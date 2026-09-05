# Next.js: Server Actions (Object Payloads)

Continuing directly from the Server/Client Components guide — same `components-playground` app, same "Server Components can do things Client Components can't" theme. This time: how a **Client Component** triggers server-only work on demand, in response to something the user does, instead of just receiving data a Server Component already fetched ahead of time.

One thing worth flagging immediately, before any of this: **you will not be hand-writing Server Actions this way in the actual project.** This project wraps action creation in a function called `toServerAction()`, and that convention gets its own guide later. Everything below is the real underlying mechanism `toServerAction()` sits on top of — worth understanding first, the same way you learned plain `useState` before anything built on top of it. You need to recognize what a raw Server Action is and how it behaves before a wrapper around one will make any sense.

A lot of Server Actions material you'll find online centers on binding an action directly to a `<form action={someAction}>`, where the action receives a `FormData` object. **That's not what this guide covers, and it's not how this project uses actions.** Here, actions are plain functions you call explicitly (from a button's `onClick`, for instance), passed a normal typed object — not tied to form submission at all.

---

## 1. What a Server Action Actually Is

A Server Action is a function, defined with the `"use server"` directive, that always runs **on the server** — even though you call it directly from a Client Component like an ordinary function call. No manually writing an API route, no manually calling `fetch()` yourself to hit it. Next.js handles the network request underneath, transparently.

```tsx
// src/app/actions.ts
"use server";

export async function greet(name: string) {
  return `Hello, ${name}, from the server`;
}
```

`"use server"` as the first line of the file marks every exported function in it as a Server Action. (You can also put `"use server"` as the first line inside one specific function, if you only want that one function to be an action rather than the whole file — useful once a file has a mix of actions and regular helpers.)

```tsx
// src/app/page.tsx
"use client";

import { greet } from "./actions";

export default function Home() {
  async function handleClick() {
    const result = await greet("Alex");
    console.log(result);
  }

  return <button onClick={handleClick}>Say hello</button>;
}
```

> **Try it**: build both files, click the button, and check the console for the greeting. Then open the Network tab, click again, and find the actual request Next.js made to the server behind the scenes — confirm `greet` really did run server-side and wasn't just a normal in-browser function call.

---

## 2. Taking an Object, Not `FormData`

The common tutorial pattern binds an action straight to a form:

```tsx
// NOT what this guide covers
<form action={someAction}>
  <input name="email" />
</form>
```

In that shape, `someAction` receives a `FormData` object and has to pull fields out with `formData.get("email")` — stringly-typed, no compile-time checking of what fields exist.

Instead, every action in this guide (and in this project) is called explicitly, passed a real, typed object directly:

```tsx
// src/app/actions.ts
"use server";

interface CreateUserPayload {
  name: string;
  email: string;
  age: number;
}

export async function createUser(payload: CreateUserPayload) {
  console.log("creating user:", payload);
  return { id: 1, ...payload };
}
```

```tsx
// src/app/page.tsx
"use client";

import { createUser } from "./actions";

export default function Home() {
  async function handleClick() {
    const newUser = await createUser({ name: "Alex", email: "alex@example.com", age: 30 });
    console.log(newUser);
  }

  return <button onClick={handleClick}>Create user</button>;
}
```

`CreateUserPayload` here is the exact same `interface` pattern from the TypeScript and TSX guides — the payload is just a typed object, checked at compile time, no `FormData` string-pulling involved anywhere. This is the shape you'll actually see and use.

> **Try it**: call `createUser` with a field missing (`{ name: "Alex", email: "alex@example.com" }`, no `age`) and read the compiler error before you even save. This is the entire point of a typed object payload over `FormData` — the mistake is caught before the button is ever clicked, not discovered at runtime.

---

## 3. Serialization Applies Here Too

Same rule from the Server/Client Components guide's props section, applied to actions instead: **both the argument you pass in and the value the action returns must be serializable.** Plain strings, numbers, booleans, and plain objects/arrays of those — cross the boundary fine. Functions, class instances, and raw `Date` objects do not survive it cleanly.

```tsx
interface Payload {
  scheduledFor: string;   // an ISO date string — NOT `scheduledFor: Date`
}
```

If you need a date, pass it as an ISO string (`new Date().toISOString()`) and reconstruct a real `Date` on whichever side actually needs one — the same fix used for the `Date`-as-prop problem in the previous guide.

---

## 4. Handling Errors: Return a Result, Don't Just Throw

A Server Action can `throw`, and the client-side `await` will reject like any other rejected Promise — but for anything the user needs to actually see and react to (a validation failure, a duplicate email), the more common and more useful pattern is to **return** a structured result describing success or failure, rather than relying purely on a thrown exception crossing the server/client boundary:

```tsx
// src/app/actions.ts
"use server";

interface CreateUserPayload {
  name: string;
  email: string;
}

type CreateUserResult =
  | { success: true; id: number }
  | { success: false; error: string };

export async function createUser(payload: CreateUserPayload): Promise<CreateUserResult> {
  if (!payload.email.includes("@")) {
    return { success: false, error: "Invalid email" };
  }

  // ... actually create the user ...
  return { success: true, id: 1 };
}
```

```tsx
"use client";

import { useState } from "react";
import { createUser } from "./actions";

export default function Home() {
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const result = await createUser({ name: "Alex", email: "not-an-email" });
    if (!result.success) {
      setError(result.error);
      return;
    }
    console.log("created user with id", result.id);
  }

  return (
    <div>
      <button onClick={handleClick}>Create user</button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

`CreateUserResult` is a **discriminated union**, exactly the pattern from the TypeScript guide — the `success` field lets the calling code (and the compiler) narrow which shape it's dealing with, `id` only accessible when `success` is `true`, `error` only when it's `false`. This pattern — action returns a typed result object instead of throwing for expected failure cases — is worth treating as the default; reserve an actual `throw` for genuinely unexpected failures, not routine validation.

> **Try it**: call `createUser` with a deliberately invalid email, confirm the error message renders on the page instead of crashing anything. Then try accessing `result.id` immediately after the `if (!result.success)` check without the `return` inside it, and read the compiler's narrowing error — same mechanism from the TypeScript guide's Section 8, applied directly here.

---

## 5. Showing Loading State: `useTransition`

An action call is just an `await`ed function — nothing stops you from tracking loading state the plain way, with `useState`:

```tsx
const [loading, setLoading] = useState(false);

async function handleClick() {
  setLoading(true);
  await createUser({ name: "Alex", email: "alex@example.com" });
  setLoading(false);
}
```

That works, but React ships a hook built specifically for this situation: `useTransition`.

```tsx
"use client";

import { useTransition } from "react";
import { createUser } from "./actions";

export default function Home() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await createUser({ name: "Alex", email: "alex@example.com" });
    });
  }

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? "Creating..." : "Create user"}
    </button>
  );
}
```

`useTransition` returns a pending flag (`isPending`) and a `startTransition` function — wrap the action call in `startTransition`, and React tracks the pending state for you, without a manually managed `useState`. It's not required (the plain `useState` version above genuinely works fine), but it's the idiomatic pairing you'll see paired with actions in real Next.js code, and worth recognizing.

> **Try it**: build the `useTransition` version, add a deliberate `await new Promise(resolve => setTimeout(resolve, 1500));` at the top of `createUser` to simulate a slow server, click the button, and watch the label and `disabled` state change automatically while it's pending.

---

## 6. Where Actions Actually Live

You've seen actions in a dedicated `actions.ts` file so far — a common, clean convention: one file, `"use server"` at the top, every export in it is an action, imported by whichever Client Components need to call them. You'll also sometimes see a `"use server"` function defined inline inside a Server Component file, but a separate `actions.ts` keeps the boundary obvious and is what you should default to.

---

## 7. What You'll Actually See in This Project

Everything above is the real mechanism. In the actual project, action files won't look exactly like Section 2's `createUser` — instead of a plain `export async function createUser(...)`, you'll see something built through a helper called `toServerAction()`. It exists to standardize the result-object pattern from Section 4 (success/error shape), validation, and a few other conventions across every action in the codebase, so individual actions don't each reinvent that structure by hand. That's a guide of its own — for now, the important thing is that everything it wraps is exactly what you just learned: a `"use server"` function, a typed object payload, a serializable return value.

---

## 8. Self-Check

1. What's the actual difference between calling a Server Action directly with a typed object versus binding it to `<form action={...}>`?
2. Where does `"use server"` go if you want every export in a file to be an action, versus just one function in a mixed file?
3. Why does a `CreateUserPayload` interface catch a missing field before the action is ever called, while `formData.get("email")` wouldn't?
4. What kinds of values can't safely cross the boundary as an action's argument or return value?
5. Why return a `{ success: false, error: string }` object instead of just `throw`ing for an expected validation failure?
6. What does `useTransition` give you that a plain `useState` boolean for loading doesn't handle automatically?
7. What is `toServerAction()` standing in front of, based on what you now know a raw action looks like?