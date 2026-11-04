# COMMAND: /website-critique

## Description
Activates AGENT 05 (UX/UI Design Specialist) using Impeccable's 24-command framework to conduct formal 10-heuristic design critique and visual polish.

## Invocations
- Claude Code: `/website-critique`
- Terminal / Node: `node scripts/harness-cli.js critique`

## Workflow Steps
1. Score the target view across Jakob Nielsen's 10 Usability Heuristics (out of 40).
2. Identify design drift, cognitive overload, or visual bugs (P0 to P3).
3. Apply appropriate steering commands (`/impeccable bolder`, `quieter`, `distill`, `typeset`, `polish`).
4. Generate `UI_CRITIQUE_REPORT.md` with prioritized action items.
5. Enforce Quality Gate G4 (UX/UI Critique).
