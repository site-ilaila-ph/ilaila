# Database & Data Layer

## Engine

- PostgreSQL `>= 15` (enforced by `@prisma/orm-postgres` 8.0.0-rc.8).
- Local: `pnpm dev:db` (uses `scripts/prisma-dev.mts`).
- Tests: PGlite (`@electric-sql/pglite`) and `embedded-postgres` 18.4.0-beta.17. Use the existing harness; do not spin up a real Postgres in tests.

## Two schema surfaces — keep in sync

| Surface | Authoritative for | Files |
|---|---|---|
| **Prisma Next** | Application queries + generated client | `src/prisma/contract.ts`, `src/prisma/contract.d.ts`, `src/prisma/contract.json`, `src/prisma/db.ts`, `prisma.config.ts` |
| **Conventional Prisma** | Migrations + schema diffs for tooling | `prisma/schema.prisma`, `prisma/migrations/`, `prisma/migrations/migration_lock.toml` |

A change to one surface almost always requires the equivalent change in the other. **Always read both before proposing a change.**

## Connection strings

- `DATABASE_URL` — runtime + local Postgres connection. Loaded from `.env` (template at `.env.example`). Required format: `postgresql://user:password@localhost:5432/mydb` for local.
- `DIRECT_URL` — GitHub Actions secret used by `cd.yml` for `prisma migrate deploy`. **Do not use it for app runtime.**

## Prisma Next workflow

1. Edit `src/prisma/contract.ts` to add/change models.
2. Run `pnpm prisma contract emit` to regenerate `src/prisma/contract.{d.ts,json}`.
3. Run `pnpm typegen:db` (= `prisma generate`) to refresh the client types.
4. Apply via conventional Prisma: edit `prisma/schema.prisma` to mirror, then `prisma migrate dev` (local) or `pnpm run cd:db` (prod).

## Migrations

- Current entry: `prisma/migrations/20260905130220_initial_migration/`.
- `prisma migrate status` shows applied vs pending.
- Destructive changes (drops, renames, type narrowing, default changes) require explicit human sign-off before `prisma migrate deploy` against a non-local DB.

## Cache & Blob

- Redis (`@upstash/redis`) and Vercel Blob are not yours to edit. If a migration invalidates their keys, flag to `master`.