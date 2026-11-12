---
description: "Creates a complete website in the **current project directory** from a plain-language brief. The user does not need a PRD, a stack choice or any engineering knowledge; the harness classifies the request, decides defaults, records its assumptions and drives the full lifecycle (`NEW_WEBSITE`) through the existing gates G1-G13."
---

# COMMAND: /website-create

## Description
Creates a complete website in the **current project directory** from a plain-language brief. The user does not need a PRD, a stack choice or any engineering knowledge; the harness classifies the request, decides defaults, records its assumptions and drives the full lifecycle (`NEW_WEBSITE`) through the existing gates G1-G13.

## Invocations
- Claude Code: `/website-create <brief>`
- Terminal / Node: `node scripts/website-engineering-harness-cli.js classify create "<brief>"` (classification only; implementation runs in the agent session)

Example: `/website-create Build a premium international commodities export company website with company profile, products, export markets, certifications, enquiry forms and contact information. Distinctive global-trading look. Responsive, SEO-friendly, secure, production-ready.`

## Workflow Steps
1. **Classify.** Run `classify create "<brief>"`. The base mode is `NEW_WEBSITE`; the sub-type is one of `LANDING_PAGE`, `CORPORATE_WEBSITE`, `E_COMMERCE`, `FULL_STACK_MVP`, `BOOKING_WEBSITE`, `CUSTOMER_PORTAL`, `CONTENT_WEBSITE`. A low-confidence result becomes a recorded assumption, not a silent guess. If the directory already holds a project, stop and point to `/website-redesign` or `/website-improve`.
2. **Specify.** Use `agents/requirement-grilling.md` to turn the brief into `REQUIREMENTS.md` (REQ-IDs) and `ASSUMPTIONS.md` (from `templates/assumptions.md`). Clarification policy: **CRITICAL** gaps are asked (max three consolidated rounds); **IMPORTANT** gaps get a sensible default recorded as an assumption; **OPTIONAL** gaps are decided autonomously.
3. **Never invent** business facts, certifications, testimonials, legal approvals, credentials or financial claims. Use clearly marked placeholders and list them in `ASSUMPTIONS.md`.
4. **Discover, design, architect.** `product-discovery` -> `design-art-director` / `ux-ui-designer` (Stitch only if configured; otherwise the local design workflow) -> `frontend-architect`. Choose the simplest stack that fits; add a backend, database or auth only if a requirement needs it. No hosting provider, Supabase or Vercel is required. Record significant decisions as ADRs in `ARCHITECTURE.md`.
5. **Build.** `tdd-test-engineer` (RED first) then `implementation-engineer` and `motion-engineer`, strictly inside the user's project directory. Every control and form must work; unavailable external services get an explicit adapter or documented stub.
6. **Verify.** `browser-qa` (6 viewports), `security-auditor`, `web-performance-auditor`, `seo-accessibility`, `code-reviewer`. Fix defects and re-test; Critical/High security findings block release.
7. **Release readiness.** `production-reviewer` runs the gate audit. Report real status; never label incomplete work production-ready. Deployment is optional and production deploys need explicit user approval.

## Model routing
Per `agents/model-registry.json` (Opus orchestrates, Sonnet implements, Haiku for documentation and mechanical tasks; an unavailable model uses only the registry's explicit fallback).
