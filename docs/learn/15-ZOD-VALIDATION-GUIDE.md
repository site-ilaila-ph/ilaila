# Zod

Back in the TypeScript guide, this was stated plainly and worth repeating now that it actually matters:

> types are completely erased at compile time... TypeScript can never check a type against something happening while the program runs.

That's not a footnote — it's the entire reason this guide exists. A `CreateUserPayload` interface in the Server Actions guide only protects you from *your own code* calling `createUser` wrong. It does nothing for data arriving from outside your program's control — a network request, a form the browser sent you, JSON parsed from anywhere. TypeScript has already stopped existing by the time that data shows up; nothing checks it unless you check it yourself, at runtime. **Zod is that check.**

This project uses Zod heavily — not as an occasional tool, but as the standard way any data entering the system gets verified before it's trusted.

---

## 1. The Problem, Concretely

```typescript
interface CreateUserPayload {
  name: string;
  email: string;
  age: number;
}

function createUser(payload: CreateUserPayload) {
  console.log(payload.age.toFixed(2));   // assumes payload.age is really a number
}

const untrustedData = JSON.parse('{"name": "Alex", "email": "alex@example.com", "age": "thirty"}');
createUser(untrustedData);    // compiles fine — TypeScript has no idea this is actually wrong
```

`JSON.parse` returns `any` — TypeScript has no way to verify that the actual JSON matches `CreateUserPayload`, because that check would require inspecting the *data*, not the *code*, and TypeScript only ever looks at code. This compiles without a single error and crashes at `payload.age.toFixed(2)`, because `age` is really the string `"thirty"`, not a number. The interface was a lie the compiler had no way to catch.

---

## 2. Defining a Schema

```typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
});
```

A Zod **schema** is a real, runtime JavaScript value describing what valid data looks like — unlike a TypeScript `interface`, which is erased entirely and doesn't exist once your code is compiled. `z.object({...})` mirrors the object-shape syntax you already know from `interface`, but it's checking actual values as your program runs, not just code as it compiles.

---

## 3. Parsing: `.parse()` vs. `.safeParse()`

```typescript
UserSchema.parse({ name: "Alex", email: "alex@example.com", age: 30 });
// returns the validated data if it matches

UserSchema.parse({ name: "Alex", email: "not-an-email", age: 30 });
// THROWS a ZodError — invalid email
```

`.parse()` returns the data if it's valid, and throws if it isn't. Fine for cases where invalid data genuinely means something has gone badly wrong and you want to stop immediately. For anything where you expect invalid input sometimes — user-submitted data, most real cases — `.safeParse()` is the better default:

```typescript
const result = UserSchema.safeParse({ name: "Alex", email: "not-an-email", age: 30 });

if (!result.success) {
  console.log(result.error.issues);   // structured list of what's wrong
} else {
  console.log(result.data);            // validated, correctly-typed data
}
```

`.safeParse()` never throws — it returns a result object with `success: true`/`data` or `success: false`/`error`. Recognize this shape immediately: it's exactly the discriminated-union result pattern from the Server Actions guide's error handling section, and it's genuinely the same idea — describe success or failure as data, don't rely purely on exceptions for expected failure cases.

> **Try it**: in a scratch `.ts` file, run both examples above through `.safeParse()`, `console.log(result)` for each, and look at the actual shape of `result.error.issues` when validation fails — you'll be reading this shape constantly.

---

## 4. The Real Payoff: Inferring Types From the Schema

This is the part that makes Zod more than "a validation library" in a TypeScript project — you don't write the type and the validator separately and hope they stay in sync. You write the schema once, and derive the TypeScript type from it:

```typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
});

type User = z.infer<typeof UserSchema>;
// equivalent to: interface User { name: string; email: string; age: number; }
```

`z.infer<typeof UserSchema>` reads the schema and produces the matching TypeScript type — the exact same generics mechanism from the TypeScript guide, applied to extract a type out of a runtime value instead of the more common direction. Change a field in `UserSchema`, and `User` updates automatically, everywhere it's used — no separate interface to remember to update, no risk of the two silently drifting apart. On this project, **the schema is the source of truth**, and any TypeScript type describing the same data should come from `z.infer`, not be hand-written alongside it.

> **Try it**: define `UserSchema` and `type User = z.infer<typeof UserSchema>`, hover over `User` in VS Code, and confirm it shows the exact shape you'd have hand-written as an interface — generated, not typed by you.

---

## 5. Common Validators

```typescript
z.string().min(3).max(50);         // length constraints
z.string().email();                  // must be a valid email format
z.string().url();                      // must be a valid URL
z.string().uuid();                       // must be a valid UUID

z.number().int();                          // must be a whole number
z.number().positive();                       // must be > 0
z.number().min(0).max(120);                    // range

z.string().optional();                            // string | undefined
z.string().nullable();                              // string | null
z.string().default("guest");                          // fills this value in if missing entirely
```

These chain — `z.string().min(3).max(50).email()` reads left to right, each call narrowing what counts as valid, same chaining style you've already seen with array methods and promises.

---

## 6. Arrays and Nested Objects

```typescript
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
});

const UserSchema = z.object({
  name: z.string(),
  addresses: z.array(AddressSchema),     // an array of objects matching AddressSchema
});

type User = z.infer<typeof UserSchema>;
// { name: string; addresses: { street: string; city: string }[] }
```

Schemas compose — a schema can be used as a field inside another schema, exactly like an `interface` can reference another `interface`'s shape. Break complex data into smaller named schemas rather than one enormous nested `z.object()` — same reasoning as breaking a large `interface` into smaller reusable pieces.

---

## 7. Unions and Enums

```typescript
const StatusSchema = z.enum(["loading", "success", "error"]);
// equivalent at the type level to: type Status = "loading" | "success" | "error";

const IdSchema = z.union([z.string(), z.number()]);
// equivalent to: string | number
```

```typescript
const ShapeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("circle"), radius: z.number() }),
  z.object({ kind: z.literal("rectangle"), width: z.number(), height: z.number() }),
]);
```

`z.discriminatedUnion` mirrors the discriminated union pattern from the TypeScript guide directly — a shared literal field (`kind`) determining which shape applies, validated and narrowed the same way, just checked against real data now instead of only against code.

---

## 8. Custom Validation: `.refine()`

Some rules can't be expressed by chaining built-in validators alone — `.refine()` takes your own function:

```typescript
const SignupSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
```

The function passed to `.refine()` returns `true` (valid) or `false` (invalid); `message` is what shows up in the resulting error, and `path` says which field the error should be attached to — useful for showing the error next to the right input rather than as a generic top-level failure.

---

## 9. Zod and Server Actions

This is where the Server Actions guide and this one meet directly. A Server Action receives a typed object — but "typed" only means the *calling code* was checked; it says nothing about data that ultimately traces back outside your program (a request body, something a client sent). Validate at the very top of the action, before trusting anything:

```typescript
// src/app/actions.ts
"use server";

import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive(),
});

type CreateUserPayload = z.infer<typeof CreateUserSchema>;

type CreateUserResult =
  | { success: true; id: number }
  | { success: false; error: string };

export async function createUser(payload: CreateUserPayload): Promise<CreateUserResult> {
  const result = CreateUserSchema.safeParse(payload);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const validated = result.data;   // guaranteed to actually match CreateUserSchema now
  // ... actually create the user using `validated` ...
  return { success: true, id: 1 };
}
```

Notice `CreateUserPayload` is now `z.infer<typeof CreateUserSchema>`, not a hand-written interface — consistent with Section 4. And the action's own result type is still the discriminated union from the Server Actions guide, with `safeParse`'s failure feeding directly into that same shape.

> **Try it**: in your `components-playground` from the Server/Client Components and Server Actions guides, add `CreateUserSchema` to `actions.ts`, wire up `safeParse` as above, and call `createUser` from a button with an invalid age (`age: -5`, or `age: "thirty" as any` to simulate genuinely untyped bad data) — confirm the structured error comes back instead of a crash, and render `result.error` on the page.

---

## 10. Where This Fits Into `toServerAction()`

Briefly, since it's a guide of its own later: the project's `toServerAction()` helper takes a shape roughly like `toServerAction({ serviceFn, schema, constraints })`. `schema` is a Zod (v4) schema, exactly as built in this guide. `constraints` is a separate, more advanced layer on top — business-rule checks that throw server errors, not something a schema alone can express (schemas validate shape and format; constraints validate things like "this email isn't already taken," which requires actually checking against real data). More on `constraints` and `serviceFn` later — the schema piece is now fully familiar.

---

## 11. Self-Check

1. Why can't a TypeScript `interface` alone protect you from bad data coming from `JSON.parse` or a network request?
2. What's the practical difference between `.parse()` and `.safeParse()`, and when would you reach for each?
3. What does `z.infer<typeof SomeSchema>` actually do, and why is it preferred over hand-writing a matching interface separately?
4. What does `z.discriminatedUnion` check that a plain `z.union` wouldn't?
5. What are `message` and `path` for inside `.refine()`?
6. Why does a Server Action need to validate its payload with Zod even though the payload already has a TypeScript type?