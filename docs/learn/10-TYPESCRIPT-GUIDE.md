# TypeScript

Back in JS Essentials, this came up and got deferred:

> nothing checks types for you before the code runs. This exact problem is why modern JavaScript projects almost always use TypeScript instead of plain JavaScript.

This is that guide. TypeScript is not a different language you write instead of JavaScript — it's JavaScript with a type system layered on top. Every valid JavaScript file is (almost) valid TypeScript already. What TypeScript adds is a compiler that checks your types **before** anything runs, and disappears entirely by the time your code actually executes.

---

## 0. Checking TypeScript, For Now

TypeScript files use the `.ts` extension. Unlike plain JS, you can't just `node app.ts` — Node doesn't understand type annotations natively. For now, use the TypeScript compiler directly to check your code:

```powershell
npx tsc --noEmit app.ts
```

(`npx` here rather than `pnpm dlx` deliberately — you're checking a standalone file outside any real project with a `package.json`, so there's no pnpm-managed project for `dlx` to run inside yet. Once you're working inside the actual project, later, checking types goes through a `package.json` script instead, run the normal `pnpm` way.)

`npx` runs a package without permanently installing it (same shape of tool as `pnpm dlx` from the pnpm guide, just npm's version of the idea). `tsc` is the TypeScript compiler. `--noEmit` means "just check the types and report errors, don't produce an output file" — exactly what you want while learning, since you're checking correctness, not running anything yet.

In practice, you'll rarely run `tsc` by hand like this — **VS Code has the TypeScript language server built in**, so type errors show up as red squiggles directly in the editor as you type, before you'd even think to run a command. Treat the command above as a way to double-check or to see the actual compiler error message in full when a squiggle isn't clear enough on its own.

If you want to actually run a `.ts` file end to end:

```powershell
npx tsc app.ts        # compiles app.ts → app.js
node app.js             # runs the plain JS output
```

This two-step process is exactly what's happening invisibly once you're inside a real project setup (Next.js) — a build step strips and checks the types, then plain JavaScript is what actually runs. Nothing about types survives into execution; more on that below.

---

## 1. The Core Idea: Types Are Checked, Then Erased

```typescript
let age: number = 30;
age = "thirty";   // Compile error: Type 'string' is not assignable to type 'number'.
```

`: number` is a **type annotation** — a claim about what this variable is allowed to hold, checked by the compiler. Try to violate it, and `tsc` refuses to compile, catching the mistake before you ever run the code — this is the entire value proposition, and it directly targets the exact class of bug the dynamic-typing section of JS Essentials called out as unguarded.

Critically: **types are completely erased at compile time.** The compiled JavaScript output for the line above is just `let age = 30;` — no type information exists at runtime at all. TypeScript can never check a type against something happening while the program runs (like the actual shape of data coming back from a network request) — only against what you've told it *should* be true, statically, before execution. Keep that boundary in mind; it explains a lot of TypeScript's real limitations later.

---

## 2. Basic Types

```typescript
let isActive: boolean = true;
let count: number = 42;              // no int/float distinction, same as plain JS
let name: string = "Alex";
let tags: string[] = ["a", "b"];      // array of strings
let tags2: Array<string> = ["a", "b"];  // identical meaning, generic syntax — you'll see both
let pair: [string, number] = ["age", 30];  // tuple: fixed length, fixed types per position
```

### `any` — and why to avoid it

```typescript
let value: any = 5;
value = "now a string";     // no error — `any` opts this variable OUT of type checking entirely
value.someMethodThatDoesntExist();   // also no error, until it crashes at runtime
```

`any` turns off type checking for that value completely — it's an escape hatch, not a type. Reaching for `any` because you don't know the type yet, or because fixing a real error is inconvenient, defeats the entire purpose of using TypeScript in the first place. Avoid it; treat every `any` in a codebase as a debt, not a neutral choice.

### `unknown` — the type-safe alternative to `any`

```typescript
let value: unknown = 5;
value.toFixed();              // Compile error — you must narrow the type before using it
if (typeof value === "number") {
  value.toFixed();             // fine now — TypeScript knows it's a number here
}
```

`unknown` also accepts anything, but — unlike `any` — refuses to let you *use* it until you've proven what it actually is (via a check like `typeof`, covered in Section 8). This is the correct type for "I genuinely don't know this yet" — `any` is not.

---

## 3. Annotations vs. Inference

You don't need to annotate everything — TypeScript infers types automatically wherever it reasonably can:

```typescript
let age = 30;              // inferred as number, no annotation needed
let name = "Alex";          // inferred as string

function double(n: number) {   // parameters DO need annotation — TypeScript can't infer these from nothing
  return n * 2;                 // return type inferred as number, from what's returned
}
```

**Function parameters always need explicit types** — there's nothing for TypeScript to infer them from. Return types are usually fine to leave inferred, though annotating them explicitly on anything non-trivial is a reasonable habit, since it catches you accidentally returning the wrong thing:

```typescript
function double(n: number): number {
  return n * 2;
}
```

General rule: annotate what TypeScript can't figure out on its own (parameters, empty array/object literals with ambiguous types), let it infer everything else. Annotating every single variable, even obvious ones, adds noise without adding safety.

---

## 4. Shaping Objects: `interface` and `type`

Two ways to describe the shape of an object — you'll see both in real code, and mostly they're interchangeable for this purpose:

```typescript
interface User {
  name: string;
  age: number;
  email?: string;        // `?` = optional property
  readonly id: number;    // readonly = can be read but never reassigned after creation
}

type User2 = {
  name: string;
  age: number;
  email?: string;
  readonly id: number;
};
```

```typescript
function greet(user: User) {
  return `Hello, ${user.name}`;
}

const alex: User = { name: "Alex", age: 30, id: 1 };
greet(alex);
```

TypeScript's object typing is **structural**, not nominal — this is a real and sometimes surprising difference from C#'s type system. A value satisfies `User` if it *has the right shape*, regardless of whether it was ever declared as a `User` anywhere:

```typescript
const notDeclaredAsUser = { name: "Sam", age: 25, id: 2 };
greet(notDeclaredAsUser);   // fine — it happens to match User's shape, that's all that matters
```

C# requires an object to explicitly implement or inherit a type. TypeScript only cares about the shape actually matching — this is called **structural typing**, and it's worth naming explicitly since it's a genuinely different mental model, not just different syntax.

### `interface` vs `type` — the practical difference

`interface` can be **extended** and, if declared twice with the same name, its declarations merge automatically:

```typescript
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}
```

`type` can express things `interface` can't — unions, intersections, and other non-object shapes (covered next). Reasonable default: use `interface` for the shape of an object (especially anything that might get extended later), use `type` for everything else — unions, function types, anything not a plain object shape. Don't agonize over the choice for a simple case; both work.

(One reminder from JS Essentials: interfaces and type aliases describe **data shapes**, not classes. Classes on this project only live in `lib/`, per convention — describing an object's shape with `interface`/`type` is not the same thing as writing a `class`, and is exactly what you'll be doing constantly.)

---

## 5. Union and Intersection Types

### Union — "this OR that"

```typescript
let id: string | number;
id = "abc123";    // fine
id = 42;            // also fine
id = true;           // Compile error — not part of the union

function printId(id: string | number) {
  console.log(id);
}
```

### Literal types — a union of specific values, not just a type

```typescript
type Status = "loading" | "success" | "error";

function setStatus(status: Status) {
  // ...
}

setStatus("loading");    // fine
setStatus("done");        // Compile error — "done" isn't one of the allowed literal values
```

This pattern — a union of string literals — is extremely common in real code as a lightweight, type-checked alternative to defining a whole separate enum for a small fixed set of states.

### Intersection — "this AND that"

```typescript
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;    // must have BOTH name and age

const person: Person = { name: "Alex", age: 30 };
```

`|` picks one of several possible shapes; `&` combines multiple shapes into one that must satisfy all of them.

---

## 6. Typing Functions

```typescript
function add(a: number, b: number): number {
  return a + b;
}

const add2 = (a: number, b: number): number => a + b;

const add3: (a: number, b: number) => number = (a, b) => a + b;   // annotating a variable AS a function type
```

That last form — a standalone function type, `(a: number, b: number) => number` — comes up constantly once you're passing functions around as values (callbacks, event handlers), same as it did untyped with `onClick={handleClick}` in the JSX guide, just now with the shape spelled out.

### Optional and default parameters

```typescript
function greet(name: string, greeting?: string): string {   // `?` = optional, may be undefined
  return `${greeting ?? "Hello"}, ${name}`;
}

function greet2(name: string, greeting: string = "Hello"): string {   // default value, same JS default-param syntax from before
  return `${greeting}, ${name}`;
}
```

`??` (nullish coalescing) returns its right side only when the left side is `null` or `undefined` — worth knowing alongside this, since it pairs constantly with optional parameters and optional properties.

---

## 7. Generics

Generics let a function, interface, or type work with a range of types while still preserving the specific type used at each call site — instead of giving up and using `any`.

```typescript
function firstElement<T>(arr: T[]): T {
  return arr[0];
}

firstElement<number>([1, 2, 3]);        // T is inferred/explicit as number, return type is number
firstElement(["a", "b", "c"]);            // T inferred as string, no annotation needed here — TS figures it out from the argument
```

Without a generic, you'd either write this once per type (`firstElementOfNumbers`, `firstElementOfStrings`, ...) or type the parameter as `any[]` and lose all type safety on the return value. `<T>` is a **placeholder for a type**, filled in per call — same relationship to types that a regular function parameter has to values.

```typescript
interface Box<T> {
  contents: T;
}

const numberBox: Box<number> = { contents: 42 };
const stringBox: Box<string> = { contents: "hello" };
```

### Constraints

```typescript
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello");        // fine — strings have .length
getLength([1, 2, 3]);       // fine — arrays have .length
getLength(42);                // Compile error — numbers don't have .length
```

`extends` here constrains what `T` is allowed to be — "any type, as long as it has a `.length` property" — not the same `extends` as class inheritance, just reused syntax.

---

## 8. Narrowing

TypeScript can track, within a block of code, that a value is more specific than its declared type — this is called **narrowing**, and it's how union types become usable without constant manual casting.

```typescript
function printId(id: string | number) {
  if (typeof id === "string") {
    console.log(id.toUpperCase());    // TypeScript knows id is a string HERE
  } else {
    console.log(id.toFixed(2));        // and knows it's a number HERE
  }
}
```

`typeof` checks, `instanceof` checks, and even a plain truthy check (`if (value)`) all narrow types within the branch where the check held. This is the standard way to safely use a value typed `unknown` from Section 2, or any union type — check first, use after, and let the compiler track which possibility you're in.

### Discriminated unions

A common, deliberate pattern: give every variant in a union a shared literal-typed field (often called `type` or `kind`), then `switch` on it:

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;     // TypeScript knows this variant has `radius`
    case "rectangle":
      return shape.width * shape.height;       // and this one has `width`/`height`
  }
}
```

Same `switch` you already know from C#, but the compiler uses the `kind` field to narrow exactly which fields are available in each `case` — a very common and genuinely useful pattern once your data has several distinct "flavors."

---

## 9. Enums — and Why This Project Prefers Literal Unions

TypeScript has real `enum` syntax:

```typescript
enum Status {
  Loading,
  Success,
  Error,
}

let s: Status = Status.Loading;
```

You'll see this in some codebases and should be able to read it. In practice, many modern TypeScript projects — including the convention here — prefer the string literal union pattern from Section 5 (`type Status = "loading" | "success" | "error"`) instead: it compiles to nothing extra at runtime (enums generate real JavaScript objects behind the scenes), and the values are plain, readable strings rather than an indirect enum reference. Recognize `enum` when you read it; default to literal unions when you write something new here.

---

## 10. A Few Utility Types Worth Knowing

TypeScript ships built-in types that transform other types — you'll see these constantly in real code:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;         // every field becomes optional — { id?: number; name?: string; email?: string }
type UserPreview = Pick<User, "id" | "name">;    // only the listed fields — { id: number; name: string }
type UserWithoutEmail = Omit<User, "email">;      // every field EXCEPT the listed ones
type UsersById = Record<number, User>;              // an object type: keys are numbers, values are User
```

`Partial` is especially common for update functions ("here's an object with *some* of a User's fields, patch just those"). `Pick`/`Omit` are for deriving a narrower shape from an existing one without redefining it by hand — worth reaching for instead of writing a near-duplicate interface.

---

## 11. `tsconfig.json`, Briefly

A TypeScript project has a `tsconfig.json` at its root controlling compiler behavior — target JS version, module system (ties back to CommonJS vs. ES Modules from the Node.js guide), and, most importantly, **strictness**. Same category of file as `.npmrc` from the pnpm guide or `.vscode/settings.json` from the VS Code guide: project-level config, checked into the repo, not something you're expected to hand-write from scratch:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

`"strict": true` turns on a whole bundle of stricter checks at once (no implicit `any`, stricter null checks, and more) — this is the setting that makes TypeScript actually catch the bugs it's good at catching. Every serious project should have it on; Next.js's default project setup already does, so this is largely something to recognize in a config file rather than something you'll configure by hand.

---

## 12. Self-Check

1. What happens to type annotations by the time your code actually runs?
2. Why is `any` a real problem to reach for, and what's the type-safe alternative when you genuinely don't know a value's type yet?
3. What does it mean that TypeScript's object typing is "structural" rather than "nominal," and how is that different from C#?
4. When does a function parameter need an explicit type annotation, versus when can you rely on inference?
5. What's the practical difference between `string | number` (union) and `Named & Aged` (intersection)?
6. Why does `getLength<T extends { length: number }>` reject a plain `number` argument?
7. In a discriminated union, what does the shared `kind`/`type` field actually let the compiler do inside a `switch`?
8. Why does this project prefer string literal unions over `enum` for a fixed set of states?

TSX — JSX with this exact type system layered on top of components and props — is next.