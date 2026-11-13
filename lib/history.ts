import { appendFileSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { History, RealTimeAlert } from '@/app/types/types';

// oref closed its history API to servers (Nov 2026), so history is whatever our realtime poller saw:
// append-only JSONL on disk, mirrored in memory. Alerts that fire while the server is down are missed.

const FILE = join(process.env.DATA_DIR ?? 'data', 'history.jsonl');
const KEEP_MS = 30 * 24 * 60 * 60 * 1000;

// On globalThis: instrumentation and route bundles may each load this module.
const g = globalThis as typeof globalThis & { __history?: History[] };

function load(): History[] {
    let text = '';
    try {
        text = readFileSync(FILE, 'utf8');
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; // never wipe a file we couldn't read
    }
    const cutoff = Date.now() - KEEP_MS;
    const kept = text.split('\n').flatMap(line => {
        try { return [JSON.parse(line) as History]; } catch { return []; } // blanks, torn last line
    }).filter(r => Date.parse(r.alertDate) >= cutoff);
    // ponytail: file is compacted only at boot; memory is pruned on every read
    mkdirSync(dirname(FILE), { recursive: true });
    writeFileSync(FILE + '.tmp', kept.map(r => JSON.stringify(r) + '\n').join(''));
    renameSync(FILE + '.tmp', FILE);
    return kept;
}

/** Chronological rows, expired ones dropped. */
function rows(): History[] {
    const all = (g.__history ??= load());
    const cutoff = Date.now() - KEEP_MS;
    while (all.length && Date.parse(all[0].alertDate) < cutoff) all.shift();
    return all;
}

export function record(alert: RealTimeAlert, at = new Date()): void {
    const all = rows();
    const have = new Set(all.map(r => r.rid)); // ponytail: O(n) per alert change; keep a Set if history gets huge
    const cat = Number(alert.cat); // oref sends it as a string
    // Realtime cat 10 is a newsflash: "event ended" → green (13), anything else is a heads-up → yellow (14).
    const category = cat === 10 ? (alert.title.includes('הסתיים') ? 13 : 14) : cat;
    const fresh = [...new Set(alert.data)]
        .map(city => ({ alertDate: at.toISOString(), title: alert.title, data: city, category, rid: `${alert.id}-${city}` }))
        .filter(r => !have.has(r.rid)); // same alert id is re-polled every second and after restarts
    if (!fresh.length) return;
    appendFileSync(FILE, fresh.map(r => JSON.stringify(r) + '\n').join(''));
    all.push(...fresh);
}

/** Newest first, keyed by city; cities with no alerts are absent. */
export function historyFor(cities: Set<string>): Record<string, History[]> {
    const all = rows();
    const out: Record<string, History[]> = {};
    for (let i = all.length - 1; i >= 0; i--) {
        if (cities.has(all[i].data)) (out[all[i].data] ??= []).push(all[i]);
    }
    return out;
}
