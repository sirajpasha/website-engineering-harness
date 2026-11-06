import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolveEvidenceProject, validateBrowser } from '../scripts/browser-validation/validate-browser.js';
import { hashProjectSources } from '../scripts/quality-gates/evidence.js';
import { GATES } from '../scripts/quality-gates/gate-rules.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hasPlaywright = await import('playwright').then(() => true, () => false);

describe('resolveEvidenceProject (pure): which project does a run belong to?', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ev-'));
  test('a file target is bound to the folder it lives in (unchanged behaviour)', () => {
    assert.equal(resolveEvidenceProject({ file: path.join(tmp, 'index.html') }, {}, {}, tmp), tmp);
  });
  test('a URL target uses --project when given', () => {
    assert.equal(resolveEvidenceProject({ url: 'http://x' }, { projectDir: tmp }, {}, root), path.resolve(tmp));
  });
  test('a URL target uses HARNESS_PROJECT_DIR, then CLAUDE_PROJECT_DIR, then the working directory', () => {
    assert.equal(resolveEvidenceProject({ url: 'http://x' }, {}, { HARNESS_PROJECT_DIR: tmp }, root), path.resolve(tmp));
    assert.equal(resolveEvidenceProject({ url: 'http://x' }, {}, { CLAUDE_PROJECT_DIR: tmp }, root), path.resolve(tmp));
    assert.equal(resolveEvidenceProject({ url: 'http://x' }, {}, {}, tmp), path.resolve(tmp));
  });
  test('inside the harness repo a URL run has no project to bind to (null, never the harness itself)', () => {
    assert.equal(resolveEvidenceProject({ url: 'http://x' }, {}, {}, root), null);
  });
});

describe('a URL run records evidence the gate can verify and invalidate (real browser)', { skip: !hasPlaywright && 'playwright not installed' }, () => {
  const PAGE = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>t</title></head><body><main><h1>Hello</h1></main></body></html>';

  test('sourceHash equals the gate hash; G9 passes, then reports STALE after a source change', async () => {
    const project = fs.mkdtempSync(path.join(os.tmpdir(), 'ev-proj-'));
    fs.writeFileSync(path.join(project, 'app.js'), 'export const v = 1;\n');
    const server = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html' }); res.end(PAGE); });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    try {
      const url = `http://127.0.0.1:${server.address().port}/`;
      const outDir = path.join(project, 'reports', 'browser-qa');
      const result = await validateBrowser(url, { projectDir: project, outDir, log: () => {} });
      assert.equal(result.passed, true, JSON.stringify(result.results.map((x) => x.failures)));

      const report = JSON.parse(fs.readFileSync(path.join(outDir, 'browser-qa.json'), 'utf8'));
      assert.equal(report.sourceHash, hashProjectSources(project), 'the validator and the gate must hash the same project the same way');
      assert.equal(report.sourceBinding, 'url-target:project-sources-at-measure-time');

      const g9 = GATES.find((g) => g.id === 'G9');
      assert.deepEqual(g9.verify({ dir: project, docs: {} }).problems, [], 'fresh URL evidence satisfies G9');

      fs.writeFileSync(path.join(project, 'app.js'), 'export const v = 2;\n');
      const stale = g9.verify({ dir: project, docs: {} }).problems.join(' ');
      assert.match(stale, /Stale evidence/);
    } finally {
      server.close();
    }
  });

  test('a file target keeps its previous binding label', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ev-file-'));
    const file = path.join(dir, 'index.html');
    fs.writeFileSync(file, PAGE);
    const outDir = path.join(dir, 'reports', 'browser-qa'); // real runs write under reports/, which the hash skips
    await validateBrowser(file, { outDir, log: () => {} });
    const report = JSON.parse(fs.readFileSync(path.join(outDir, 'browser-qa.json'), 'utf8'));
    assert.equal(report.sourceBinding, 'file-target');
    assert.equal(report.sourceHash, hashProjectSources(dir));
  });
});
