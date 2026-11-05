# PRODUCTION READINESS & RELEASE GATES PROTOCOL (skills/production/)

## 1. Overview
This skill operationalizes Quality Gate G13, ensuring that software releases are gated by verifiable automated and human review evidence.

## 2. Release Checklist Requirements
Before issuing `APPROVED FOR PRODUCTION`:
- [ ] G1: All items in `REQUIREMENTS.md` have explicit acceptance criteria.
- [ ] G2: Sitemap and user journeys signed off.
- [ ] G3: Design tokens confirmed; no AI slop patterns.
- [ ] G4: Impeccable heuristic critique score ≥ 32/40.
- [ ] G5: Stitch screens and variants mapped to code components.
- [ ] G6: Component architecture signed off.
- [ ] G7: Automated test suites pass (100% green).
- [ ] G8: Motion runs at 60fps; `prefers-reduced-motion` supported.
- [ ] G9: Playwright validates 6 viewports without horizontal scroll.
- [ ] G10: 0 Critical / High security findings; zero leaked secrets.
- [ ] G11: Performance budgets met; metric honesty preserved.
- [ ] G12: WCAG 2.2 AA verified; JSON-LD and meta tags present.
- [ ] G13: Production Reviewer formal sign-off.
