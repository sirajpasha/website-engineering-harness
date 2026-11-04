# INTEGRATION: PLAYWRIGHT CLI & TEST RUNNER

## 1. Overview
Playwright CLI and Playwright Test provide headless, deterministic execution for continuous regression testing, cross-browser test suites, and viewport QA.

## 2. Command Execution
- Quick page screenshot at specific viewport:
  ```bash
  npx playwright screenshot --viewport-size=390,844 http://localhost:3000 mobile-modern.png
  ```
- Run automated test suite:
  ```bash
  npx playwright test
  ```
- Run harness browser validation:
  ```bash
  node scripts/browser-validation/validate-browser.js
  ```
