---
name: deployment

description: Guidance for GitHub Actions, CI/CD, deployment configuration, release tagging, and environment promotion.

---

# Deployment

Use this skill when working on:

- GitHub Actions workflows
- CI/CD pipelines
- Vercel deployment
- deployment configuration
- release tagging
- environment promotion
- deployment sequencing
- rollback procedures

## GitHub Actions

Before changing a workflow:

- inspect the affected workflow
- inspect scripts and commands referenced by it
- reuse existing commands
- preserve verification and deployment ordering unless the task requires changing them

Prefer minimal workflow changes.

Never expose secrets, tokens, credentials, or secret values.

## Deployment

Before changing deployment behavior, establish:

- target environment
- deployment trigger
- build command
- database migration behavior
- required verification
- rollback mechanism

Do not alter application behavior merely to accommodate deployment unless explicitly required.

## Database Deployment

When deployment involves Prisma:

- distinguish migration generation from migration deployment
- verify which command actually applies migrations
- preserve migration ordering
- avoid adding unintended database-mutating steps

## Releases

When handling release or promotion:

- inspect the repository's existing branch/tag conventions
- do not assume environment mappings
- preserve existing deployment gates
- do not bypass verification without explicit instruction

Never force-push.

Never commit directly on `main`.

## Validation

Validate proportionally to the change.

Examples:

- Workflow change → inspect the workflow and referenced commands.
- Build/deployment change → run the relevant existing build command.
- CI change → run the relevant CI check when practical.
- Migration deployment change → verify migration behavior before execution.

Do not perform a full deployment when a local or targeted validation is sufficient.

## Boundaries

This skill concerns deployment and release infrastructure.

Application implementation remains the responsibility of the master agent unless another skill is specifically relevant.