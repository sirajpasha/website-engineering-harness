# CONFIGURATION & SETTINGS GUIDE

## 1. Environment Variables
Configure the following environment variables in your local `.env` or system environment:
- `STITCH_API_KEY`: Google Stitch API key (optional; if omitted, the harness falls back to local visual specifications).
- `NODE_ENV`: Set to `development` or `production`.
- `PORT`: Default local preview port (default: `3000`).

## 2. Model Context Protocol (`mcp.json`)
The root `mcp.json` defines standard bindings for Playwright and Google Stitch:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "google-stitch": {
      "command": "npx",
      "args": ["-y", "@google/stitch-mcp"],
      "env": {
        "STITCH_API_KEY": "${STITCH_API_KEY}"
      }
    }
  }
}
```
