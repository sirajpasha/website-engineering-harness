# WORKFLOW: WEB PERFORMANCE REVIEW

## 1. Overview
The Web Performance Review workflow evaluates Core Web Vitals (LCP, INP, CLS) and frontend resource efficiency under strict metric honesty guidelines.

## 2. Review Pipeline
1. **Quick Mode (Static Inspection):**
   - Audit all `<img>` tags for explicit `width` and `height` (CLS prevention).
   - Verify font preloads and `font-display: swap`.
   - Check bundle imports for unnecessary heavy dependencies.
2. **Deep Mode (Lab Measurements):**
   - Execute Lighthouse CLI or Playwright performance traces where tools are available.
   - Measure LCP (≤ 2.5s), INP (≤ 200ms), CLS (≤ 0.1).
3. **Metric Classification:**
   - Tag findings as `[MEASURED LAB DATA]`, `[STATIC OBSERVATION]`, or `[NOT MEASURED]`.
4. **Report Compilation:** Generate `PERFORMANCE_AUDIT_REPORT.md` and trigger Gate G11.
