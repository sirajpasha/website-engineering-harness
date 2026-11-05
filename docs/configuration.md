# CONFIGURATION & SETTINGS GUIDE

## 1. Environment Variables
Configure the following environment variables in your local `.env` or system environment:
- `STITCH_API_KEY`: Google Stitch API key (optional; if omitted, the harness falls back to local visual specifications).
- `NODE_ENV`: Set to `development` or `production`.
- `PORT`: Default local preview port (default: `3000`).

## 2. Model Context Protocol (`mcp.json`)
The root `mcp.json` defines a pinned Playwright MCP binding:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@0.0.84"]
    }
  }
}
```
Google Stitch is optional and not bundled; see `integrations/google-stitch-mcp.md` (user-scope setup with your own key).
