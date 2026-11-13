import type { RealTimeAlert } from '@/app/types/types';
import { record } from './history';

// One server-side loop polls oref, records history, and fans out to every SSE subscriber.
// Always on (started from instrumentation.ts) so history has no gaps; upstream load is 1 req/s regardless of users.

export type RealtimeMsg =
    | { type: 'alert'; alert: RealTimeAlert }
    | { type: 'ping'; lastOk: number };
type Listener = (msg: RealtimeMsg) => void;

const OREF_URL = 'https://www.oref.org.il/warningMessages/alert/Alerts.json';
const TICK_MS = 1000;
const PING_EVERY = 5; // ticks; keeps proxies from idling out and drives the client stale warning
const FRESH_MS = 3000;

interface State {
    subs: Set<Listener>;
    running: boolean;
    current: RealTimeAlert | null;
    sig: string;
    lastOk: number;
    ticks: number;
    failing: boolean;
}

// On globalThis so dev HMR reuses one poller instead of stacking loops.
const g = globalThis as typeof globalThis & { __realtime?: State };
const s = (g.__realtime ??= {
    subs: new Set(), running: false, current: null, sig: '', lastOk: 0, ticks: 0, failing: false,
});

async function fetchAlert(): Promise<RealTimeAlert | null> {
    const res = await fetch(OREF_URL, {
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`oref HTTP ${res.status}`);
    // Empty body (BOM + whitespace) means no active alert.
    const text = (await res.text()).replace(/^﻿/, '').trim();
    return text ? JSON.parse(text) : null;
}

function broadcast(msg: RealtimeMsg) {
    for (const fn of s.subs) fn(msg);
}

async function tick() {
    try {
        const alert = await fetchAlert();
        s.lastOk = Date.now();
        if (s.failing) console.info('realtime poll recovered');
        s.failing = false;
        const sig = alert ? alert.id + alert.data.join() : '';
        if (sig !== s.sig) {
            s.sig = sig;
            s.current = alert;
            if (alert) {
                broadcast({ type: 'alert', alert });
                try { record(alert); } catch (error) { console.error('history write failed:', error); }
            }
        }
    } catch (error) {
        if (!s.failing) console.error('realtime poll failed:', error);
        s.failing = true;
    }
    if (s.ticks++ % PING_EVERY === 0) broadcast({ type: 'ping', lastOk: s.lastOk });
    setTimeout(tick, TICK_MS);
}

export function start() {
    if (s.running) return;
    s.running = true;
    tick();
}

export function subscribe(fn: Listener): () => void {
    s.subs.add(fn);
    return () => { s.subs.delete(fn); };
}

/** Current state, only if the poller has fresh data (otherwise the next tick will deliver it). */
export function snapshot() {
    const fresh = Date.now() - s.lastOk < FRESH_MS;
    return { fresh, current: s.current, lastOk: s.lastOk };
}
