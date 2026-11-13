import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'history-'));
process.env.DATA_DIR = dir;
const file = join(dir, 'history.jsonl');
const row = (rid: string, ageMs: number) =>
    JSON.stringify({ alertDate: new Date(Date.now() - ageMs).toISOString(), title: 't', data: 'A', category: 1, rid });
// expired row, kept row, torn last line from a crash mid-append
writeFileSync(file, `${row('old-A', 31 * 864e5)}\n${row('kept-A', 1000)}\n{"torn`);

const { record, historyFor } = await import('./history.ts');
const ended = { id: '9', cat: '10', title: 'האירוע הסתיים', data: ['A', 'B', 'A'], desc: '' };

test('loads, prunes, records deduped, serves newest first, persists', () => {
    record(ended as never);
    record(ended as never); // re-polled next second: no duplicates
    const h = historyFor(new Set(['A', 'B', 'C']));
    assert.deepEqual(h.A.map(r => r.rid), ['9-A', 'kept-A']);
    assert.equal(h.A[0].category, 13); // "ended" newsflash → green
    assert.equal(h.B.length, 1);
    assert.equal(h.C, undefined);
    assert.equal(readFileSync(file, 'utf8').trim().split('\n').length, 3); // kept + 9-A + 9-B
});
