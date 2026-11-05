#!/usr/bin/env node
/**
 * Client walkthrough video.
 *
 * Drives the REAL site in headless Chromium (Playwright) and records what a visitor would see, so the
 * result can be sent to a client for approval:
 *
 *   <out>/desktop.webm, phone.webm      continuous recordings (+ .mp4 when ffmpeg is installed)
 *   <out>/desktop-poster.png ...        a still of each video's first screen
 *   <out>/walkthrough.json              machine-readable manifest (pages, statuses, files)
 *   <out>/CLIENT_APPROVAL.md            what is shown + measured QA evidence + an UNSIGNED decision block
 *
 * Honesty rules (same as the rest of the harness):
 *  - it records the actual build, never a mockup, and fails closed (blocked / not recorded) if it cannot;
 *  - a page that does not load (HTTP >= 400, navigation error) is reported as a failure and the
 *    recording is marked "not ready" - it is never silently shown as fine;
 *  - quality figures in the approval sheet come only from a FRESH Playwright QA report for the same
 *    sources (otherwise the sheet says there is no fresh evidence);
 *  - the approval boxes are never pre-ticked: a human decides.
 *
 * Usage: node scripts/walkthrough/walkthrough.js [url|file.html] [--out dir] [--devices desktop,phone]
 *          [--pages /,/about] [--max-pages 8] [--max-seconds-per-page 10] [--pause-ms 1200]
 *          [--label "Acme v1"] [--no-captions]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { projectRoot, importFromProject } from '../lib/paths.js';
import { serveDir, resolveTarget } from '../browser-validation/validate-browser.js';
import { hashProjectSources } from '../quality-gates/evidence.js';

export const DEVICES = [
  { name: 'desktop', width: 1440, height: 900, touch: false, mobile: false },
  { name: 'phone', width: 390, height: 844, touch: true, mobile: true }
];

const NON_PAGE_EXT = /\.(pdf|png|jpe?g|gif|webp|avif|svg|ico|css|js|mjs|json|xml|txt|zip|mp4|webm|woff2?|ttf)$/i;

/** Pure: same-origin, unique, page-like paths from a list of hrefs (entry page always available). */
export function discoverPages(hrefs, baseUrl, limit = 8) {
  const base = new URL(baseUrl);
  const seen = new Set();
  for (const href of hrefs) {
    let u;
    try { u = new URL(href, base); } catch { continue; }
    if (!/^https?:$/.test(u.protocol) || u.origin !== base.origin) continue;
    if (NON_PAGE_EXT.test(u.pathname)) continue;
    seen.add(u.pathname || '/');
    if (seen.size >= limit) break;
  }
  return seen.size ? [...seen] : ['/'];
}

/** Pure: a site path ("/about"), or null when the value is not one (drive paths, URLs, empty). */
export function normalizePagePath(p) {
  const s = String(p ?? '').trim();
  if (!s) return null;
  if (/^[A-Za-z]:[\\/]/.test(s) || /^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith('//')) return null;
  return s.startsWith('/') ? s : `/${s}`;
}

/**
 * Pure: Git Bash on Windows rewrites a command-line argument that starts with "/" into
 * "C:/Program Files/Git/...". Undo exactly that rewrite so `--pages /,/about` works there.
 */
export function unmangleGitBashPath(p) {
  const m = String(p).match(/^[A-Za-z]:[\\/]Program Files(?: \(x86\))?[\\/]Git(?:[\\/](.*))?$/i);
  return m ? `/${(m[1] || '').replace(/\\/g, '/')}` : p;
}

/** Pure: the on-screen caption for a page. */
export function buildCaption({ title, path: p }) {
  // Real <title>s are long SEO strings ("About Us | Brand | City"); keep only the first segment.
  const first = (title || '').split(/\s[|–—-]\s/)[0].trim();
  const short = p === '/' ? 'Home' : first;
  return short ? `${short} · ${p}` : p;
}

const fmtDate = (iso) => iso.slice(0, 10);
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|');

/** Pure: the CLIENT_APPROVAL.md text. `qa` is the result of readFreshQa(). */
export function approvalMarkdown(m, qa) {
  const lines = [];
  lines.push(`# Client approval — ${m.label}`, '');
  lines.push(`Prepared ${fmtDate(m.recordedAt)} · Recorded from: \`${m.target}\``, '');
  if (!m.passed) {
    lines.push('> **Not ready for approval.** One or more pages failed to load during recording (see the table). Fix them and record again.', '');
  }
  lines.push('## What you are approving', '');
  lines.push('A recording of the **actual website build**, not a design mockup. Please watch each video and use the decision block at the end.', '');
  lines.push('| Device | Screen | Video | Still |', '|---|---|---|---|');
  for (const d of m.devices) {
    lines.push(`| ${d.name} | ${d.width}×${d.height} | \`${d.video}\`${d.mp4 ? ` · \`${d.mp4}\`` : ''} | \`${d.poster}\` |`);
  }
  lines.push('', '### Pages shown', '', '| Page | Title | Result |', '|---|---|---|');
  const pages = m.devices[0]?.pages || [];
  for (const p of pages) {
    lines.push(`| \`${esc(p.path)}\` | ${esc(p.title) || '—'} | ${p.ok ? 'loaded (HTTP ' + p.status + ')' : '**FAILED** (' + (p.status || 'no response') + ')'} |`);
  }
  lines.push('', '## Quality evidence (measured, not estimated)', '');
  if (qa && qa.fresh) {
    lines.push(`- Browser check: **${qa.viewportsPassed} of ${qa.viewportsTested}** viewports passed (phone, tablet, desktop sizes) — overflow, tap targets, structure.`);
    lines.push(`- Accessibility (axe-core, WCAG 2.2 AA rules): **${qa.axeViolations}** violation rule(s).`);
    if (qa.lcpMs != null) lines.push(`- Load speed, LAB MEASURED on the build machine (not real-user data): LCP ${qa.lcpMs} ms, layout shift ${qa.cls}.`);
  } else {
    lines.push('- No fresh browser QA evidence for these exact sources. Run the browser QA (`test:browser`) so measured results can be shown here.');
  }
  lines.push('', '## What this does not show', '');
  lines.push('- Only navigation, scrolling and the mobile menu are demonstrated; forms are **not** submitted and nothing is sent.');
  lines.push('- It is one browser (Chromium) at two screen sizes; other browsers and real devices are not part of this recording.');
  for (const n of m.notes || []) lines.push(`- ${n}`);
  lines.push('', '## Decision', '');
  lines.push('- [ ] Approved as shown');
  lines.push('- [ ] Approved with the changes listed below');
  lines.push('- [ ] Changes required before approval', '');
  lines.push('Changes requested:', '', '> ', '');
  lines.push('Name: ____________________   Role: ____________________', '', 'Date: ____________________   Signature: ____________________', '');
  return lines.join('\n');
}

/** Measured QA numbers for these sources, or { fresh:false } (stale/missing/not from the validator). */
export function readFreshQa(projectDir) {
  try {
    const p = path.join(projectDir, 'reports', 'browser-qa', 'browser-qa.json');
    const r = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (r.tool !== 'playwright-chromium' || !r.sourceHash || r.sourceHash !== hashProjectSources(projectDir)) return { fresh: false };
    return {
      fresh: true,
      viewportsTested: r.viewportsTested,
      viewportsPassed: r.results.filter(x => x.passed).length,
      axeViolations: r.a11y ? r.a11y.violations : 'not measured',
      lcpMs: r.vitals ? r.vitals.lcpMs : null,
      cls: r.vitals ? r.vitals.cls : null
    };
  } catch {
    return { fresh: false };
  }
}

function ffmpegAvailable() {
  const r = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  return r.status === 0;
}
const defaultFfmpeg = () => (ffmpegAvailable() ? (args) => spawnSync('ffmpeg', args, { stdio: 'ignore' }) : null);

/** Runs inside the page: smooth, eased scroll to the bottom and back to the top. */
async function smoothScrollTour(page, seconds) {
  await page.evaluate(async (secs) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const total = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if (total < 20) return;
    const down = Math.max(400, secs * 1000);
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const run = (from, to, ms) => new Promise((resolve) => {
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        window.scrollTo(0, from + (to - from) * ease(t));
        t < 1 ? requestAnimationFrame(step) : resolve();
      };
      requestAnimationFrame(step);
    });
    await run(0, total, down);
    await sleep(400);
    await run(total, 0, Math.min(down, 1200));
  }, seconds);
}

async function showCaption(page, text, badge) {
  await page.evaluate(({ text, badge }) => {
    document.getElementById('__harness_caption')?.remove();
    // One compact box (bottom-left) so it never covers the site's header or navigation:
    // line 1 = page, line 2 = "preview build" label.
    const el = document.createElement('div');
    el.id = '__harness_caption';
    Object.assign(el.style, {
      position: 'fixed', left: '12px', bottom: '12px', zIndex: '2147483647', pointerEvents: 'none',
      background: 'rgba(15,23,42,0.9)', color: '#fff', font: '600 13px/1.3 system-ui, sans-serif',
      padding: '7px 11px', borderRadius: '9px', maxWidth: 'min(70vw, 360px)', boxShadow: '0 4px 18px rgba(0,0,0,.35)'
    });
    const main = document.createElement('div');
    main.textContent = text;
    el.appendChild(main);
    if (badge) {
      const sub = document.createElement('div');
      sub.textContent = badge;
      Object.assign(sub.style, { font: '700 10px/1.3 system-ui, sans-serif', letterSpacing: '.07em', textTransform: 'uppercase', color: '#fbbf24', marginTop: '2px' });
      el.appendChild(sub);
    }
    document.documentElement.appendChild(el);
  }, { text, badge });
}

async function phoneMenuDemo(page, pauseMs) {
  const toggle = page.getByRole('button', { name: /menu|navigation/i }).first();
  if (!(await toggle.count())) return false;
  try {
    await toggle.click({ timeout: 3000 });
    await page.waitForTimeout(Math.max(pauseMs, 900));
    await page.keyboard.press('Escape');
    const closer = page.getByRole('button', { name: /close/i }).first();
    if (await closer.count()) await closer.click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(300);
    return true;
  } catch {
    return false;
  }
}

export async function recordWalkthrough(targetArg, options = {}) {
  const log = options.log || console.log;
  const importer = options.importer || (() => importFromProject('playwright'));
  const captions = options.captions !== false;
  const pauseMs = options.pauseMs ?? 1200;
  const maxSeconds = options.maxSecondsPerPage ?? 10;
  const deviceNames = options.devices || DEVICES.map(d => d.name);
  const devices = DEVICES.filter(d => deviceNames.includes(d.name));
  const ffmpeg = options.ffmpeg !== undefined ? options.ffmpeg : defaultFfmpeg();

  log('====================================================');
  log('  CLIENT WALKTHROUGH RECORDING');
  log('====================================================');

  const target = resolveTarget(targetArg);
  if (!target) {
    log(`[✖] Target not found: ${targetArg || '(none given and no project entry page)'}. Nothing was recorded.`);
    return { passed: false, blocked: false, recorded: false, devices: [], notes: ['target-not-found'] };
  }

  let chromium;
  try {
    const mod = await importer();
    chromium = mod.chromium ?? mod.default?.chromium;
    if (!chromium) throw new Error('module has no chromium export');
  } catch (err) {
    log('[✖] BLOCKED: Playwright is not installed. Nothing was recorded.');
    log('    Fix (in your project): npm i -D playwright && npx playwright install chromium');
    return { passed: false, blocked: true, recorded: false, devices: [], notes: [`playwright-unavailable: ${err.message}`] };
  }

  let server = null;
  if (target.file) {
    server = await serveDir(path.dirname(target.file));
    target.url = `http://127.0.0.1:${server.address().port}/${encodeURIComponent(path.basename(target.file))}`;
  }
  const projectDir = target.file ? path.dirname(target.file) : null;
  const outDir = path.resolve(options.outDir || path.join(projectDir || projectRoot(), 'reports', 'walkthrough'));
  fs.mkdirSync(outDir, { recursive: true });

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    server?.close();
    log('[✖] BLOCKED: Chromium could not be launched. Nothing was recorded.');
    log('    Fix: npx playwright install chromium');
    return { passed: false, blocked: true, recorded: false, devices: [], notes: [`browser-launch-failed: ${err.message}`] };
  }

  const label = options.label || target.label;
  const recordedAt = (options.now ? options.now() : new Date()).toISOString();
  const badge = `${options.label ? options.label + ' · ' : ''}Preview build · ${fmtDate(recordedAt)}`;
  const entryUrl = new URL(target.url);
  const entryPath = entryUrl.pathname || '/';

  const result = { passed: true, blocked: false, recorded: false, captions, devices: [], notes: [], label, target: target.label, recordedAt, outDir };

  try {
    // 1) which pages?
    let pagePaths = options.pages && options.pages.length ? options.pages : null;
    if (!pagePaths) {
      const scout = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
      await scout.goto(target.url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
      const hrefs = await scout.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'))).catch(() => []);
      await scout.context().close();
      pagePaths = discoverPages([entryPath, ...hrefs], target.url, options.maxPages ?? 8);
    }

    // 2) one continuous recording per device
    for (const dev of devices) {
      const videoTmp = fs.mkdtempSync(path.join(outDir, `.rec-${dev.name}-`));
      const context = await browser.newContext({
        viewport: { width: dev.width, height: dev.height },
        hasTouch: dev.touch,
        isMobile: dev.mobile,
        recordVideo: { dir: videoTmp, size: { width: dev.width, height: dev.height } }
      });
      const page = await context.newPage();
      const pages = [];
      let posterTaken = false;
      let menuShown = false;

      for (const p of pagePaths) {
        const entry = { path: p, title: '', status: 0, ok: false };
        const norm = normalizePagePath(p);
        if (!norm) {
          entry.error = 'not a site path (on Windows Git Bash a bare "/" is rewritten to a drive path; use "index" or set MSYS_NO_PATHCONV=1)';
        } else {
          try {
            const resp = await page.goto(new URL(norm, target.url).href, { waitUntil: 'networkidle', timeout: 30000 });
            entry.status = resp ? resp.status() : 0;
            entry.title = await page.title();
            // Loaded means a real 2xx/3xx HTTP response, still on the same site (status 0 / error pages are NOT loaded).
            entry.ok = !!resp && entry.status >= 200 && entry.status < 400 && new URL(page.url()).origin === entryUrl.origin;
          } catch (err) {
            entry.status = 0;
            entry.error = String(err.message).split('\n')[0];
          }
        }
        pages.push(entry);
        if (!entry.ok) { result.passed = false; log(`[✖] ${dev.name}: ${p} did not load (${entry.status || entry.error})`); continue; }

        if (captions) await showCaption(page, buildCaption({ title: entry.title, path: p, label }), badge);
        await page.waitForTimeout(pauseMs);
        if (!posterTaken) {
          await page.screenshot({ path: path.join(outDir, `${dev.name}-poster.png`) });
          posterTaken = true;
        }
        await smoothScrollTour(page, maxSeconds);
        if (dev.mobile && !menuShown) menuShown = await phoneMenuDemo(page, pauseMs);
        await page.waitForTimeout(pauseMs);
        log(`[✔] ${dev.name}: ${p}  (${entry.title || 'untitled'})`);
      }

      const video = page.video();
      await context.close(); // finalises the file
      const dest = path.join(outDir, `${dev.name}.webm`);
      if (video) {
        const src = await video.path();
        fs.rmSync(dest, { force: true });
        fs.renameSync(src, dest);
      }
      fs.rmSync(videoTmp, { recursive: true, force: true });

      const rec = { name: dev.name, width: dev.width, height: dev.height, video: `${dev.name}.webm`, poster: `${dev.name}-poster.png`, pages };

      if (ffmpeg && fs.existsSync(dest)) {
        const mp4 = path.join(outDir, `${dev.name}.mp4`);
        const r = ffmpeg(['-y', '-i', dest, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', mp4]);
        if (r && r.status === 0 && fs.existsSync(mp4)) rec.mp4 = `${dev.name}.mp4`;
        else result.notes.push(`MP4 conversion failed for ${dev.name}; the .webm is the deliverable.`);
      }
      result.devices.push(rec);
    }
    result.recorded = result.devices.length > 0 && result.devices.every(d => fs.existsSync(path.join(outDir, d.video)));
    if (!result.recorded) result.passed = false;
  } finally {
    await browser.close();
    server?.close();
  }

  if (!ffmpeg) {
    result.notes.push('No MP4 was produced because ffmpeg is not installed. The .webm plays in Chrome, Edge and Firefox; for WhatsApp / email / Safari, install ffmpeg and re-run (or convert the .webm).');
  }

  const qa = projectDir ? readFreshQa(projectDir) : { fresh: false };
  const manifest = {
    label, target: target.label, recordedAt, passed: result.passed, tool: 'playwright-chromium',
    sourceHash: projectDir ? hashProjectSources(projectDir) : null,
    captions, devices: result.devices, notes: result.notes
  };
  fs.writeFileSync(path.join(outDir, 'walkthrough.json'), JSON.stringify(manifest, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'CLIENT_APPROVAL.md'), approvalMarkdown(manifest, qa), 'utf8');

  log('\n====================================================');
  log(`  ${result.passed ? 'Recorded' : 'NOT READY'}: ${result.devices.map(d => d.video).join(', ')}`);
  log(`  Output: ${outDir}`);
  log('====================================================\n');
  return result;
}

function parseArgs(argv) {
  const get = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
  const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && !['--no-captions'].includes(argv[i - 1])));
  return {
    target: positional[0],
    options: {
      outDir: get('--out'),
      devices: get('--devices') ? get('--devices').split(',').map(s => s.trim()) : undefined,
      pages: get('--pages') ? get('--pages').split(',').map(s => unmangleGitBashPath(s.trim())).filter(Boolean) : undefined,
      maxPages: get('--max-pages') ? Number(get('--max-pages')) : undefined,
      maxSecondsPerPage: get('--max-seconds-per-page') ? Number(get('--max-seconds-per-page')) : undefined,
      pauseMs: get('--pause-ms') ? Number(get('--pause-ms')) : undefined,
      label: get('--label'),
      captions: !argv.includes('--no-captions')
    }
  };
}

export { parseArgs as parseWalkthroughArgs };

if (process.argv[1] && process.argv[1].endsWith('walkthrough.js')) {
  const { target, options } = parseArgs(process.argv.slice(2));
  recordWalkthrough(target, options).then(r => process.exit(r.passed ? 0 : 1));
}
