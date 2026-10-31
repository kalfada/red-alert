import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';
import { cached } from './cache.ts';

test('concurrent calls share one upstream call', async () => {
    let calls = 0;
    const fn = async () => { calls++; await sleep(20); return calls; };
    const results = await Promise.all([cached('a', 50, fn), cached('a', 50, fn), cached('a', 50, fn)]);
    assert.equal(calls, 1);
    assert.deepEqual(results, [1, 1, 1]);
});

test('TTL starts when settled, refetches after expiry', async () => {
    let calls = 0;
    const fn = async () => { calls++; await sleep(30); return calls; };
    await cached('b', 100, fn);
    await sleep(40);                       // 70ms since start, 40ms since settle: still fresh
    assert.equal(await cached('b', 100, fn), 1);
    await sleep(90);
    assert.equal(await cached('b', 100, fn), 2);
});

test('rejections are cached for the TTL, then retried', async () => {
    let calls = 0;
    const fn = async () => { calls++; throw new Error('down'); };
    await assert.rejects(cached('c', 30, fn));
    await assert.rejects(cached('c', 30, fn));
    assert.equal(calls, 1);
    await sleep(40);
    await assert.rejects(cached('c', 30, fn));
    assert.equal(calls, 2);
});
