# EMIL KOWALSKI MOTION DESIGN ENGINEERING SKILLS (emilkowalski/skills)

## 1. Overview
Emil Kowalski's motion design engineering skills formulate interaction design as an exact, physics-based engineering discipline.

## 2. The 14 Design Engineering Skills
1. `emil-design-eng`: Core ethos of tactile feedback, invisible motion, and interface poise.
2. `animate`: Designing micro-interactions with custom cubic-bezier and spring parameters.
3. `animate-expo`: High-performance gesture-driven animations offloaded from JS main thread.
4. `animation-vocabulary`: Precise definitions for damping, stiffness, mass, velocity, and bounce.
5. `apple-design`: Tactile precision, springiness, and spatial orientation inspired by Apple UI.
6. `ask-sonner`: Toast and notification choreography (smooth stacking, exit, interactive swipes).
7. `break-ui`: Stress-testing rapid interactive hammering, aborting gestures, and interruption safety.
8. `find-animation-opportunities`: Algorithmic review of codebase identifying missing feedback.
9. `improve-animations`: Eliminating linear eases, reducing excessive durations, aligning transform origins.
10. `mobile-native`: Sheet physics, pull-to-refresh, pinch-to-zoom, touch feedback.
11. `pick-ui-library`: Selecting the right runtime (CSS transitions, Web Animations API, Motion).
12. `prototype`: Interactive variant switcher allowing live comparison of spring curves.
13. `review-animations`: Strict inspection against craft rules (e.g. entrances must decelerate; exits must accelerate).
14. `reduced-motion`: Zero-delay, cross-fade fallback honoring user preference.

## 3. Authoritative Motion Curves & Values
```css
:root {
  /* Snappy Tactile (buttons, toggles, checkboxes): 150ms */
  --ease-tactile: cubic-bezier(0.2, 0.8, 0.2, 1);
  --duration-tactile: 180ms;

  /* Smooth Spatial (dialogs, drawers, dropdowns): 280ms */
  --ease-spatial: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-spatial: 280ms;

  /* Natural Spring (Framer Motion / Motion One): */
  /* stiffness: 300, damping: 28, mass: 1 */
}
```
