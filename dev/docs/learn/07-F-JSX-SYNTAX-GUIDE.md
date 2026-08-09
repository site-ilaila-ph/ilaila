# JSX

JSX is a syntax extension for JavaScript that lets you write HTML-like markup directly inside your JS code. It's used almost exclusively with **React** — the library actually responsible for turning that markup into real content on a screen. JSX itself is just syntax; React is what gives it meaning.

This guide is plain JSX — `.jsx` files. Keep the syntax and concepts here separate from anything you've seen with type annotations elsewhere; that's not part of this guide.

---

## 0. Getting a Live Playground Running

Everything in this guide is easier to absorb if you can actually run it and see it change, instead of reading code in isolation. For that, you need *some* React project running in a browser — and the fastest way to get one is a tool called **Vite**.

One thing worth being upfront about: **this project will use Next.js, not Vite**, once you get there — different setup, different conventions, a separate guide entirely. Vite's only job here is to get you a working React app in under a minute so you have somewhere to actually type and run the JSX in this guide. Don't invest time learning Vite's configuration, plugins, or build system — none of that transfers to what you'll use on the real project. Treat it purely as scaffolding.

```powershell
pnpm create vite@latest jsx-playground
```

You'll be prompted for a framework — choose **React** — and a variant — choose **JavaScript**. Then:

```powershell
cd jsx-playground
pnpm install
pnpm dev
```

`pnpm dev` starts a local dev server and prints a URL, normally `http://localhost:5173`. Open that in a browser — you now have a real, running React app.

Everything you'll edit lives in `src/App.jsx`. Delete its contents and replace them with whatever example you're currently reading in this guide, save the file, and check the browser — it updates automatically without a manual refresh. That's the whole workflow: edit `src/App.jsx`, save, look at the browser, repeat.

You do not need to understand anything else in this generated project — `vite.config.js`, `index.html`, the rest of it — to use it as intended here. `src/App.jsx` is the only file that matters for this guide.

---

## 1. What JSX Actually Is

This looks like it shouldn't work, coming from plain JavaScript:

```jsx
const element = <h1>Hello, world!</h1>;
```

That's not a string, and it's not HTML being interpreted at runtime. JSX is **not valid JavaScript** on its own — it requires a build step (a compiler) to transform it into plain JavaScript before it can actually run. The line above compiles to something close to:

```javascript
const element = React.createElement("h1", null, "Hello, world!");
```

`React.createElement` returns a plain JavaScript object describing what should appear on screen — a tag name, some props, and children — not the actual rendered output. React takes that description and does the real work of putting it on the page. This is why you can't just `node app.jsx` the way you could `node app.js` in the earlier guides — JSX needs a compiler in the loop first. Once you're in the Next.js guide, that compiler is already wired in for you; for now, treat this as: JSX describes UI, it doesn't directly draw it.

> **Try it**: open `src/App.jsx` in your playground, delete everything, and replace it with:
> ```jsx
> function App() {
>   return <h1>Hello, world!</h1>;
> }
> export default App;
> ```
> Save, check the browser. Now change the text and save again — watch how fast it updates without a manual refresh.

---

## 2. JSX Looks Like HTML, But Isn't

A handful of concrete differences, all because JSX compiles to JavaScript and has to follow JavaScript's rules, not HTML's:

```jsx
// HTML                          // JSX
<div class="box">                <div className="box">
<label for="name">               <label htmlFor="name">
<button onclick="...">           <button onClick={handleClick}>
<img src="pic.png">              <img src="pic.png" />        {/* self-closing REQUIRED */}
<input type="text">               <input type="text" />        {/* same */}
```

- **`class` → `className`**, **`for` → `htmlFor`** — both are reserved words in JavaScript (`class` is a real keyword, as you saw in the JS Essentials guide; `for` too), so JSX renames the HTML attributes that collide with them.
- **Event handlers are camelCase and take a real function, not a string** — `onClick={handleClick}`, not `onclick="handleClick()"`. This connects directly to functions being values, from JS Essentials.
- **Every tag must be closed.** HTML tolerates `<img src="pic.png">` with no closing tag. JSX does not — it must be `<img src="pic.png" />`. Same for `<input />`, `<br />`, and anything else HTML normally leaves open.
- **Comments are `{/* like this */}`**, not `<!-- like this -->` — because they're JavaScript expressions, covered next.

> **Try it**: in `App.jsx`, add `<img src="https://placekitten.com/200/200">` without the self-closing slash and save — watch the dev server throw a real error in the browser overlay. Fix it to `<img src="https://placekitten.com/200/200" />` and confirm it clears. Then try `<div class="box">` instead of `className` and see what actually happens (hint: it won't error, but check the browser console).

---

## 3. Embedding JavaScript: Curly Braces

Anywhere inside JSX, `{}` drops you back into plain JavaScript — any *expression* (something that produces a value) is valid inside:

```jsx
const name = "Alex";
const element = <h1>Hello, {name}!</h1>;                    // Hello, Alex!

const element2 = <p>{2 + 2}</p>;                              // 4
const element3 = <p>{name.toUpperCase()}</p>;                  // ALEX
```

This is the exact same `{...}` role template literals played with `${...}` in the JS Essentials guide — "step out of the surrounding syntax and evaluate real JavaScript here." The difference is scope: template literals only work inside strings; JSX's `{}` works anywhere in the markup, including as a whole child, an attribute value, or nested inside other JSX.

**One restriction worth knowing early**: only *expressions* go in `{}`, not *statements*. `{2 + 2}` works because it's an expression (it produces a value). `{if (x) { ... }}` does not work — `if` is a statement, not an expression. This is why conditional rendering (next) uses different patterns than a plain `if` block.

> **Try it**: in `App.jsx`, declare `const name = "your actual name";` above the component and render `<h1>Hello, {name.toUpperCase()}!</h1>`. Then try putting a real `if` statement inside the `{}` and read the compiler error it produces — connect that error back to the expression-vs-statement rule above.

---

## 4. Components: Functions That Return JSX

A **component** is just a JavaScript function that returns JSX. That's the entire definition — nothing more exotic than that.

```jsx
function Welcome() {
  return <h1>Hello, world!</h1>;
}
```

**Naming convention that is not optional**: component names must start with a capital letter — `Welcome`, not `welcome`. This isn't style preference; it's how JSX tells the difference between your own component and a built-in HTML tag. `<welcome />` (lowercase) is treated as an attempt to render an actual, nonexistent `<welcome>` HTML element. `<Welcome />` (capitalized) is treated as your component.

Using a component looks like using any other JSX tag:

```jsx
function App() {
  return (
    <div>
      <Welcome />
      <Welcome />
    </div>
  );
}
```

Note the parentheses around multi-line JSX in a `return` — not required syntactically, but standard convention, since a bare `return` followed by a newline and then JSX is a real bug trap (JavaScript's automatic semicolon insertion will terminate the `return` early with nothing after it).

### One root element

A component must return a **single** root element. This does not work:

```jsx
function Broken() {
  return (
    <h1>Title</h1>
    <p>Text</p>          // ERROR — two sibling root elements, not allowed
  );
}
```

Wrap in a parent `<div>`, or, when you don't want an extra wrapper element cluttering the actual rendered output, use a **Fragment**:

```jsx
function Fixed() {
  return (
    <>
      <h1>Title</h1>
      <p>Text</p>
    </>
  );
}
```

`<>...</>` is shorthand for `<React.Fragment>...</React.Fragment>` — groups elements for JSX's sake without adding a real, visible wrapper element to the page.

> **Try it**: write a `Welcome` component and render three copies of it inside `App` with a shared `<div>` wrapper. Then open your browser's dev tools (`F12`), inspect the rendered HTML, and confirm the `<div>` is really there. Swap the `<div>` for a Fragment (`<>...</>`) and inspect again — confirm the wrapper is gone from the actual HTML this time, even though your JSX still "wraps" the three components.

---

## 5. Props: Passing Data Into Components

Props (short for "properties") are how a component receives data from whatever's rendering it — the same conceptual role as arguments to a function, because that's literally what they are.

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

function App() {
  return <Welcome name="Alex" />;
}
```

React collects every attribute you write on `<Welcome name="Alex" />` into a single object and passes it as the function's one argument — `props` here is `{ name: "Alex" }`. Destructuring (from JS Essentials) is the standard way to pull specific props out immediately, and you'll see this far more often than `props.name`:

```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

Props are **read-only** from the component receiving them — a component must never reassign its own props. (Making UI actually change over time, in response to something, is what **state** is for — a separate concept, covered in the React fundamentals material once you're past plain JSX.)

### `children`

Anything nested between a component's opening and closing tags is passed automatically as a special prop called `children`:

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}

function App() {
  return (
    <Card>
      <p>This paragraph is the Card's children.</p>
    </Card>
  );
}
```

This is how reusable wrapper components (cards, layouts, modals) work — the component controls the wrapper, the caller controls what's inside it.

> **Try it**: build the `Card` component above, then render two of them with completely different `children` inside each — one with a paragraph, one with a button. Confirm both render correctly through the same `Card`. Then, inside `Welcome`, try writing `props.name = "Changed";` before the `return` and see what React actually does about it (check the console).

---

## 6. Conditional Rendering

No `if` statements inside JSX markup itself — remember, `{}` only accepts expressions. Three patterns cover nearly everything:

### Ternary — when you need one of two things

```jsx
function Status({ isLoggedIn }) {
  return <p>{isLoggedIn ? "Welcome back!" : "Please log in."}</p>;
}
```

### `&&` — when you want something or nothing

```jsx
function Notification({ hasUnread }) {
  return (
    <div>
      {hasUnread && <span className="badge">New</span>}
    </div>
  );
}
```

Reads as: "if `hasUnread` is truthy, render the `<span>`; if it's falsy, render nothing." This works because of the truthy/falsy rules from JS Essentials — `false && anything` short-circuits to `false`, and React simply renders nothing for `false`, `null`, or `undefined`.

**One real trap**: `{count && <p>{count} items</p>}` — if `count` is `0`, this renders the literal number `0` on the page, not nothing, because `0` is falsy but React still renders falsy *numbers* (just not `false`/`null`/`undefined`). Guard explicitly (`count > 0 && ...`) rather than relying on a raw number's truthiness here.

### `if`, outside the JSX — when the logic is more involved

Nothing stops you from branching *before* the `return`, in plain JavaScript, and just returning different JSX entirely:

```jsx
function Status({ isLoggedIn }) {
  if (!isLoggedIn) {
    return <p>Please log in.</p>;
  }
  return <p>Welcome back!</p>;
}
```

Prefer this over cramming complex logic into a ternary once it's more than a simple either/or — a ternary that's hard to read is a sign to pull the logic out into a real `if`.

> **Try it**: hardcode `const count = 0;` in `App.jsx` and render `{count && <p>Items: {count}</p>}` — look at the page and confirm you actually see a stray `0` rendered. Then fix it with `{count > 0 && <p>Items: {count}</p>}` and confirm it disappears. This bug is easy to read about and easy to miss live — seeing the literal `0` on the page is worth more than the explanation above.

---

## 7. Rendering Lists

Straight from the `.map()` method in JS Essentials — this is the payoff of learning it there:

```jsx
const users = ["Alex", "Sam", "Jordan"];

function UserList() {
  return (
    <ul>
      {users.map(user => (
        <li key={user}>{user}</li>
      ))}
    </ul>
  );
}
```

`users.map(user => <li key={user}>{user}</li>)` produces an array of JSX elements — one `<li>` per user — and JSX renders an array of elements exactly like it renders any other expression inside `{}`.

### `key` is not optional

Every element produced inside a `.map()` needs a `key` prop — a string or number, unique among its siblings. React uses `key` to track which item is which across re-renders (so it can correctly figure out what moved, what's new, and what's gone, instead of rebuilding everything from scratch). Omitting it doesn't crash your app, but React will warn loudly in the console, and skipping it can cause real, confusing bugs once list items are added, removed, or reordered.

```jsx
{users.map((user, index) => (
  <li key={index}>{user}</li>          // works, but avoid when possible
))}
```

Using the array `index` as `key` works in a pinch but is a known trap the moment the list can be reordered, filtered, or have items inserted/removed — React can misattribute state to the wrong item. Prefer a stable, unique value from the actual data (an ID) whenever one exists.

> **Try it**: render the `users` list above with `key={user}`, then open dev tools and remove the `key` prop entirely — save, and read the warning React prints in the browser console. Put it back, and confirm the warning clears.

---

## 8. Handling Events

```jsx
function Button() {
  function handleClick() {
    console.log("clicked");
  }

  return <button onClick={handleClick}>Click me</button>;
}
```

`onClick={handleClick}` — pass the function itself, not a call to it. This is a real and common mistake:

```jsx
<button onClick={handleClick()}>Click me</button>     // WRONG — calls handleClick immediately during render, not on click
<button onClick={handleClick}>Click me</button>         // RIGHT — passes the function, React calls it when clicked
```

If you need to pass an argument, wrap it in an inline arrow function so the call happens on click, not during render:

```jsx
function DeleteButton({ id }) {
  function handleDelete(itemId) {
    console.log("deleting", itemId);
  }

  return <button onClick={() => handleDelete(id)}>Delete</button>;
}
```

> **Try it**: build the `Button` example, open dev tools' console, and click it — confirm "clicked" logs only when you actually click, not on page load. Then change it to `onClick={handleClick()}` (calling it) and reload the page without clicking anything — notice it logs immediately on render instead. That's the whole bug, seen directly instead of just described.

---

## 9. Self-Check

1. Why can't you just `node app.jsx` a JSX file the way you could a plain `.js` file?
2. Why does JSX use `className` instead of `class`?
3. What's the actual rule for whether something can go inside `{}` in JSX?
4. What's the difference between a lowercase `<welcome />` and a capitalized `<Welcome />`?
5. If `count` is `0`, what does `{count && <p>Items: {count}</p>}` actually render, and why?
6. Why does every element inside a `.map()` need a `key`, and why is array `index` a risky choice for it?
7. What's wrong with `<button onClick={handleClick()}>`, specifically?

You now know the syntax. React Fundamentals — hooks, context, and the patterns you'll actually reach for day to day — is next.
