# INTEGRATION: PLAYWRIGHT MCP

## 1. Overview
The Playwright MCP server provides real-time browser automation tools over the Model Context Protocol, enabling models to navigate pages, inspect DOM structures, take screenshots, and evaluate page expressions.

## 2. Server Configuration
Register in `mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "env": {}
    }
  }
}
```

## 3. Tool Reference
- `playwright_navigate(url)`: Open page.
- `playwright_screenshot(options)`: Capture screenshot of current view.
- `playwright_click(selector)`: Click interactive element.
- `playwright_fill(selector, value)`: Fill input field.
- `playwright_evaluate(script)`: Evaluate arbitrary JavaScript in page context.
