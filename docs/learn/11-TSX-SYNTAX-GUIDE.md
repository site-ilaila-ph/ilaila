# TSX

This is where the JSX guide, React Fundamentals, and the TypeScript guide meet. Nothing here is a new concept on its own — it's the specific vocabulary for applying TypeScript's type system (interfaces, generics, unions) to React's component model (props, state, events). `.tsx` files, real playground, same "try it and watch it break" approach as the JSX guide.

---

## 0. A TypeScript-Flavored Playground

Same tool as the JSX guide, different variant:

```powershell
pnpm create vite@latest tsx-playground
```

Choose **React**, then choose **TypeScript** (not "TypeScript + SWC" — either works, but plain TypeScript is fine and keeps things simple). Then:

```powershell
cd tsx-playground
pnpm install
pnpm dev
```

Everything you edit now lives in `src/App.tsx` — same workflow as before (edit, save, check the browser), just with the compiler now checking your JSX too.

---

## 1. Why `.tsx`, Not `.ts`

A plain `.ts` file's compiler doesn't expect JSX syntax at all — `<div>` inside a `.ts` file is ambiguous with TypeScript's own generic syntax (`<T>`), and the compiler can't tell them apart. `.tsx` tells the compiler "this file contains JSX," resolving that ambiguity. The rule is simple: any file with JSX markup in it is `.tsx`; anything without JSX — a utility function, a type definitions file — stays `.ts`.

> **Try it**: rename `App.tsx` to `App.ts` (keep the JSX inside) and save. Watch the compiler produce a wall of confusing errors about `<` and generics. Rename it back to `.tsx` and confirm they vanish instantly.

---

## 2. Typing Props

From the JSX guide, plain: `function Welcome({ name }) { ... }`. Now, typed:

```tsx
interface WelcomeProps {
  name: string;
}

function Welcome({ name }: WelcomeProps) {
  return <h1>Hello, {name}!</h1>;
}
```

`interface WelcomeProps` — same `interface` from the TypeScript guide, describing the shape of whatever gets passed to this component. `{ name }: WelcomeProps` is destructuring (from JS Essentials) with a type annotation attached to the whole destructured parameter, not to `name` individually — you can't write `{ name: string }` directly in the parameter list, since `:` there would collide with destructuring's own renaming syntax.

Using it wrong is now a compile-time error instead of a silent runtime `undefined`:

```tsx
<Welcome name="Alex" />     // fine
<Welcome age={30} />         // Compile error — `age` isn't a WelcomeProps field, and `name` is missing
```

> **Try it**: build `Welcome` with typed props, then deliberately call `<Welcome age={30} />` and read the actual compiler error VS Code shows you. This is the exact class of bug — passing the wrong prop, or forgetting one — that plain JSX would only catch by manually testing.

---

## 3. Typing `children`

```tsx
import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}
```

`ReactNode` is the type covering everything React is willing to render — JSX elements, strings, numbers, arrays of those, `null`. It's deliberately broad, because `children` genuinely can be almost anything renderable. Import it with `type ReactNode` (or `import type { ReactNode } from "react"`) — the `type` keyword on the import tells the compiler this is a type-only import, erased completely at compile time, never a real runtime import.

> **Try it**: build `Card`, pass it a string as `children` (`<Card>hello</Card>`), then pass it a whole other JSX element (`<Card><button>Click</button></Card>`). Confirm both compile fine — that's `ReactNode`'s breadth in action.

---

## 4. Optional Props and Defaults

```tsx
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";     // optional — union of literal types from the TypeScript guide
}

function Button({ label, variant = "primary" }: ButtonProps) {
  return <button className={variant}>{label}</button>;
}
```

`variant?:` makes the prop optional; the destructuring default (`variant = "primary"`) supplies the actual fallback value at runtime — the `?` alone only affects what the compiler will accept as valid, it doesn't provide a value on its own.

> **Try it**: render `<Button label="Save" />` with no `variant` at all, confirm it compiles and defaults correctly. Then try `<Button label="Save" variant="danger" />` and read the error — `"danger"` isn't one of the two literal values allowed.

---

## 5. Typing Event Handlers

Untyped, from the JSX guide: `onClick={handleClick}`. The event object itself needs a type the moment you actually use it:

```tsx
function Form() {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    console.log("clicked at", e.clientX, e.clientY);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

The pattern is always `React.<EventType><HTMLElementType>` — `ChangeEvent<HTMLInputElement>` for an input's `onChange`, `FormEvent<HTMLFormElement>` for a form's `onSubmit`, `MouseEvent<HTMLButtonElement>` for a click. The `<...>` here is a generic parameter (from the TypeScript guide) telling TypeScript exactly which element `e.target`/`e.currentTarget` refers to — without it, `e.target.value` wouldn't type-check, since a generic `Event` has no `.value` field.

> **Try it**: write `handleChange` with no type on `e` at all and watch TypeScript infer it as `any` implicitly (or error, if `noImplicitAny` — part of `strict` mode from the TypeScript guide — is on, which it will be in this playground). Add the correct `React.ChangeEvent<HTMLInputElement>` type and watch `e.target.value` go from untyped to a real, checked `string`.

---

## 6. Typing `useState`

```tsx
const [count, setCount] = useState(0);                    // inferred as number, no annotation needed
const [name, setName] = useState("");                       // inferred as string
const [user, setUser] = useState<User | null>(null);          // MUST be explicit here
```

For simple initial values, TypeScript infers the state's type from what you pass in — same inference behavior from the TypeScript guide. But `useState(null)` alone would infer the type as just `null` forever, rejecting any real value later. This is exactly where the generic syntax from the TypeScript guide's Section 7 gets used directly: `useState<User | null>(null)` explicitly tells `useState` "this state is either a `User` or `null`," letting you assign a real `User` later without a type error.

```tsx
interface User {
  name: string;
  age: number;
}

function Profile() {
  const [user, setUser] = useState<User | null>(null);

  if (!user) return <p>Loading...</p>;
  return <p>{user.name}</p>;      // TypeScript knows user is a User here, not null — narrowing, from the TypeScript guide
}
```

> **Try it**: write `Profile` above, and inside the `if (!user)` branch, try accessing `user.name` anyway — read the compiler error. Then move that same access below the `if`, after the null check, and confirm it compiles — this is narrowing (TypeScript guide, Section 8) applied directly to a real component.

---

## 7. Typing `useRef`

```tsx
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  function focusInput() {
    inputRef.current?.focus();
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}
```

`useRef<HTMLInputElement>(null)` — the generic tells TypeScript what kind of DOM element this ref will eventually hold. The initial value has to be `null` (the ref before the element has actually rendered), which is why `.current` is typed as `HTMLInputElement | null`, and why `inputRef.current?.focus()` uses `?.` (optional chaining — calls `.focus()` only if `.current` isn't `null`, otherwise evaluates to `undefined` instead of crashing).

---

## 8. Typing Custom Hooks

```tsx
import { useState, useEffect } from "react";

function useWindowWidth(): number {
  const [width, setWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}
```

Same custom hook from React Fundamentals, with an explicit return type (`: number`) added — worth doing on custom hooks specifically, even though return types are often fine left inferred elsewhere, because a hook's return type is effectively a public contract every component calling it relies on.

For a hook returning multiple values as an array (mirroring `useState`'s own shape), TypeScript needs a specific nudge to keep the array's positions as distinct types instead of collapsing them into one union:

```tsx
function useToggle(initial: boolean): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  function toggle() {
    setValue(v => !v);
  }
  return [value, toggle];      // without the tuple return type above, TS infers (boolean | (() => void))[] instead
}
```

The explicit `[boolean, () => void]` return type is a **tuple type** (from the TypeScript guide's Section 2) — without it, destructuring `const [isOn, toggle] = useToggle(false)` would give both variables the same overly broad unioned type instead of `isOn: boolean` and `toggle: () => void` correctly.

---

## 9. Component Typing: Skip `React.FC`

You'll see this in older code and tutorials:

```tsx
const Welcome: React.FC<WelcomeProps> = ({ name }) => {
  return <h1>Hello, {name}!</h1>;
};
```

Recognize it, but don't reach for it. `React.FC` used to be the recommended way to type a component, but it has real downsides (it implicitly adds an optional `children` prop to every component whether you want one or not, among other issues) and has fallen out of favor. The plain function form from Section 2 — a regular function with a typed props parameter, no `React.FC` wrapper — is the current convention and what you should default to:

```tsx
function Welcome({ name }: WelcomeProps) {
  return <h1>Hello, {name}!</h1>;
}
```

---

## 10. Typing Lists

```tsx
interface User {
  id: number;
  name: string;
}

function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

`{ users: User[] }` inline as the props type is fine for something this small — a full separate `interface` isn't mandatory for a one-field props object, though reaching for one anyway is a completely reasonable habit once a component has more than one or two props. Note `key={user.id}` here instead of `key={user.name}` or an index — the real, unique field from actual data, per the JSX guide's warning about `key`.

> **Try it**: build this with a hardcoded `users` array, then try removing `id` from the `User` interface entirely while still writing `key={user.id}` — watch the compiler catch the now-invalid property access immediately, before you'd ever see a broken list in the browser.

---

## 11. Self-Check

1. Why does a file need to be `.tsx` instead of `.ts` the moment it contains JSX?
2. Why is `interface Props { name: string }` combined with `{ name }: Props` in the function signature, instead of typing `name` directly inline?
3. What does `ReactNode` cover that a plain `string` type wouldn't?
4. Why does `useState(null)` alone cause problems later, and what fixes it?
5. What does the `<HTMLInputElement>` in `useRef<HTMLInputElement>(null)` actually tell the compiler?
6. Why does a custom hook returning multiple values need an explicit tuple return type, but a component usually doesn't need an explicit return type at all?
7. What's the current convention for typing a component's props — `React.FC<Props>`, or a plain function with a typed parameter — and why?

Next.js is next — file-based routing, server vs. client components, and how all of this (JSX, React, TypeScript, TSX) fits into an actual project structure.