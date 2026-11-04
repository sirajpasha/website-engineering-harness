# MOTION SPECIFICATION: AETHER STUDIO

**Engineer:** AGENT 07 (Motion & Interaction Engineer - Emil Kowalski Standard)  
**Quality Gate G8 Status:** `PASSED`  

## 1. Interaction Parameters
- **Button Press:** `160ms`, `cubic-bezier(0.2, 0.8, 0.2, 1)`, scale down to `0.98`.
- **Modal Entry:** `240ms`, `cubic-bezier(0.16, 1, 0.3, 1)`, translateY from `12px` to `0px`, opacity `0` to `1`.
- **Slider Interaction:** Live value update with zero jank; 60fps CSS transform feedback.
- **Reduced Motion:** When `@media (prefers-reduced-motion: reduce)` is detected, all transitions drop to `0.01ms` cross-fade.
