# Standard Operating Procedure: Project Rules & Onboarding

> **MANDATORY PREREQUISITE:** Guide 00 is required reading for all project members. For all subsequent topics, you MUST complete either the provided internal text guides or their designated YouTube video alternatives prior to reviewing this final document. Full compliance with the rules in this specification is mandatory for all team members.

## Terminology

* **Feature Branch**: A dedicated workspace branch derived directly from `main` that strictly adheres to the naming convention `feature/<feature-group-name>`.

## Version Control Rules

* **Main Branch Protection**: Direct commits to the `main` branch are strictly prohibited.
* **Mandatory Synchronization**: Team members MUST execute `git pull origin main` immediately prior to initiating any new code changes.
* **Isolated Development**: All modifications MUST be developed and committed within an authorized Feature Branch.
* Semantic Commit Messages: All commit messages MUST follow the Conventional Commits / Semantic Commits format: <type>(<scope>): <short summary>.
  * feat: A new feature for the user or application.
  * fix: A bug fix.
  * docs: Documentation-only changes.
  * style: Formatting, missing semi-colons, white-space (no production code logic change).
  * refactor: Refactoring production code (no feature additions or bug fixes).
  * test: Adding missing tests or refactoring existing tests.
  * chore: Updating build tasks, package dependencies, or repo configuration.

Example: feat(auth): add login form validation or fix(api): handle timeout on network request

<!-- Section X defines strict rules to be followed by everyone. The reason why it's a letter is because i dont want to change the section number everytime i add a section before it. -->

## Other Rules

### Project Architecture & Governance

* **Prohibition of Hardcoded Values**: Inlining values susceptible to change (e.g., cross-feature page routes, API endpoints, environment variables) is strictly forbidden. All variable state and dynamic routes MUST be centralized within configuration files inside `src/config`.
* **Restricted Access (`src/lib`)**: Direct modifications or writes to `src/lib` are strictly prohibited without prior explicit permission from the project lead.
* **ESLint Enforcement Policy**: Disabling ESLint across an entire file is strictly prohibited. Targeted suppressions (file or line level) are permitted exclusively when a rule blocks valid execution, and MUST be accompanied by an inline comment detailing the technical rationale for the override.

### Code Reuse & Efficiency Standard

* **Mandatory Dependency Audit**: Team members MUST verify whether an existing project module or installed npm package fulfills the feature requirements before writing custom code. If a compatible, compliant library exists, custom re-implementation is discouraged.

## Onboarding
### Project Structure

```plaintext
root/
├── .vscode/          # VS Code configurations (Do not touch)
├── dev/              # Guides, feature drafts, and non-source documentation
├── prisma/           # Prisma schematics (Models mostly written; do not touch)
├── public/           # Static assets served as-is (Bypasses Next.js build step)
└── src/              # Application source code
    ├── generated/    # Generated source code (Do not touch)
    └── app/          # Next.js App Router directory
        ├── config/    # Global application configuration files
        ├── lib/       # Global application-level libraries and shared utilities
        ├── proxy.ts   # Application proxy routing/handling logic, uses `toMonolithic()` to compose a monolithic middleware.
        └── [feature]/ # Individual feature groups (e.g., authentication/, home/, landing/)
            ├── page.tsx       # Single-page entry point for single-page features
            ├── (pages)/       # Sub-directory for multi-page features
            ├── actions/       # Server actions exports (Utilizes toServerAction)
            ├── lib/           # Feature-local libraries and shared code
            ├── middlewares/   # Middleware factories exported by the feature group
            ├── services/      # Core backend logic implementation
            └── validation/    # Input validation and sanitization
                ├── schemas/   # Zod schematics for basic input shape validation
                └── constraints/ # Advanced validation functions beyond basic schemas
```
### Project Library

`src/lib` is the shared library referenced by the Code Reuse & Efficiency Standard above. Below is a walkthrough of how to actually use each piece.

---

#### 1. UI Components (`src/lib/client/components`)

These are pre-built, styled primitives (base-ui + Tailwind under the hood). Import and use them directly — don't rebuild them.

```tsx
import { Button } from "@/lib/client/components/actions/button"
import { Card } from "@/lib/client/components/display/card"

export function ExampleCard() {
  return (
    <Card>
      <Button variant="secondary" size="sm">
        Click me
      </Button>
    </Card>
  )
}
```

* Components are grouped by purpose: `actions/`, `display/`, `feedback/`, `form/`, `layout/`, `navigation/`, `overlay/`, `design/`.
* Most take a `variant`/`size` prop (via `class-variance-authority`) — check the component file for the available options before adding custom classes.
* ⚠️ Use `actions/button.tsx`, not `client/components/button.tsx` — the latter is a stray duplicate slated for removal.

To merge your own classNames with a component's defaults, always use `cn`:

```tsx
import cn from "@/lib/client/utilities/cn"

<Button className={cn("w-full", isActive && "border-primary")} />
```

---

#### 2. Hooks (`src/lib/client/hooks`)

```tsx
import useIsMobile from "@/lib/client/hooks/use-is-mobile"
import useHasPointer from "@/lib/client/hooks/use-has-pointer"

function Nav() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileNav /> : <DesktopNav />
}
```

`use-server-action` is covered in the Forms section below, since it's meant to be used together with server actions.

---

#### 3. Server Actions (`src/lib/server/actions.ts`)

Don't write raw Next.js server actions by hand — wrap your service function with `toServerAction`. It gives you Zod validation, business-rule constraints, and a typed success/failure result for free.

```ts
// app/features/profile/actions.ts
"use server";

import z from "zod";
import toServerAction from "@/lib/server/actions";
import { updateDisplayName } from "./service"; // your own async function

const schema = z.object({
  userId: z.string(),
  displayName: z.string().min(1).max(50),
});

export const updateDisplayNameAction = toServerAction({
  serviceFn: updateDisplayName,
  schema,
  constraints: [
    async ({ userId }) => {
      // throw a ServerError here to fail with a custom message
    },
  ],
});
```

The returned action always resolves to one of:
* `{ success: true, data }`
* `{ success: false, type: "validation", fieldErrors }`
* `{ success: false, type: "sensitive" | "insensitive", hint?, message? }`

To surface a controlled failure from inside your service function, throw a `ServerError`:

```ts
import { ServerError } from "@/lib/server/errors";

if (usernameTaken) {
  throw new ServerError({
    domain: "profile",
    hint: "username-taken",
    message: "That username is already in use.",
    sensitive: false, // false = message is safe to show the client
  });
}
```

---

#### 4. Calling Server Actions from a Component

**Option A — manual, with `useServerAction`:**

```tsx
"use client";
import useServerAction from "@/lib/client/hooks/use-server-action"
import { updateDisplayNameAction } from "@/app/features/profile/actions"

function RenameButton({ userId }: { userId: string }) {
  const { execute, executionOngoing, result } = useServerAction({
    action: updateDisplayNameAction,
  });

  return (
    <Button
      disabled={executionOngoing}
      onClick={() => execute({ userId, displayName: "New Name" })}
    >
      {executionOngoing ? "Saving..." : "Rename"}
    </Button>
  );
}
```

**Option B — full form, with `ActionForm` + `ActionFormField`:**

```tsx
"use client";
import { ActionForm, ActionFormField } from "@/lib/client/components/form/action"
import { updateDisplayNameAction } from "@/app/features/profile/actions"
import { schema } from "@/app/features/profile/actions" // same schema used above

function RenameForm() {
  return (
    <ActionForm
      action={updateDisplayNameAction}
      schema={schema}
      onSuccess={(data) => console.log("Saved:", data)}
      onFailure={(failure) => console.log("Failed:", failure)}
    >
      <ActionFormField name="displayName" label="Display name" />
      <Button type="submit">Save</Button>
    </ActionForm>
  );
}
```

`ActionForm` wires up `react-hook-form` + Zod validation and auto-populates field errors returned from the server action — no manual error plumbing needed.

---

#### 5. Caching (`src/lib/server/caching`)

Import the pre-configured singleton, don't instantiate a cache yourself:

```ts
import cache from "@/lib/server/caching/cache"

await cache.set("some-key", value, 60 * 5); // expires in 5 min
const value = await cache.get<MyType>("some-key");
await cache.delete("some-key");
```

`cache` automatically resolves to `UpstashRedisCache` in environments where `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are set, and falls back to `InMemoryCache` otherwise (e.g. local dev) — you never need to branch on environment yourself.

---

#### 6. Session (`src/lib/server/session.ts` + `src/lib/client/session.ts`)

**Server-side** (Server Components, Route Handlers, Server Actions):

```tsx
import { getSessionUser } from "@/lib/server/session"

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <div>Hello {user.name}</div>;
}
```

**Client-side** (read the session passed down from a Server Component via context):

```tsx
"use client";
import { useSession } from "@/lib/client/session"

function Greeting() {
  const session = useSession();
  return <p>Hi, {session?.user.name}</p>;
}
```

---

#### 7. Middleware (`src/lib/server/middleware.ts`)

Write each concern as its own small middleware, then flatten them into the one middleware Next.js expects:

```ts
// middleware.ts
import { createMiddleware, toMonolithic } from "@/lib/server/middleware"
import { NextResponse } from "next/server"

const authMiddleware = createMiddleware(
  async (req) => {
    // return a NextResponse to short-circuit, or return undefined to continue
  },
  { paths: ["/dashboard/*path"] },
);

export default toMonolithic(authMiddleware /*, otherMiddleware, ... */);
```

---

#### 8. `server-only.ts`

Import this at the top of any server module that must never end up in a client bundle (it already guards `db.ts`, `session.ts`, and `conventions.ts`):

```ts
import "@/lib/server/server-only";
```

It throws at import time if the module is accidentally pulled into client code — a cheap safety net, add it to new server-only files too.