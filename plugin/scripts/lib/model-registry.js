/**
 * Central model registry: role/task -> model, explicit fallbacks, escalation.
 * Pure functions; no network or billing calls. Availability is supplied by the
 * caller (e.g. from the installed Claude Code environment).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const REGISTRY_PATH = path.resolve(here, '../../agents/model-registry.json');

export const loadRegistry = (p = REGISTRY_PATH) => JSON.parse(fs.readFileSync(p, 'utf8'));

export function validateRegistry(reg, agentNames) {
  const e = [];
  const models = reg.models || {};
  if (!models[reg.default_model]) e.push(`default_model '${reg.default_model}' is not a model`);
  for (const [k, m] of Object.entries(models)) {
    if (!m.alias || !m.id) e.push(`${k}: alias and id required`);
    if (m.fallback !== null && m.fallback !== undefined && !models[m.fallback]) e.push(`${k}: fallback '${m.fallback}' unknown`);
  }
  for (const [a, m] of Object.entries(reg.agents || {})) if (!models[m]) e.push(`agent ${a}: unknown model '${m}'`);
  for (const [t, m] of Object.entries(reg.task_classes || {})) if (!models[m]) e.push(`task ${t}: unknown model '${m}'`);
  if (agentNames) for (const n of agentNames) if (!reg.agents?.[n]) e.push(`agent ${n} has no model assignment`);
  const sum = Object.values(reg.allocation_targets || {}).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) > 1e-9) e.push(`allocation_targets sum to ${sum}, expected 1`);
  return e;
}

/** Resolve a model key against availability, following only approved fallbacks. */
export function resolveModel(key, { available, registry = loadRegistry() } = {}) {
  const ok = (k) => !available || available.includes(k);
  const seen = new Set();
  let cur = key;
  while (cur && !seen.has(cur)) {
    if (ok(cur)) return { model: cur, requested: key, substituted: cur !== key, reason: cur === key ? 'available' : `fallback from ${key}` };
    seen.add(cur);
    cur = registry.models[cur]?.fallback;
  }
  return { model: null, requested: key, substituted: false, reason: `${key} unavailable and no approved fallback is available` };
}

/** Route a task to a model; escalate after repeated failures. */
export function routeTask({ class: cls, failures = 0, available, registry = loadRegistry() }) {
  let key = registry.task_classes[cls] || registry.default_model;
  let escalated = false;
  if (failures >= registry.escalation.after_failures && key !== registry.escalation.to) { key = registry.escalation.to; escalated = true; }
  return { ...resolveModel(key, { available, registry }), escalated };
}
