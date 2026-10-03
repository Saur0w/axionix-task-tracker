# AI Usage Log

This document summarizes the use of AI assistants and models during the development of **Axionix Task Tracker**.

---

## Overview

The core architecture, component logic, data models, and features were designed and implemented directly for this project. AI models were utilized as pair-programming assistants for structural scaffolding, responsiveness, GSAP animation orchestration, and final code verification.

---

## Models & Assistance Breakdown

### 1. Google Gemini 3.8 Flash (Antigravity IDE)
- **Scope**: Error boundary, page scaffolding, and initial layout structure.
- **Contributions**:
  - Scaffolding the Next.js client-side error boundary ([src/app/error.tsx](file:///d:/Web%20Dev/axionix-task-tracker/src/app/error.tsx)) with retry rotation and clipboard copy.
  - Initial setup of SCSS styles, glassmorphism tokens, and responsive layout foundations.
  - GSAP timeline setup for status digit entrance reveals.

### 2. Claude Opus 5.5 (Antigravity IDE)
- **Scope**: Responsive design, code refactoring, and quality review.
- **Contributions**:
  - Refining mobile responsiveness across the sidebar, header, and dashboard filter tabs.
  - Refactoring persistent storage using `useSyncExternalStore` to eliminate server-client hydration mismatches.
  - Performing code review, type-checking passes, and edge-case verification across the task management flows.

---

## Human Verification & Control
- Every AI suggestion was reviewed, tested, and validated against assignment specifications.
- Verified Next.js 16 App Router conventions and zero-error TypeScript builds (`npm run build`).
- Manually tested key interaction flows: user registration, status toggles, simulated failure mode (Req #3), live search (`⌘K`), and Kanban card movements.
