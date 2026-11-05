import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseSteps, localCommand } from '../scripts/ci/run-ci-local.js';

test('parses the real workflow: run steps only, in order', () => {
  const steps = parseSteps(fs.readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8'));
  const cmds = steps.map((s) => s.run);
  assert.ok(cmds.includes('npm test') && cmds.includes('npm run gate'));
  assert.ok(cmds.indexOf('npm test') < cmds.indexOf('npm run gate'));
  assert.ok(!steps.some((s) => s.uses));
});
test('drops apt-only --with-deps off Linux', () => {
  const out = localCommand('npx playwright install --with-deps chromium');
  assert.equal(out.includes('--with-deps'), process.platform === 'linux');
});
