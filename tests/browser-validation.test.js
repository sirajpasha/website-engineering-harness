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

describe('validateBrowser does not flag legitimate patterns (real browser)', { skip: !hasPlaywright && 'playwright not installed' }, () => {
  const page = (extraHead, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>t</title>
    <style>.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    .sr-only:focus{position:static;width:auto;height:auto;clip:auto;margin:0}</style>${extraHead}</head><body>${body}</body></html>`;
  const run = async (html) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bq-ok-'));
    const file = path.join(dir, 'index.html');
    fs.writeFileSync(file, html);
    return validateBrowser(file, { outDir: dir, log: () => {} });
  };

  test('a visually hidden "skip to content" link is not a tap-target failure', async () => {
    const r = await run(page('', '<a class="sr-only" href="#main">Skip to main content</a><main id="main"><h1>Hello</h1></main>'));
    assert.equal(r.passed, true, JSON.stringify(r.results.map(x => x.failures)));
  });

  test('a cancelled background request (e.g. a router prefetch) is not a console error', async () => {
    const script = '<script>const c=new AbortController();fetch("/slow.json",{signal:c.signal}).catch(()=>{});c.abort();</script>';
    const r = await run(page('', `<main><h1>Hello</h1></main>${script}`));
    assert.equal(r.passed, true, JSON.stringify(r.results.map(x => x.failures)));
  });

  test('a genuinely small visible tap target is still caught', async () => {
    const r = await run(page('', '<main><h1>Hello</h1><a href="/x" style="display:block;width:30px;height:16px">x</a></main>'));
    assert.equal(r.results.find(v => v.width === 390).passed, false);
  });
});

describe('tap targets: a control inside a <label> is as large as its label (real browser)', { skip: !hasPlaywright && 'playwright not installed' }, () => {
  const html = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>t</title></head><body><main><h1>Hello</h1>${body}</main></body></html>`;
  const run = async (body) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bq-lbl-'));
    const file = path.join(dir, 'index.html');
    fs.writeFileSync(file, html(body));
    return validateBrowser(file, { outDir: dir, log: () => {} });
  };
  test('a small checkbox inside a large label passes', async () => {
    const r = await run('<label style="display:flex;min-height:48px;width:100%;align-items:center"><input type="checkbox" style="width:13px;height:16px"> I agree to the terms</label>');
    assert.equal(r.results.find(v => v.width === 390).passed, true, JSON.stringify(r.results.map(x => x.failures)));
  });
  test('a small checkbox with no label is still flagged', async () => {
    const r = await run('<input type="checkbox" style="width:13px;height:16px" aria-label="x">');
    assert.equal(r.results.find(v => v.width === 390).passed, false);
  });
});

describe('tap targets: a control with a separate <label for> uses the label (real browser)', { skip: !hasPlaywright && 'playwright not installed' }, () => {
  test('checkbox + sibling label[for] with a large label passes', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bq-for-'));
    const file = path.join(dir, 'index.html');
    fs.writeFileSync(file, '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>t</title></head><body><main><h1>Hello</h1><div style="display:flex;gap:8px"><input type="checkbox" id="c" style="width:13px;height:16px"><label for="c" style="display:block;min-height:48px;padding:12px 0">I agree to the terms and conditions of this form</label></div></main></body></html>');
    const r = await validateBrowser(file, { outDir: dir, log: () => {} });
    assert.equal(r.results.find(v => v.width === 390).passed, true, JSON.stringify(r.results.map(x => x.failures)));
  });
});
