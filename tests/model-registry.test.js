import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRegistry, validateRegistry, resolveModel, routeTask } from '../scripts/lib/model-registry.js';
import { listAgentNames, buildSubagent, parseFrontmatter } from '../scripts/agent-validation/sync-claude-agents.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('central model registry', () => {
  const reg = loadRegistry();

  test('registry is valid and assigns a model to all 16 agents', () => {
    assert.deepEqual(validateRegistry(reg), []);
    for (const n of listAgentNames()) assert.ok(reg.agents[n], `${n} has a model`);
  });

  test('opus is the only orchestrator; fable is a challenger that reports to opus', () => {
    assert.equal(reg.agents.orchestrator, 'opus');
    assert.equal(reg.models.fable.role, 'challenger');
    assert.equal(reg.models.fable.reports_to, 'opus');
    assert.ok(!Object.values(reg.agents).includes('fable'), 'no agent defaults to fable');
  });

  test('sonnet is the default implementation model', () => {
    assert.equal(reg.agents['implementation-engineer'], 'sonnet');
    assert.equal(reg.default_model, 'sonnet');
  });

  test('allocation targets are 15/65/20 and fallbacks are explicit', () => {
    assert.deepEqual(reg.allocation_targets, { opus: 0.15, sonnet: 0.65, haiku: 0.2 });
    for (const [k, m] of Object.entries(reg.models)) assert.ok(m.fallback === null || reg.models[m.fallback], `${k} fallback`);
  });

  test('unavailable model resolves to the approved fallback and records the substitution', () => {
    const r = resolveModel('fable', { available: ['opus', 'sonnet', 'haiku'] });
    assert.equal(r.model, 'opus');
    assert.equal(r.substituted, true);
    assert.equal(r.requested, 'fable');
  });

  test('no fallback chain silently ends on a missing model', () => {
    const r = resolveModel('opus', { available: [] });
    assert.equal(r.model, null);
    assert.match(r.reason, /no approved fallback/i);
  });

  test('task routing by class and escalation', () => {
    assert.equal(routeTask({ class: 'documentation' }).model, 'haiku');
    assert.equal(routeTask({ class: 'implementation' }).model, 'sonnet');
    assert.equal(routeTask({ class: 'security-decision' }).model, 'opus');
    assert.equal(routeTask({ class: 'implementation', failures: 2 }).model, 'opus');
  });

  test('generated subagents carry the registry alias as `model`, and the registry has no secrets/paths', () => {
    for (const n of listAgentNames()) {
      const { data } = parseFrontmatter(buildSubagent(n));
      assert.equal(data.model, reg.models[reg.agents[n]].alias, n);
    }
    assert.ok(!/[A-Za-z]:\|\/Users\//.test(fs.readFileSync(path.join(root, 'agents/model-registry.json'), 'utf8')));
  });
});
