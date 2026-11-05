import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyGates, SAMPLE_PROJECT } from '../scripts/quality-gates/gate-rules.js';
import { hashProjectSources } from '../scripts/quality-gates/evidence.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function cloneSample() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gates-'));
  fs.cpSync(SAMPLE_PROJECT, dir, { recursive: true });
  return dir;
}
const read = (d, f) => fs.readFileSync(path.join(d, f), 'utf8');
const write = (d, f, c) => fs.writeFileSync(path.join(d, f), c);
const gate = (res, id) => res.results.find(r => r.gate === id);
const failedIds = res => res.results.filter(r => r.status !== 'PASSED').map(r => r.gate);

describe('content-aware quality gates', () => {
  test('sample project passes all 13 gates', () => {
    const res = verifyGates(SAMPLE_PROJECT);
    assert.deepEqual(failedIds(res), [], JSON.stringify(res.results.filter(r => r.status !== 'PASSED')));
    assert.equal(res.passed, 13);
  });

  test('an empty project fails every gate (templates/ and examples/ are never evidence)', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gates-empty-'));
    const res = verifyGates(dir);
    assert.equal(res.passed, 0);
    assert.equal(res.results.length, 13);
  });

  test('unfilled template placeholders fail the gate', () => {
    const d = cloneSample();
    write(d, 'ARCHITECTURE.md', read(d, 'ARCHITECTURE.md') + '\n{{COMPONENT_NAME}} TODO fill me in\n');
    assert.equal(gate(verifyGates(d), 'G6').status, 'FAILED');
  });

  test('G1 requires REQ ids', () => {
    const d = cloneSample();
    write(d, 'REQUIREMENTS.md', '# Requirements\n\nSome prose with no identifiers at all, long enough to look real and plausible to a naive length check.\n');
    assert.equal(gate(verifyGates(d), 'G1').status, 'FAILED');
  });

  test('G4 fails when P0 defects remain open', () => {
    const d = cloneSample();
    write(d, 'UI_CRITIQUE_REPORT.md', read(d, 'UI_CRITIQUE_REPORT.md').replace(/P0 Defects:\*{0,2}\s*0/, 'P0 Defects: 2'));
    assert.equal(gate(verifyGates(d), 'G4').status, 'FAILED');
  });

  test('G7 fails when a requirement has no traceability row', () => {
    const d = cloneSample();
    write(d, 'REQUIREMENTS.md', read(d, 'REQUIREMENTS.md') + '\n| `REQ-099` | Ghost | Untested feature | P1 | `AC-099` |\n');
    assert.equal(gate(verifyGates(d), 'G7').status, 'FAILED');
  });

  test('G7 fails when the referenced test file does not exist', () => {
    const d = cloneSample();
    fs.rmSync(path.join(d, 'tests'), { recursive: true });
    assert.equal(gate(verifyGates(d), 'G7').status, 'FAILED');
  });

  test('G8 fails on animation durations over 300ms', () => {
    const d = cloneSample();
    write(d, 'src/styles.css', read(d, 'src/styles.css') + '\n.x { transition: opacity 900ms ease; }\n');
    assert.equal(gate(verifyGates(d), 'G8').status, 'FAILED');
  });

  test('G3 fails when a banned AI gradient is in the source', () => {
    const d = cloneSample();
    write(d, 'src/styles.css', read(d, 'src/styles.css') + '\n.hero { background: linear-gradient(135deg, #667eea, #764ba2); }\n');
    assert.equal(gate(verifyGates(d), 'G3').status, 'FAILED');
  });

  test('G9 requires machine evidence from a real browser run', () => {
    const d = cloneSample();
    fs.rmSync(path.join(d, 'reports'), { recursive: true, force: true });
    assert.equal(gate(verifyGates(d), 'G9').status, 'FAILED');
  });

  test('G9 fails when source changed after the browser run (stale evidence)', () => {
    const d = cloneSample();
    write(d, 'src/app.js', read(d, 'src/app.js') + '\n// changed after QA\n');
    assert.equal(gate(verifyGates(d), 'G9').status, 'FAILED');
  });

  test('G9 fails when the recorded run did not pass or covered fewer than 6 viewports', () => {
    const d = cloneSample();
    const p = path.join(d, 'reports/browser-qa/browser-qa.json');
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    j.passed = false;
    fs.writeFileSync(p, JSON.stringify(j));
    assert.equal(gate(verifyGates(d), 'G9').status, 'FAILED');
    j.passed = true; j.viewportsTested = 3;
    fs.writeFileSync(p, JSON.stringify(j));
    assert.equal(gate(verifyGates(d), 'G9').status, 'FAILED');
  });

  test('G10 fails with any High/Critical finding', () => {
    const d = cloneSample();
    write(d, 'SECURITY_AUDIT_REPORT.md', read(d, 'SECURITY_AUDIT_REPORT.md').replace(/High Vulnerabilities:\*{0,2}\s*0/, 'High Vulnerabilities: 1'));
    assert.equal(gate(verifyGates(d), 'G10').status, 'FAILED');
  });

  test('G11 fails when a CWV metric is not classified lab vs static', () => {
    const d = cloneSample();
    write(d, 'PERFORMANCE_AUDIT_REPORT.md', read(d, 'PERFORMANCE_AUDIT_REPORT.md').replace(/`\[STATIC OBSERVATION\]`/g, ''));
    assert.equal(gate(verifyGates(d), 'G11').status, 'FAILED');
  });

  test('G13 fails when any earlier gate fails, or a checklist item is unchecked', () => {
    const d = cloneSample();
    write(d, 'ARCHITECTURE.md', '');
    assert.equal(gate(verifyGates(d), 'G13').status, 'FAILED');
    const d2 = cloneSample();
    write(d2, 'RELEASE_CHECKLIST.md', read(d2, 'RELEASE_CHECKLIST.md').replace('- [x] **Gate G5', '- [ ] **Gate G5'));
    assert.equal(gate(verifyGates(d2), 'G13').status, 'FAILED');
  });
});

describe('hashProjectSources', () => {
  test('is stable across CRLF/LF and ignores reports/ and tests/', () => {
    const d = cloneSample();
    const h1 = hashProjectSources(d);
    write(d, 'src/app.js', read(d, 'src/app.js').replace(/\r?\n/g, '\r\n'));
    write(d, 'tests/extra.js', 'x');
    write(d, 'reports/browser-qa/x.json', '{}');
    assert.equal(hashProjectSources(d), h1);
    write(d, 'src/app.js', read(d, 'src/app.js') + '//x');
    assert.notEqual(hashProjectSources(d), h1);
  });
});
