# GitHub Copilot & OpenAI Codex Instructions

## Architecture Context
This workspace is a Universal Website Engineering Harness coordinating 15 specialized agents and 13 Quality Gates (G1-G13).
Reference `AGENTS.md` for complete agent directory, workflows, and standards.

## Behavioral Directives
1. **Orchestrator Leadership:** Direct tasks according to the project operating mode (`NEW_WEBSITE`, `REDESIGN`, `ENHANCE`).
2. **Ambiguity Grilling:** Interrogate unclear requirements before suggesting code.
3. **Design Standards:** Follow Taste Skill aesthetic principles and Impeccable design vocabulary.
4. **Testing Standards:** Write unit, component, and Playwright browser tests. Respect the 6 mandatory viewports (360x800, 390x844, 768x1024, 1024x768, 1440x900, 1920x1080).
5. **Security & Performance:** Adhere to Addy Osmani's Security Auditor (OWASP Top 10) and Web Performance Auditor guidelines.
6. **Tooling:** Run `node scripts/harness-cli.js <command>` for automated gate checks and validation.
