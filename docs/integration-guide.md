# INTEGRATION GUIDE: MCP & CLI RUNTIMES

## 1. Google Stitch MCP
To enable Stitch MCP:
1. Obtain an API key from `stitch.withgoogle.com`.
2. Set environment variable: `export STITCH_API_KEY="your-key"`.
3. Verify connection: `node scripts/mcp-validation/validate-mcp.js`.

## 2. Playwright MCP & CLI
Playwright is installed via npm.
To run the automated 6-viewport verification suite:
```bash
node scripts/browser-validation/validate-browser.js
```
Or interactively via Playwright MCP in Claude Code / Cursor.
