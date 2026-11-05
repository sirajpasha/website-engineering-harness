import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runEvals, runHookScenario, runGateScenario } from '../scripts/evals/run-evals.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = f => JSON.parse(fs.readFileSync(path.join(root, 'evals', f), 'utf8'));

describe('scenario evals', () => {
  test('every shipped scenario behaves as specified', () => {
    const r = runEvals();
    const bad = r.results.filter(x => !x.ok);
    assert.deepEqual(bad.map(b => `${b.id}: ${b.detail}`), []);
    assert.ok(r.results.length >= 20, `expected a meaningful suite, got ${r.results.length}`);
  });

  test('suite covers both hook and gate scenarios', () => {
    assert.ok(load('hook-scenarios.json').length >= 10);
    assert.ok(load('gate-scenarios.json').length >= 8);
  });

  test('a scenario with a wrong expectation is reported as a failure (the evals can fail)', () => {
    const hook = runHookScenario({
      id: 'bad', payload: { tool_name: 'Bash', tool_input: { command: 'git push --force origin main' } }, expect: 'allow'
    });
    assert.equal(hook.ok, false);
    const gate = runGateScenario({ id: 'bad-gate', mutations: [], expectFailedGates: ['G9'] });
    assert.equal(gate.ok, false);
  });

  test('the unmodified sample is a passing control', () => {
    assert.equal(runGateScenario({ id: 'control', mutations: [], expectFailedGates: [] }).ok, true);
  });
});

describe('CI workflow', () => {
  const ci = fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8');
  test('installs deps, a real browser, and runs tests, gates, evals', () => {
    for (const needle of ['npm ci', 'playwright install', 'npm test', 'npm run evals', 'npm run gate', 'npm run test:browser', 'npm run ratchet']) {
      assert.ok(ci.includes(needle), `ci.yml must run: ${needle}`);
    }
  });
  test('triggers on push and pull_request', () => {
    assert.match(ci, /pull_request/);
    assert.match(ci, /push/);
  });
});
