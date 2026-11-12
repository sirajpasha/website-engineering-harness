/**
 * Execution time controller. Execution targets (not guarantees) for appropriately scoped
 * projects. Reports elapsed/remaining honestly; time pressure never waives a security gate.
 */
export const MODE_MINUTES = { EXPRESS: 60, PROFESSIONAL: 90, ADVANCED: 120 };
export const SECURITY_GATES_WAIVABLE = false;

export function startRun(mode, now = new Date()) {
  if (!MODE_MINUTES[mode]) throw new Error(`Unknown execution mode '${mode}' (expected EXPRESS|PROFESSIONAL|ADVANCED)`);
  return { mode, budgetMin: MODE_MINUTES[mode], startedAt: now.toISOString() };
}

export function timeStatus(run, now = new Date()) {
  const elapsedMin = Math.floor((now - new Date(run.startedAt)) / 60000);
  const remainingMin = Math.max(0, run.budgetMin - elapsedMin);
  const exceeded = elapsedMin > run.budgetMin;
  return {
    mode: run.mode, budgetMin: run.budgetMin, elapsedMin, remainingMin, exceeded,
    message: exceeded
      ? 'Time budget exceeded: report actual status and remaining work; do not label incomplete work production-ready. Security and quality gates still apply in full.'
      : `${remainingMin} min remaining of ${run.budgetMin}. Prioritise critical functionality; security and quality gates are not waivable.`,
  };
}
