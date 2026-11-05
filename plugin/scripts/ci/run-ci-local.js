#!/usr/bin/env node
/**
 * Run the GitHub Actions CI workflow locally: executes every `run:` step of
 * .github/workflows/ci.yml in order (so it cannot drift from the real workflow).
 * `uses:` steps (checkout, setup-node, upload-artifact) are skipped - they are
 * GitHub-hosted plumbing. Exit code is non-zero if any step fails.
 *   npm run ci:local            run all steps
 *   npm run ci:local -- --list  print the steps only
 * For a full container run, `act` (needs Docker) also works: `act pull_request`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function parseSteps(yml) {
  const steps = [];
  let cur = null;
  for (const line of yml.split(/\r?\n/)) {
    const name = line.match(/^\s*-\s+name:\s*(.+?)\s*$/);
    const uses = line.match(/^\s*-\s+uses:\s*(.+?)\s*$/);
    if (name || uses) { cur = { name: name ? name[1] : uses[1], run: null, uses: !!uses }; steps.push(cur); continue; }
    const run = line.match(/^\s+run:\s*(.+?)\s*$/);
    if (run && cur) cur.run = run[1];
    if (/^\s+uses:/.test(line) && cur) cur.uses = true;
  }
  return steps.filter((s) => s.run && !s.uses);
}

export function localCommand(cmd) {
  // `--with-deps` installs OS packages via apt (Linux runner only).
  return process.platform === 'linux' ? cmd : cmd.replace(/\s--with-deps\b/, '');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const steps = parseSteps(fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8'));
  if (process.argv.includes('--list')) { steps.forEach((s, i) => console.log(`${i + 1}. ${s.name}: ${localCommand(s.run)}`)); process.exit(0); }
  const results = [];
  for (const s of steps) {
    console.log(`\n=== [${results.length + 1}/${steps.length}] ${s.name}\n$ ${localCommand(s.run)}`);
    const r = spawnSync(localCommand(s.run), { cwd: root, shell: true, stdio: 'inherit' });
    results.push({ name: s.name, ok: r.status === 0 });
    if (r.status !== 0) break;
  }
  console.log('\n=== Local CI summary');
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}`);
  const ok = results.length === steps.length && results.every((r) => r.ok);
  console.log(ok ? '\nLocal CI: all steps passed' : '\nLocal CI: FAILED');
  process.exit(ok ? 0 : 1);
}
