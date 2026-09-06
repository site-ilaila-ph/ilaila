# Scripts (package.json5)

These are the **only** scripts you should invoke. If something isn't here, it's not defined — propose it to `master` before guessing.

## Type generation

| Script | Command | Purpose |
|---|---|---|
| `pnpm typegen:app` | `next typegen` | Generate Next.js route types. |
| `pnpm typegen:db` | `prisma generate` | Generate Prisma client. |
| `pnpm typegen` | both of the above | Full typegen. |

Run after any change to routes, params, or Prisma Next contract.

## Local development

| Script | Command | Purpose |
|---|---|---|
| `pnpm dev:app` | `next dev` | Next dev server (Turbopack). |
| `pnpm dev:db` | `tsx scripts/prisma-dev.mts` | Local Postgres lifecycle. |
| `pnpm dev:setup` | `pnpm typegen` | One-shot setup before first dev. |
| `pnpm dev` | `concurrently --kill-others-on-fail "dev:app" "dev:db"` | Run app + DB together. |

## CI gates

| Script | Command | Purpose |
|---|---|---|
| `pnpm ci:typecheck` | `pnpm run typegen:app && tsc --noEmit` | TS typecheck. |
| `pnpm ci:lint` | `eslint --cache` | ESLint. |
| `pnpm ci:test` | `vitest run` | Vitest run. |
| `pnpm ci:setup` | `pnpm install --frozen-lockfile && pnpm typegen` | Install + typegen. |
| `pnpm ci:checks` | `ci:typecheck && ci:lint && ci:test` | All three checks. |
| `pnpm ci` | `ci:setup && ci:checks` | Full CI chain (matches `.github/workflows/ci.yml`). |

## CD / production

| Script | Command | Purpose |
|---|---|---|
| `pnpm cd:setup` | `pnpm install --frozen-lockfile && pnpm typegen` | Pre-deploy setup. |
| `pnpm cd:app` | `pnpm run cd:setup && pnpm next build` | Production build (this is what Vercel runs per `vercel.json: buildCommand`). |
| `pnpm cd:bootstrap` | `tsx scripts/bootstrap.mts` | Post-deploy seed/ID hydration. |
| `pnpm cd:db` | `pnpm run cd:setup && pnpm exec prisma migrate deploy && pnpm run cd:bootstrap` | Production DB CD. |

## Prisma Next CLI

- `pnpm prisma contract emit` — regenerate `src/prisma/contract.{d.ts,json}` after editing `src/prisma/contract.ts`.
- `pnpm prisma db init` — create tables.
- `pnpm prisma migration status` — show migration status.

## Auxiliary scripts (`scripts/*.mts`)

- `bootstrap.mts` — post-migrate seed/ID hydration. Invoked by `pnpm cd:bootstrap`.
- `prisma-dev.mts` — local Postgres lifecycle. Invoked by `pnpm dev:db`.
- `seed.mts` — manual seed (not wired to a script by default).