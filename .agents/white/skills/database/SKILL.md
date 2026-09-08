---

name: database

description: Guidance for Prisma 7 schema design, migrations, seeding, query design, runtime database access, and database-related performance work.

---

# Database

Use this skill when working on:

* Prisma 7 schema and data models
* migrations
* database seeding
* Prisma queries
* database runtime configuration
* indexes and constraints
* database-related performance
* schema consistency

## Prisma 7

This repository currently uses Prisma 7.

When Prisma-specific behavior, syntax, CLI commands, configuration, or migration semantics are uncertain, search the official Prisma documentation before acting.

Prefer official Prisma documentation over memory or third-party sources.

Do not assume Prisma APIs or workflows from older Prisma versions.

## Schema

Treat the repository's actual Prisma schema as the source of truth for the data model.

Before modifying a model, inspect the existing definition and consider:

* fields and types
* nullability
* defaults
* uniqueness
* indexes
* relations
* referential actions
* compatibility with existing data

Follow the repository's established Prisma 7 schema conventions.

Do not introduce a second schema representation or change schema authoring style unless explicitly required.

## Migrations

Prefer safe, additive migrations.

Be especially careful with:

* dropping columns or tables
* renaming fields
* changing field types
* making nullable fields required
* changing defaults
* changing uniqueness constraints
* changing relation behavior

For potentially destructive changes, determine the data impact before applying them.

Use Prisma 7's normal migration workflow rather than manually manufacturing migration history.

Do not modify generated migration files merely to hide an incorrect schema change. Fix the schema and regenerate when appropriate.

Never apply destructive migrations to a non-local database without appropriate confirmation.

## Query Design

Prefer queries that:

* avoid N+1 access patterns
* select only required data
* filter at the database layer
* batch related operations where appropriate
* paginate large result sets
* use appropriate indexes

When a new index or constraint is required, express it through the Prisma 7 schema and generate the migration through the normal workflow.

Reuse existing query patterns and database abstractions rather than inventing unnecessary wrappers.

## Runtime

When changing database runtime code, inspect the existing Prisma Client setup, connection configuration, transactions, and environment handling first.

Preserve the repository's established:

* Prisma Client lifecycle
* connection behavior
* transaction semantics
* error handling
* environment-variable conventions
* caching boundaries

Never expose credentials, connection strings, or secret environment values.

## Seeding

When modifying seed logic:

* keep it deterministic where practical
* make reruns safe when expected
* follow existing development/test data conventions
* avoid accidentally targeting production

## Validation

Validate according to the change.

Examples:

* Schema change → generate/update the relevant Prisma artifacts and typecheck.
* Migration change → validate the migration locally before considering remote application.
* Query change → typecheck and run an appropriate focused test.
* Seed change → run the seed workflow against the intended local/test database.

Use commands already defined by the repository rather than inventing script names.

Do not automatically run every database check for every edit.

## Scope

This skill covers database-specific work.

Master remains responsible for integrating the database change into the wider application.

Use other skills for concerns that are primarily:

* frontend/UI
* debugging
* testing
* refactoring
* deployment/CD

Apply this skill only to the database portion of a broader task.

## Goal

Produce Prisma 7 database changes that are:

## **correct, migration-safe, typed, efficient, and consistent with the repository's existing conventions.**
