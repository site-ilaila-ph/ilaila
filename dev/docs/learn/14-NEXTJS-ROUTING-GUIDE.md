# Next.js Routing: The Router Is the File System

Back in the Server/Client Components guide, `src/app/page.tsx` rendered at `/` and this was left unexplained on purpose: *"don't worry yet about what makes that specific file/folder structure mean 'this is a page.'"* This guide is that explanation, and it's really one idea, applied consistently:

**In the App Router, there is no separate routing configuration file, no list of paths mapped to components anywhere. The folder structure under `src/app/` *is* the routing table.** A folder becomes a URL segment. A specific filename inside that folder decides what happens at that segment. That's the whole system — everything else in this guide is a consequence of that one fact.

Keep using `components-playground` from the earlier Next.js guides.

---

## 1. Folders Are URL Segments

```
src/app/
├── page.tsx              →  /
├── about/
│   └── page.tsx           →  /about
└── contact/
    └── page.tsx             →  /contact
```

Create `src/app/about/page.tsx`, and `/about` exists as a route — immediately, with nothing registered anywhere else. Delete the folder, and the route is gone. There's no routes array, no `<Route path="/about">` to write, nothing to keep in sync with the file structure, because the file structure **is** the configuration.

> **Try it**: create `src/app/about/page.tsx` with a simple `export default function About() { return <h1>About</h1>; }`, save, and navigate to `/about` in the browser with the dev server running. No import, no registration, nothing — it just exists now because the folder does.

---

## 2. `page.tsx` Is What Actually Creates a Route

A folder alone does **not** create a route — it only creates a URL *segment*. The segment only becomes visitable once it contains a `page.tsx` (or `.js`/`.jsx`) that default-exports a component. This is deliberate: it lets a folder exist purely for organization (nesting, layouts, colocated files) without necessarily being a page itself.

```
src/app/
└── dashboard/
    ├── settings.ts       ←  a helper file, NOT a route — no page.tsx here
    └── team/
        └── page.tsx        →  /dashboard/team exists
                                 /dashboard alone does NOT — no page.tsx directly in dashboard/
```

> **Try it**: create `src/app/dashboard/team/page.tsx` (with no `page.tsx` directly inside `dashboard/`), visit `/dashboard/team` — works. Then visit `/dashboard` alone and see Next.js's 404 — confirming the folder existing isn't enough by itself.

---

## 3. Nesting Is Just Nesting

Every folder inside a folder adds another URL segment, arbitrarily deep — there's no special syntax for "deeper" routes, just more folders:

```
src/app/blog/reviews/2026/page.tsx   →   /blog/reviews/2026
```

---

## 4. `layout.tsx` — Shared UI That Wraps Its Segment

A `layout.tsx` in a folder wraps every `page.tsx` (and every nested route) inside that folder, and — critically — **persists across navigation between its children** instead of re-rendering from scratch each time:

```tsx
// src/app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>Dashboard Nav</nav>
      {children}
    </div>
  );
}
```

`children` here is the matched `page.tsx` (or a nested layout) for whatever the current URL actually is — same `ReactNode`-typed `children` pattern from the TSX and Server/Client Components guides, just filled in by the router instead of by JSX you wrote yourself. Navigate from `/dashboard/team` to `/dashboard/settings`, and `DashboardLayout`'s `<nav>` doesn't re-mount — only `children` swaps.

Every project has exactly one **root layout**, `src/app/layout.tsx` — required, wraps the entire app, and is the only place `<html>` and `<body>` tags belong. `create-next-app` generates this for you already.

Layouts nest the same way pages do — a `layout.tsx` inside `dashboard/team/` would wrap only routes under `/dashboard/team`, nested inside `dashboard/layout.tsx`, nested inside the root layout.

> **Try it**: build `DashboardLayout` above, put a `page.tsx` in both `dashboard/team/` and `dashboard/settings/`, and click between them (once you've built `<Link>` navigation in Section 8) — watch the nav persist while only the inner content changes.

---

## 5. Dynamic Segments: `[param]`

A folder name wrapped in square brackets matches **any** value at that position in the URL:

```
src/app/products/[id]/page.tsx   →   matches /products/1, /products/abc, /products/anything
```

```tsx
// src/app/products/[id]/page.tsx
interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <p>Product ID: {id}</p>;
}
```

Two things worth being precise about, since this is a real, current-version detail: **`params` is a `Promise`, not a plain object** — you must `await` it before reading anything off it, and the component itself has to be `async` to do that (the same `async`/`await` on a Server Component from the Server/Client Components guide). This is a genuinely recent change (Next.js 15+) — older tutorials and the general internet will very often show `params.id` accessed directly with no `await`, which will not work in the version you're using. Trust this guide's shape over an older blog post here specifically.

> **Try it**: build `ProductPage` above, visit `/products/42`, confirm it renders "Product ID: 42". Then deliberately remove the `await` and access `params.id` directly — read the TypeScript error, confirming the compiler catches the exact mistake described above before you'd even run it.

---

## 6. Special Files Within a Segment

Beyond `page.tsx` and `layout.tsx`, a few other filenames are recognized automatically by the router when present in a folder:

```tsx
// loading.tsx — shown automatically while page.tsx's data is still being fetched
export default function Loading() {
  return <p>Loading...</p>;
}
```

```tsx
// error.tsx — catches errors thrown while rendering this segment. MUST be a Client Component.
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

```tsx
// not-found.tsx — shown when notFound() is called, or a route genuinely doesn't match anything
export default function NotFound() {
  return <p>That page doesn't exist.</p>;
}
```

`error.tsx` requiring `"use client"` isn't arbitrary — error boundaries fundamentally rely on a React mechanism (catching errors during render and re-rendering fallback UI) that only exists on the client, tying directly back to the Server/Client Components guide's rules table. None of these three files are required — a segment works fine without them — but when present, Next.js wires them in automatically, again with zero manual registration.

> **Try it**: build `loading.tsx` in a folder whose `page.tsx` does a slow `fetch()` (add an artificial delay, same trick as the `useTransition` guide), reload, and watch the loading state appear automatically with no code of your own managing that transition.

---

## 7. Route Groups: Organizing Without Affecting the URL

A folder name wrapped in **parentheses** — `(marketing)` — creates a folder for organizational purposes only; it does **not** become part of the URL:

```
src/app/(marketing)/about/page.tsx   →   /about   (NOT /marketing/about)
src/app/(marketing)/contact/page.tsx  →  /contact
```

Useful for grouping related routes (and sharing a `layout.tsx` scoped to just that group) without that grouping leaking into the URL structure users actually see.

---

## 8. Linking and Navigation

```tsx
import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href="/about">About</Link>
      <Link href="/products/42">Product 42</Link>
    </nav>
  );
}
```

Use `<Link>`, not a plain `<a>`, for navigation within the app. A plain `<a>` triggers a full page reload — a complete round trip, re-downloading and re-running everything. `<Link>` intercepts the navigation client-side, only fetching and swapping what's actually changed (informed by the layout-persistence behavior from Section 4), which is dramatically faster and preserves things like scroll position and component state where appropriate.

For navigating programmatically (after a form submits, after a Server Action completes) rather than from a rendered link, use the `useRouter` hook — a **Client Component only** hook, for the same reason any interactivity requires `"use client"`:

```tsx
"use client";
import { useRouter } from "next/navigation";

export default function DeleteButton() {
  const router = useRouter();

  async function handleClick() {
    // ... call a Server Action to delete something ...
    router.push("/products");     // navigate after the action completes
  }

  return <button onClick={handleClick}>Delete</button>;
}
```

`usePathname()` (also client-only) gives you the current URL path as a plain string — useful for things like highlighting the active nav link:

```tsx
"use client";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  return <p>Current path: {pathname}</p>;
}
```

> **Try it**: build the `Nav` component with `<Link>`s to two different pages, click between them, and open the Network tab — confirm you don't see a full-document request each time, only smaller data requests. Then swap one `<Link>` for a plain `<a href="...">` and compare — watch the page do a full, visible reload instead.

---

## 9. The Same Idea Applies to APIs: Route Handlers

The file-system-is-the-router principle isn't limited to pages — it applies to backend API endpoints too, through a differently-named file:

```
src/app/api/users/route.ts   →   handles requests to /api/users
```

```typescript
// src/app/api/users/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ created: body }, { status: 201 });
}
```

Each exported function name (`GET`, `POST`, `PUT`, `DELETE`, ...) corresponds to that HTTP method on that URL — same folder-equals-URL-segment idea from Section 1, just resolving to functions instead of a rendered page. You'll use Server Actions (from the Server Actions guide) far more often than hand-written Route Handlers on this project for anything internal — Route Handlers matter more for endpoints meant to be hit by something outside your own app (a webhook, a third-party integration) rather than your own Client Components calling your own server logic.

---

## 10. Self-Check

1. What single fact explains why creating `src/app/about/page.tsx` makes `/about` work with no registration anywhere else?
2. Why doesn't a folder alone create a visitable route — what specific file is required?
3. Why does `DashboardLayout`'s `<nav>` not re-render when navigating between two of its child pages?
4. Why must a dynamic route's `page.tsx` be `async` and `await` its `params`, in the version of Next.js this guide covers?
5. Why does `error.tsx` require `"use client"` specifically, tying back to the Server/Client Components guide?
6. What does wrapping a folder name in parentheses, like `(marketing)`, actually do to the URL?
7. Why does `<Link>` produce a faster navigation than a plain `<a href="...">` inside the app?
8. What determines which function (`GET`, `POST`, etc.) in a `route.ts` file handles a given request?