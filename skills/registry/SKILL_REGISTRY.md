# SKILL REGISTRY (SKILL_REGISTRY.md)
# AUTONOMOUS WEBSITE ENGINEERING HARNESS

This registry catalogues all approved, integrated, and evaluated skills in the Website Engineering Harness. Every skill is mapped to a designated specialist agent and verified for compatibility across AI tools.

> **Note on sources.** The `Source` column names the public project a skill's working method was *inspired by*. This repository ships its own short summaries of those methods (see `skills/*/`) and does not bundle or relicense the upstream projects; see [`NOTICE.md`](../../NOTICE.md). Install upstream skills from their own repositories and check their licenses first.

---

## 1. Primary Skills Directory

| Skill | Source | Purpose | Agent | Dependencies | Installation | Status | Validation | Overlap | License |
|---|---|---|---|---|---|---|---|---|---|
| **`taste-skill`** | `Leonxlnx/taste-skill` | Visual art direction, typography, anti-slop rules, color harmonies | AGENT 04 (Design Art Director) | Node.js, modern browser | `npx skills add Leonxlnx/taste-skill` or harness wrapper | Installed | Verified: Enforces anti-slop rules; generates `DESIGN_TOKENS.json` | Complements Impeccable | MIT |
| **`impeccable`** | `pbakaus/impeccable` | 24-command design vocabulary, 10-heuristic UX critique, layout & typography polish | AGENT 05 (UX/UI Designer) | Node.js, browser runtime | `npx impeccable install` or harness wrapper | Installed | Verified: All 24 commands indexed; heuristic scoring operational | Complements Taste | Apache-2.0 / MIT |
| **`emil-motion-skills`** | `emilkowalski/skills` | 14 motion & interaction engineering skills, spring physics, reduced-motion | AGENT 07 (Motion Engineer) | Modern CSS, Web Animations API, Framer Motion | `npx skills add emilkowalski/skills` or harness wrapper | Installed | Verified: 14 motion skills verified; sub-300ms budget enforced | Distinct from layout design | MIT |
| **`security-auditor`** | `addyosmani/agent-skills` | OWASP Top 10, STRIDE threat modeling, trust boundaries, secrets sanitization | AGENT 12 (Security Auditor) | Source tree analysis, Node.js | Native agent definition + wrapper | Installed | Verified: Authoritative rules loaded; blocks on CRITICAL/HIGH | Distinct | Apache-2.0 / MIT |
| **`web-performance-auditor`** | `addyosmani/agent-skills` | Core Web Vitals (LCP, INP, CLS), payload budgets, Quick/Deep modes, metric honesty | AGENT 13 (Web Performance Auditor) | Node.js, Lighthouse / CDP | Native agent definition + wrapper | Installed | Verified: Metric honesty directive active; Quick/Deep modes operational | Distinct | Apache-2.0 / MIT |
| **`matt-pocock-grilling`** | `mattpocock/skills` | Socratic requirement grilling, assumption challenge, domain modeling | AGENT 02 (Requirement Grilling) | Markdown, interactive terminal | Harness integration wrapper | Installed | Verified: Single high-leverage question rule operational | Complements Addy interview-me | MIT |
| **`matt-pocock-tdd`** | `mattpocock/skills` | RED-GREEN-REFACTOR workflow, test seams, bug diagnosis | AGENT 10 (TDD Specialist) | Node.js test runner, Vitest / Jest | Harness integration wrapper | Installed | Verified: Confirms RED failure prior to GREEN implementation | Unifies testing | MIT |
| **`domain-modeling`** | `mattpocock/skills` | Ubiquitous language clarification, `GLOSSARY.md` maintenance | AGENT 02 (Requirement Grilling) | Markdown | Harness integration wrapper | Installed | Verified: Prevents terminology drift | Distinct | MIT |
| **`google-stitch-mcp`** | `@google/stitch-mcp` | AI screen generation, variant exploration, design system token export | AGENT 06 (Stitch Design Engineer) | MCP client, Node.js 18+, API key | `npx -y @google/stitch-mcp` | Configured | Verified: MCP tool schema mapped in `mcp.json` | Bridges visual design to code | Google Terms |
| **`playwright-mcp`** | `@playwright/mcp` | Real-time interactive browser exploration, DOM tree inspection, accessibility tree | AGENT 11 (Browser QA) | Playwright, Chromium, Node.js 18+ | `npx -y @playwright/mcp@latest` | Configured | Verified: MCP schema registered in `mcp.json` | Complements Playwright CLI | Apache-2.0 |
| **`playwright-cli`** | `microsoft/playwright-cli` | Token-efficient browser operations, 6 viewport validation, screenshot diffing | AGENT 11 (Browser QA) | Playwright, Node.js | `npm install playwright` / `npx playwright` | Installed | Verified: Automated script tests 6 viewports | Complements Playwright MCP | Apache-2.0 |

---

## 2. Dynamic Discovery & Governance Policy
Skills outside this primary registry are governed by [`skills/registry/policy.md`](policy.md). Every newly considered skill must be evaluated across 10 dimensions:
1. **Relevance** to production website engineering.
2. **Quality & Maintainability** of codebase.
3. **Source Credibility** (official or respected author).
4. **Documentation Completeness**.
5. **Compatibility** with Node.js 18+ and cross-model runtimes.
6. **Security & Sandboxing** safety.
7. **Zero Overlap** with existing registered skills.
8. **Context Consumption** efficiency (token economy).
9. **Measurable Benefit** to website craft.
10. **Permissive Licensing** (MIT, Apache 2.0, BSD).
