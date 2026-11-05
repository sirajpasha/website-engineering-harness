import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { inspectCommand } from '../scripts/hooks/pre-bash-gate.js';

describe('recursive delete guard: block catastrophic targets, allow specific folders', () => {
  const blocked = [
    'rm -rf /', 'rm -rf /*', 'rm -fr /', 'rm -r -f /', 'rm -rf *', 'rm -rf ~', 'rm -rf ~/', 'rm -rf $HOME',
    'rm -rf .', 'rm -rf ..', 'rm -rf ./*', 'rm --no-preserve-root -rf /', 'sudo rm -rf /', 'cd x && rm -rf /; echo done'
  ];
  const allowed = [
    'rm -rf /e/Harness/Jayimpex-website/recording', 'rm -rf /tmp/build', 'rm -rf ./dist', 'rm -rf node_modules',
    'rm -rf .next', 'rm -rf dist build', 'rm -f notes.txt', 'rm -r old-folder', 'echo rm -rf is dangerous'
  ];
  for (const c of blocked) test(`blocks: ${c}`, () => assert.equal(inspectCommand(c).allowed, false, c));
  for (const c of allowed) test(`allows: ${c}`, () => assert.equal(inspectCommand(c).allowed, true, c));

  test('the other destructive rules are unchanged', () => {
    assert.equal(inspectCommand('git reset --hard HEAD~1').allowed, false);
    assert.equal(inspectCommand('git push origin main --force').allowed, false);
    assert.equal(inspectCommand('git commit -m x --no-verify').allowed, false);
    assert.equal(inspectCommand('chmod 777 file').allowed, false);
    assert.equal(inspectCommand('npm test').allowed, true);
  });
});
