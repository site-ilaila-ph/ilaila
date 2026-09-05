# Next.js: Caching and Invalidation

Earlier in this series, a direct question got a direct answer: revalidation isn't automatic, you have to trigger it yourself. That's still true — more true, in fact — but the mechanism changed under us. Next.js 16 introduced **Cache Components**, a real shift in the default model, and it's current as of this guide. If you find older tutorials, blog posts, or even earlier explanations in this conversation describing "fetch is cached by default" or a single `revalidate: 60` number — that's the *previous* model. This guide reflects what's actually in the version you're using.

One more thing worth being precise about before any of this: **everything in this guide — `"use cache"`, `cacheLife`, `cacheTag`, `revalidateTag`, `updateTag`, `revalidatePath`** — is Next.js's own, built-in caching system. This project also has its own caching module at `@/lib/server/caching`, which is a **separate thing** — a project-specific layer, not a wrapper around or a rename of what's covered here. Don't assume the two are the same system with different names, and don't assume knowing this guide means you already know what `@/lib/server/caching` does. That's its own guide, later.

---

## 1. The New Default: Everything Is Dynamic Unless You Opt In

Older Next.js versions treated caching as something that happened to you — fetches were cached unless you opted out, and figuring out *why* something was or wasn't cached was a genuine source of confusion.

**Cache Components flips this entirely: nothing is cached by default.** Every Server Component and every function runs fresh, on every request, unless you explicitly mark it cacheable with `"use cache"`. Caching is now something you deliberately opt into, not something that happens invisibly.

```tsx
// No caching here at all — this runs fresh on every single request
export default async function ProductList() {
  const products = await prisma.product.findMany();
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

This is the honest, current answer to "isn't it automatic": **the opposite of automatic is now the default.** You have to explicitly ask for caching before invalidation even becomes a concept that applies to a given piece of data.

---

## 2. Opting In: `"use cache"`

```tsx
// src/lib/products.ts
import { cacheLife, cacheTag } from "next/cache";

export async function getProducts() {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  return prisma.product.findMany();
}
```

`"use cache"` — same directive shape as `"use client"`/`"use server"` from earlier guides, first line of the function (or a file, to apply it to every export) — marks this function's result as cacheable. On its own it's not very useful yet; `cacheLife` and `cacheTag`, both imported from `next/cache`, are what actually configure *how*.

---

## 3. `cacheLife`: How Long Is This Good For?

```tsx
cacheLife("seconds");   // named profiles: seconds, minutes, hours, days, weeks, max
cacheLife("hours");
cacheLife("max");         // effectively "cache indefinitely until explicitly invalidated"
```

Named profiles instead of hand-picking a raw number of seconds at every call site — a deliberate simplification, and it means changing what "hours" means project-wide is a single config change instead of hunting down every hardcoded number. For finer control:

```tsx
cacheLife({
  stale: 3600,       // how long a client can keep showing this without even checking back
  revalidate: 7200,    // how long before the server fetches fresh data in the background
});
```

Pick `cacheLife` based on how tolerant the data is of being slightly stale: something like a product catalog that only changes when someone deliberately edits it is a great fit for `"max"` combined with on-demand invalidation (next section) — cache it essentially forever, and only refresh it the moment it actually changes.

---

## 4. `cacheTag`: Naming What You Cached, So You Can Invalidate It Later

```tsx
cacheTag("products");             // a single tag
cacheTag(`product-${id}`);          // or a specific, per-item tag — more precise
```

A tag is just a string label attached to a cached entry. **Tag by the specific entity, not by a broad content type** — `product-4711` rather than a single blanket `products` tag for everything — so invalidating one changed product doesn't force-refresh every other product's cache along with it. This is the direct connection to Prisma: tag cached reads by the same IDs your database rows already use.

---

## 5. Invalidating: Three Tools, Three Different Jobs

This is the part actually worth internalizing — there are three ways to invalidate, and they're not interchangeable. Each answers a different question about *who* needs to see the change and *how urgently*.

### `revalidateTag(tag, profile)` — someone else's change, brief staleness is fine

```tsx
// Called from anywhere a change might originate — a webhook, an admin action, another Server Action
import { revalidateTag } from "next/cache";

revalidateTag("product-4711", "max");
```

Use this when the change **didn't come from the person currently looking at the page** — a CMS editor publishing an update, a webhook from an external system, a background job. The tagged data is marked stale; the next time *anyone* actually visits a page using that tag, fresh data gets fetched then — not immediately, and not for everyone at once. A brief window of staleness is acceptable here because the person viewing the page isn't the one who made the change and has no way to know the old value was already stale.

### `updateTag(tag)` — the user's own change, they need to see it now

```tsx
"use server";
import { updateTag } from "next/cache";

export async function renameProduct(id: string, name: string) {
  await prisma.product.update({ where: { id }, data: { name } });
  updateTag(`product-${id}`);
}
```

Use this when the person triggering the mutation is the same person who needs to immediately see its result — they just renamed something and are looking at the screen waiting for it to update. `updateTag` **immediately** expires the tag and forces a fresh fetch for the current route right away, rather than waiting for a future visit. **`updateTag` only works inside a Server Action** — call it from a Route Handler and it throws; use `revalidateTag` there instead. This maps directly onto the Server Actions guide's territory: a user-triggered mutation, needing an immediate, visible result.

### `revalidatePath(path)` — you know the route, but never set up tags

```tsx
"use server";
import { revalidatePath } from "next/cache";

revalidatePath("/products");
```

Invalidates everything cached under a specific path rather than a specific tag. Simpler to reach for, but blunter — it can't distinguish "this one product changed" from "something on this page changed," so it tends to over-invalidate compared to a precise tag. **Prefer tag-based invalidation (`revalidateTag`/`updateTag`) when you can** — reach for `revalidatePath` when tags genuinely weren't set up for what changed, not as the default choice.

---

## 6. The Decision, As One Table

| Who caused the change? | Does the viewer need to see it instantly? | Use |
|---|---|---|
| Someone/something else (CMS, webhook, another user) | No — brief staleness is fine | `revalidateTag(tag, profile)` |
| The current user, right now, in a Server Action | Yes — they're watching | `updateTag(tag)` |
| Anyone, but no cache tags exist for this data | Either | `revalidatePath(path)` |

---

## 7. Putting It Together With Prisma and Server Actions

The full, realistic shape — extending the `createUser` action from the Server Actions and Zod guides with actual caching:

```tsx
// src/lib/users.ts
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getUsers() {
  "use cache";
  cacheLife("hours");
  cacheTag("users");
  return prisma.user.findMany();
}
```

```tsx
// src/app/actions.ts
"use server";
import { z } from "zod";
import { updateTag } from "next/cache";
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
  updateTag("users");   // the person who just created this user should see it immediately

  return { success: true, id: user.id };
}
```

`getUsers` reads through the cache, tagged `"users"`. `createUser` writes through Prisma, then calls `updateTag("users")` because the person submitting the form is the one who needs to see their new user show up right away — if this mutation instead came from some external sync job nobody was watching, `revalidateTag("users", "max")` would be the right call instead, not `updateTag`.

---

## 8. Self-Check

1. What's the current (Next.js 16) default — is a Server Component's data cached unless you opt out, or fresh unless you opt in?
2. What do `cacheLife` and `cacheTag` each configure, and why are they separate concerns?
3. Why should you tag by specific entity (`product-4711`) rather than a single broad tag (`products`)?
4. What's the actual deciding question between `revalidateTag` and `updateTag` — not "what changed," but "who needs to see it, and how fast"?
5. Why does `updateTag` throw an error if called from a Route Handler instead of a Server Action?
6. When is `revalidatePath` the right choice, given tag-based invalidation is generally preferred?
7. Is `@/lib/server/caching` the same system as `"use cache"`/`cacheTag`/`revalidateTag`, or something separate?