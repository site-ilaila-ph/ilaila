# Repository Overview

## What this is

- **Project:** `ilaila` — a Next.js 16 + React 19 application backed by Prisma Next (PostgreSQL), Tailwind v4, shadcn-style components, NextAuth, Redis (`@upstash/redis`), and Vercel Blob.
- **Current branch policy:** AGENTS.md forbids committing on `main`. Always check `git branch --show-current` first and create/switch to a working branch before any commit or push.

## Identity

- `name` in `package.json5`: `ilaila`
- `private: true`, `version: 0.1.0`

## Engines

- Node `24.x`
- pnpm `11.22.0` (the only supported package manager; never `npm`, never `yarn`)

## Top-level layout

| Path | Purpose |
|---|---|
| `src/app/` | Next.js App Router pages, layouts, route handlers. Two route groups: `(session-gated)` and `(unauthenticated-only)`. |
| `src/config/` | Auth and team config (`auth.ts`, `team.ts`). |
| `src/lib/` | Server actions (`action/`), client infra, hooks, components, session helpers. |
| `src/prisma/` | Prisma Next data contract (`contract.ts`) and generated artifacts (`contract.d.ts`, `contract.json`, `db.ts`). |
| `prisma/` | Conventional Prisma schema (`schema.prisma`) + applied migrations. |
| `scripts/` | Build/dev/seed helpers (`bootstrap.mts`, `prisma-dev.mts`, `seed.mts`). |
| `tests/` | Vitest test suites (top-level, **not** co-located with source). |
| `docs/` | Project structure and learning docs (`PROJECT_STRUCTURE.md`, `learn/`). |
| `drafts/` | Working drafts. |
| `public/` | Static assets. |
| `.github/workflows/` | CI and CD workflows (`ci.yml`, `cd.yml`). |
| `.devcontainer/` | Dev container config. |
| `.agents/` | Agent definitions + this insights bundle. |
| `.claude/`, `.cursor/`, `.devin/` | Per-tool agent configuration surfaces. |
| `.vscode/` | Workspace settings. |