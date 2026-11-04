# WORKFLOW: BROWSER QA & PLAYWRIGHT AUTOMATION

## 1. Overview
The Browser QA workflow executes automated cross-device testing using Playwright across 6 viewports, verifying visual layout, interactivity, and zero console/network errors.

## 2. Execution Pipeline
1. **Viewport Matrix Iteration:**
   - `360 × 800` (Mobile Compact)
   - `390 × 844` (Mobile Modern)
   - `768 × 1024` (Tablet Portrait)
   - `1024 × 768` (Tablet Landscape)
   - `1440 × 900` (Desktop Standard)
   - `1920 × 1080` (Desktop FHD)
2. **Horizontal Overflow Check:** Ensure `scrollWidth <= clientWidth` on all non-overflow containers.
3. **Interactive Control Verification:** Click all primary buttons, toggle mobile menus, submit forms.
4. **Console Hygiene:** Collect all errors and warnings; fail if unhandled exceptions are caught.
5. **Screenshot Capture:** Store visual evidence in `screenshots/`.
6. **Report Generation:** Output results to `BROWSER_QA_REPORT.md` and trigger Gate G9.
