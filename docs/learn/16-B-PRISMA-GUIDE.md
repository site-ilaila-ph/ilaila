# Prisma v7 (SQLite)

Prisma is the ORM this project uses to talk to a database — you describe your data's shape once, in a schema file, and Prisma generates a fully-typed client for querying it. This guide gets it running with SQLite (a real, file-based database requiring no server or hosting setup) in the same `components-playground` Next.js project from the earlier guides, then focuses almost entirely on **querying** — that's the part you'll actually spend time on day to day. Setup and migrations get just enough coverage to get you unblocked.

Prisma v7 changed several things from older tutorials you might find online — most notably, it now requires a **driver adapter** rather than talking to the database directly, and configuration has moved partly into a separate `prisma.config.ts` file. Everything below reflects v7 specifically; don't be surprised if an older blog post or the model's own general knowledge shows a different, no-longer-current setup shape.

---

## 0. Setup: Prisma + SQLite, Once

```powershell
pnpm add -D prisma
pnpm add @prisma/client @prisma/adapter-better-sqlite3
pnpm exec prisma init --datasource-provider sqlite
```

`prisma init` creates a `prisma/schema.prisma` file and a `.env` file with a `DATABASE_URL`. Adjust `schema.prisma` to match v7's generator requirements:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

Two things worth noting since they're genuinely new in v7: the `output` path is **required** now (older versions generated silently into `node_modules`; v7 generates into a real folder in your source tree instead, treated like normal application code), and the `datasource` block no longer holds a `url` — that's moved to a separate config file, next.

```typescript
// prisma.config.ts, at the project root
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "file:./dev.db",
  },
});
```

`.env` no longer loads automatically in v7 — `import "dotenv/config"` at the top of this file is what actually reads it. `file:./dev.db` is the whole "connection string" a local SQLite setup needs: no host, no port, no credentials — just a path to a file Prisma will create.

Finally, the client itself needs the driver adapter wired in wherever you instantiate it:

```typescript
// src/lib/prisma.ts
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
export const prisma = new PrismaClient({ adapter });
```

Import `prisma` from this one file everywhere you need it, rather than constructing a new `PrismaClient` per file — same "one shared instance" reasoning you'd apply to any expensive-to-create resource. This file only ever runs on the server — it belongs in `lib/`, per the convention from JS Essentials, and should never be imported into a `"use client"` file, for the same reason a database connection has no business existing in the browser at all.

**One SQLite-specific limitation worth knowing now**: SQLite doesn't support native enum columns. If you'd reach for a TypeScript literal union or a Zod `z.enum` for a field like `status`, model the column itself as a plain `String` in `schema.prisma` — the type safety still lives in your TypeScript/Zod layer above it, just not enforced by SQLite itself at the column level.

> **Try it**: run through Section 0 in `components-playground`, confirm `pnpm exec prisma init` and the file edits go through without error. You won't have a working query yet — that needs a migration first, next.

---

## 1. Migrations

A **migration** is a recorded, versioned change to your database's actual structure — Prisma compares your `schema.prisma` against the database's current state and generates the SQL needed to bring the database in line, saving that SQL as a file you can review and that gets applied the same way on every machine and environment.

```powershell
pnpm exec prisma migrate dev --name init
```

This does three things: generates a SQL migration file (`prisma/migrations/<timestamp>_init/migration.sql`), applies it to your local SQLite database (creating `dev.db` if it doesn't exist yet), and regenerates the Prisma Client so its types match the new schema — you don't need a separate `prisma generate` after this specific command.

**Every migration file gets committed to Git** — this is how the whole team, and any deployment, ends up with an identical database structure, the same reasoning as committing a lockfile from the pnpm guide.

To change the schema later — add a field, add a model — edit `schema.prisma`, then run the same command again with a new descriptive name:

```powershell
pnpm exec prisma migrate dev --name add_user_bio
```

If you only change the `generator` block (not any actual data model) and don't need a new migration, `pnpm exec prisma generate` alone regenerates just the client.

> **Try it**: run `prisma migrate dev --name init` with the `User` model from Section 0, confirm `dev.db` and a `prisma/migrations/` folder both appear. Then add a `bio String?` field to `User`, run `migrate dev --name add_bio` again, and look at the new migration file's actual SQL — it's a plain `ALTER TABLE`, worth reading once so it's not a mystery.

---

## 2. The Generated, Typed Client

This is the payoff for the setup above, and the reason Prisma fits so naturally into everything from the TypeScript and Zod guides: **you never hand-write a type for your data.** Every model in `schema.prisma` gets a matching TypeScript type generated automatically, kept in sync with the actual database structure — the exact same "single source of truth" idea as `z.infer` from the Zod guide, just generated from your database schema instead of a validation schema.

```typescript
import { prisma } from "@/lib/prisma";

const users = await prisma.user.findMany();
// `users` is typed as User[] automatically — { id: number; name: string; email: string }[]
```

No `interface User` written anywhere by you. Change `schema.prisma`, run a migration, and every place in your code using `prisma.user` gets the updated type immediately, with the compiler flagging anything now inconsistent — the same "change the schema, everything downstream updates" property Zod gave you, extended to your actual database.

---

## 3. Basic Queries

```typescript
// Read
await prisma.user.findMany();                          // all rows
await prisma.user.findUnique({ where: { id: 1 } });      // one row by a unique field, or null
await prisma.user.findFirst({ where: { name: "Alex" } });  // first row matching, or null (field need not be unique)

// Create
await prisma.user.create({
  data: { name: "Alex", email: "alex@example.com" },
});

// Update
await prisma.user.update({
  where: { id: 1 },
  data: { name: "Alex Updated" },
});

// Delete
await prisma.user.delete({ where: { id: 1 } });

// Count
await prisma.user.count({ where: { name: "Alex" } });
```

`findUnique` requires the field you're querying by to actually be `@unique` or `@id` in the schema (like `id` or `email` above) — for anything else, use `findFirst`. Every one of these returns a `Promise`, so `await` is required, same as any async work from the JS Essentials and TSX guides — and every one of these is exactly the kind of call that belongs inside a Server Action's `serviceFn`, from the Server Actions guide, never called directly from a Client Component.

> **Try it**: with `prisma.user` and a migrated `User` model, `create` two users, `findMany` to confirm both exist, `update` one, then `delete` the other, logging the result of each call. This is the entire CRUD cycle, in five lines.

---

## 4. Filtering with `where`

```typescript
await prisma.user.findMany({
  where: { name: "Alex" },                      // exact match
});

await prisma.user.findMany({
  where: { email: { contains: "@example.com" } },  // substring match
});

await prisma.user.findMany({
  where: { id: { gt: 5, lte: 20 } },               // greater-than, less-than-or-equal
});

await prisma.user.findMany({
  where: { id: { in: [1, 2, 3] } },                  // matches any of these values
});

await prisma.user.findMany({
  where: {
    OR: [{ name: "Alex" }, { name: "Sam" }],
  },
});

await prisma.user.findMany({
  where: {
    AND: [{ name: { contains: "A" } }, { email: { contains: "@example.com" } }],
  },
});
```

A bare field (`{ name: "Alex" }`) means exact equality. Wrapping the field's value in an object (`{ id: { gt: 5 } }`) switches to one of several available operators — `contains`, `startsWith`, `endsWith`, `gt`/`gte`/`lt`/`lte`, `in`, `not`, and more depending on the field's type. `AND`/`OR`/`NOT` combine multiple conditions explicitly when the default (implicit `AND` between top-level fields) isn't what you need.

---

## 5. Shaping the Response: `select` and `include`

By default, a query returns every scalar field on the model. Narrow or expand that explicitly:

```typescript
await prisma.user.findMany({
  select: { id: true, name: true },      // ONLY these fields — email is left out of the result entirely
});
```

```typescript
await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },              // include a RELATED model's rows alongside this one
});
```

`select` narrows which fields of *this* model come back — useful for not fetching (and not accidentally exposing) more than you need, especially anything sensitive. `include` pulls in related models (covered next) that wouldn't be returned by default at all. You can't use `select` and `include` in the same query at the top level — `select` can nest a relation inside it instead, if you need both narrowing and relations together:

```typescript
await prisma.user.findUnique({
  where: { id: 1 },
  select: { id: true, name: true, posts: { select: { title: true } } },
});
```

---

## 6. Ordering and Pagination

```typescript
await prisma.user.findMany({
  orderBy: { name: "asc" },      // or "desc"
});

await prisma.user.findMany({
  take: 10,          // limit
  skip: 20,            // offset — page 3, 10 per page
});
```

`take`/`skip` is straightforward offset-based pagination — fine for smaller datasets, worth knowing it has real performance downsides at large scale (skipping many rows gets slower as the offset grows), though not a concern worth solving before it's an actual problem.

---

## 7. Relations

Given a schema with a relation:

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
```

```typescript
// Create a Post connected to an existing User
await prisma.post.create({
  data: {
    title: "First post",
    author: { connect: { id: 1 } },     // link to an EXISTING user by id
  },
});

// Create a User AND a Post together, in one call
await prisma.user.create({
  data: {
    name: "Alex",
    posts: { create: [{ title: "First post" }] },   // create a NEW related row at the same time
  },
});
```

`connect` links to something that already exists; nested `create` makes a new related row as part of the same write. Both are common — `connect` when the related row already exists (an existing user authoring a new post), nested `create` when it doesn't yet (creating a user and their first post in one action).

> **Try it**: add `Post` to your schema as above, migrate, then create a user with two nested posts in one `create` call, followed by a `findUnique` with `include: { posts: true }` to confirm both posts came back attached to the user.

---

## 8. Bulk Operations and Upsert

```typescript
await prisma.user.createMany({
  data: [{ name: "Alex", email: "alex@example.com" }, { name: "Sam", email: "sam@example.com" }],
});

await prisma.user.updateMany({
  where: { name: "Alex" },
  data: { name: "Alexander" },
});

await prisma.user.deleteMany({
  where: { email: { contains: "@old-domain.com" } },
});

await prisma.user.upsert({
  where: { email: "alex@example.com" },
  update: { name: "Alex Updated" },      // runs if a row with this email already exists
  create: { name: "Alex", email: "alex@example.com" },  // runs if it doesn't
});
```

`upsert` is worth internalizing specifically — "update if it exists, create if it doesn't" is an extremely common real pattern (syncing data from an external source, idempotent setup scripts), and hand-rolling it with a separate `findUnique` + conditional `create`/`update` is both more code and has a real race-condition risk `upsert` avoids.

---

## 9. Transactions

When multiple writes need to succeed or fail **together** — a bank transfer being the classic example, but "create a user and their first post" from Section 7 has the same shape if you want both-or-neither guarantees — wrap them in `$transaction`:

```typescript
await prisma.$transaction([
  prisma.user.update({ where: { id: 1 }, data: { name: "Alex" } }),
  prisma.post.deleteMany({ where: { authorId: 1 } }),
]);
```

If any operation in the array fails, **all of them roll back** — the database ends up as if none of them ran. Without a transaction, a failure partway through a multi-step operation can leave your data in an inconsistent, half-applied state — reach for `$transaction` any time correctness genuinely depends on several writes happening as one atomic unit.

---

## 10. Where This Fits: Server Actions and Zod

Putting the last several guides together, here's the actual shape you'll write repeatedly on this project:

```typescript
// src/app/actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

type CreateUserResult =
  | { success: true; id: number }
  | { success: false; error: string };

export async function createUser(payload: z.infer<typeof CreateUserSchema>): Promise<CreateUserResult> {
  const result = CreateUserSchema.safeParse(payload);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const user = await prisma.user.create({ data: result.data });
  return { success: true, id: user.id };
}
```

Zod validates the shape of what came in; Prisma's generated types make sure what you send to the database matches the actual schema; the discriminated-union result type from the Server Actions guide carries success or failure back to the Client Component that called it. Every piece from the last several guides shows up in this one function.

---

## 11. Prisma Studio — A GUI for Your Data

```powershell
pnpm exec prisma studio
```

Opens a local browser-based table editor for your actual database — genuinely useful for checking whether a query did what you expected without writing a throwaway script to log it. Worth reaching for constantly during development, not a production tool.

---

## 12. Self-Check

1. What's new in Prisma v7's `generator client` block that older tutorials won't show?
2. Where does the database connection URL live in v7, and why does `prisma.config.ts` need `import "dotenv/config"` at its top?
3. Why is a driver adapter (`@prisma/adapter-better-sqlite3`) required now, when older Prisma versions didn't need one?
4. What does `prisma migrate dev --name <description>` actually produce, and why does that output get committed to Git?
5. Why don't you need to hand-write an `interface User` anywhere in this setup?
6. What's the difference between `select` and `include`, and why can't you always use both at once?
7. When would you reach for `connect` versus a nested `create` on a relation?
8. Why does `upsert` avoid a race condition that a manual `findUnique` + `create`/`update` wouldn't?
9. Why does SQLite specifically push enum-like fields back into your TypeScript/Zod layer instead of the database column itself?