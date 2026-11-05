---
description: "Activates AGENT 11 (Playwright Browser Engineer) to execute real browser automation across the 6 standard viewports, verifying routes, forms, and layout stability."
---

# COMMAND: /website-test

## Description
Activates AGENT 11 (Playwright Browser Engineer) to execute real browser automation across the 6 standard viewports, verifying routes, forms, and layout stability.

## Invocations
- Claude Code: `/website-test`
- Terminal / Node: `npm run test:browser` or `node scripts/browser-validation/validate-browser.js`

## Workflow Steps
1. Launch Chromium via Playwright.
2. Iterate through all 6 mandatory viewports:
   - `360 × 800` (Mobile Compact)
   - `390 × 844` (Mobile Modern)
   - `768 × 1024` (Tablet Portrait)
   - `1024 × 768` (Tablet Landscape)
   - `1440 × 900` (Desktop Standard)
   - `1920 × 1080` (Desktop FHD)
3. Check for horizontal overflow on all routes (`scrollWidth <= clientWidth`).
4. Test interactive buttons, dropdowns, and modal dialogs.
5. Capture screenshots and compile `BROWSER_QA_REPORT.md`.
6. Enforce Quality Gate G9 (Browser QA).
