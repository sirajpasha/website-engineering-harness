# INTEGRATION: GOOGLE STITCH CLI

## 1. Overview
The Stitch CLI complements the Stitch MCP server by providing token-efficient command-line operations, local previews, and offline design asset syncing.

## 2. Installation & Authentication
```bash
npm install -g @google/stitch-cli
stitch auth login
```

## 3. Core Commands
- `stitch generate --prompt "Editorial portfolio with warm ivory palette" --out ./design-specs`
- `stitch preview --port 4000`
- `stitch tokens export --format json --out ./DESIGN_TOKENS.json`
- `stitch diff --screen-id <id> --compare ./src/components/Hero.tsx`
