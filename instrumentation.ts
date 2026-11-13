// Poll oref from boot, not only while someone is watching: history is recorded from this loop.
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') (await import('./lib/realtime')).start();
}
