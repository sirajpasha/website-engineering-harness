import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  discoverPages,
  normalizePagePath,
  unmangleGitBashPath,
  buildCaption,
  approvalMarkdown,
  recordWalkthrough,
  DEVICES
} from '../scripts/walkthrough/walkthrough.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hasPlaywright = await import('playwright').then(() => true, () => false);
const quiet = { log: () => {} };
const tmp = (p = 'wt-') => fs.mkdtempSync(path.join(os.tmpdir(), p));

/** A tiny three-page site (+ one broken link) with tall pages so scrolling is real. */
function fixtureSite() {
  const dir = tmp('wt-site-');
  const page = (title, extra = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
    <style>body{font-family:sans-serif;margin:0}section{height:700px;padding:24px}nav a{margin-right:12px}</style></head><body>
    <nav><a href="/index.html">Home</a><a href="/about.html">About</a><a href="/contact.html">Contact</a>${extra}</nav>
    <main><h1>${title}</h1><section>one</section><section>two</section><section>three</section></main></body></html>`;
  fs.writeFileSync(path.join(dir, 'index.html'), page('Home page'));
  fs.writeFileSync(path.join(dir, 'about.html'), page('About us'));
  fs.writeFileSync(path.join(dir, 'contact.html'), page('Contact us'));
  return dir;
}

describe('discoverPages (pure)', () => {
  const base = 'http://127.0.0.1:4000';
  test('keeps unique same-origin pages, drops files, mailto, external and fragments', () => {
    const links = ['/about', '/about#team', '/about?x=1', '/contact', 'mailto:a@b.c', 'tel:+1', 'https://other.example/x',
      '/brochure.pdf', '/logo.png', '#top', '/', '/products/rice', 'http://127.0.0.1:4000/privacy'];
    assert.deepEqual(discoverPages(links, base, 10), ['/about', '/contact', '/', '/products/rice', '/privacy']);
  });
  test('honours the page limit', () => {
    assert.equal(discoverPages(['/a', '/b', '/c', '/d'], base, 2).length, 2);
  });
  test('never returns nothing: falls back to the entry page', () => {
    assert.deepEqual(discoverPages([], base, 5), ['/']);
  });
});

describe('page path handling (pure)', () => {
  test('normalizePagePath accepts site paths and rejects things that are not', () => {
    assert.equal(normalizePagePath('/about'), '/about');
    assert.equal(normalizePagePath('about'), '/about');
    assert.equal(normalizePagePath('/'), '/');
    assert.equal(normalizePagePath('C:/Program Files/Git/'), null);
    assert.equal(normalizePagePath(String.raw`C:\Users\x`), null);
    assert.equal(normalizePagePath('https://evil.example/x'), null);
    assert.equal(normalizePagePath(''), null);
  });
  test('unmangleGitBashPath undoes the Git-for-Windows rewrite of a leading slash', () => {
    assert.equal(unmangleGitBashPath('C:/Program Files/Git/'), '/');
    assert.equal(unmangleGitBashPath('C:/Program Files/Git/products'), '/products');
    assert.equal(unmangleGitBashPath('C:/Program Files (x86)/Git/about'), '/about');
    assert.equal(unmangleGitBashPath('/products'), '/products');
    assert.equal(unmangleGitBashPath('C:/Users/me/site'), 'C:/Users/me/site', 'unrelated paths are left alone');
  });
});

describe('captions and approval sheet (pure)', () => {
  test('caption carries the page title and path', () => {
    const c = buildCaption({ title: 'About us', path: '/about', label: 'Acme v1' });
    assert.match(c, /About us/);
    assert.match(c, /\/about/);
  });

  test('caption is short: only the first segment of a long SEO title, "Home" for the root', () => {
    assert.equal(buildCaption({ title: 'Export Catalogue - Rice, Spices & Pulses | Jay Impex - Commodities Exporters', path: '/products' }), 'Export Catalogue · /products');
    assert.equal(buildCaption({ title: 'Jay Impex | Leading Commodities Exporter & Sourcing Partner | Chennai, India', path: '/' }), 'Home · /');
    assert.equal(buildCaption({ title: '', path: '/contact' }), '/contact');
    assert.ok(buildCaption({ title: 'About Us & Sourcing Capabilities | Jay Impex Exporters', path: '/about' }).length < 50);
  });

  const manifest = {
    label: 'Acme website v1',
    target: 'http://127.0.0.1:3100/',
    recordedAt: '2026-11-05T10:00:00.000Z',
    passed: true,
    devices: [
      { name: 'desktop', width: 1440, height: 900, video: 'desktop.webm', poster: 'desktop-poster.png', pages: [{ path: '/', title: 'Home', status: 200, ok: true }] },
      { name: 'phone', width: 390, height: 844, video: 'phone.webm', poster: 'phone-poster.png', pages: [{ path: '/', title: 'Home', status: 200, ok: true }] }
    ],
    notes: []
  };
  const qa = { fresh: true, viewportsPassed: 6, viewportsTested: 6, axeViolations: 0, lcpMs: 420, cls: 0 };

  test('approval sheet shows what is shown, measured evidence, and an UNSIGNED decision block', () => {
    const md = approvalMarkdown(manifest, qa);
    assert.match(md, /Acme website v1/);
    assert.match(md, /desktop\.webm/);
    assert.match(md, /phone\.webm/);
    assert.match(md, /6 of 6/);
    assert.match(md, /LAB MEASURED/i);
    assert.equal((md.match(/- \[ \]/g) || []).length >= 3, true, 'decision boxes are present and unchecked');
    assert.equal(/- \[x\]/i.test(md), false, 'nothing may be pre-approved');
  });
  test('without fresh QA evidence it says so instead of implying a pass', () => {
    const md = approvalMarkdown(manifest, { fresh: false });
    assert.match(md, /No fresh browser QA evidence/i);
    assert.doesNotMatch(md, /6 of 6/);
  });
  test('a failed recording is stated plainly', () => {
    const bad = { ...manifest, passed: false, devices: [{ ...manifest.devices[0], pages: [{ path: '/broken', title: '', status: 404, ok: false }] }] };
    const md = approvalMarkdown(bad, { fresh: false });
    assert.match(md, /404/);
    assert.match(md, /not ready|failed/i);
  });
});

describe('recordWalkthrough fails closed', () => {
  test('blocked when Playwright cannot be loaded', async () => {
    const r = await recordWalkthrough('http://127.0.0.1:1/', { importer: async () => { throw new Error('nope'); }, outDir: tmp(), ...quiet });
    assert.equal(r.passed, false);
    assert.equal(r.blocked, true);
  });
  test('fails when the target does not exist', async () => {
    const r = await recordWalkthrough(path.join(os.tmpdir(), 'no-such-site-dir', 'index.html'), { outDir: tmp(), ...quiet });
    assert.equal(r.passed, false);
    assert.equal(r.recorded, false);
  });
});

describe('recordWalkthrough with a real browser', { skip: !hasPlaywright && 'playwright not installed' }, () => {
  const fast = { maxSecondsPerPage: 1, pauseMs: 150, ...quiet };

  test('records desktop and phone videos, posters, a manifest and an unsigned approval sheet', async () => {
    const site = fixtureSite();
    const out = tmp('wt-out-');
    const r = await recordWalkthrough(path.join(site, 'index.html'), { ...fast, outDir: out, ffmpeg: null });
    assert.equal(r.recorded, true, JSON.stringify(r.notes));
    assert.equal(r.passed, true, JSON.stringify(r.devices.map(d => d.pages)));
    for (const d of DEVICES.map(x => x.name)) {
      const v = path.join(out, `${d}.webm`);
      assert.ok(fs.existsSync(v), `${d}.webm missing`);
      const head = fs.readFileSync(v).subarray(0, 4);
      assert.deepEqual([...head], [0x1a, 0x45, 0xdf, 0xa3], `${d}.webm is not a WebM/Matroska file`);
      assert.ok(fs.statSync(v).size > 2000, `${d}.webm is suspiciously small`);
      assert.ok(fs.existsSync(path.join(out, `${d}-poster.png`)));
    }
    const m = JSON.parse(fs.readFileSync(path.join(out, 'walkthrough.json'), 'utf8'));
    assert.equal(m.devices.length, 2);
    assert.ok(m.devices[0].pages.length >= 3, 'discovered the nav links');
    assert.ok(m.devices.every(d => d.pages.every(p => p.ok)));
    const md = fs.readFileSync(path.join(out, 'CLIENT_APPROVAL.md'), 'utf8');
    assert.match(md, /Home page/);
    assert.equal(/- \[x\]/i.test(md), false);
    assert.ok(m.notes.some(n => /mp4/i.test(n)), 'explains that no MP4 was made without ffmpeg');
  });

  test('a broken page is reported as a failure, never hidden', async () => {
    const site = fixtureSite();
    const out = tmp('wt-out-');
    const r = await recordWalkthrough(path.join(site, 'index.html'), { ...fast, outDir: out, devices: ['phone'], pages: ['/index.html', '/missing-page.html'], ffmpeg: null });
    assert.equal(r.passed, false);
    const bad = r.devices[0].pages.find(p => p.path === '/missing-page.html');
    assert.equal(bad.ok, false);
    assert.equal(bad.status, 404);
    assert.match(fs.readFileSync(path.join(out, 'CLIENT_APPROVAL.md'), 'utf8'), /404/);
  });

  test('converts to MP4 when ffmpeg is available (command is H.264, yuv420p, faststart)', async () => {
    const site = fixtureSite();
    const out = tmp('wt-out-');
    const calls = [];
    const ffmpeg = (args) => { calls.push(args); fs.writeFileSync(args[args.length - 1], 'fake-mp4'); return { status: 0 }; };
    const r = await recordWalkthrough(path.join(site, 'index.html'), { ...fast, outDir: out, devices: ['phone'], pages: ['/index.html'], ffmpeg });
    assert.equal(calls.length, 1);
    const a = calls[0].join(' ');
    assert.match(a, /libx264/);
    assert.match(a, /yuv420p/);
    assert.match(a, /faststart/);
    assert.ok(fs.existsSync(path.join(out, 'phone.mp4')));
    assert.equal(r.devices[0].mp4, 'phone.mp4');
  });

  test('an invalid page path is a reported failure, never "loaded (HTTP 0)"', async () => {
    const site = fixtureSite();
    const out = tmp('wt-out-');
    const r = await recordWalkthrough(path.join(site, 'index.html'), { ...fast, outDir: out, devices: ['phone'], pages: ['/index.html', 'C:/Program Files/Git/'], ffmpeg: null });
    assert.equal(r.passed, false);
    const bad = r.devices[0].pages.find(p => p.path === 'C:/Program Files/Git/');
    assert.equal(bad.ok, false);
    const md = fs.readFileSync(path.join(out, 'CLIENT_APPROVAL.md'), 'utf8');
    assert.doesNotMatch(md, /loaded (HTTP 0)/);
    assert.match(md, /FAILED/);
  });

  test('captions can be switched off', async () => {
    const site = fixtureSite();
    const r = await recordWalkthrough(path.join(site, 'index.html'), { ...fast, outDir: tmp('wt-out-'), devices: ['phone'], pages: ['/index.html'], captions: false, ffmpeg: null });
    assert.equal(r.recorded, true);
    assert.equal(r.captions, false);
  });

  test('CLI: `walkthrough <file> --out dir --devices phone` works end to end', () => {
    const site = fixtureSite();
    const out = tmp('wt-cli-');
    const res = spawnSync(process.execPath, [path.join(root, 'scripts', 'website-engineering-harness-cli.js'), 'walkthrough', path.join(site, 'index.html'), '--out', out, '--devices', 'phone', '--max-seconds-per-page', '1', '--pause-ms', '150'], { encoding: 'utf8', timeout: 120000 });
    assert.equal(res.status, 0, res.stdout + res.stderr);
    assert.ok(fs.existsSync(path.join(out, 'phone.webm')));
    assert.ok(fs.existsSync(path.join(out, 'CLIENT_APPROVAL.md')));
  });
});
