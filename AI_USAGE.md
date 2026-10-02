# AI Usage Log

This document tracks the usage of AI tools, models, and assistants in the development of the **Axionix Task Tracker** project.

---

## 1. Application Error Page

- **Date**: October 2026
- **Tool / Environment**: Google Antigravity IDE
- **Model Used**: Gemini 3.8 Flash (Antigravity)
- **Target Files**:
  - `src/app/error.tsx`
  - `src/app/error.module.scss`

### Description of AI Assistance
Gemini 3.8 Flash was utilized to design, scaffold, and implement the custom Next.js application error boundary page.

### Key Contributions & Features
1. **Interactive Component Architecture (`error.tsx`)**:
   - Built a Next.js client error boundary component (`'use client'`) receiving `error` and `reset` props.
   - Integrated clipboard copying functionality with real-time feedback state for error messages.
   - Implemented an animated retry mechanism with smooth icon rotation before triggering `reset()`.
   - Included path display using `usePathname()` and navigation fallback back to the dashboard.

2. **GSAP Motion & Animations**:
   - Orchestrated entrance timelines using `@gsap/react` (`useGSAP`).
   - Created masked staggered digit reveals (`500` status code).
   - Added support for accessibility with `prefers-reduced-motion` detection.

3. **Styling & Visual Design (`error.module.scss`)**:
   - Crafted a dark sci-fi aesthetic matching the background artwork (`/images/error.jpg`).
   - Implemented radial gradients, glassmorphism (`backdrop-filter`), and animated glowing status pulse dots.
   - Built fully responsive layouts adapting seamlessly across desktop and mobile screens.

### Human Verification & Oversight
- Verified Next.js App Router error handling conventions.
- Tested retry flows, clipboard copying, and responsive breakpoints.
- Reviewed and refined styling, layout alignment, and typography tokens.
