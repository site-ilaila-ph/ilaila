# Next.js: Server and Client Components

Next.js is a big framework, and trying to absorb all of it in one sitting is a good way to retain none of it. This guide is deliberately narrow — just Server and Client Components, the single most foundational concept in how Next.js's App Router works, and the thing every other Next.js guide after this one will assume you already have solid. Routing, data fetching patterns, and project structure are their own guides, coming after this one.

---

## 0. A Minimal Next.js App, Just to Have Somewhere to Test This

```powershell
pnpm create next-app@latest components-playground
```

You'll be prompted for several options — for this guide, answer:

- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes** (you won't use it in this guide, default is fine)
- `src/` directory: **Yes**
- App Router: **Yes** — this matters; everything in this guide is specific to the App Router, not the older Pages Router you may see referenced in older tutorials
- Import alias: accept the default

```powershell
cd components-playground
pnpm dev
```

Open the printed URL (normally `http://localhost:3000`). The file you'll edit for this guide is `src/app/page.tsx` — don't worry yet about what makes that specific file/folder structure mean "this is a page." That's the next guide's job. For now, just know: whatever you put inside the default-exported function in that file is what renders at `/`.

---

## 1. The Core Idea: Two Kinds of Components, One New Rule

Everything you built in React Fundamentals and TSX was a **Client Component**, even though nothing told you so — because outside of Next.js, that's the only kind that exists. Next.js's App Router introduces a second kind, and makes it **the default**:

- **Server Component** — renders on the server, before anything reaches the browser. Its code, and critically its JavaScript, never gets sent to the client at all. No `useState`, no `useEffect`, no event handlers, no browser APIs — none of that exists on the server, so none of it is allowed here.
- **Client Component** — exactly what you already know from React Fundamentals and TSX. Renders in the browser, can use state, effects, event handlers, everything.

**Every component in the App Router is a Server Component by default**, unless you explicitly opt out.

```tsx
// src/app/page.tsx — this is a Server Component, with no special syntax needed
export default function Home() {
  return <h1>Hello from the server</h1>;
}
```

> **Try it**: in `page.tsx`, add `const [count, setCount] = useState(0);` above the `return`, without any other changes, and save. Read the actual error Next.js shows you in the browser. This error is the whole point of this guide — you're about to learn exactly why it happens and how to fix it correctly.

---

## 2. Opting Into a Client Component: `"use client"`

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

`"use client"` as the very first line of a file — before any imports — marks everything in that file as a Client Component. It has to be the first line, a plain string, nothing else on that line. This isn't a React feature; it's a Next.js-specific directive the build tooling looks for.

> **Try it**: create `src/app/counter.tsx` with the code above, then import and render `<Counter />` from `page.tsx`. Click the button, confirm it actually increments — you've now fixed the Section 1 error correctly.

---

## 3. Why This Distinction Exists

This isn't complexity for its own sake — it solves two real problems plain React (what you learned in React Fundamentals) can't:

**Bundle size.** In a plain React app, every component's code ships to the browser, whether it needs interactivity or not — a component that just displays some text still costs JavaScript weight. A Server Component's code never ships at all; it runs once on the server, produces HTML, and that's what the browser receives. A page built mostly of Server Components with a few small interactive Client Components sends dramatically less JavaScript than the same page built entirely of Client Components.

**Secrets and direct data access.** A Server Component can safely read environment variables, query a database directly, or call an API with a secret key — none of that code or those credentials ever reach the browser, because the component never runs there. Attempting the same thing in a Client Component would ship your secret key straight into the page source for anyone to read.

```tsx
// Server Component — this is safe, real capabilities, nothing invented
export default async function GitHubUser() {
  const response = await fetch("https://api.github.com/users/vercel");
  const user = await response.json();

  const secret = process.env.SOME_API_KEY;   // reading an env var directly — fine here, never sent to the browser

  return <p>{user.name}</p>;
}
```

One thing worth being explicit about: **there is no built-in `db` object in Next.js.** A plain `create-next-app` project has no database connection of any kind out of the box — `fetch()` and `process.env` above are real, actually-available capabilities; a call like `db.query(...)` is not something Next.js provides, and you'd only see it in a project that has deliberately set up a database client itself (an ORM, a driver, some connection helper — almost always something living in `lib/`, per the convention from JS Essentials). Don't assume `db` exists just because a component is a Server Component — being a Server Component means direct data access is *possible* and *safe*, not that any particular data source is already wired up for you.

Notice `async` directly on the component function — Server Components are allowed to be `async` and `await` data directly in the component body, something a plain React component (and Client Components) can never do. This is a real, new capability, not something you saw in React Fundamentals.

---

## 4. The Rules, Concretely

| | Server Component | Client Component |
|---|---|---|
| `useState`, `useEffect`, other hooks | Not allowed | Allowed |
| Event handlers (`onClick`, etc.) | Not allowed | Allowed |
| `async`/`await` directly in the component | Allowed | Not allowed |
| Direct database/filesystem access | Allowed | Not allowed |
| Access to secret environment variables | Allowed | Not allowed |
| Browser-only APIs (`window`, `localStorage`) | Not allowed | Allowed |
| Ships JavaScript to the browser | No | Yes |

Read a build error carefully when it mentions hooks, event handlers, or browser APIs inside a component that has no `"use client"` — that's almost always this exact table being violated, not a deeper bug.

> **Try it**: in a fresh Server Component (no `"use client"`), try adding `<button onClick={() => console.log("hi")}>Click</button>` directly — no state, just an inline handler. Read the error. Event handlers require `"use client"` even without any state involved, since handlers are inherently a browser-only concept.

---

## 5. Composing Server and Client Components Together

The real pattern, almost always: **Server Components by default, Client Components only for the small interactive pieces that genuinely need them.** You don't mark a whole page `"use client"` just because one button on it needs an `onClick`.

```tsx
// src/app/page.tsx — Server Component (no directive)
import Counter from "./counter";

export default async function Home() {
  const response = await fetch("https://api.github.com/users/vercel");
  const user = await response.json();   // real fetch, server-only work, fine here

  return (
    <div>
      <h1>Hello, {user.name}</h1>
      <Counter />                        {/* a Client Component, imported and rendered from a Server Component */}
    </div>
  );
}
```

A Server Component can import and render a Client Component directly — this is the normal, expected shape. What you **cannot** do is the reverse: a Client Component cannot `import` a Server Component the same way, because by the time a Client Component's code exists, it's already running in the browser, where Server-Component-only capabilities (direct DB access, secrets) simply don't exist.

### The `children` escape hatch

Sometimes you want a Server Component nested *inside* a Client Component's markup (say, a Client Component that just provides some interactive wrapper — a collapsible panel — around otherwise-server-rendered content). Direct importing won't work for the reason above, but passing it as `children` does:

```tsx
// collapsible.tsx
"use client";
import { useState, type ReactNode } from "react";

export default function Collapsible({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {open && children}
    </div>
  );
}
```

```tsx
// page.tsx — Server Component
import Collapsible from "./collapsible";

export default async function Home() {
  const response = await fetch("https://api.github.com/users/vercel");
  const user = await response.json();
  return (
    <Collapsible>
      <p>{user.bio}</p>   {/* this content is still server-rendered, even though it's nested inside a Client Component */}
    </Collapsible>
  );
}
```

The `children` prop here is typed `ReactNode` — same type from the TSX guide — and whatever gets passed as `children` from the Server Component parent is still rendered on the server; only `Collapsible` itself (the toggle button, the open/closed state) actually runs in the browser. This pattern — a small Client Component "shell" wrapping server-rendered `children` — is worth recognizing as the standard way to keep interactivity minimal and localized.

> **Try it**: build both files above, render it, and confirm clicking Toggle shows/hides the server-rendered paragraph.

---

## 6. Passing Props Across the Boundary: Serialization

A Server Component can pass props to a Client Component — you saw this shape already — but there's a real constraint: **those props must be serializable.** Concretely, this means plain data (strings, numbers, booleans, plain objects/arrays of those) — not functions, not classes, not `Date` objects passed raw, not anything that can't survive being turned into JSON and sent across the server/client boundary.

```tsx
// Server Component
export default async function Home() {
  const user = await getUser();

  return <UserCard user={user} onEdit={() => console.log("edit")} />;
  //                                ^ ERROR — a function isn't serializable, can't cross this boundary
}
```

Functions defined in a Server Component can't be handed to a Client Component as props, because a function is code meant to run somewhere — and a Server Component's code doesn't exist in the browser to run it there. If a Client Component needs a click handler, define that handler *inside* the Client Component itself, not passed in from a Server Component parent.

> **Try it**: try passing an inline arrow function as a prop from a Server Component to a Client Component, and read the actual error message Next.js produces — it names the problem directly.

---

## 7. A Series of Things to Actually Break and Fix

Everything above is easier to keep straight once you've caused each failure yourself, in the same `components-playground` from Section 0, rather than just read about it. Do these in order, in the running app:

1. **Prove the JS actually isn't sent.** With `Counter` (Section 2) rendered on the page, open browser dev tools → Network tab, reload, and search the loaded JS files for the literal text `Hello from the server` (or whatever static text you have in a Server Component). It won't be there — only `Counter`'s code and markup ship as JavaScript; the Server Component's output arrives as plain HTML.
2. **Move state to the wrong place, on purpose.** Remove `"use client"` from `counter.tsx` entirely, keep everything else the same, save, and read the error. Then add `"use client"` back only to `page.tsx` instead (leaving `counter.tsx` as-is) and see that this doesn't fix it either — the directive has to be on the specific file that actually uses the hook.
3. **Fetch two different things.** Add a second `fetch()` call to a different GitHub user in `page.tsx`, render both names. Confirm both load fine — multiple `await` calls in one Server Component is completely normal.
4. **Force a serialization error on purpose, then fix it correctly.** Try passing a `Date` object as a prop from `page.tsx` to `Counter` (`<Counter startedAt={new Date()} />`) and see what actually happens versus passing a plain string (`startedAt={new Date().toISOString()}`) instead — notice the second one works fine, since a string is serializable and a raw `Date` object is not guaranteed to survive the boundary cleanly.
5. **Add a second Client Component and nest it.** Create a `Toggle` client component similar to `Collapsible` from Section 5, and render `<Counter />` as its `children` — a Client Component containing another Client Component, no Server Component involved this time. Confirm it works, and notice this is a completely different situation from the `children`-from-a-Server-Component pattern in Section 5, even though the code looks similar.

None of these are meant to be "correct" on the first try — the point is seeing the actual error Next.js gives you for each, since that's what you'll be reading for real once you're working in the actual project.

---

## 8. Self-Check

1. What's the default component type in the App Router if you write no directive at all?
2. What does `"use client"` actually do, and where in a file does it have to go?
3. Name the two real problems the Server/Client split solves that plain React (from React Fundamentals) can't.
4. Why is a Server Component allowed to be `async` and `await` data directly, while a Client Component isn't?
5. Why can a Server Component import a Client Component, but not the other way around?
6. What does the `children`-as-`ReactNode` pattern let you do that a direct import wouldn't?
7. Why can't a Server Component pass a function as a prop to a Client Component?

Routing and project structure — what actually makes a file become a page, layouts, and how folders map to URLs — is next.