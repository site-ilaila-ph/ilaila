# Insights — Repository Intelligence Bundle

Single source of truth for the ilaila repo. Every agent in `.agents/*.agent.md` should treat these as ground truth and **not** duplicate the facts in their own definitions.

## How to use

1. Read the **shared baseline first** — `copilot-instructions.md` (Prompt Defense + closing conventions) plus this bundle.
2. Skim the relevant section(s) for your role before deciding what to do.
3. Keep your agent file focused on role-specific procedures. If you find yourself re-stating facts that already live here, **delete them from your file** and add a pointer here instead.

## Sections

| File | Topic |
|---|---|
| [00-overview.md](00-overview.md) | What this repo is, engines, top-level layout. |
| [10-stack.md](10-stack.md) | Framework versions, UI primitives, forms, auth, libraries. |
| [20-scripts.md](20-scripts.md) | Every `pnpm` script in `package.json5` and what it does. |
| [30-database.md](30-database.md) | Prisma Next + conventional Prisma, env vars, migrations, cache/Blob. |
| [40-routing.md](40-routing.md) | Next.js App Router structure, route groups, Server/Client rules. |
| [50-testing.md](50-testing.md) | Vitest setup, test locations, tools, E2E. |
| [60-deploy.md](60-deploy.md) | Vercel, GitHub Actions, secrets, branch safety, pre-deploy checks. |
| [70-quality-gates.md](70-quality-gates.md) | CI chain, when to run each gate, ESLint/TS rules. |
| [80-style-conventions.md](80-style-conventions.md) | Naming, imports, Server/Client, styling recap, handoff table. |

## Maintenance

- These files are **authoritative**. If you change `package.json5`, `next.config.ts`, `vercel.json`, `.github/workflows/*`, `prisma/schema.prisma`, `src/prisma/contract.ts`, `eslint.config.ts`, or `vitest.config.mts`, update the matching section here.
- One fact, one place. Don't restate it in three agent files.