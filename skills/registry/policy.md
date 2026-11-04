# SKILL SELECTION & GOVERNANCE POLICY (policy.md)

## 1. Purpose & Scope
This policy governs how AI specialist agents discover, evaluate, install, retain, or reject skills within the Website Engineering Harness. The goal is to maximize engineering craft while strictly preventing context bloating, duplicate capabilities, and competing slash commands.

## 2. Dynamic Skill Evaluation Rubric (10-Point Filter)
Before any skill is added to `SKILL_REGISTRY.md`, it must achieve a passing evaluation against this rubric:

```markdown
1. Relevance: Solves a concrete website engineering or design problem.
2. Quality: Clean code, zero unhandled exceptions, modern standards.
3. Source Credibility: Authored by recognized domain experts or official vendor teams.
4. Documentation: Clear installation, parameters, inputs, and outputs.
5. Maintenance: Actively maintained or stable with no open CVEs.
6. Compatibility: Cross-model compatible (Claude, Gemini, Codex, Cursor).
7. Security: Does not execute arbitrary untrusted shell strings or exfiltrate tokens.
8. Non-Overlapping: Does not duplicate Taste, Impeccable, Emil Kowalski, Addy Osmani, or Matt Pocock skills.
9. Token Efficiency: Concise instructions that do not saturate context windows.
10. License: Permissive open-source license (MIT, Apache-2.0, BSD-3-Clause).
```

## 3. Context Loading Policy (Selective Ingestion)
- **Never load the entire skills library into every prompt.**
- The Master Orchestrator loads **only** the single skill required for the current stage:
  - Art direction phase: Load Taste Skill.
  - Review phase: Load Impeccable 24-commands.
  - Animation phase: Load Emil Kowalski motion rules.
  - Security audit phase: Load Addy Osmani Security Auditor.
  - Performance audit phase: Load Addy Osmani Web Performance Auditor.
  - TDD phase: Load Matt Pocock Red-Green-Refactor rules.

## 4. Conflict Resolution Strategy
When two skills offer overlapping recommendations (e.g., visual layout critique):
1. **Taste Skill** holds absolute jurisdiction over high-level visual aesthetic, brand personality, and anti-slop rules.
2. **Impeccable** holds absolute jurisdiction over UX usability heuristics, cognitive load, and micro typographic polish.
3. **Frontend Architect** resolves any underlying code implementation conflict.
