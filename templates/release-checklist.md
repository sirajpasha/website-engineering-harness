# TEMPLATE: RELEASE CHECKLIST (RELEASE_CHECKLIST.md)

# Production Release Checklist: [Project Name]
**Reviewer:** AGENT 16 (Production Readiness & Release Reviewer)  
**Quality Gate G13 Sign-off:** [APPROVED | REJECTED]  
**Date:** [YYYY-MM-DD]  

---

## Quality Gate Evidence Checklist
- [ ] **G1 Requirements:** Ambiguity resolved; `REQUIREMENTS.md` approved.
- [ ] **G2 Product:** Sitemap and user journeys approved in `USER_JOURNEYS.md`.
- [ ] **G3 Design Taste:** Anti-slop verified; `DESIGN_TOKENS.json` generated.
- [ ] **G4 UX/UI:** Heuristic review score ≥ 32/40; zero P0/P1 defects.
- [ ] **G5 Stitch:** Stitch screen variants and components mapped.
- [ ] **G6 Architecture:** Component boundaries and state models approved.
- [ ] **G7 TDD:** Automated unit/integration tests passing (100%).
- [ ] **G8 Motion:** Interactions fluid (<250ms); reduced-motion supported.
- [ ] **G9 Browser QA:** 6 viewports tested in Playwright; zero horizontal scroll.
- [ ] **G10 Security:** Zero Critical or High vulnerabilities.
- [ ] **G11 Performance:** CWV within budget; honest metric labeling.
- [ ] **G12 Accessibility & SEO:** WCAG 2.2 AA compliant; meta tags present.
- [ ] **G13 Production Approval:** Final sign-off issued.
