---

name: vercel

description: Guidance for Vercel deployment configuration, environment variables, runtime selection, and Vercel-specific application hosting behavior.

---

# Vercel

Use this skill for:

* Vercel configuration
* `vercel.json`
* Vercel environment variables
* build/deployment settings
* Vercel runtime configuration
* Edge vs Node.js runtime decisions
* Vercel-specific routing or middleware behavior
* Vercel deployment integration

## Configuration

Before changing Vercel behavior, inspect the repository's existing:

* `vercel.json`
* relevant GitHub Actions workflows
* package scripts
* `next.config.*`
* middleware/proxy configuration where relevant

Follow the repository's existing deployment conventions.

Do not invent build, deployment, or package-manager commands.

## Environment Variables

Treat environment variables as sensitive configuration.

Never expose:

* secret values
* tokens
* API keys
* credentials
* private connection strings

Do not edit local secret files such as `.env` merely to document configuration.

When a variable needs to be introduced or documented for developers, update the repository's example/configuration documentation according to its existing conventions.

Distinguish clearly between:

* build-time variables
* server-only variables
* browser-exposed variables
* Vercel environment-specific configuration

Do not expose a server-only secret to client code.

## Build and Deployment

Verify that the Vercel build configuration matches the repository's actual application and package-manager setup.

Pay attention to:

* build command
* install command
* output configuration
* framework detection
* environment availability
* generated artifacts
* deployment-specific configuration

Do not assume that a Git push automatically deploys. Inspect the repository's actual deployment trigger and Vercel configuration.

## Runtime

Prefer the default Node.js runtime unless there is a concrete requirement for another runtime.

When considering Edge:

* verify that the dependencies support the target runtime
* verify API/runtime compatibility
* consider filesystem, database-driver, Node API, and package restrictions
* do not switch runtimes solely for theoretical performance benefits

A runtime change should be deliberate and validated.

## Next.js Integration

When Vercel behavior depends on Next.js configuration:

* inspect the relevant `next.config.*`
* preserve existing Server/Client boundaries
* verify route/runtime behavior
* avoid changing application logic solely to fit a deployment configuration assumption

Do not add deployment-specific complexity when the existing platform configuration already supports the required behavior.

## Security

Do not:

* weaken authentication to make deployment work
* expose secrets for debugging
* disable security headers or restrictions without a clear reason
* broaden environment-variable exposure unnecessarily
* switch to a less restrictive runtime without justification

Treat deployment configuration as production-sensitive infrastructure.

## Validation

Validate proportionally to the change.

Examples:

* `vercel.json` change → validate the affected configuration and relevant build.
* Environment configuration change → verify references and exposure boundaries without revealing values.
* Runtime change → verify the affected routes/functions build and run under the selected runtime.
* Deployment workflow change → use the deployment skill for CI/CD sequencing and release validation.

Use the repository's existing commands rather than inventing new ones.

Do not claim a deployment or build succeeded unless it was actually validated.

## Scope

This skill covers Vercel-specific concerns.

Use:

* `deployment` for broader CI/CD, release, promotion, and rollback workflow
* `database` for database schema/migration/query work
* `frontend` for ordinary UI work
* `debugging` for diagnosing failures
* `master` for application/business logic

A task can use both the Vercel and deployment skills when it crosses those boundaries.

## Goal

Keep Vercel configuration:

## **correct, secure, minimal, and compatible with the application's actual runtime and deployment workflow.**
