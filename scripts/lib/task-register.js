/**
 * Task register: dependency-aware, ownership-checked work plan for the agent team.
 *
 * Task shape: { id, agent, model, dependencies[], inputs[], outputs[], file_ownership[],
 *               acceptance[], time_budget_min, status, evidence[] }
 *
 * Rules enforced here (pure functions, no I/O besides reading agent contracts):
 *  - ids unique, dependencies exist, no cycles, agent has a contract, model is in the registry
 *  - a task may only own paths its agent contract allows (and not ones it forbids)
 *  - two tasks with overlapping ownership must be ordered by dependencies (no concurrent writes)
 *  - scheduling starts with 2 concurrent tasks (Claude Pro friendly) and never starts a task
 *    whose dependency is not done, or whose ownership overlaps a running task
 */
import fs from 'node:fs';
import path from 'node:path';
import { HARNESS_ROOT } from './paths.js';
import { loadRegistry } from './model-registry.js';

export const STATUSES = ['pending', 'running', 'done', 'failed', 'blocked'];
const REQUIRED = ['id', 'agent', 'model', 'dependencies', 'inputs', 'outputs', 'file_ownership', 'acceptance', 'time_budget_min', 'status', 'evidence'];

const contractCache = new Map();
function contractFor(agent) {
  if (!contractCache.has(agent)) {
    const p = path.join(HARNESS_ROOT, 'agents', `${agent}.contract.json`);
    contractCache.set(agent, fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null);
  }
  return contractCache.get(agent);
}

const norm = (p) => p.replace(/\\/g, '/').replace(/^\.\//, '');
const isDir = (p) => p.endsWith('/');

/** True when path `p` is inside root `r` (r is a directory prefix or the identical file). */
function within(p, r) {
  p = norm(p); r = norm(r);
  return isDir(r) ? p.startsWith(r) || p + '/' === r : p === r;
}

export function ownershipOverlap(a, b) {
  return a.some(x => b.some(y => within(x, y) || within(y, x)));
}

function hasPath(tasks, from, to, seen = new Set()) {
  if (from === to) return true;
  if (seen.has(from)) return false;
  seen.add(from);
  const t = tasks.find(x => x.id === from);
  return (t?.dependencies || []).some(d => hasPath(tasks, d, to, seen));
}

export function validateRegister(tasks, { registry = loadRegistry() } = {}) {
  const errs = [];
  const ids = new Set();
  for (const t of tasks) {
    const label = t.id || '(no id)';
    for (const f of REQUIRED) if (t[f] === undefined || t[f] === null) errs.push(`${label}: missing field '${f}'`);
    if (t.id) { if (ids.has(t.id)) errs.push(`${label}: duplicate task id`); ids.add(t.id); }
    if (t.status && !STATUSES.includes(t.status)) errs.push(`${label}: invalid status '${t.status}'`);
    if (t.model && !registry.models[t.model]) errs.push(`${label}: model '${t.model}' is not in the model registry`);
    if (t.time_budget_min !== undefined && !(t.time_budget_min > 0)) errs.push(`${label}: time_budget_min must be > 0`);
  }
  for (const t of tasks) {
    const label = t.id || '(no id)';
    for (const d of t.dependencies || []) if (!ids.has(d)) errs.push(`${label}: unknown dependency '${d}'`);
    if (t.agent) {
      const c = contractFor(t.agent);
      if (!c) errs.push(`${label}: unknown agent '${t.agent}' (no contract)`);
      else for (const own of t.file_ownership || []) {
        const allowed = c.allowed_write_roots.some(r => within(own, r));
        const forbidden = c.forbidden_write_roots.some(r => within(own, r));
        if (!allowed || forbidden) errs.push(`${label}: ${t.agent} may not own '${own}' (contract ${forbidden ? 'forbids' : 'does not allow'} it)`);
      }
    }
  }
  if (errs.some(e => /unknown dependency|missing field/.test(e))) return errs;
  for (const t of tasks) {
    if ((t.dependencies || []).some(d => hasPath(tasks, d, t.id))) errs.push(`${t.id}: dependency cycle`);
  }
  for (let i = 0; i < tasks.length; i++) for (let j = i + 1; j < tasks.length; j++) {
    const a = tasks[i], b = tasks[j];
    if (!ownershipOverlap(a.file_ownership, b.file_ownership)) continue;
    if (hasPath(tasks, a.id, b.id) || hasPath(tasks, b.id, a.id)) continue;
    errs.push(`ownership conflict: ${a.id} and ${b.id} own overlapping paths but are not ordered by dependencies`);
  }
  return errs;
}

/** Tasks that may start now, honouring dependencies, running tasks' ownership and the concurrency cap. */
export function nextRunnable(tasks, { maxConcurrent = 2 } = {}) {
  const byId = new Map(tasks.map(t => [t.id, t]));
  const running = tasks.filter(t => t.status === 'running');
  const slots = Math.max(0, maxConcurrent - running.length);
  const picked = [];
  for (const t of tasks) {
    if (picked.length >= slots) break;
    if (t.status !== 'pending') continue;
    if (!t.dependencies.every(d => byId.get(d)?.status === 'done')) continue;
    const claimed = [...running, ...picked];
    if (claimed.some(r => ownershipOverlap(r.file_ownership, t.file_ownership))) continue;
    picked.push(t);
  }
  return picked;
}
