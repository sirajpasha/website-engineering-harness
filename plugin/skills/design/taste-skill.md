# TASTE SKILL INTEGRATION (Leonxlnx/taste-skill)

## 1. Overview
Taste Skill is the anti-slop frontend engineering skill that prevents AI models from generating predictable, templated web designs.

## 2. Aesthetic Directives
- **Typographic Distinction:** Avoid default font stacks like Inter, Roboto, or standard sans-serifs without specific intent. Select high-craft font pairings:
  - Display / Editorial: e.g., Newsreader, Playfair Display, Instrument Serif, Fraunces.
  - Body: e.g., Geist Sans, Plus Jakarta Sans, General Sans, Satoshi, Inter Display with tuned letter spacing (`-0.02em`).
  - Monospace / Technical: e.g., JetBrains Mono, Fira Code, Geist Mono.
- **Color Discipline:**
  - Establish a dominant 60-30-10 color distribution.
  - 60% neutral surface canvas (deep obsidian, warm ivory, or cool zinc).
  - 30% structural contrast (borders, secondary cards, typography).
  - 10% high-intent intentional accent.
  - Never generate unmotivated rainbow or purple-to-cyan gradient blobs.
- **Asymmetry & Rhythm:** Break out of symmetrical 3-column card layouts. Utilize asymmetrical hero sections, large typographic display headers, split editorial grids, and generous whitespace.
- **Tactile Depth:** Prefer crisp 1px borders (`rgba(255,255,255,0.08)` or `rgba(0,0,0,0.08)`) with subtle inset box shadows over muddy blurred drop shadows.

## 3. Self-Check Inspection
Before approving any layout, verify against the Anti-Slop Scorecard:
- [ ] Are all font families explicitly imported and declared?
- [ ] Is there an intentional hierarchy of text sizes using `clamp()`?
- [ ] Are buttons styled with purposeful active/hover feedback rather than default transitions?
- [ ] Is there meaningful negative space around content blocks?
