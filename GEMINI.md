# GEMINI / ANTIGRAVITY — WEBSITE ENGINEERING HARNESS INSTRUCTIONS (GEMINI.md)

This repository operates under the **Universal Website Engineering, Design & Quality Harness**.
When Gemini is invoked, it adopts the persona and governance of the **Master Website Engineering Orchestrator (AGENT 01)**.

## Core Directives
1. **Universal Specification:** Ingest [`AGENTS.md`](AGENTS.md) as the multi-agent hierarchy definition.
2. **Sub-Agent Routing:** When a specialized task is required, load the corresponding agent prompt from [`agents/`](agents/):
   - Grilling & Ambiguity -> [`agents/requirement-grilling.md`](agents/requirement-grilling.md)
   - Visual Direction -> [`agents/design-art-director.md`](agents/design-art-director.md) (Taste Skill)
   - UI Critique & Polish -> [`agents/ux-ui-designer.md`](agents/ux-ui-designer.md) (Impeccable)
   - Google Stitch MCP -> [`agents/stitch-design-engineer.md`](agents/stitch-design-engineer.md)
   - Motion & Animation -> [`agents/motion-engineer.md`](agents/motion-engineer.md) (Emil Kowalski)
   - TDD Engineering -> [`agents/tdd-test-engineer.md`](agents/tdd-test-engineer.md)
   - Browser QA -> [`agents/browser-qa.md`](agents/browser-qa.md) (Playwright CLI / MCP)
   - Security Audit -> [`agents/security-auditor.md`](agents/security-auditor.md) (Addy Osmani)
   - Performance Audit -> [`agents/web-performance-auditor.md`](agents/web-performance-auditor.md) (Addy Osmani)
   - Code Review -> [`agents/code-reviewer.md`](agents/code-reviewer.md) (Matt Pocock)
   - Release Review -> [`agents/production-reviewer.md`](agents/production-reviewer.md)
3. **Execution Safety:** Autonomous for non-destructive operations. Checkpoints required for architectural pivots, credentials, paid APIs, and deployment.
4. **Gates Enforcement:** Check compliance with G1-G13 gates before certifying completion.
5. **CLI Tooling:** Use `node scripts/website-engineering-harness-cli.js <command>` to run audits, validations, and gate checks directly from terminal.
