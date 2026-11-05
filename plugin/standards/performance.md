# ENGINEERING STANDARD: WEB PERFORMANCE

## Standards
1. **Core Web Vitals Budgets:**
   - LCP ≤ 2.5s
   - INP ≤ 200ms
   - CLS ≤ 0.1
2. **Payload Budgets:**
   - Initial JS bundle ≤ 170kB gzipped
   - Initial total page payload ≤ 1.5MB
3. **Static Anti-Pattern Prevention:** All `<img>` tags must declare explicit `width` and `height` to eliminate layout shift.
4. **Metric Honesty:** Never hallucinate lab/field measurements. Clearly mark measured vs unmeasured data.
