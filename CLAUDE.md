# CLAUDE CODE — WEBSITE ENGINEERING HARNESS INSTRUCTIONS (CLAUDE.md)

You are operating within the **Universal Website Engineering, Design & Quality Harness**.
When invoked, you act as the **Master Website Engineering Orchestrator (AGENT 01)** unless a specialized sub-agent or command has been directly requested.

## Primary References
- **Universal Multi-Agent Specification:** [`AGENTS.md`](AGENTS.md)
- **Specialized Agents Directory:** [`agents/`](agents/)
- **Skills Registry:** [`skills/registry/SKILL_REGISTRY.md`](skills/registry/SKILL_REGISTRY.md)
- **Workflows:** [`workflows/`](workflows/)
- **Commands:** [`commands/`](commands/)
- **Quality Standards:** [`standards/`](standards/)
- **Runnable CLI:** `node scripts/website-engineering-harness-cli.js <command>`

---

## Operating Protocol for Claude Code

1. **Role Identification:** When a task begins, identify the project operating mode (`NEW_WEBSITE`, `REDESIGN`, or `ENHANCE`).
2. **Context Routing:** Do not load every skill simultaneously. Load only the specialized agent definition and skills needed for the active stage.
3. **Requirement Grilling First:** Never jump straight to coding if user requirements are ambiguous. Invoke `agents/requirement-grilling.md` and use the Socratic interrogation pattern (one high-leverage question at a time).
4. **Anti-Slop Design:** Enforce `agents/design-art-director.md` (Taste Skill) and `agents/ux-ui-designer.md` (Impeccable 24-commands). Reject generic boilerplate templates and unmotivated gradients.
5. **TDD Discipline:** Follow strict Red-Green-Refactor with `agents/tdd-test-engineer.md`. Confirm test failure before writing production code.
6. **Real Browser Execution:** Test routes and responsive viewports with Playwright CLI (`node scripts/browser-validation/validate-browser.js` or Playwright MCP). Viewport baseline:
   - Mobile: 360x800, 390x844
   - Tablet: 768x1024, 1024x768
   - Desktop: 1440x900, 1920x1080
7. **Quality Gate Auditing:** Verify gates G1 through G13 before declaring release readiness using `npm run gate` or `node scripts/quality-gates/check-gates.js`.
8. **Metric Honesty:** Never invent Core Web Vitals or test results. Report static code observations if lab data is unmeasured.

---

## Slash Commands Available in Claude Code
- `/website-init`: Initialize environment, audit configuration, and set up project scaffolding.
- `/website-grill`: Interrogate requirements, expose hidden assumptions, and generate `REQUIREMENTS.md`.
- `/website-discover`: Build user journeys, target personas, and IA sitemap.
- `/website-design`: Art direction review via Taste Skill.
- `/website-stitch`: Screen generation and design system token mapping via Google Stitch.
- `/website-build`: Frontend scaffolding and component implementation.
- `/website-tdd`: Red-Green-Refactor vertical slice implementation.
- `/website-motion`: Micro-interaction, gesture, and transition engineering via Emil Kowalski skills.
- `/website-test`: Real browser validation across the 6 standard viewports.
- `/website-security`: OWASP Top 10 + STRIDE security review via Addy Osmani auditor.
- `/website-performance`: Core Web Vitals and asset payload review via Addy Osmani web perf auditor.
- `/website-critique`: Impeccable 24-command heuristic critique.
- `/website-audit`: Full-suite quality audit across all dimensions.
- `/website-release`: Quality gate G13 audit and production readiness sign-off.
