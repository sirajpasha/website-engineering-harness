---
description: "Improves an **existing website in the current project** through bounded enhancements: new features, performance, security remediation, accessibility and code quality (`ENHANCE` mode). Visual identity is left alone unless asked; for that use `/website-redesign`."
---

# COMMAND: /website-improve

## Description
Improves an **existing website in the current project** through bounded enhancements: new features, performance, security remediation, accessibility and code quality (`ENHANCE` mode). Visual identity is left alone unless asked; for that use `/website-redesign`.

## Invocations
- Claude Code: `/website-improve <goal>`
- Terminal / Node: `node scripts/website-engineering-harness-cli.js classify improve "<goal>"`

## Workflow Steps
1. **Classify** with `classify improve "<goal>"`. If no project is found, stop and say so.
2. **Scope narrowly.** Convert the goal into REQ-IDs with acceptance criteria. Inspect only the files the goal touches; avoid repeated full-repository scans.
3. **Measure before.** Capture the relevant baseline (tests, `npm run test:browser`, audit output). Unmeasured metrics are reported as unmeasured, never invented.
4. **Fix by priority:** security, data integrity, broken critical journeys, build failures, functional defects, accessibility, performance, visual, SEO.
5. **TDD per slice** (`tdd-test-engineer` RED receipt, then `implementation-engineer`). Destructive migrations, production data changes and credential rotation need explicit user approval.
6. **Verify and compare** to the baseline; ratchets may only hold or improve. Re-run the affected audits (`security-auditor`, `web-performance-auditor`, `seo-accessibility`) and `code-reviewer`.
7. **Report** before/after with real evidence and list anything left open in `DEFECT_REGISTER.md`.

## Model routing
Per `agents/model-registry.json`.
