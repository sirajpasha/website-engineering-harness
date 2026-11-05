import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateMCP } from '../scripts/mcp-validation/validate-mcp.js';
import { verifyGates, SAMPLE_PROJECT } from '../scripts/quality-gates/gate-rules.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8');
const quiet = (fn) => { const l = console.log; console.log = () => {}; try { return fn(); } finally { console.log = l; } };

describe('Stitch / MCP configuration is honest', () => {
  test('mcp.json does not reference nonexistent Stitch packages and pins Playwright MCP', () => {
    const cfg = JSON.parse(read('mcp.json'));
    const text = JSON.stringify(cfg);
    assert.ok(!text.includes('@google/stitch-mcp'), 'package does not exist on npm');
    assert.ok(!text.includes('@google/stitch-cli'), 'package does not exist on npm');
    assert.ok(cfg.mcpServers.playwright, 'playwright MCP stays configured');
    assert.ok(!/@latest/.test(text), 'servers must be pinned to an exact version, not @latest');
  });

  test('no shipped doc or agent tells anyone to install a nonexistent package or invented tool names', () => {
    const files = [
      'agents/stitch-design-engineer.md', 'commands/website-stitch.md', 'docs/configuration.md', 'docs/troubleshooting.md',
      'skills/registry/SKILL_REGISTRY.md', 'AGENTS.md', 'integrations/google-stitch-mcp.md', 'integrations/google-stitch-sdk.md'
    ];
    for (const f of files) {
      const t = read(f);
      assert.ok(!/npx -y @google\/stitch-mcp/.test(t), `${f}: installs a nonexistent package`);
      assert.ok(!/npm install -g @google\/stitch-cli/.test(t), `${f}: installs a nonexistent package`);
      assert.ok(!/stitch_create_project|stitch_generate_screen|stitch_export_tokens/.test(t), `${f}: invented tool names`);
    }
  });

  test('integrations/google-stitch-cli.md is gone (there is no official Stitch CLI)', () => {
    assert.ok(!fs.existsSync(path.join(root, 'integrations/google-stitch-cli.md')));
    assert.ok(fs.existsSync(path.join(root, 'integrations/google-stitch-sdk.md')));
  });

  test('the Stitch example config is reference-only and holds no real key', () => {
    const ex = JSON.parse(read('integrations/stitch.mcp.example.json'));
    assert.match(ex._comment, /REFERENCE ONLY/);
    assert.equal(ex.mcpServers.stitch.headers['X-Goog-Api-Key'], '${STITCH_API_KEY}');
  });

  test('validateMCP passes without Stitch and reports it as optional (not as configured)', () => {
    const r = quiet(() => validateMCP());
    assert.equal(r.valid, true);
    assert.equal(r.hasPlaywright, true);
    assert.equal(r.hasStitch, false);
    assert.equal(r.stitch, 'optional-not-configured');
  });
});

describe('Gate G5 requires an honest provenance line', () => {
  const clone = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'g5-')); fs.cpSync(SAMPLE_PROJECT, d, { recursive: true }); return d; };
  const g5 = (d) => verifyGates(d).results.find(r => r.gate === 'G5');

  test('the sample declares a Source and passes', () => {
    assert.equal(g5(SAMPLE_PROJECT).status, 'PASSED', JSON.stringify(g5(SAMPLE_PROJECT).problems));
  });
  test('a spec with no Source line fails', () => {
    const d = clone();
    const p = path.join(d, 'STITCH_DESIGN_SPEC.md');
    fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/^.*\*\*Source:\*\*.*$/m, ''));
    assert.equal(g5(d).status, 'FAILED');
    assert.match(g5(d).problems.join(' '), /Source/);
  });
  test('an unrecognised Source value fails', () => {
    const d = clone();
    const p = path.join(d, 'STITCH_DESIGN_SPEC.md');
    fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/\*\*Source:\*\*.*$/m, '**Source:** trust me'));
    assert.equal(g5(d).status, 'FAILED');
  });
  test('each allowed provenance value passes', () => {
    for (const v of ['Stitch MCP', 'Stitch SDK', 'Manual']) {
      const d = clone();
      const p = path.join(d, 'STITCH_DESIGN_SPEC.md');
      fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/\*\*Source:\*\*.*$/m, `**Source:** ${v}`));
      assert.equal(g5(d).status, 'PASSED', v);
    }
  });
});
