---
name: emil-design-eng
description: Emil Kowalski design engineering principles: high-craft physical interactions, spring physics, tactile micro-interactions, anti-slop animation curves, and physical feedback.
---

# Emil Kowalski Design Engineering Standards

## Core Principles
1. **Never use `transition: all`**: Specify exact animated properties (`transform`, `opacity`, `background-color`).
2. **Spring Physics & Physicality**:
   - Never pop from `scale(0)`. Elements enter from `scale(0.96)` with smooth opacity fade.
   - Button click down: `:active { transform: scale(0.97); }` (instant tactile press feedback).
3. **Restrained, Crisp Timing**:
   - Micro-interactions: 150ms–220ms with custom cubic bezier curves `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Modals & Drawers: Spring dampening (exit is always 1.5x faster than entry).
4. **Natural Color Harmony (Anti-AI Palette)**:
   - Eliminate harsh saturation and fake neon accents.
   - Use warm off-blacks (`#0B0C10`, `#12141A`), zinc neutral surfaces, and refined monochromatic accents with purposeful contrast.

