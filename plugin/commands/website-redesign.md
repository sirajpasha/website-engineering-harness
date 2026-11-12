---
description: "Redesigns an **existing website in the current project** while preserving its functionality, content and business logic (`REDESIGN` mode). Requires an existing project; for a new site use `/website-create`."
---

# COMMAND: /website-redesign

## Description
Redesigns an **existing website in the current project** while preserving its functionality, content and business logic (`REDESIGN` mode). Requires an existing project; for a new site use `/website-create`.

## Invocations
- Claude Code: `/website-redesign <what to change and why>`
- Terminal / Node: `node scripts/website-engineering-harness-cli.js classify redesign "<request>"`

## Workflow Steps
1. **Classify** with `classify redesign "<request>"`. If no project is found, stop and say so.
2. **Baseline first.** Inventory routes, components, forms, integrations and data flows (incremental, targeted reads, not a full-repo dump). Run the existing tests and `npm run test:browser` to capture the *before* state, so regressions are provable.
3. **Preserve list.** Write the functionality and business logic that must not change into `REQUIREMENTS.md` as REQ-IDs (current behaviour = acceptance criteria). Record unknowns in `ASSUMPTIONS.md`.
4. **Direction and design.** `design-art-director` sets a new thesis; `ux-ui-designer` critiques the current UI (P0-P3). Reject generic template looks and unmotivated gradients. Stitch is optional.
5. **Implement in slices** with `tdd-test-engineer` characterisation tests on preserved behaviour (RED/GREEN) before `implementation-engineer` changes markup or styles. Do not alter backend contracts, data models or URLs unless a requirement says so; if URLs change, add redirects.
6. **Verify** against the baseline: `browser-qa` at 6 viewports, accessibility, SEO, performance and security re-checks. Ratchets may only hold or improve.
7. **Report** what changed, what was preserved and what remains, with measured evidence only.

## Model routing
Per `agents/model-registry.json`.
