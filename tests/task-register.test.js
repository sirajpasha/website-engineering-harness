import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateRegister, nextRunnable, ownershipOverlap } from '../scripts/lib/task-register.js';
import { MODE_MINUTES, startRun, timeStatus, SECURITY_GATES_WAIVABLE } from '../scripts/lib/time-controller.js';
import { logModelUsage, readModelUsage } from '../scripts/lib/model-usage.js';

const task = (o) => ({
  id: 'T-1', agent: 'implementation-engineer', model: 'sonnet', dependencies: [], inputs: ['REQUIREMENTS.md'],
  outputs: ['src/app.js'], file_ownership: ['src/'], acceptance: ['page renders'], time_budget_min: 10, status: 'pending', evidence: [], ...o,
});

describe('task register validation', () => {
  test('a complete register is valid', () => {
    assert.deepEqual(validateRegister([task({}), task({ id: 'T-2', agent: 'tdd-test-engineer', file_ownership: ['tests/'], outputs: ['tests/a.test.js'], dependencies: ['T-1'] })]), []);
  });
  test('missing fields, duplicate ids, unknown deps and agents are rejected', () => {
    const errs = validateRegister([task({}), task({ acceptance: undefined }), task({ id: 'T-3', dependencies: ['T-9'], agent: 'nobody' })]);
    assert.ok(errs.some(e => /duplicate/i.test(e)));
    assert.ok(errs.some(e => /acceptance/.test(e)));
    assert.ok(errs.some(e => /T-9/.test(e)));
    assert.ok(errs.some(e => /unknown agent/i.test(e)));
  });
  test('dependency cycles are rejected', () => {
    const errs = validateRegister([task({ id: 'A', dependencies: ['B'] }), task({ id: 'B', dependencies: ['A'], file_ownership: ['docs/'], agent: 'orchestrator', outputs: ['docs/x.md'] })]);
    assert.ok(errs.some(e => /cycle/i.test(e)));
  });
  test('a task may only own paths its agent contract allows', () => {
    const errs = validateRegister([task({ id: 'T-1', file_ownership: ['tests/'], outputs: ['tests/x.js'] })]);
    assert.ok(errs.some(e => /implementation-engineer/.test(e) && /tests\//.test(e)));
  });
  test('unrelated tasks that own overlapping paths are a conflict; ordered ones are not', () => {
    const a = task({ id: 'A' });
    const b = task({ id: 'B', file_ownership: ['src/components/'], outputs: ['src/components/x.js'] });
    assert.ok(validateRegister([a, b]).some(e => /ownership conflict/i.test(e)));
    assert.deepEqual(validateRegister([a, { ...b, dependencies: ['A'] }]), []);
  });
  test('model must exist in the registry', () => {
    assert.ok(validateRegister([task({ model: 'gpt' })]).some(e => /model/i.test(e)));
  });
  test('ownershipOverlap treats directory prefixes and equal files as overlapping', () => {
    assert.equal(ownershipOverlap(['src/'], ['src/a.js']), true);
    assert.equal(ownershipOverlap(['src/a.js'], ['src/a.js']), true);
    assert.equal(ownershipOverlap(['src/a/'], ['src/b/']), false);
    assert.equal(ownershipOverlap(['src/a'], ['src/ab']), false);
  });
});

describe('dependency-aware scheduling', () => {
  const reg = [
    task({ id: 'A', status: 'done' }),
    task({ id: 'B', dependencies: ['A'], file_ownership: ['src/b/'], outputs: ['src/b/x.js'] }),
    task({ id: 'C', dependencies: ['A'], file_ownership: ['src/c/'], outputs: ['src/c/x.js'] }),
    task({ id: 'D', dependencies: ['B'], file_ownership: ['src/d/'], outputs: ['src/d/x.js'] }),
  ];
  test('only tasks whose dependencies are done are runnable; concurrency defaults to 2', () => {
    assert.deepEqual(nextRunnable(reg).map(t => t.id), ['B', 'C']);
    assert.deepEqual(nextRunnable(reg, { maxConcurrent: 1 }).map(t => t.id), ['B']);
  });
  test('running tasks count against the cap and block overlapping ownership', () => {
    const running = reg.map(t => t.id === 'B' ? { ...t, status: 'running' } : t);
    assert.deepEqual(nextRunnable(running).map(t => t.id), ['C']);
    const clash = [...reg.slice(0, 2).map(t => t.id === 'B' ? { ...t, status: 'running' } : t),
      task({ id: 'E', dependencies: ['A'], file_ownership: ['src/b/'], outputs: ['src/b/y.js'] })];
    assert.deepEqual(nextRunnable(clash).map(t => t.id), []);
  });
  test('blocked or failed dependencies stop downstream work', () => {
    const failed = reg.map(t => t.id === 'A' ? { ...t, status: 'failed' } : t);
    assert.deepEqual(nextRunnable(failed), []);
  });
});

describe('time controller', () => {
  test('modes are 60/90/120 minutes', () => assert.deepEqual(MODE_MINUTES, { EXPRESS: 60, PROFESSIONAL: 90, ADVANCED: 120 }));
  test('reports elapsed, remaining and exceeded honestly', () => {
    const t0 = new Date('2026-01-01T00:00:00Z');
    const run = startRun('EXPRESS', t0);
    const s = timeStatus(run, new Date(t0.getTime() + 45 * 60000));
    assert.equal(s.elapsedMin, 45); assert.equal(s.remainingMin, 15); assert.equal(s.exceeded, false);
    const late = timeStatus(run, new Date(t0.getTime() + 70 * 60000));
    assert.equal(late.exceeded, true); assert.equal(late.remainingMin, 0);
    assert.match(late.message, /not production-ready|report actual status/i);
  });
  test('time pressure can never waive security gates', () => assert.equal(SECURITY_GATES_WAIVABLE, false));
  test('unknown mode throws', () => assert.throws(() => startRun('TURBO')));
});

describe('model usage log', () => {
  test('appends JSONL under the project, records substitutions, and never stores secrets', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mu-'));
    logModelUsage({ task: 'T-1', requested: 'fable', model: 'opus', substituted: true, tokens: null }, { projectDir: dir });
    logModelUsage({ task: 'T-2', requested: 'sonnet', model: 'sonnet', substituted: false, tokens: 1200, apiKey: 'sk-secret' }, { projectDir: dir });
    const rows = readModelUsage({ projectDir: dir });
    assert.equal(rows.length, 2);
    assert.equal(rows[0].substituted, true);
    assert.equal(rows[1].tokens, 1200);
    assert.ok(!JSON.stringify(rows).includes('sk-secret'));
    assert.ok(rows[0].ts);
  });
});
