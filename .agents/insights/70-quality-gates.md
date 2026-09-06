# Quality Gates & Coding Conventions

## The single command for "is it green?"

```
pnpm run ci
```

Which expands to `pnpm install --frozen-lockfile && pnpm typegen && pnpm run ci:typecheck && pnpm run ci:lint && pnpm run ci:test`. This is the contract; [`.github/workflows/ci.yml`](../github/workflows/ci.yml) runs exactly this on every PR.

## Sub-gates and when to run them

| Gate | Command | When |
|---|---|---|
| Typecheck | `pnpm run ci:typecheck` | After any type, route, or schema change. Always before commit. |
| Lint | `pnpm run ci:lint` | After any code change. Always before commit. |
| Test | `pnpm run ci:test` | After any logic change. Always before commit. |
| Build | `pnpm run cd:app` | Before any tag/push, or after dependency changes. |

## ESLint

- Flat config (`eslint.config.ts`) extends `eslint-config-next/core-web-vitals` + `/typescript`.
- Do not relax these rules or add overrides without explicit human sign-off.
- Ignored paths: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`, `node_modules`, `src/generated`, `dev/tmp`, `.pnpm-store`, `.next`, `.husky`.

## TypeScript

- `tsconfig.json` strictness applies. Path aliases propagate to tests via `vite-tsconfig-paths`.
- `next typegen` must run before `tsc --noEmit`, otherwise Next.js route types will be missing.

## Prettier

- `prettier@3.9.6` is installed but not wired to a `format` script. Don't introduce unconfigured formatting tooling; if formatting is needed, add the script in `package.json5` and inform `master`.

## Coding style anchors

- Reuse existing tokens/components/utilities before adding new ones (see [10-stack.md](10-stack.md)).
- Prefer extending existing patterns over introducing new abstractions.
- Make the smallest change that satisfies the request — no opportunistic cleanup (that's `refactor`'s job).
- Keep Server Component boundaries clean — don't add `"use client"` to make unrelated changes easier.