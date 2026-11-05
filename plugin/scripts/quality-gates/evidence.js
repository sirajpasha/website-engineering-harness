/**
 * Evidence helpers shared by the browser validator and the quality gates.
 * The source hash binds a machine-generated QA report to the exact project
 * sources it was measured against, so stale evidence cannot satisfy a gate.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SOURCE_EXT = new Set(['.html', '.css', '.js', '.mjs', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.svg', '.json']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'reports', 'tests', 'test', '.harness', '.playwright-artifacts', 'coverage', 'dist']);

function walk(dir, base, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), base, out);
    } else if (SOURCE_EXT.has(path.extname(entry.name).toLowerCase())) {
      out.push(path.relative(base, path.join(dir, entry.name)).replace(/\\/g, '/'));
    }
  }
}

/** SHA-256 over the project's source files (paths + LF-normalised content). */
export function hashProjectSources(projectDir) {
  const files = [];
  if (fs.existsSync(projectDir)) walk(projectDir, projectDir, files);
  files.sort();
  const h = crypto.createHash('sha256');
  for (const rel of files) {
    h.update(rel + '\0');
    h.update(fs.readFileSync(path.join(projectDir, rel), 'utf8').replace(/\r\n/g, '\n'));
    h.update('\0');
  }
  return h.digest('hex');
}
