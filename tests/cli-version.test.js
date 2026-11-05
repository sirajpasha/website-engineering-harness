import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

describe('version is reported consistently', () => {
  test('the CLI banner shows the real package version (not a hard-coded one)', () => {
    const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'website-engineering-harness-cli.js')], { encoding: 'utf8' });
    assert.match(r.stdout, new RegExp(`\\(v${pkg.version.replace(/\./g, '\\.')}\\)`));
    assert.doesNotMatch(r.stdout, /\(v2\.0\.0\)/);
  });

  test('VERSION, package.json, marketplace, Gemini extension and AGENTS.md agree', () => {
    const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
    assert.equal(read('VERSION').trim(), pkg.version);
    assert.equal(JSON.parse(read('.claude-plugin/marketplace.json')).plugins[0].version, pkg.version);
    assert.equal(JSON.parse(read('gemini-extension.json')).version, pkg.version);
    assert.match(read('AGENTS.md'), new RegExp(`\\*\\*Version:\\*\\*\\s*${pkg.version.replace(/\./g, '\\.')}`));
  });
});
