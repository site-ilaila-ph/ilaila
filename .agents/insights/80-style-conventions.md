# Style & Conventions

## Naming & structure

- File names: lowercase with hyphens for multi-word routes and components (`food-item-card.tsx`). PascalCase reserved for React component files when the existing convention demands it — match local convention, don't invent.
- Type-only imports: use `import type { ... }` where applicable (TypeScript + ESLint `consistent-type-imports` rule).

## Server vs Client components (recap from 40-routing.md)

- Server Components default; `"use client"` only when needed (state, effects, browser APIs).
- Server actions in `src/lib/action/`. Follow `src/lib/common-server-action-protocol.ts`.

## Styling recap (from 10-stack.md)

- Tailwind v4. Tokens via `@theme` in `src/app/styles/`. **No `tailwind.config.*`.**
- Use `cn` util from `src/lib/components/` for class merging (clsx + tailwind-merge).
- Variants via `class-variance-authority` — extend, don't hand-roll conditional classnames.

## Forms (recap from 10-stack.md)

- `react-hook-form` + `@hookform/resolvers` + `zod`.

## Imports

- Use path aliases (`@/...`) consistent with `tsconfig.json`. Don't mix `@/` and long relative paths in the same file.
- Icons: `lucide-react` by default. Don't pull in another icon set unless the user asks.

## Branch & commit conventions

- Never commit while on `main` (see [60-deploy.md](60-deploy.md)).
- Make atomic commits with anchored replacements; never reformat unrelated code in the same change.

## Quick references for code reviewers

| Concern | Hand off to |
|---|---|
| Styling / layout / a11y / on-page SEO | `frontend` |
| Tests / CI gates | `tester` |
| Dead code / readability cleanup | `refactor` |
| Comment audits / codemaps / external docs | `docs` |
| Build/type errors / silent failures | `debugger` |
| Prisma schema / migrations / seeds | `database` |
| Vercel / env vars / middleware | `vercel` |
| Release tagging / env promotion | `cd` |
| Network design / diagnosis | `network` |
| Perf / bundle / render / query | `optimizer` |
| Swarm design / harness config | `swarm` |
| Anything else | `master` |