import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decide } from '../scripts/hooks/claude-hook.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('claude-hook decide()', () => {
  test('blocks destructive Bash', () => {
    const d = decide({ tool_name: 'Bash', tool_input: { command: 'git reset --hard HEAD~1' } });
    assert.equal(d.allow, false);
  });
  test('allows benign Bash', () => {
    assert.equal(decide({ tool_name: 'Bash', tool_input: { command: 'npm test' } }).allow, true);
  });
  test('blocks writing a secret', () => {
    const d = decide({ tool_name: 'Write', tool_input: { file_path: 'src/a.js', content: 'const k = "-----BEGIN PRIVATE KEY-----"' } });
    assert.equal(d.allow, false);
  });
  test('blocks the AI purple gradient in CSS', () => {
    const d = decide({ tool_name: 'Edit', tool_input: { file_path: 'src/a.css', old_string: 'x', new_string: 'background: linear-gradient(135deg, #667eea, #764ba2)' } });
    assert.equal(d.allow, false);
  });
  test('enforces agent contract from agent_type (reviewer cannot write src/)', () => {
    const d = decide({ tool_name: 'Write', agent_type: 'browser-qa', tool_input: { file_path: 'src/app.js', content: 'x' } });
    assert.equal(d.allow, false);
    assert.match(d.reason, /browser-qa/);
  });
  test('main session (no agent_type) is not contract-restricted', () => {
    assert.equal(decide({ tool_name: 'Write', tool_input: { file_path: 'src/app.js', content: 'x' } }).allow, true);
  });
  test('absolute paths inside the repo are normalised for contracts', () => {
    const abs = path.join(root, 'src', 'app.js');
    assert.equal(decide({ tool_name: 'Write', agent_type: 'browser-qa', tool_input: { file_path: abs, content: 'x' } }).allow, false);
  });
  test('ignores unrelated tools', () => {
    assert.equal(decide({ tool_name: 'Read', tool_input: { file_path: 'a' } }).allow, true);
  });
});

describe('.claude/settings.json wiring', () => {
  const settings = JSON.parse(fs.readFileSync(path.join(root, '.claude/settings.json'), 'utf8'));
  test('PreToolUse hook covers Bash and file writes and calls claude-hook.js', () => {
    const pre = settings.hooks.PreToolUse;
    const matchers = pre.map(h => h.matcher).join('|');
    for (const t of ['Bash', 'Write', 'Edit']) assert.match(matchers, new RegExp(t));
    assert.ok(JSON.stringify(pre).includes('claude-hook.js'));
  });
  test('denies reading .env and force pushes', () => {
    const deny = settings.permissions.deny.join('\n');
    assert.match(deny, /\.env/);
    assert.match(deny, /push --force|push -f/);
  });
});
