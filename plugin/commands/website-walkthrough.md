---
description: "Records desktop and phone videos of the real, running website for client approval, and writes an unsigned CLIENT_APPROVAL.md with measured QA evidence."
---

# COMMAND: /website-walkthrough

## Description
Records desktop and phone videos of the real, running website for client approval, and writes an unsigned CLIENT_APPROVAL.md with measured QA evidence.

## Invocations
- Claude Code: `/website-walkthrough`
- Terminal / Node: `node scripts/website-engineering-harness-cli.js walkthrough [url|file.html] --label "Name v1"`
- MCP: `harness_walkthrough`

## Workflow Steps
1. Make sure the site is running (or point at a built `index.html`) and run browser QA first (`/website-test`) so the approval sheet can quote measured results.
2. Run the walkthrough. It visits the entry page and its internal navigation links, scrolls each page, opens the mobile menu, and shows on-screen captions.
3. Check the output folder (`reports/walkthrough/`): `desktop.webm`, `phone.webm` (+ `.mp4` if ffmpeg is installed), poster images, `walkthrough.json`, `CLIENT_APPROVAL.md`.
4. If any page failed to load the result is **NOT READY** — fix it and record again. Never send a video of a broken build as approved.
5. Send the videos and `CLIENT_APPROVAL.md` to the client. The decision boxes are intentionally unchecked: only the client ticks them.

## Honesty rules
- It records the actual build, not a mockup; forms are never submitted.
- Quality numbers appear only if a fresh browser-QA report exists for the same sources.
