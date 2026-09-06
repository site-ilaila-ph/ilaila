# Stack & Frameworks

## Runtime

- **Framework:** Next.js `16.2.11` (App Router, Server Components by default).
- **UI library:** React `19.2.4` + React DOM `19.2.4`.
- **Compiler:** React Compiler is enabled (`next.config.ts: reactCompiler: true`). Do **not** add manual `useMemo`/`useCallback`/`React.memo` unless profiling proves the compiler isn't doing its job — manual memoization under the React Compiler is a bug source, not a fix.
- **Bundler:** Turbopack for dev (`next dev`). Build is `next build`.

## Styling

- Tailwind CSS v4 via the `@tailwindcss/postcss` PostCSS plugin (`postcss.config.mjs`).
- **No `tailwind.config.*` file** — Tailwind v4 is config-as-CSS. Theme tokens (colors, spacing, radii) are defined with `@theme` in the global stylesheet under `src/app/styles/`.
- Animation utilities: `tw-animate-css`.

## UI primitives (shadcn-style)

Actual packages installed (use these instead of pulling in alternatives):

| Package | Use for |
|---|---|
| `@base-ui/react` | Unstyled accessible primitives |
| `@shadcn/react` | shadcn-style component layer |
| `class-variance-authority` | Variant authoring |
| `clsx`, `tailwind-merge` | Class merging (likely wrapped in a `cn` util under `src/lib/components/`) |
| `cmdk` | Command palette |
| `input-otp` | OTP inputs |
| `react-day-picker` | Date pickers |
| `sonner` | Toasts |
| `embla-carousel-react` | Carousels |
| `lucide-react` | Icons (default) |
| `react-resizable-panels` | Resizable layouts |
| `recharts` `3.8.0` | Charts |

Generated components live under `src/lib/components/`. Reuse these before adding new primitives. Icons default to `lucide-react` unless an existing component imports a different set.

## Forms & validation

- `react-hook-form` + `@hookform/resolvers` + `zod` `^4.4.3` for client-side forms.
- Server actions live in `src/lib/action/` and follow the protocol in `src/lib/common-server-action-protocol.ts`.
- `date-fns` for date math.

## Auth

- `next-auth` `^4.24.14`.
- Config under `src/config/auth.ts`. Auth state drives which route group renders the user: `(session-gated)` vs `(unauthenticated-only)`.

## Caching & storage

- `@upstash/redis` `^1.38.2` — Redis cache.
- `@vercel/blob` `^2.8.0` — Blob storage.

## Misc libraries

- `next-themes` — theme switching.
- `path-to-regexp` — route pattern parsing.
- `zod` — runtime validation across forms and server actions.

## ESLint config

- Flat config in `eslint.config.ts` extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. Do not relax these rules.