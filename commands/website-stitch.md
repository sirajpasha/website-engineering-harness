# COMMAND: /website-stitch

## Description
Activates AGENT 06 (Google Stitch Design Engineer) to generate UI screens, design variants, and design token exports through a Stitch MCP server the user has connected (or `@google/stitch-sdk`). Stitch is optional; without it the spec is authored manually and labelled `Source: Manual`.

## Invocations
- Claude Code: `/website-stitch`
- Terminal / Node: `node scripts/website-engineering-harness-cli.js stitch`

## Workflow Steps
1. Ingest approved `REQUIREMENTS.md` and `DESIGN_DIRECTION.md`.
2. If a Stitch server is connected, discover its tools (`tools/list`) and initialize a project; otherwise author the spec manually.
3. Generate high-fidelity screen concepts for all sitemap routes.
4. Extract visual tokens into `DESIGN_TOKENS.json`.
5. Record provenance (`**Source:**` line) in `STITCH_DESIGN_SPEC.md`.
5b. Map generated UI nodes to component boundaries in `COMPONENT_INVENTORY.md`.
6. Enforce Quality Gate G5 (Stitch Design).
