# Copilot instructions — Bright Spark Learning

Summary
- This is a Vite + React + TypeScript + Tailwind project scaffolded with shadcn-style UI primitives.
- Entry points: `src/main.tsx` → `src/App.tsx` (providers, router) → `src/pages/*` (screens).

Quick start (dev)
- npm install
- npm run dev  # start Vite dev server with HMR
- npm run build  # production build
- npm run build:dev  # development-mode build
- npm run preview  # serve a built bundle locally
- npm run lint  # run ESLint checks

Key files & structure
- `src/main.tsx` - React root mount.
- `src/App.tsx` - global providers: `QueryClientProvider` (react-query), `TooltipProvider`, `Toaster` components, and `BrowserRouter`.
  - Note: add new routes in `App.tsx` above the catch-all `*` route (see the inline comment).
- `src/pages/Index.tsx` - main dashboard. The app uses a single page with a `Sidebar` that switches the main content via local state (tab names: `home`, `learn`, `notes`, `speech`, `stats`, `leaderboard`, `settings`).
- `src/components/` - feature folders (e.g., `dashboard/`, `learn/`, `notes/`) and `components/ui/` for primitives (Radix/Vaul wrappers, shadcn patterns).
- `src/contexts/ThemeContext.tsx` - theme and companion selection (toggles `theme-blue` class on `<html>`). Colors are read from CSS variables referenced in `tailwind.config.ts`.
- `src/lib/utils.ts` - `cn()` helper (uses `clsx` + `tailwind-merge`) — use this to merge classNames consistently.

Conventions & patterns (important for edits)
- Use the `@/` path alias (configured in `tsconfig.json`) for imports (e.g., `import { Button } from '@/components/ui/button'`).
- UI primitives:
  - Use `cva` (class-variance-authority) to define component variants (see `components/ui/button.tsx`).
  - Use `cn()` to merge and dedupe Tailwind classes.
  - Prefer building on existing primitives in `components/ui` instead of creating raw DOM + Tailwind combos.
- Theme and design tokens:
  - Tailwind uses CSS variables for colors declared in `tailwind.config.ts` (e.g., `background`, `primary`, `sidebar.*`). Update CSS variables (usually in a global CSS file) when adding themes.
  - `ThemeProvider` sets a `theme-blue` class — use that class and tokens rather than hardcoding colors.
- Routing:
  - Add new top-level routes in `App.tsx` (the project currently uses a small router with a homepage and a catch-all 404).
  - The Index page is a single-dashboard app where sidebar tabs control which feature component is shown. To add a new tab, update `Sidebar` and `Index`'s switch-case.
- Data fetching:
  - `@tanstack/react-query` is set up via `QueryClientProvider`. Use `useQuery`/`useMutation` with clear query keys and centralize API calls in a `lib/api` or `hooks/` file (no centralized API helper exists yet).
- Third-party & primitives used:
  - Radix UI primitives, `vaul` for drawer primitives, `sonner` + custom `Toaster` for notifications, `class-variance-authority` for variants.

Developer workflow & debugging tips
- Use `npm run dev` and the browser console + Vite terminal output for fast feedback and HMR errors.
- Run `npm run lint` to surface style and type-lint issues (ESLint + typescript-eslint config lives in `eslint.config.js`).
- Type errors surface in the editor (tsserver) and during builds.

Adding features & PR guidance (practical do/don't)
- DO reuse UI primitives (`components/ui/*`) and the `cn()` helper for consistent styling.
- DO use `@/` imports and add path-types to `tsconfig` if you add new top-level folders.
- DO add new routes above the `*` catch-all route in `App.tsx`.
- AVOID hardcoding colors where tokens exist (use theme tokens in `tailwind.config.ts`).

Examples to reference
- `src/components/ui/button.tsx` — combination of `cva` + `cn` pattern for reusable variants.
- `src/components/ui/drawer.tsx` — how `vaul` primitives are wrapped with consistent styling.
- `src/pages/Index.tsx` and `src/components/layout/Sidebar.tsx` — how the dashboard tab routing is implemented.
- `src/contexts/ThemeContext.tsx` — theme toggling side effects and companion state.

Notes & missing items
- There are currently no automated tests configured in the repo.
- There is no centralized API service yet — create `src/lib/api` or `src/hooks` for network code and reuse `react-query` for caching.

If anything here is unclear or you want examples added (e.g., a starter `lib/api` file, or a sample `useQuery` hook), tell me which section to expand and I will iterate. ✅
