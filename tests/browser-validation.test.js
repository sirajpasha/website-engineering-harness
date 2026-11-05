import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MANDATORY_VIEWPORTS,
  evaluateViewportMetrics,
  validateBrowser
} from '../scripts/browser-validation/validate-browser.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hasPlaywright = await import('playwright').then(() => true, () => false);

const clean = {
  horizontalOverflowPx: 0,
  smallTargets: [],
  h1Count: 1,
  hasMetaViewport: true,
  hasMain: true,
  consoleErrors: []
};

describe('evaluateViewportMetrics (pure)', () => {
  test('passes clean metrics', () => {
    assert.deepEqual(evaluateViewportMetrics(clean, MANDATORY_VIEWPORTS[0]).failures, []);
  });
  test('flags horizontal overflow', () => {
    const r = evaluateViewportMetrics({ ...clean, horizontalOverflowPx: 40 }, MANDATORY_VIEWPORTS[0]);
    assert.equal(r.passed, false);
    assert.match(r.failures[0], /horizontal/i);
  });
  test('flags small touch targets only on touch viewports', () => {
    const m = { ...clean, smallTargets: ['a.nav (30x20)'] };
    assert.equal(evaluateViewportMetrics(m, { width: 390, height: 844 }).passed, false);
    assert.equal(evaluateViewportMetrics(m, { width: 1440, height: 900 }).passed, true);
  });
  test('flags missing h1, multiple h1, console errors', () => {
    assert.equal(evaluateViewportMetrics({ ...clean, h1Count: 0 }, MANDATORY_VIEWPORTS[0]).passed, false);
    assert.equal(evaluateViewportMetrics({ ...clean, h1Count: 2 }, MANDATORY_VIEWPORTS[0]).passed, false);
    assert.equal(evaluateViewportMetrics({ ...clean, consoleErrors: ['boom'] }, MANDATORY_VIEWPORTS[0]).passed, false);
  });
});

describe('validateBrowser fails closed', () => {
  test('blocked (not passed) when Playwright cannot be loaded', async () => {
    const r = await validateBrowser('examples/sample-website/index.html', {
      importer: async () => { throw new Error('Cannot find package'); },
      log: () => {}
    });
    assert.equal(r.passed, false);
    assert.equal(r.blocked, true);
  });
  test('fails when no target exists', async () => {
    const r = await validateBrowser(path.join(os.tmpdir(), 'nope-does-not-exist.html'), { log: () => {} });
    assert.equal(r.passed, false);
  });
});

describe('validateBrowser with a real browser', { skip: !hasPlaywright && 'playwright not installed' }, () => {
  test('detects horizontal overflow in a broken page', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bq-'));
    const file = path.join(dir, 'bad.html');
    fs.writeFileSync(file, '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><main><h1>x</h1><div style="width:2000px;height:10px;background:#000"></div></main></body></html>');
    const r = await validateBrowser(file, { outDir: dir, log: () => {} });
    assert.equal(r.passed, false);
    assert.equal(r.viewportsTested, 6);
    assert.ok(r.results.every(v => v.failures.some(f => /horizontal/i.test(f))));
    assert.ok(fs.existsSync(path.join(dir, 'browser-qa.json')));
  });
  test('passes the sample website at all six viewports', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bq-'));
    const r = await validateBrowser(path.join(root, 'examples/sample-website/index.html'), { outDir: dir, log: () => {} });
    assert.equal(r.viewportsTested, 6, JSON.stringify(r.results.map(x => x.failures)));
    assert.equal(r.passed, true, JSON.stringify(r.results.map(x => x.failures)));
  });
});
