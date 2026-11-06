#!/usr/bin/env node
/**
 * Browser Validation (real Playwright execution)
 *
 * Loads the target page in headless Chromium at each of the 6 mandatory
 * viewports and MEASURES: horizontal overflow, touch-target size, heading and
 * landmark structure, and console/page errors. A screenshot is captured per
 * viewport. Nothing is reported as passing unless it was measured.
 *
 * Fail-closed: if Playwright (or a browser) is unavailable, or the target does
 * not exist, the result is `passed: false` and the process exits non-zero.
 *
 * Usage: node scripts/browser-validation/validate-browser.js [file.html | http(s)://url] [--out dir] [--project dir]
 *
 * Evidence binding: the report records a sourceHash of the PROJECT's sources so the quality gates can reject stale
 * evidence. For a file target that project is the file's folder. For a URL target (a running dev/preview server) it is
 * --project, else HARNESS_PROJECT_DIR / CLAUDE_PROJECT_DIR / the working directory (unless that is the harness repo itself).
 * The hash binds the evidence to the sources as they were when measured; it cannot prove the server at the URL was built
 * from them, which is why the report also records `sourceBinding`.
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { hashProjectSources } from '../quality-gates/evidence.js';
import { projectRoot, isHarnessRepo, findEntryHtml, importFromProject, resolveFromProject } from '../lib/paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../');

export const MANDATORY_VIEWPORTS = [
  { name: 'mobile-compact', width: 360, height: 800, category: 'Mobile' },
  { name: 'mobile-modern', width: 390, height: 844, category: 'Mobile' },
  { name: 'tablet-portrait', width: 768, height: 1024, category: 'Tablet' },
  { name: 'tablet-landscape', width: 1024, height: 768, category: 'Tablet' },
  { name: 'desktop-standard', width: 1440, height: 900, category: 'Desktop' },
  { name: 'desktop-fhd', width: 1920, height: 1080, category: 'Desktop' }
];

const TOUCH_MAX_WIDTH = 1024; // viewports narrower than this must meet the 44px target
const MIN_TARGET_PX = 44;

/** Runs inside the page. Must be self-contained (serialised by Playwright). */
function collectPageMetrics(minTarget) {
  const doc = document.documentElement;
  const horizontalOverflowPx = Math.max(0, doc.scrollWidth - doc.clientWidth);
  const smallTargets = [];
  const sel = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [tabindex]:not([tabindex="-1"])';
  for (const el of document.querySelectorAll(sel)) {
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (cs.display === 'inline' && el.tagName === 'A') continue; // WCAG 2.5.8 inline exception
    // A labelable control is activated by clicking any of its <label>s (wrapping or <label for>), so the largest
    // label counts as part of its tap target.
    let r = el.getBoundingClientRect();
    if (el.labels && el.labels.length) {
      for (const l of el.labels) {
        const lr = l.getBoundingClientRect();
        if (lr.width * lr.height > r.width * r.height) r = lr;
      }
    }
    if (r.width === 0 || r.height === 0) continue;
    if (r.width <= 1 && r.height <= 1) continue; // visually hidden (.sr-only skip links): not a tap target until focused
    if (r.width < minTarget || r.height < minTarget) {
      const label = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '');
      smallTargets.push(`${label} (${Math.round(r.width)}x${Math.round(r.height)})`);
    }
  }
  return {
    horizontalOverflowPx,
    smallTargets: smallTargets.slice(0, 20),
    h1Count: document.querySelectorAll('h1').length,
    hasMetaViewport: !!document.querySelector('meta[name="viewport"]'),
    hasMain: !!document.querySelector('main, [role=main]')
  };
}

/** Installed before any page script runs; records LCP and CLS for the page. */
const VITALS_INIT_SCRIPT = `
  window.__vitals = { lcpMs: null, cls: 0 };
  try {
    new PerformanceObserver(list => { for (const e of list.getEntries()) window.__vitals.lcpMs = e.startTime; })
      .observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value; })
      .observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}
`;

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Run axe-core in the page. Returns null (unmeasured) if axe-core is unavailable. */
async function runAxe(page) {
  let axePath;
  try { axePath = resolveFromProject('axe-core/axe.min.js'); } catch { return null; }
  try {
    await page.addScriptTag({ path: axePath });
    return await page.evaluate(async (tags) => {
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: tags } });
      return {
        violations: r.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }))
      };
    }, AXE_TAGS);
  } catch {
    return null;
  }
}

/** Worst case across viewports; null when nothing was measured. */
function aggregateVitals(results) {
  const v = results.map(r => r.metrics?.vitals).filter(x => x && x.lcpMs !== null);
  if (!v.length) return null;
  return {
    classification: 'LAB MEASURED',
    condition: 'headless Chromium, localhost, no throttling',
    lcpMs: Math.round(Math.max(...v.map(x => x.lcpMs))),
    cls: Number(Math.max(...v.map(x => x.cls)).toFixed(4))
  };
}

function aggregateA11y(results) {
  const a = results.map(r => r.metrics?.a11y).filter(Boolean);
  if (a.length !== results.length || !a.length) return null;
  const ids = new Map();
  for (const x of a) for (const viol of x.violations) ids.set(viol.id, viol);
  return { engine: 'axe-core', tags: AXE_TAGS, violations: ids.size, rules: [...ids.values()] };
}

/** Pure: turn measured metrics into pass/fail for one viewport. */
export function evaluateViewportMetrics(metrics, viewport) {
  const failures = [];
  if (metrics.horizontalOverflowPx > 1) {
    failures.push(`Horizontal overflow of ${metrics.horizontalOverflowPx}px`);
  }
  if (viewport.width < TOUCH_MAX_WIDTH && metrics.smallTargets.length > 0) {
    failures.push(`${metrics.smallTargets.length} touch target(s) below ${MIN_TARGET_PX}px: ${metrics.smallTargets.slice(0, 5).join(', ')}`);
  }
  if (metrics.h1Count !== 1) failures.push(`Expected exactly one <h1>, found ${metrics.h1Count}`);
  if (!metrics.hasMetaViewport) failures.push('Missing <meta name="viewport">');
  if (!metrics.hasMain) failures.push('Missing <main> landmark');
  if (metrics.a11yViolations > 0) failures.push(`${metrics.a11yViolations} axe WCAG violation rule(s): ${(metrics.a11y?.violations || []).map(v => v.id).slice(0, 5).join(', ')}`);
  if (metrics.consoleErrors?.length) failures.push(`Console/page errors: ${metrics.consoleErrors.slice(0, 3).join(' | ')}`);
  return { passed: failures.length === 0, failures };
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

/** Minimal static server so ES modules and root-relative assets load like production. */
export function serveDir(dir) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.resolve(dir, '.' + rel);
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

/**
 * Which project directory the evidence belongs to (and is hashed from), or null when there is none.
 * Pure given its inputs, so it is unit-tested without a browser.
 */
export function resolveEvidenceProject(target, options = {}, env = process.env, cwd = process.cwd()) {
  if (target.file) return path.dirname(target.file); // static file: the folder it lives in (unchanged behaviour)
  if (options.projectDir) return path.resolve(options.projectDir);
  const dir = projectRoot(env, cwd);
  return isHarnessRepo(dir) ? null : dir; // inside the harness repo a URL run has no project to bind to
}

export function resolveTarget(target) {
  if (!target) {
    // No explicit target: the user's project entry page, or the reference sample inside the harness repo.
    const sample = path.join(rootDir, 'examples/sample-website/index.html');
    target = isHarnessRepo() ? (fs.existsSync(sample) ? sample : null) : findEntryHtml(projectRoot());
  }
  if (!target) return null;
  if (/^https?:\/\//i.test(target)) return { url: target, label: target };
  const abs = path.resolve(target);
  if (!fs.existsSync(abs)) return null;
  return { file: abs, label: path.relative(rootDir, abs) || abs };
}

export async function validateBrowser(targetPath, options = {}) {
  const log = options.log || console.log;
  const importer = options.importer || (() => importFromProject('playwright'));

  log('====================================================');
  log('  PLAYWRIGHT BROWSER VALIDATION (6 VIEWPORTS)');
  log('====================================================');

  const target = resolveTarget(targetPath);
  if (!target) {
    log(`[✖] Target not found: ${targetPath || '(none given and no sample site)'}. Nothing was tested.`);
    return { passed: false, blocked: false, viewportsTested: 0, results: [], reason: 'target-not-found' };
  }

  let chromium;
  try {
    const mod = await importer();
    chromium = mod.chromium ?? mod.default?.chromium; // CJS packages surface their API on `default`
    if (!chromium) throw new Error("module has no chromium export");
  } catch (err) {
    log('[✖] BLOCKED: Playwright is not installed. No browser validation was performed.');
    log('    Fix (in your project): npm i -D playwright axe-core && npx playwright install chromium');
    return { passed: false, blocked: true, viewportsTested: 0, results: [], reason: `playwright-unavailable: ${err.message}` };
  }

  let server = null;
  if (target.file) {
    server = await serveDir(path.dirname(target.file));
    target.url = `http://127.0.0.1:${server.address().port}/${encodeURIComponent(path.basename(target.file))}`;
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    log('[✖] BLOCKED: Chromium could not be launched. No browser validation was performed.');
    log('    Fix: npx playwright install chromium');
    if (server) server.close();
    return { passed: false, blocked: true, viewportsTested: 0, results: [], reason: `browser-launch-failed: ${err.message}` };
  }

  // Evidence lives with the project under test: <project>/reports/browser-qa
  const projectDir = resolveEvidenceProject(target, options);
  const sourceBinding = target.file ? 'file-target' : projectDir ? 'url-target:project-sources-at-measure-time' : 'none';
  const outDir = options.outDir || path.join(projectDir || rootDir, 'reports', 'browser-qa');
  fs.mkdirSync(outDir, { recursive: true });
  log(`Target: ${target.label}`);
  if (sourceBinding.startsWith('url-target')) log(`Evidence bound to project sources: ${projectDir}`);
  log('');
  const results = [];

  try {
    for (const vp of MANDATORY_VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        hasTouch: vp.width < TOUCH_MAX_WIDTH,
        isMobile: vp.width < 768
      });
      await context.addInitScript(VITALS_INIT_SCRIPT);
      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
      page.on('pageerror', e => consoleErrors.push(e.message));
      page.on('requestfailed', r => {
        // A cancelled request (router prefetch cut short, aborted fetch) is normal browser behaviour, not a failure.
        if (/ERR_ABORTED/.test(r.failure()?.errorText || '')) return;
        consoleErrors.push(`request failed: ${r.url()}`);
      });

      let metrics;
      let screenshot = null;
      try {
        await page.goto(target.url, { waitUntil: 'load', timeout: 30000 });
        metrics = await page.evaluate(collectPageMetrics, MIN_TARGET_PX);
        await page.waitForTimeout(400); // let LCP/layout-shift entries settle
        metrics.vitals = await page.evaluate(() => window.__vitals || null);
        metrics.a11y = await runAxe(page);
        if (metrics.a11y) metrics.a11yViolations = metrics.a11y.violations.length;
        screenshot = path.join(outDir, `${vp.name}-${vp.width}x${vp.height}.png`);
        await page.screenshot({ path: screenshot, fullPage: true });
      } catch (err) {
        metrics = { horizontalOverflowPx: 0, smallTargets: [], h1Count: 1, hasMetaViewport: true, hasMain: true };
        consoleErrors.push(`navigation failed: ${err.message}`);
      }
      metrics.consoleErrors = consoleErrors;
      const verdict = evaluateViewportMetrics(metrics, vp);
      results.push({ viewport: vp.name, width: vp.width, height: vp.height, ...verdict, metrics, screenshot });
      const mark = verdict.passed ? '✔' : '✖';
      const detail = verdict.passed ? '' : '\n      - ' + verdict.failures.join('\n      - ');
      log(`[${mark}] ${vp.name.padEnd(17)} ${vp.width}x${vp.height}${detail}`);
      await context.close();
    }
  } finally {
    await browser.close();
    if (server) server.close();
  }

  const passed = results.every(r => r.passed);
  const report = {
    target: target.label,
    measuredAt: new Date().toISOString(),
    tool: 'playwright-chromium',
    sourceHash: projectDir ? hashProjectSources(projectDir) : null,
    sourceBinding,
    passed,
    viewportsTested: results.length,
    vitals: aggregateVitals(results),
    a11y: aggregateA11y(results),
    results
  };
  fs.writeFileSync(path.join(outDir, 'browser-qa.json'), JSON.stringify(report, null, 2), 'utf8');

  log('\n====================================================');
  log(`  Browser QA: ${results.filter(r => r.passed).length}/${results.length} viewports passed (measured)`);
  log('====================================================\n');
  return { passed, blocked: false, viewportsTested: results.length, results };
}

if (process.argv[1] && process.argv[1].endsWith('validate-browser.js')) {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const outDir = outIdx >= 0 ? args.splice(outIdx, 2)[1] : undefined;
  const projIdx = args.indexOf('--project');
  const projectDir = projIdx >= 0 ? args.splice(projIdx, 2)[1] : undefined;
  validateBrowser(args[0], { outDir, projectDir }).then(r => process.exit(r.passed ? 0 : 1));
}
