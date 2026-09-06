# Routing & App Structure

## Next.js App Router

- All routes live under `src/app/`.
- `next.config.ts` enables `reactCompiler: true`, `turbopack.root: import.meta.dirname`, `cacheComponents: false`.

## Root files

- `src/app/layout.tsx` — root layout.
- `src/app/page.tsx` — root index.
- `src/app/error.tsx` — root error boundary.
- `src/app/favicon.ico` — favicon.

## Route groups

| Group | Purpose | Files |
|---|---|---|
| `(session-gated)` | Authenticated screens. Anything requiring a session. | `src/app/(session-gated)/...` |
| `(unauthenticated-only)` | Logged-out screens (sign-in, marketing, etc.). | `src/app/(unauthenticated-only)/...` |

Place a screen under the correct group for its auth state. Crossing groups is a `master` decision, not a refactor.

## Middleware

- No `src/middleware.ts` exists today. If you need one, **propose it to `master` first** — middleware affects every route and is easy to overreach with.

## Server vs Client components

- Server Components are the default. Add `"use client"` **only** when the component needs:
  - `useState`, `useEffect`, `useReducer`, or other React state/hooks.
  - Browser-only APIs (`window`, `localStorage`, `IntersectionObserver`, etc.).
  - Event handlers that depend on client-side state.
- Server actions in `src/lib/action/` are the default for mutations. Use the protocol in `src/lib/common-server-action-protocol.ts`.

## Path aliases

- Configured via `tsconfig.json` (likely `@/*` → `src/*`); `vite-tsconfig-paths` propagates them into Vitest.
- Use the same aliases in tests and app code.