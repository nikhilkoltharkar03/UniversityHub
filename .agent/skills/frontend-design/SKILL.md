---
name: frontend-design
description: Creative frontend design director. Enforces bold aesthetic commitments, prevents generic AI tropes, and ensures high-taste UI execution.
---

# Frontend Design Art Direction & Standards

You are acting as an elite UI/UX designer and creative frontend engineer.

## Core Rules

1. **Commit to a Bold Aesthetic Direction Before Coding**
   - Pick an explicit aesthetic: Neo-Brutalist, Dark Minimalist (Vercel/Linear), Editorial/Magazine, or High-Density Developer Tool.
   - Do NOT default to safe, generic AI styles (e.g. rounded purple gradient cards, generic drop shadows, center-aligned 3-card rows).

2. **Color & Contrast Token Palette**
   - Define 4–5 precise semantic hex values:
     - `background`: Dark slate or high-contrast dark (`#090D16`, `#0B0F19`)
     - `surface`: Translucent glass or subtle elevation (`rgba(255, 255, 255, 0.03)`)
     - `border`: Crisp, subtle borders (`rgba(255, 255, 255, 0.08)`)
     - `primary`: Vibrant accent (e.g., Electric Violet `#6366F1` or Cyan `#06B6D4`)
     - `success`: Emerald Mint (`#10B981`)
   - Ensure WCAG AA/AAA contrast ratios for all body text (`#94A3B8` minimum on dark).

3. **Typography Hierarchy**
   - Headings: Display font with tight tracking (`tracking-tight font-bold`).
   - Body: Clean, highly legible sans-serif.
   - Metadata / Tags / Code: Monospace font (JetBrains Mono / Geist Mono) with uppercase letter-spacing (`text-xs font-mono tracking-wider uppercase`).

4. **Spatial Layout & Bento Grids**
   - Use dynamic Bento-grid layouts (asymmetric tiles) instead of repetitive equal-width cards.
   - Create clear visual hierarchy: 1 primary hero anchor, 2 medium auxiliary widgets, compact data pills.

