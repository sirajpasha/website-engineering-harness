# WORKFLOW: PRODUCTION READINESS & RELEASE

## 1. Overview
The Release workflow consolidates evidence across all preceding quality gates (G1–G12) to make an objective, independent decision on production readiness.

## 2. Release Progression
1. **Consolidate Quality Gate Statuses:**
   - Verify G1 (Requirements), G2 (Product), G3 (Taste), G4 (Impeccable), G5 (Stitch), G6 (Architecture), G7 (TDD), G8 (Motion), G9 (Browser QA), G10 (Security), G11 (Performance), G12 (Accessibility & SEO).
2. **Defect Audit:** Confirm zero unresolved P0 (Blocker) or P1 (High) issues in `DEFECT_REGISTER.md`.
3. **Security Audit:** Confirm zero CRITICAL or HIGH vulnerabilities in `SECURITY_AUDIT_REPORT.md`.
4. **Compile Release Artifacts:** Complete `RELEASE_CHECKLIST.md` and `RELEASE_NOTES.md`.
5. **Issue Authoritative Verdict:** `APPROVED FOR PRODUCTION`, `APPROVED WITH NON-BLOCKING ISSUES`, or `REJECTED`.
