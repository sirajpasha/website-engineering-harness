# ENGINEERING STANDARD: MOTION & INTERACTION

## Standards
1. **Duration Cap:** Feedback animations must complete under 250ms; page transitions under 350ms.
2. **Natural Curves:** Natural easing (e.g. spring physics or `cubic-bezier(0.16, 1, 0.3, 1)`). No linear spatial movement.
3. **Accessibility:** Strictly provide `@media (prefers-reduced-motion: reduce)` overrides.
4. **Performance:** Only animate `transform` and `opacity` properties to prevent layout thrashing and maintain 60fps.
