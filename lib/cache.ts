// In-memory TTL cache that stores the promise, so concurrent misses share one upstream call.
// Failures are cached for the TTL too, so a dead upstream isn't hammered.
// In-flight entries never expire: callers' fn MUST time out (e.g. AbortSignal.timeout).
const store = new Map<string, { exp: number; p: Promise<unknown> }>();

export function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const hit = store.get(key);
    if (hit && now < hit.exp) return hit.p as Promise<T>;
    // ponytail: O(n) sweep on miss; fine for a few hundred keys, LRU if it ever grows
    for (const [k, v] of store) if (now >= v.exp) store.delete(k);
    const entry = { exp: Infinity, p: fn() };
    entry.p.finally(() => { entry.exp = Date.now() + ttlMs; }).catch(() => { });
    store.set(key, entry);
    return entry.p;
}
