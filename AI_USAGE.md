# AI Usage Log

This document summarizes the use of AI assistants and models during the design and development of **Axionix Task Tracker**.

---

## Overview

The core architecture, component logic, data models, and features were designed and implemented specifically for this project. AI models were utilized as pair-programming assistants for structural scaffolding, responsive design, GSAP animation orchestration, architectural audits, and strict code verification.

---

## Models & Assistance Breakdown

### 1. Google Gemini 3.8 Flash (Antigravity IDE)
- **Scope**: Page scaffolding, design system implementation, sidebar refactor, and animation orchestration.
- **Contributions**:
  - Scaffolding the Next.js client-side error boundary ([src/app/error.tsx](file:///D:/Web%20Dev/axionix-task-tracker/src/app/error.tsx)) with crash simulation, digest logging, and clipboard diagnostics.
  - Establishing SCSS design tokens, glassmorphism aesthetics, dark/light theme switching, and responsive layout foundations.
  - Implementing GSAP timelines for entry animations, metric digit reveals, and status check transitions.
  - Implementing the full sidebar refactor: centralized navigation config, dynamic real project bindings, interactive workspace selector, keyboard shortcuts modal, and quick settings popover.
  - Wiring `TaskFilters` into the dashboard to power the dedicated **"My Issues"** scoped view (`/dashboard?view=my-issues`).

### 2. Claude Opus 5.5 (Antigravity IDE)
- **Scope**: Responsive design, architectural refactoring, and state synchronization.
- **Contributions**:
  - Refining mobile navigation drawer and responsive layout behavior across desktop and tablet breakpoints.
  - Refactoring persistent stores with `useSyncExternalStore` and `themeInitScript` to eliminate hydration flashes and React 19 hydration mismatches.
  - Initial implementation of the interactive Kanban board (`/projects/[id]`), project creation modals, and optimistic state updates with rollback on failure (Req #3).

### 3. Claude Fable 5.1 (WebStorm)
- **Scope**: Final codebase audit, navigation review, and ESLint cleanup.
- **Contributions**:
  - Performing a comprehensive audit of the sidebar navigation to identify placeholder links, hardcoded badges, and accessibility gaps.
  - Formulating the architectural plan for centralized navigation config ([src/components/layout/navConfig.ts](file:///D:/Web%20Dev/axionix-task-tracker/src/components/layout/navConfig.ts)) and dynamic project links.
  - Auditing unused TypeScript domain models (`TaskFilters`) and recommending their integration into the dashboard's filtering layer.
  - IDE-level static analysis, comment cleanup, and verifying zero ESLint warnings and zero TypeScript errors within WebStorm.

---

## Human Verification & Control
- Every AI-assisted contribution was reviewed, tested, and validated against assignment specifications.
- Verified Next.js 16 App Router conventions, Turbopack compatibility, and zero-error builds (`npm run build`).
- Manually verified core workflows: user registration, role selection, optimistic status cycles, simulated failure mode (Req #3), global search (`⌘K`), and Kanban board transitions.
