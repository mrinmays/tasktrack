# AGENTS.md — AI Agent Operating Rules for tasktrack

## Mandatory: Run `pnpm check` After Every Significant Change

```bash
pnpm check
```

This runs **ESLint** and **TypeScript type-checking** (`tsc -b`, no emit). After any meaningful code change you **must** run this command and ensure **zero errors and zero warnings** before considering the task complete.

---

## Environment

- **Package manager**: pnpm (see `packageManager` field in `package.json`).
- **Runtime / tooling**: Bun is available for scripts (`bun run <script>`), but pnpm is the primary package manager.
- **Bundler**: Vite (with `@vitejs/plugin-react`).
- **Linting**: ESLint (flat config — `eslint.config.js`), with `react-hooks` and `react-refresh` plugins.
- **Type-checking**: TypeScript ~5.9, strict mode, project references (`tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`).
- **Styling**: Tailwind CSS 3 + PostCSS + Autoprefixer.
- **Routing**: TanStack Router (file-based, auto-generated `routeTree.gen.ts`).

## Project Structure

```
src/
  contexts/        — React contexts
  hooks/           — Shared hooks
  modules/
    <domain>/
      components/  — UI components
      hooks/       — Domain hooks
      services/    — API / service files
      utils/       — Utility functions
      types/       — TypeScript types
      constants/   — Constants
      stores/      — State stores
      index.ts     — Public re-exports only
  routes/          — TanStack Router file-based routes
```

### Test Mirroring

- **Unit tests**: `test/unittests/modules/<domain>/...` — mirror source 1:1.
- **Module tests**: `test/moduletests/modules/<domain>/...` — integration within a module.
- Filename mapping: `Foo.tsx` → `Foo.spec.tsx`, module tests use `.module.spec.tsx`.
- Snapshots in `__snapshots__/`, fixtures in `__fixtures__/`, both next to spec files.
- Never colocate tests inside `src/`.

## Code Rules

### General

- **Never break existing functionality.** Prefer additive, safe changes.
- No placeholders, no TODOs left behind (except long-term TODOs with a comment explaining why).
- Output correct, complete, bug-free, secure, and performant code.
- Follow SonarQube and Biome rules. No `any`, no unused vars/imports, no broad lint disables.

### React

- Functional components with hooks only.
- **UI is a thin layer over data** — no business logic or data-fetching in components.
- `useState` only for transient UI state; prefer `useRef` for non-reactive values.
- **Prefer derived data over `useEffect`**. Only use `useEffect` to sync with external systems (DOM events, subscriptions).
- Avoid nested conditionals; extract sub-components when rendering gets complex.
- Keep inline ternaries short and readable.
- Avoid `setTimeout` unless absolutely necessary; always add a comment explaining why.
- Prefer named exports over default exports (better for tree-shaking and testability).
- Stable, minimal keys on lists; memoize only when profiling justifies it.
- Max ~300 lines per file; functions ideally < 50 lines.

### Imports

- **Always use the `@/` path alias** (maps to `src/`) for all imports — never use relative paths like `../../`.
  - Correct: `import { Tooltip } from '@/components/Tooltip';`
  - Wrong: `import { Tooltip } from '../../components/Tooltip';`
- Do not introduce new path aliases; `@/` → `src/` is the only one.
- No deep relative chains in tests; import from `@/modules/...`.
- Cross-feature imports must go through that feature's `index.ts`.

### Styling

- Styles local to components (Tailwind utility classes, `styled.ts`, or CSS Modules).
- No theme/styling leaks via utils.

### Z-Index Layering

The app uses a defined z-index scale. When adding or modifying overlays, modals, or floating elements, follow this hierarchy:

| Layer                    | Z-Index     |
|--------------------------|-------------|
| Ticket detail overlay    | `z-40`      |
| Sidebar / detail panel   | `z-50`      |
| Context menus            | `z-[60]`    |
| Delete confirmation      | `z-[70]`–`z-[80]` |
| Dialog overlays          | `z-[100]`   |
| Dialog content / Toasts  | `z-[101]`   |
| Tooltips                 | `z-[150]`   |
| Fullscreen overlay       | `z-[200]`   |

Tooltips must always render above dialogs. When adding new floating UI, pick a value that fits within this scale rather than inventing arbitrary numbers.

### Comments

- Only add comments for:
  - Potential race conditions (e.g., `setTimeout` with justification).
  - Long-lived TODOs.
  - Non-obvious logic that would stump senior developers.

## Naming Conventions

| Kind        | Convention                | Example              |
|-------------|---------------------------|----------------------|
| Components  | PascalCase `.tsx`         | `UserCard.tsx`       |
| Hooks       | `useXxx.ts`              | `useAuth.ts`         |
| Services    | `*.service.ts` / `*.api.ts` | `ticket.service.ts` |
| Utils       | `verbNoun.ts`            | `formatDate.ts`      |
| Constants   | `constants.ts` or `*.constants.ts` | `api.constants.ts` |
| Types       | `types.ts` or `*.types.ts` | `ticket.types.ts`   |

## Testing

- Use the existing test runner; do not introduce new frameworks.
- Tests must be deterministic and fast; minimal mocking.
- Test public surfaces (functions, components, hooks) — assert behavior/output, not implementation details.
- Module tests stay within a single module boundary; mock other modules via their public API.
- No real network/IO in tests.
- e2e/automation tests go in `test/automation` — never mix with unit tests.

## What NOT To Do

- Do not colocate tests inside `src/`.
- Do not generate or change configs unless explicitly asked.
- Do not break module boundaries to reach into private internals.
- Do not introduce new dependencies without being asked.
- Do not use `npm` or `yarn` — use `pnpm` for package management, `bun run` for scripts.
- Do not add unnecessary comments or documentation files unless requested.
- Do not skip the `pnpm check` step.
