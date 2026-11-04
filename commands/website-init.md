# COMMAND: /website-init

## Description
Initializes project context, runs an environment audit, assesses installed capabilities, and scaffolds the workspace according to the Universal Website Engineering Harness.

## Invocations
- Claude Code: `/website-init`
- Terminal / Node: `npm run audit` or `node scripts/harness-cli.js init`

## Workflow Steps
1. Execute `scripts/environment-audit/audit-environment.js` to inspect runtime, tools (git, node, npm, python), and MCP configurations.
2. Initialize or verify root configuration files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `mcp.json`).
3. Generate initial project template files (`PROJECT_BRIEF.md`, `REQUIREMENTS.md`, `DECISIONS.md`, `DEFECT_REGISTER.md`).
4. Output environment status summary and prompt the user to start requirement grilling with `/website-grill`.
