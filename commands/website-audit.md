# COMMAND: /website-audit

## Description
Executes a multi-agent quality audit evaluating all 13 Quality Gates (G1 through G13) across requirements, design, architecture, tests, browser QA, security, performance, accessibility, and SEO.

## Invocations
- Claude Code: `/website-audit`
- Terminal / Node: `npm run validate:all` or `node scripts/quality-gates/check-gates.js --all`

## Workflow Steps
1. Run automated gate checker script (`check-gates.js`).
2. Verify artifacts across all 13 quality gates.
3. Consolidate defects into `DEFECT_REGISTER.md`.
4. Output executive quality scorecard.
