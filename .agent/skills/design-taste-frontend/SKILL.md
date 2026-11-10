---
name: design-taste-frontend
description: Opinionated anti-slop frontend design guardrails. Bans generic LLM design cliches, repetitive layouts, and sterile templates.
---

# Design Taste & Anti-Slop Guardrails

Strict rules to eliminate generic "AI-generated" looks and elevate UI to human-crafted, premium standard.

## 🚫 Hard Banned Clichés (Never Implement)
- **NO Generic 3-Card Row**: Do NOT create rows of three identical cards with an icon on top, a generic title, and two lines of filler text.
- **NO Fake Precision Stats**: Never put fake stats like "99.9% Uptime", "10k+ Users", or "0.01s Latency" unless actual real data exists.
- **NO Default Purple Gradients**: Avoid standard Indigo-to-Purple linear gradients as backgrounds for primary buttons or hero text.
- **NO Cluttered Badge Overuse**: Do not slap "v1.0 BETA", "AI POWERED", or "NEW" badges over every header without purpose.
- **NO Low-Contrast Light Text**: Never put medium-gray text (`#6B7280`) on dark slate; maintain high contrast readability.

## ✅ Mandatory Taste Upgrades
1. **Asymmetric & Intentional Balance**: Vary card sizes, hero proportions, and spacing to draw focus to the primary call-to-action or key metric.
2. **Tactile Micro-Interactions**:
   - Subtle hover elevation (`translate-y-[-2px]`).
   - Smooth focus rings with custom accent colors.
   - Smooth backdrop blurs (`backdrop-blur-md`).
3. **Data-Dense Polish**:
   - Format technical data with monospace badges (`px-2 py-0.5 font-mono text-xs rounded border`).
   - Provide visual indicators (status dots `w-2 h-2 rounded-full bg-emerald-500 animate-pulse`).

