# INTEGRATION GUIDE: MCP & CLI RUNTIMES

## 1. Google Stitch MCP
To enable Stitch MCP:
Stitch is **optional and not bundled**. Follow [`integrations/google-stitch-mcp.md`](../integrations/google-stitch-mcp.md)
(your own API key, user-scope config), or [`integrations/google-stitch-sdk.md`](../integrations/google-stitch-sdk.md).
Without it, `STITCH_DESIGN_SPEC.md` declares `**Source:** Manual` (gate G5).
Verify the repo's own MCP config with `npm run validate:mcp`.

## 2. Playwright MCP & CLI
Playwright is a dependency of *your website project*, not of the harness:
```bash
npm i -D playwright axe-core && npx playwright install chromium
```
Run the 6-viewport verification suite (fails closed if Playwright is missing):
```bash
npx -y github:sirajpasha/website-engineering-harness test:browser [file.html|url]
```
Or interactively via Playwright MCP in Claude Code / Cursor.

## 3. Harness MCP server (any MCP client)
```json
{ "command": "npx", "args": ["-y", "github:sirajpasha/website-engineering-harness", "mcp"] }
```
Tools: `harness_check_gates`, `harness_browser_qa`, `harness_check_ratchets`, `harness_walkthrough`,
`harness_inspect_write`, `harness_inspect_command`, `harness_list_agents`.

## 4. Client approval video
`walkthrough [url|file]` records desktop and phone videos plus an unsigned `CLIENT_APPROVAL.md`
under `reports/walkthrough/`. MP4 output needs `ffmpeg`. See the README section "Client approval video".
