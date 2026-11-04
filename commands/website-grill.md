# COMMAND: /website-grill

## Description
Activates AGENT 02 (Requirement Grilling Specialist) to conduct Socratic interrogation of project requirements, resolve ambiguities, challenge hidden assumptions, and update `REQUIREMENTS.md` and `GLOSSARY.md`.

## Invocations
- Claude Code: `/website-grill`
- Terminal / Node: `node scripts/website-engineering-harness-cli.js grill`

## Workflow Steps
1. Ingest `PROJECT_BRIEF.md` and existing prompt context.
2. Formulate the single most critical unanswered question regarding business goals, user personas, or technical constraints.
3. Challenge ambiguous buzzwords ("modern", "clean", "simple").
4. Define explicit domain terms in `GLOSSARY.md`.
5. Assign immutable IDs (`REQ-001`, `REQ-002`) to confirmed requirements in `REQUIREMENTS.md`.
6. Enforce Quality Gate G1 (Requirements) once all blocking items are resolved.
