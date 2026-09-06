# Deploy, CI/CD & Branch Safety

## Hosting target

- Vercel. `vercel.json` pins `buildCommand: pnpm cd:app` and sets `git.deploymentEnabled: false` (pushes do **not** auto-deploy).
- Real production deploys run through the GitHub Actions `cd.yml` workflow, which posts to a Vercel deploy hook (`VERCEL_DEPLOY_HOOK_URL` secret).

## Branch & commit safety (project-wide rule)

- **Never create a commit while on `main`.**
- Always check `git branch --show-current` first; if `main`, switch to a working branch before any tag/push action.
- See `AGENTS.md` for the full rule.

## CI workflow (`.github/workflows/ci.yml`)

- Runs `pnpm run ci` on every push to `main` and every PR into `main`.
- Provides `DIRECT_URL` as a secret env var for DB-touching checks.
- Single job: `ci` on `ubuntu-latest` with Node 22 and pnpm cache.

## CD workflow (`.github/workflows/cd.yml`)

Two jobs in order, both on `ubuntu-latest` with Node 22:

1. **`database-migration`** — runs `pnpm run cd:db` (= install --frozen-lockfile + typegen + `prisma migrate deploy` + `cd:bootstrap`). Uses `DIRECT_URL` secret.
2. **`deploy-app`** — depends on the above succeeding; `curl -X POST "${{ secrets.VERCEL_DEPLOY_HOOK_URL }}"` to trigger the Vercel deploy.

## Secrets

| Secret | Where | Used by |
|---|---|---|
| `DATABASE_URL` | `.env` (local); Vercel project settings (prod) | App runtime. |
| `DIRECT_URL` | GitHub Actions secret | `prisma migrate deploy` in CD. |
| `VERCEL_DEPLOY_HOOK_URL` | GitHub Actions secret | CD `deploy-app` job. |
| Other | Vercel project settings | App runtime. |

Never edit `.env` directly — update `.env.example` and document.

## Pre-deploy verification (must run locally before any tag/push)

1. `pnpm run ci` — full chain green.
2. Reason through `pnpm run cd:db`: confirm migrations are additive and `prisma migrate deploy` is the only DB-mutating step.
3. `pnpm run cd:app` — confirms the build Vercel will run.

## Environments

- Today: production (Vercel) + local only.
- No staging tier. Adding one is a `vercel.json` + `cd.yml` change, not application code.