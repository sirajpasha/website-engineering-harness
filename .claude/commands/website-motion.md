# COMMAND: /website-motion

## Description
Activates AGENT 07 (Motion & Interaction Engineer) using Emil Kowalski skills to engineer micro-interactions, layout transitions, spring physics, and reduced-motion states.

## Invocations
- Claude Code: `/website-motion`
- Terminal / Node: `node scripts/website-engineering-harness-cli.js motion`

## Workflow Steps
1. Scan codebase for static or jarring UI components (`find-animation-opportunities`).
2. Implement sub-300ms transitions using natural spring physics or custom cubic-bezier curves.
3. Validate `@media (prefers-reduced-motion: reduce)` fallbacks.
4. Verify 60fps performance without causing Cumulative Layout Shift (CLS).
5. Enforce Quality Gate G8 (Motion Quality).
