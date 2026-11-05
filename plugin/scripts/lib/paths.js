/**
 * Path resolution shared by every harness script.
 *
 * Two roots exist once the harness is installed as a plugin / npm package:
 *   HARNESS_ROOT  where the harness itself lives (agents, contracts, standards, templates)
 *   projectRoot() the website project being worked on (writes, receipts, git hooks, gates)
 *
 * Inside the harness repo itself the two coincide, so development behaviour is unchanged.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const HARNESS_ROOT = path.resolve(__dirname, '../../');
export const SAMPLE_PROJECT = path.join(HARNESS_ROOT, 'examples', 'sample-website');

/** The user's project: HARNESS_PROJECT_DIR, else CLAUDE_PROJECT_DIR (set by Claude Code), else cwd. */
export function projectRoot(env = process.env, cwd = process.cwd()) {
  return path.resolve(env.HARNESS_PROJECT_DIR || env.CLAUDE_PROJECT_DIR || cwd);
}

/** True when the project being worked on is the harness repository itself. */
export function isHarnessRepo(dir = projectRoot()) {
  return path.resolve(dir) === HARNESS_ROOT;
}

/** Default target for gates/ratchets/browser QA: the user's project, or the reference sample inside the harness repo. */
export function defaultTarget(dir = projectRoot()) {
  return isHarnessRepo(dir) ? SAMPLE_PROJECT : path.resolve(dir);
}

const ENTRY_CANDIDATES = ['index.html', 'public/index.html', 'dist/index.html', 'build/index.html', 'src/index.html'];

/** First conventional entry HTML file in a project, or null. */
export function findEntryHtml(dir) {
  for (const c of ENTRY_CANDIDATES) {
    const p = path.join(dir, c);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** Resolve a module/file path the way the user's project would (falls back to the harness's own node_modules). */
export function resolveFromProject(specifier, dir = projectRoot()) {
  const attempts = [path.join(dir, 'noop.js'), path.join(HARNESS_ROOT, 'noop.js')];
  let lastErr;
  for (const from of attempts) {
    try { return createRequire(from).resolve(specifier); } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

/** Dynamic import of an optional dependency (e.g. playwright) installed in the project OR the harness. */
export async function importFromProject(specifier, dir = projectRoot()) {
  const resolved = resolveFromProject(specifier, dir);
  return import(pathToFileURL(resolved).href);
}
