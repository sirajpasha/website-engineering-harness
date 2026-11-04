# COMMAND: /website-stitch

## Description
Activates AGENT 06 (Google Stitch Design Engineer) to generate UI screens, design variants, and design token exports via Google Stitch MCP server (`@google/stitch-mcp`) and CLI.

## Invocations
- Claude Code: `/website-stitch`
- Terminal / Node: `node scripts/harness-cli.js stitch`

## Workflow Steps
1. Ingest approved `REQUIREMENTS.md` and `DESIGN_DIRECTION.md`.
2. Connect to Stitch MCP / CLI and initialize project workspace.
3. Generate high-fidelity screen concepts for all sitemap routes.
4. Extract visual tokens into `DESIGN_TOKENS.json`.
5. Map generated UI nodes to component boundaries in `COMPONENT_INVENTORY.md`.
6. Enforce Quality Gate G5 (Stitch Design).
