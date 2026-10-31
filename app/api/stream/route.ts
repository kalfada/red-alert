import { subscribe, snapshot, type RealtimeMsg } from '@/lib/realtime';
import type { RealTimeAlert } from '../../types/types';

export const dynamic = 'force-dynamic';

const encoder = new TextEncoder();

export function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const cities = new Set(
        Array.from(searchParams.entries())
            .filter(([key]) => key.startsWith('city_'))
            .map(([, value]) => value)
    );

    let unsubscribe = () => { };

    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            const send = (event: string, data: unknown) => {
                try {
                    controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
                } catch {
                    unsubscribe(); // client gone
                }
            };

            const onMessage = (msg: RealtimeMsg) => {
                if (msg.type === 'ping') return send('ping', { lastOk: msg.lastOk, now: Date.now() });
                const hit = [...new Set(msg.alert.data.filter(city => cities.has(city)))];
                if (hit.length) send('alert', { ...msg.alert, data: hit } satisfies RealTimeAlert);
            };

            const { fresh, current, lastOk } = snapshot();
            if (fresh) {
                send('ping', { lastOk, now: Date.now() });
                if (current) onMessage({ type: 'alert', alert: current });
            }

            if (searchParams.has('mock') && cities.size) {
                send('alert', {
                    id: `mock-${Date.now()}`,
                    cat: 1,
                    title: 'ירי רקטות וטילים',
                    data: [...cities],
                    desc: 'היכנסו למרחב המוגן',
                } satisfies RealTimeAlert);
            }

            unsubscribe = subscribe(onMessage);
            request.signal.addEventListener('abort', () => {
                unsubscribe();
                try { controller.close(); } catch { /* already closed */ }
            });
        },
        cancel() {
            unsubscribe();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
            'Content-Encoding': 'none', // stop Next's gzip from buffering events
        },
    });
}
