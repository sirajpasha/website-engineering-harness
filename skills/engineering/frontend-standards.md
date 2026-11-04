# FRONTEND ENGINEERING STANDARDS (skills/engineering/)

## 1. Component Modularity Principles
- **Single Responsibility Principle (SRP):** Each component must perform exactly one function (e.g., button rendering, form control, navigation drawer).
- **Interface Segregation:** Component props must be strictly typed and minimal. Do not pass monolithic data objects when only two primitives are consumed.
- **Composition over Inheritance:** Leverage compound components or slots/children rather than deeply configured boolean flags.

## 2. Directory Structure Conventions
```
src/
├── components/          # Reusable UI primitives (Button, Card, Modal, Input)
├── layouts/             # Page shell layouts (Header, Footer, Nav, Sidebar)
├── pages/ or routes/    # Route endpoints and page assemblies
├── styles/              # CSS tokens, theme variables, reset
├── hooks/ or composables# Reusable stateful logic
├── utils/               # Pure functions, formatters, validators
└── types/               # Type definitions and interfaces
```

## 3. Performance & Rendering Guardrails
- Avoid inline function declarations inside hot render loops.
- Use explicit `key` props based on persistent entity IDs, never array indices.
- Lazy-load heavy below-the-fold components and modal dialogs.
