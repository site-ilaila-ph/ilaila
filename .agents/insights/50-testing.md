# Testing

## Runner

- Vitest `4.x` with `jsdom` environment (`vitest.config.mts`).
- Path aliases via `vite-tsconfig-paths` (matches `tsconfig.json`).
- Test discovery: `tests/**/*.{spec,test}.?(m|c)ts?(x)`.

## Where tests live

- Top-level `tests/` directory — **not** co-located with source.
- Existing suites cover: `auth`, `action-server` protocol, `cookie-map`, `foods-service`, `cache-manager`, `defer`, `storage-manager`, `database`, `sample-test`.

## Tools installed

| Package | Use for |
|---|---|
| `@testing-library/dom`, `@testing-library/react` | Component tests (prefer semantic queries). |
| `jsdom` | DOM env for component tests. |
| `@electric-sql/pglite` | In-process Postgres for tests. |
| `embedded-postgres` 18.4.0-beta.17 | Real embedded Postgres when PGlite isn't enough. |
| `adm-zip`, `tar`, `chokidar`, `chokidar-cli` | Fixture/IO helpers. |

## Conventions

- Use `data-testid` for stable locators.
- Mock external dependencies (network, Redis, Vercel Blob) at the module boundary — don't reach into real services.
- For DB-touching tests: rely on the local harness; CI provides `DIRECT_URL` from secrets, but tests should not require a real Postgres if they can use PGlite.

## E2E

- No Playwright/Cypress installed today. If asked to add E2E, propose `@playwright/test` to `devDependencies` + `tests/e2e/` + an `e:playwright` script in `package.json5`, and get human sign-off before installing.