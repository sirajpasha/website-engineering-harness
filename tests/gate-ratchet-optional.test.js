import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkGates } from '../scripts/quality-gates/check-gates.js';
import { SAMPLE_PROJECT } from '../scripts/quality-gates/gate-rules.js';

const quiet = (fn) => {
  const l = console.log, w = console.warn;
  console.log = () => {}; console.warn = () => {};
  try { return fn(); } finally { console.log = l; console.warn = w; }
};
const clone = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-'));
  fs.cpSync(SAMPLE_PROJECT, d, { recursive: true });
  return d;
};

describe('ratchets are opt-in: a project without baselines is not failed for it', () => {
  test('control: the sample (with baselines) passes everything', () => {
    const r = quiet(() => checkGates(SAMPLE_PROJECT));
    assert.equal(r.allPassed, true);
    assert.equal(r.ratchets, 'satisfied');
  });

  test('no baselines file -> ratchets "not-configured", overall still passes when all 13 gates pass', () => {
    const d = clone();
    fs.rmSync(path.join(d, '.harness'), { recursive: true, force: true });
    const r = quiet(() => checkGates(d));
    assert.equal(r.passed, 13);
    assert.equal(r.ratchets, 'not-configured');
    assert.equal(r.allPassed, true);
  });

  test('baselines exist but a metric cannot be measured -> still fails closed', () => {
    const d = clone();
    fs.rmSync(path.join(d, 'tests'), { recursive: true, force: true }); // coverage becomes unmeasurable
    const r = quiet(() => checkGates(d));
    assert.equal(r.ratchets, 'failed');
    assert.equal(r.allPassed, false);
  });

  test('a failing gate still fails overall even though ratchets are not configured', () => {
    const d = clone();
    fs.rmSync(path.join(d, '.harness'), { recursive: true, force: true });
    fs.writeFileSync(path.join(d, 'ARCHITECTURE.md'), '');
    const r = quiet(() => checkGates(d));
    assert.equal(r.allPassed, false);
  });
});
