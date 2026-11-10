---
name: ui-ux-pro-max
description: Comprehensive UI/UX design intelligence database and design system specifications for modern data-dense web apps and SaaS dashboards.
---

# UI/UX Pro Max Design Intelligence

Guidelines for enterprise-grade SaaS, developer portals, and complex dashboards.

## 1. Grid & Spacing System
- Base unit: **4px / 8px scale** (`gap-2` = 8px, `gap-4` = 16px, `gap-6` = 24px, `p-6` = 24px).
- Containers: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Section Spacing: Balanced vertical breathing room (`py-12` to `py-20`).

## 2. Component Design Tokens
- **Cards & Surfaces:**
  - Background: `rgba(15, 23, 42, 0.65)` (Deep slate with 65% opacity).
  - Border: 1px solid `rgba(255, 255, 255, 0.08)`.
  - Border Radius: `rounded-xl` (12px) or `rounded-2xl` (16px) for cards; `rounded-lg` (8px) for buttons/inputs.
- **Buttons & Interactive Elements:**
  - Primary: High contrast solid or crisp neon edge (`bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm shadow-indigo-500/25`).
  - Secondary / Outline: Subtle glass surface (`bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10`).
  - Danger / Terminate: Soft ruby (`bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20`).

## 3. Data Tables & Status States
- Always include active status indicators (e.g. `Approved`, `Pending`, `Running`, `Rejected`).
- Use skeleton loaders instead of full-screen spinners during API loading states.
- Empty states must contain an icon, a descriptive one-sentence reason, and an actionable button.

