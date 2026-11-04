# COMMAND: /website-performance

## Description
Activates AGENT 13 (Web Performance Auditor) based on Addy Osmani's Web Performance Auditor standard to evaluate Core Web Vitals (LCP, INP, CLS), asset payloads, and rendering efficiency.

## Invocations
- Claude Code: `/website-performance`
- Terminal / Node: `npm run audit:perf` or `node scripts/website-engineering-harness-cli.js perf`

## Workflow Steps
1. Execute Quick Mode static code scan (unsized images, render-blocking scripts, font preloads).
2. Execute Deep Mode lab measurements if Lighthouse / CDP runtime is available.
3. Apply Metric Honesty Directive: explicitly label lab data vs. static observations vs. unmeasured items.
4. Compile findings in `PERFORMANCE_AUDIT_REPORT.md`.
5. Enforce Quality Gate G11 (Performance Audit).
