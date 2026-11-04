# INTEGRATION: GOOGLE STITCH MCP

## 1. Overview
The Google Stitch MCP server provides programmatic Model Context Protocol tools for AI models to create design projects, generate screens, iterate design variants, and export design tokens from Google Stitch (`stitch.withgoogle.com`).

## 2. Server Configuration
Register in `mcp.json` or `.cursor/mcp.json` or `claude_desktop_config.json`:

```json
{
  "mcpServers": {
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

## 3. Tool Reference
- `stitch_create_project(title, description)`: Initializes a design project.
- `stitch_generate_screen(projectId, prompt, deviceType)`: Generates high-fidelity screen concepts.
- `stitch_get_screen(screenId)`: Retrieves screen DOM, CSS, and layout specs.
- `stitch_update_screen(screenId, modificationPrompt)`: Applies targeted iterative revisions.
- `stitch_export_tokens(projectId)`: Exports color, typography, and spacing tokens as JSON.

## 4. Security & Credentials
Never commit `STITCH_API_KEY` into git or markdown files. Always configure it as an environment variable.
