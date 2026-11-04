# Universal Autonomous Website Engineering, Design & Quality Harness

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](VERSION)
[![Quality Gates](https://img.shields.io/badge/quality%20gates-G1--G13-brightgreen.svg)](standards/)
[![AI Compatibility](https://img.shields.io/badge/AI%20Compatibility-Universal-orange.svg)](AGENTS.md)

A production-grade, extensible multi-agent harness that turns any AI coding assistant (**Claude Code, Gemini / Antigravity, OpenAI Codex / Copilot, Cursor, Windsurf, Aider, OpenCode**) into a coordinated engineering organization capable of taking a website from initial business idea to production-verified release.

---

## 🌟 Ecosystem Unification

This harness integrates the finest engineering and design practices into a unified orchestration framework:

| Ecosystem | Role & Contribution |
|---|---|
| **Claude Code / Universal Agent Protocol** | Orchestration, sub-agent delegation, slash commands, tool execution |
| **Taste Skill (`Leonxlnx/taste-skill`)** | Visual art direction, anti-slop rules, distinctive aesthetic personalities |
| **Impeccable (`pbakaus/impeccable`)** | 24-command design vocabulary, heuristic UX critique, layout & typographic polish |
| **Emil Kowalski Skills** | 14 motion & interaction engineering skills, natural springs, reduced-motion |
| **Google Stitch MCP & CLI** | AI UI generation, screen variants, design token export, visual prototyping |
| **Playwright MCP, CLI & Test** | Real browser validation across 6 mandatory viewports (360px to 1920px) |
| **Addy Osmani Agent Skills** | Authoritative Security Auditor (OWASP/STRIDE) & Web Performance Auditor (CWV) |
| **Matt Pocock Skills** | Socratic requirement grilling, domain modeling, strict TDD Red-Green-Refactor |
| **Everything Claude Code (ECC)** | Production workflows, quality gates, and agent handoff protocols |

---

## 🏛️ System Architecture

```
website-engineering-harness/
├── AGENTS.md                  # Universal Multi-Agent Specification
├── CLAUDE.md                  # Claude Code CLI configuration & directives
├── GEMINI.md                  # Gemini CLI / Antigravity configuration
├── .cursorrules               # Cursor IDE agent instructions
├── .windsurfrules             # Windsurf IDE agent instructions
├── .github/                   # GitHub Copilot & Codex workspace rules
├── mcp.json                   # Universal MCP server bindings (Stitch, Playwright)
│
├── agents/                    # 16 Specialized Agent Definitions
│   ├── orchestrator.md
│   ├── requirement-grilling.md
│   ├── product-discovery.md
│   ├── design-art-director.md
│   ├── ux-ui-designer.md
│   ├── stitch-design-engineer.md
│   ├── motion-engineer.md
│   ├── frontend-architect.md
│   ├── implementation-engineer.md
│   ├── tdd-test-engineer.md
│   ├── browser-qa.md
│   ├── security-auditor.md
│   ├── web-performance-auditor.md
│   ├── seo-accessibility.md
│   ├── code-reviewer.md
│   └── production-reviewer.md
│
├── skills/                    # Unified Skills Ecosystem
│   ├── registry/              # SKILL_REGISTRY.md & Governance Policy
│   ├── design/                # Taste Skill & Impeccable integration wrappers
│   ├── engineering/           # Component architectures, contracts, conventions
│   ├── motion/                # Emil Kowalski motion curves & gesture patterns
│   ├── testing/               # TDD Red-Green-Refactor runners & test seams
│   ├── browser-automation/    # Playwright multi-viewport fixtures & screenshot rules
│   ├── security/              # OWASP Top 10 checklist & STRIDE templates
│   ├── performance/           # Core Web Vitals audit modes & metric honesty
│   └── production/            # Release readiness checklists & gate auditors
│
├── commands/                  # 14 Standard Workflow Commands
│   ├── website-init.md
│   ├── website-grill.md
│   ├── website-discover.md
│   ├── website-design.md
│   ├── website-stitch.md
│   ├── website-build.md
│   ├── website-tdd.md
│   ├── website-motion.md
│   ├── website-test.md
│   ├── website-security.md
│   ├── website-performance.md
│   ├── website-critique.md
│   ├── website-audit.md
│   └── website-release.md
│
├── workflows/                 # 8 End-to-End Execution Workflows
│   ├── new-website.md
│   ├── existing-website-redesign.md
│   ├── enhancement.md
│   ├── tdd-development.md
│   ├── browser-qa.md
│   ├── security-review.md
│   ├── performance-review.md
│   └── release.md
│
├── integrations/              # MCP & CLI Integration Guides & Configurations
│   ├── google-stitch-mcp.md
│   ├── google-stitch-cli.md
│   ├── playwright-mcp.md
│   ├── playwright-cli.md
│   └── integration-validation.md
│
├── standards/                 # 12 Authoritative Quality Standards
│   ├── requirements.md
│   ├── design.md
│   ├── ux.md
│   ├── frontend.md
│   ├── motion.md
│   ├── tdd.md
│   ├── browser-qa.md
│   ├── security.md
│   ├── performance.md
│   ├── accessibility.md
│   ├── seo.md
│   └── production.md
│
├── templates/                 # 10 Traceability & Engineering Document Templates
│   ├── project-brief.md
│   ├── requirement-grilling.md
│   ├── design-direction.md
│   ├── architecture.md
│   ├── test-plan.md
│   ├── security-report.md
│   ├── performance-report.md
│   ├── design-review.md
│   ├── release-checklist.md
│   └── requirements-traceability.md
│
├── scripts/                   # Executable Cross-Platform CLI & Validation Tooling
│   ├── harness-cli.js         # Master CLI runner
│   ├── environment-audit/     # System capability & dependency auditor
│   ├── agent-validation/      # Agent discoverability & contract tester
│   ├── skill-validation/      # Skill registry & dependency validator
│   ├── mcp-validation/        # Stitch & Playwright MCP tester
│   ├── browser-validation/    # Playwright 6-viewport automation engine
│   ├── quality-gates/         # Gates G1-G13 automated validator
│   └── traceability/          # Requirement-to-test traceability verifier
│
├── docs/                      # Complete Technical Documentation & Guides
│   ├── architecture.md
│   ├── installation.md
│   ├── configuration.md
│   ├── agent-mapping.md
│   ├── skill-registry.md
│   ├── skill-governance.md
│   ├── integration-guide.md
│   ├── workflows.md
│   ├── troubleshooting.md
│   ├── changelog.md
│   └── acceptance-report.md
│
└── examples/                  # Reference Implementations
    └── sample-website/        # Fully implemented, production-verified sample website
```

---

## 🚦 The 13 Quality Gates (G1 - G13)

No website is shipped until every gate provides objective evidence:

1. **G1 Requirements:** Ambiguity grilling resolved in `REQUIREMENTS.md`.
2. **G2 Product:** Approved IA sitemap and user journeys in `USER_JOURNEYS.md`.
3. **G3 Design Direction:** Taste Skill anti-slop visual identity approved.
4. **G4 UX/UI:** Impeccable 24-command heuristic review completed (scored out of 40).
5. **G5 Stitch:** AI screen variants and design tokens integrated.
6. **G6 Architecture:** Component contracts, routing, and state model signed off.
7. **G7 TDD:** Red-Green-Refactor verified with passing automated unit/integration tests.
8. **G8 Motion:** Emil Kowalski physics, micro-interactions, and reduced-motion validated.
9. **G9 Browser QA:** Playwright tests passing on all 6 viewports with zero horizontal overflow.
10. **G10 Security:** OWASP Top 10 + STRIDE audit with 0 Critical/High findings.
11. **G11 Performance:** Core Web Vitals measured with strict metric honesty.
12. **G12 Accessibility & SEO:** WCAG 2.2 AA contrast/keyboard checks and JSON-LD metadata verified.
13. **G13 Release Review:** Independent production sign-off.

---

## ⚡ Quick Start (Any AI or Terminal)

### In Claude Code CLI:
```bash
/website-init
/website-grill
/website-design
/website-build
/website-test
/website-release
```

### In Gemini CLI / Antigravity / Cursor / Terminal:
```bash
# Check environment and audit harness
npm run audit

# Validate all agents, skills, and MCP configurations
npm run validate:all

# Run quality gates
npm run gates

# Start master interactive CLI
npm run harness -- --help
```
