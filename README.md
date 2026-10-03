# Axionix Task Tracker

A sleek, Linear-inspired project management and issue-tracking platform built with **Next.js 16 (App Router)**, **TypeScript**, **SCSS Modules**, and **GSAP**.

---

## Features

- **Engineering Pulse & Dashboard (`/dashboard`)**:
  - Live sprint metrics (Total Issues, In Progress, Completed, Completion Rate).
  - Status filter tabs (`All`, `In Progress`, `To Do`, `Done`) with mobile-friendly horizontal scroll.
  - Linear-styled task rows with monospace keys (`AX-1`), priority tags, assignee avatars, and smart due date badges with overdue alerts.
  - Interactive status toggles and quick delete actions with toast feedback.
- **Global Search & Shortcuts**:
  - `⌘K` / `Ctrl+K`: Live issue filter across keys, titles, descriptions, projects, and assignees.
  - `C`: Quick-create issue modal from any page.
- **Interactive Kanban Board (`/projects/[id]`)**:
  - 3-column workflow (**To Do**, **In Progress**, **Done**) with column badges.
  - Inline issue creation per column.
  - One-click task transitions (`Start →`, `← Back`, `Done ✓`, `Re-open`) with optimistic updates and error rollback.
- **Projects Directory (`/projects`)**:
  - Visual project cards with delivery progress bars, health indicators (`On Track`, `Under Review`, `Completed`), and assigned member avatars.
  - Modal to create new initiatives on the fly.
- **Authentication & User Management (`/login`)**:
  - Clean login and registration flow with role selection.
  - 1-Click demo profile selector for testing.
  - Interactive profile switcher in the sidebar footer.
- **Simulated Network Error Mode (Req #3)**:
  - Header toggle (`Mock Error`) to simulate network failures on all mutations, testing optimistic update rollbacks and toast notifications.
  - Test crash button to trigger the custom Next.js error boundary (`error.tsx`).
- **Dark / Light Mode**:
  - Theme toggle with zero hydration flash using inline script injection.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (Strict mode)
- **Styling**: Vanilla SCSS Modules with CSS custom properties
- **Animations**: GSAP (`@gsap/react`)
- **State Management**: `useSyncExternalStore` with persistent `localStorage` cache
- **Icons**: Lucide React

---

## Demo Accounts

You can log in directly using one-click demo profiles on `/login` or enter:

| Name | Email | Role |
| :--- | :--- | :--- |
| **Saurabh Thapliyal** | `sthap@axionix.dev` | Frontend Developer Intern |
| **John Doe** | `jdoe@example.com` | Product Designer |
| **Asta** | `asta@axionix.dev` | Product Designer |

*Password: Any string with 4+ characters (e.g., `password123`).*

---

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Production build & type check**:
   ```bash
   npm run build
   ```

---

## License

MIT
