# CORE WEB VITALS & WEB PERFORMANCE GUIDELINES (skills/performance/)

## 1. Overview
Embodying Addy Osmani's Web Performance Auditor, this skill enforces Core Web Vitals thresholds and metric honesty across all environments.

## 2. Core Web Vitals Target Thresholds
- **LCP (Largest Contentful Paint):**
  - Good: ≤ 2.5s
  - Needs Improvement: 2.5s - 4.0s
  - Poor: > 4.0s
  - Primary levers: Image preload, image CDN optimization (WebP/AVIF), server TTFB reduction, critical CSS inlining.
- **INP (Interaction to Next Paint):**
  - Good: ≤ 200ms
  - Needs Improvement: 200ms - 500ms
  - Poor: > 500ms
  - Primary levers: Break long tasks (>50ms) using `scheduler.yield()` or `requestAnimationFrame()`, minimize main-thread JS execution.
- **CLS (Cumulative Layout Shift):**
  - Good: ≤ 0.1
  - Needs Improvement: 0.1 - 0.25
  - Poor: > 0.25
  - Primary levers: Explicit `width` and `height` (or `aspect-ratio`) on all images and embeds; reserve space for dynamic content.

## 3. Metric Honesty Protocol
Always distinguish between:
1. `[MEASURED LAB DATA]` - Direct Lighthouse / Playwright trace run.
2. `[STATIC OBSERVATION]` - Source inspection finding.
3. `[NOT MEASURED]` - Not measured due to lack of production runtime or network access.
Never invent synthetic scores.
