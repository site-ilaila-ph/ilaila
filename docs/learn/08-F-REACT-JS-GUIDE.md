# React Fundamentals: Hooks, Context, and Patterns

The JSX guide covered syntax and the basic component model — functions returning markup, props, conditional rendering, lists. Everything in that guide was **static**: given the same props, a component always renders the same output, with no memory and no way to change over time on its own.

This guide is about the part that makes React actually useful for real applications: components that remember things, react to events, talk to each other, and share logic. Keep using the same Vite playground from the JSX guide (`src/App.jsx`) — every example here is meant to be run, not just read.

---

## 1. Why Components Need State

A React component is a function. Every time it re-renders, the **entire function body runs again**, from top to bottom — this is the core mental model everything else builds on.

```jsx
function Counter() {
  let count = 0;                       // this line runs on EVERY render

  function increment() {
    count = count + 1;
    console.log(count);                 // this will log correctly...
  }

  return (
    <div>
      <p>{count}</p>                     {/* ...but this will always show 0 */}
      <button onClick={increment}>+1</button>
    </div>
  );
}
```

> **Try it**: paste this into `App.jsx` and click the button several times. Watch the console log increasing numbers while the number on screen never changes. This is the single most important thing to internalize before hooks make sense: a plain variable inside a component function is recreated from scratch every render — it cannot survive between renders, and reassigning it doesn't trigger React to re-render anyway.

Two separate problems, both solved by `useState`:
1. A plain variable doesn't survive across renders.
2. Even if it did, changing it doesn't tell React to re-render and show the new value.

---

## 2. `useState`

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1);
  }

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}
```

`useState(0)` returns an array with exactly two things: the current value (`count`), and a function to update it (`setCount`). The array destructuring here — `const [count, setCount] = ...` — is exactly the array destructuring from JS Essentials, just applied to what `useState` hands back.

Calling `setCount` does two things: it stores the new value somewhere that survives across renders, and it tells React "re-render this component." That second part is the whole reason you never mutate state directly (`count = count + 1`) — React has no way to know something changed unless you go through the setter function.

> **Try it**: swap `Counter` above in for the broken version, click the button, and confirm the number on screen now actually updates.

### Functional updates

```jsx
function increment() {
  setCount(prevCount => prevCount + 1);
}
```

When the new state depends on the previous state, pass a function instead of a value. This matters because state updates aren't necessarily applied instantly — if you call `setCount(count + 1)` twice in a row in the same event handler, both calls may see the same stale `count` and only increment once total. `setCount(prev => prev + 1)` always operates on the actual latest value, not whatever `count` happened to be when the function was defined.

> **Try it**: write a button whose `onClick` calls `setCount(count + 1)` twice in a row, and observe it only increments by 1 per click. Then change both calls to `setCount(prev => prev + 1)` and observe it increments by 2. This is a real, common bug — worth seeing directly once.

### State with objects and arrays

State must be treated as **immutable** — never mutate it directly, always replace it with a new value. This is exactly where spread (from JS Essentials, and reinforced in the JSX guide's props section) becomes essential:

```jsx
const [user, setUser] = useState({ name: "Alex", age: 30 });

function haveBirthday() {
  setUser({ ...user, age: user.age + 1 });    // correct: new object, old fields spread in, one field changed
  // user.age = user.age + 1;                 // WRONG — mutates state directly, React won't detect the change
}
```

Same principle for arrays:

```jsx
const [items, setItems] = useState([]);

function addItem(newItem) {
  setItems([...items, newItem]);        // correct: new array
  // items.push(newItem);                // WRONG — mutates in place, React may not re-render
}
```

React compares state by reference for objects and arrays — mutating in place can leave the reference identical, and React may conclude nothing changed even though the contents did.

---

## 3. The Rules of Hooks

Two rules, both non-negotiable, and both exist because of *how* React tracks which piece of state belongs to which `useState` call:

1. **Only call hooks at the top level.** Never inside a loop, a condition, or a nested function.
2. **Only call hooks from React function components or custom hooks.** Never from a regular function.

```jsx
function Broken({ showExtra }) {
  if (showExtra) {
    const [extra, setExtra] = useState(0);   // WRONG — conditional hook call
  }
  const [count, setCount] = useState(0);
  // ...
}
```

React tracks hooks by **call order**, not by name — internally, it's essentially "the 1st `useState` call in this component is this piece of state, the 2nd is that one." If a hook call is sometimes skipped (because it's inside an `if`), that ordering shifts between renders and React attaches the wrong stored value to the wrong hook. This isn't a style guideline — it silently corrupts state, and ESLint's React hooks plugin (already part of most React project setups, including what you'll get from Next.js) will flag violations directly.

> **Try it**: write the broken example above with a toggleable `showExtra` prop, and watch React (or your linter) complain. You don't need to fix it — just see the warning once so you recognize it later.

---

## 4. `useEffect`

Rendering describes what the UI *should* look like right now. Some things don't belong in that description — fetching data, subscribing to something external, manually touching the DOM, setting a timer. `useEffect` is where that kind of code goes: things that happen *because* of a render, but aren't part of the render itself.

```jsx
import { useState, useEffect } from "react";

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch(`https://api.example.com/users/${userId}`);
      const data = await response.json();
      setUser(data);
    }
    fetchUser();
  }, [userId]);

  if (!user) return <p>Loading...</p>;
  return <p>{user.name}</p>;
}
```

The second argument — `[userId]`, the **dependency array** — controls when the effect re-runs:

```jsx
useEffect(() => { ... });              // runs after EVERY render — rarely what you want
useEffect(() => { ... }, []);           // runs ONCE, after the first render only
useEffect(() => { ... }, [userId]);      // runs after the first render, and again whenever userId changes
```

An empty array doesn't mean "don't run it" — it means "run it once, right after the first render, and never again on re-renders." This trips people up initially.

> **Try it**: add a `console.log("effect ran")` inside the effect above, with `[userId]` as the dependency array. Render `UserProfile` with a hardcoded `userId`, then change something *unrelated* (some other piece of state in the parent) that causes a re-render, and confirm the log does **not** fire again. Then change `userId` itself and confirm it does.

### Cleanup functions

If an effect sets something up that needs to be torn down (an interval, an event listener, a subscription), return a function from it — React calls that function before the effect re-runs, and again when the component unmounts entirely:

```jsx
useEffect(() => {
  const id = setInterval(() => {
    console.log("tick");
  }, 1000);

  return () => clearInterval(id);      // cleanup — runs before the next effect, and on unmount
}, []);
```

Skipping cleanup on something like `setInterval` or an event listener is one of the most common sources of real, hard-to-diagnose bugs in React apps — timers stacking up, listeners firing multiple times, memory leaks. If your effect subscribes to anything, ask whether it also needs to unsubscribe.

> **Try it**: build the interval example above, mount and unmount the component (conditionally render it and toggle a parent state to remove it), and watch "tick" stop logging once it's unmounted, confirming cleanup actually ran.

### The dependency array is not optional to get right

Omitting a value the effect actually uses is a real bug — the effect will keep using a stale version of that value ("stale closure"). ESLint's `react-hooks/exhaustive-deps` rule (again, part of standard tooling) will warn you when a dependency is missing. Don't silence that warning without understanding why it's firing first.

---

## 5. `useRef`

Two distinct uses, worth separating clearly:

### Accessing a real DOM element

```jsx
import { useRef } from "react";

function TextInput() {
  const inputRef = useRef(null);

  function focusInput() {
    inputRef.current.focus();
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus the input</button>
    </>
  );
}
```

`ref={inputRef}` hands you the actual underlying DOM node once it's rendered, available as `inputRef.current`. This is an escape hatch for the rare cases JSX/state can't cover — focusing an input, measuring an element's size, integrating a non-React library that needs a real DOM node.

> **Try it**: build this, click the button, confirm the input actually gains focus (the cursor blinks in it) without you clicking it directly.

### Holding a mutable value that shouldn't trigger a re-render

```jsx
function Timer() {
  const renderCount = useRef(0);
  renderCount.current = renderCount.current + 1;

  return <p>This component has rendered {renderCount.current} times</p>;
}
```

Unlike `useState`, changing `.current` on a ref does **not** cause a re-render. Use `useRef` for values you need to track across renders but that shouldn't themselves cause the UI to update (a previous value for comparison, a timer ID, a flag) — reach for `useState` whenever the value actually needs to be reflected on screen.

---

## 6. Lifting State Up

Two sibling components can't directly share state — each `useState` call is scoped to the component that calls it. The fix isn't a special hook; it's a structural pattern: move the state to their closest common parent, and pass it down as props.

```jsx
function TemperatureInput({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

function Converter() {
  const [celsius, setCelsius] = useState("");

  return (
    <div>
      <TemperatureInput value={celsius} onChange={setCelsius} />
      <p>{celsius}°C is {celsius * 9 / 5 + 32}°F</p>
    </div>
  );
}
```

`Converter` owns the state; `TemperatureInput` just receives a value and a way to request a change. Neither sibling needs to know the other exists — they only know about their shared parent. This single pattern — "state lives as high as the components that need it, but no higher" — is the default answer to "how do two components share data" before reaching for anything more elaborate.

---

## 7. Controlled Components (Forms)

A **controlled component** is a form element whose value is driven entirely by React state, not by the DOM's own internal state:

```jsx
function NameForm() {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();          // stop the browser's default full-page-reload form submission
    console.log("Submitted:", name);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

`value={name}` plus `onChange={e => setName(e.target.value)}` is the standard pairing — the input's displayed value always comes from state, and every keystroke updates that state, which triggers a re-render that redisplays the (now updated) value. It looks circular but it's the deliberate pattern: React state is the single source of truth for what's in the box, not the browser's own uncontrolled input behavior.

`e.preventDefault()` on the submit handler is one you'll type reflexively — without it, the browser performs its native form submission (a full page navigation) which you almost never want in a React app.

> **Try it**: build this form, type into the input, and add a `console.log(name)` right in the render body (not inside a handler) to watch state update on every keystroke, live in the console.

---

## 8. Context — Avoiding Prop Drilling

If five components deep needs a value that only the top-level component has, passing it down through every intermediate component as props — none of which actually use it themselves — is called **prop drilling**. Context is React's built-in way to skip the chain.

```jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);

function App() {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return <ThemedButton />;          // doesn't touch theme at all, just renders its child
}

function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current theme: {theme}
    </button>
  );
}
```

Three pieces: `createContext` defines the context object itself, `<ThemeContext.Provider value={...}>` makes a value available to every component nested inside it (however deep), and `useContext(ThemeContext)` reads that value from anywhere inside the provider, with no props passed through `Toolbar` at all.

> **Try it**: build this three-component chain, click the button, and confirm the theme toggles — then note that `Toolbar` never once mentions `theme`, proving it really did skip the middle layer.

**Context is not a general state-management replacement.** It solves exactly one problem — avoiding prop drilling for values genuinely needed widely (theme, current user, locale) — and every component reading a context re-renders when that context's value changes, which can get expensive if used carelessly for frequently changing values. For state that's only needed locally or by a couple of nearby components, lifting state up (Section 6) is still the right first tool, not Context.

---

## 9. `useReducer` — State Logic That Outgrows `useState`

When state updates involve multiple related sub-values or non-trivial transition logic, a reducer often reads more clearly than a pile of separate `useState` calls and handler functions:

```jsx
import { useReducer } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return { count: 0 };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+1</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-1</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </div>
  );
}
```

The `reducer` function is pure — given the same current `state` and `action`, it always returns the same new state, with no side effects. This is directly analogous to the `switch`/modern `switch` you already know from C# for expressing "one of several named transitions." `dispatch({ type: "increment" })` is how components request a change; they never compute the next state themselves, they just describe *what happened*, and the reducer decides what that means for state.

Reach for `useReducer` when you notice several `useState` calls that always seem to update together, or when "what should happen next" genuinely depends on more than just the new value being passed in.

---

## 10. `useMemo` and `useCallback` — Read This Before Reaching for Them

Both exist purely for **performance**, specifically to avoid recalculating a value or recreating a function on every single render when that render didn't actually need to.

```jsx
const expensiveResult = useMemo(() => computeExpensiveThing(data), [data]);

const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

`useMemo` caches a *computed value*; `useCallback` caches a *function reference*. Both only recompute/recreate when something in the dependency array changes, same dependency-array rules as `useEffect`.

**The important, easy-to-skip point**: these are optimizations, not correctness tools, and they have their own overhead (React still has to check the dependency array every render). Reaching for `useMemo`/`useCallback` everywhere "just in case" makes code harder to read for no measurable benefit in most components. Write the plain, unmemoized version first. Reach for these specifically when you've identified an actual performance problem — a genuinely expensive calculation, or a function passed to a child component wrapped in `React.memo` where a new reference every render defeats that memoization. Premature use of these two hooks is a common, real code-smell in React codebases, not a sign of experience.

---

## 11. Custom Hooks — Extracting Reusable Logic

Any function whose name starts with `use` and that calls other hooks internally is a **custom hook** — a way to extract and reuse *stateful* logic between components, something plain function extraction can't do (a plain function can't call `useState` and have that state belong to whichever component uses it).

```jsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

function ResponsiveComponent() {
  const width = useWindowWidth();
  return <p>Window width: {width}px</p>;
}
```

`useWindowWidth` bundles a `useState` and a `useEffect` — with its own cleanup — into one reusable unit. Any component that needs the window width just calls the hook; it doesn't need to know or duplicate how that value is tracked. Custom hooks are the standard way real React codebases avoid repeating the same `useState`/`useEffect` pairing across many components — if you notice the same stateful logic appearing in two components, that's the signal to extract a custom hook, not to copy-paste.

The Rules of Hooks from Section 3 apply identically inside custom hooks — top level only, no conditionals.

---

## 12. Patterns Worth Naming

A few higher-level habits, not new APIs — ways of thinking about the pieces above that separate code that scales from code that doesn't:

- **State lives as close as possible to where it's used, and gets lifted only as far as it needs to be shared.** Don't default to putting everything in one giant top-level state object "just in case" — that causes far more re-rendering and far more prop-passing than keeping state local until something genuinely needs it higher up.
- **Derive, don't duplicate.** If a value can be computed from existing state or props, compute it during render instead of storing it as its own `useState`. Two pieces of state that must always be kept in sync manually are two bugs waiting to happen the moment one update path is missed.
- **Composition over configuration.** Rather than one component with a dozen boolean props toggling behavior (`<Card bordered rounded shadow compact />`), prefer building it from smaller composable pieces (`children`, as in the JSX guide's `Card` example) — easier to read, easier to extend without touching the component itself.
- **Colocate related state and the logic that changes it.** A `useState` and the handler functions that update it belong together, ideally in the same component or the same custom hook — not state in one place and its update logic scattered across unrelated files.

---

## 13. Self-Check

1. Why doesn't reassigning a plain `let` variable inside a component cause the UI to update, even though `console.log` shows the new value?
2. Why must state updates that depend on the previous value use the `prev => ...` functional form instead of referencing the state variable directly?
3. Why is calling a hook inside an `if` statement a real bug, not just a style violation?
4. What does an empty dependency array (`[]`) on `useEffect` actually mean, and how is that different from omitting the array entirely?
5. What's the practical difference between `useState` and `useRef` for holding a value across renders?
6. What problem does Context solve, and what's the first tool you should reach for *before* Context when two components need to share data?
7. Why are `useMemo`/`useCallback` not something to add by default to every value and function?
8. What has to be true about a function's name and internals for it to count as a "custom hook"?
