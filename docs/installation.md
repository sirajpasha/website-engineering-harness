# INSTALLATION & COMPATIBILITY GUIDE

## 1. Prerequisites
- **Node.js:** v18.0.0 or newer (v22 recommended)
- **NPM:** v9.0.0 or newer
- **Git:** v2.30+
- **Playwright:** Installed via `npx playwright install`

## 2. Installation Across AI Environments

### Claude Code CLI
Claude Code automatically discovers `CLAUDE.md`, `.claude/agents/`, and `.claude/commands/`:
```bash
claude
# Inside Claude Code session:
/website-init
```

### Gemini CLI / Google Antigravity
Gemini CLI / Antigravity automatically ingests `GEMINI.md` and `AGENTS.md`:
```bash
# Verify environment and quality gates
npm run audit
npm run gates
```

### Cursor & Windsurf IDEs
Cursor and Windsurf read `.cursorrules`, `.cursor/rules/`, and `.windsurfrules`.
Add MCP servers from `mcp.json` into Cursor Settings -> Features -> MCP Servers.

### OpenAI Codex / Copilot / Terminal
Run the universal CLI runner directly:
```bash
npm run harness -- --help
npm run validate:all
```
