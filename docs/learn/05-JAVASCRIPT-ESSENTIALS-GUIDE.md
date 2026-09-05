# JavaScript Essentials

Fair warning up front: JavaScript is weird. It has real historical baggage (`null` reporting as `"object"`, `==` doing bizarre type coercion, `var` scoping rules nobody would design today) and you'll bump into that weirdness directly in this guide. But it's also one of those languages that gets genuinely addicting once it clicks — the "everything is a value, functions are just objects you can pass around" style opens up patterns that feel awkward to force into more rigid languages. Stick with the weird parts; they're a small fraction of the language and worth it.

This guide assumes you know the *basics* of programming from starting C# — operators, variables, literals, `for` loops, `foreach` loops, `while` loops (including the `while (true)` pattern), conditionals, and `switch`/modern `switch` expressions. It does **not** assume you know C# deeply, and it doesn't assume OOP, generics, LINQ, or async/await — if you haven't gotten there in C# yet, this guide won't lean on it.

---

## 0. Running JavaScript, For Now

You already have Node.js installed. For the rest of this guide, running a file is this simple:

```powershell
node app.js
```

That's it — `node` executes the JavaScript in `app.js` and prints anything you `console.log()` to the terminal. Treat this as a black box for now. What `node` actually is, what "runtime" means, how it finds files, what `npm`/`package.json`/`node_modules` are — all of that is covered properly in the next guide (Node.js Prerequisites), where explaining it will actually mean something. Right now you just need a way to run code and see output, so you can test everything below as you read it.

```javascript
// app.js
console.log("this runs");
```

```powershell
node app.js
# this runs
```

`console.log` is your primary tool for inspecting values while learning and debugging — same role as `Console.WriteLine`.

---

## 1. Variables: `let` and `const`

JavaScript has three variable keywords historically, but you only need two. **Never use `var`** — it has confusing scoping rules (function-scoped instead of block-scoped) that exist for historical reasons and cause real bugs. Any tutorial or codebase using `var` is either old or wrong.

```javascript
let count = 5;        // reassignable
const name = "app";    // NOT reassignable — this binding is fixed
```

`const` does not mean "immutable value" — it means "this variable name can't be reassigned to point at something else." An object or array declared with `const` can still have its contents changed:

```javascript
const user = { name: "Alex" };
user.name = "Sam";        // fine — mutating the object's contents
user = { name: "Sam" };    // ERROR — reassigning the binding itself
```

**Default to `const`.** Only use `let` when you genuinely need to reassign (loop counters, accumulator variables). If you're not sure which to use, start with `const` and only switch to `let` if the code refuses to compile without it.

No type declarations — JavaScript is **dynamically typed**. A variable can hold a number, then later a string, with nothing stopping you:

```javascript
let value = 5;
value = "now a string";   // legal, no error
```

This is a real difference from C#, not just missing syntax — nothing checks types for you before the code runs. This exact problem is *why* modern JavaScript projects almost always use **TypeScript** instead of plain JavaScript — TypeScript adds a type system back on top of JS, catching the kind of mistakes C#'s compiler already catches for you. You'll meet TypeScript once you reach the actual project; this guide is deliberately plain JavaScript first so the language itself isn't tangled up with a type system on day one.

---

## 2. Types

JavaScript has far fewer primitive types than C#:

```javascript
typeof 5              // "number"   — no int/float/double distinction, it's all one number type
typeof "text"          // "string"
typeof true             // "boolean"
typeof undefined         // "undefined" — a variable declared but not assigned
typeof null               // "object"    — this is a decades-old bug in JS everyone knows about; null means "intentionally no value"
typeof {}                   // "object"
typeof []                    // "object"    — arrays are a special kind of object, more below
typeof function () {}         // "function"  — functions are values, more below
```

`undefined` vs `null` is a real distinction worth internalizing: `undefined` generally means "nothing was ever assigned here," `null` means "a value was deliberately set to nothing."

---

## 3. Template Literals

Backticks (`` ` ``), not quotes, enable string interpolation directly:

```javascript
const name = "Alex";
const greeting = `Hello, ${name}!`;      // "Hello, Alex!"
const multi = `line one
line two`;                                 // backticks also allow real multi-line strings
```

Regular strings still use `"double"` or `'single'` quotes — interchangeable, pick one convention and stay consistent. Backticks are specifically for interpolation or multi-line text.

---

## 4. Functions

Multiple ways to write a function — you'll see all of them in real code, so recognize each rather than picking a favorite too early.

```javascript
// Function declaration
function add(a, b) {
  return a + b;
}

// Function expression — a function assigned to a variable
const add2 = function (a, b) {
  return a + b;
};

// Arrow function — the modern, most common form
const add3 = (a, b) => {
  return a + b;
};

// Arrow function with implicit return — no braces, no `return` keyword, the expression IS the return value
const add4 = (a, b) => a + b;
```

Arrow functions are what you'll write and read most, especially once you reach React. A single-parameter arrow function can drop the parentheses too:

```javascript
const double = x => x * 2;
```

**Default parameters** and **rest parameters**:

```javascript
function greet(name = "friend") {        // default value if not provided
  return `Hello, ${name}`;
}

function sum(...numbers) {                // rest parameter: collects any number of args into an array
  return numbers.reduce((total, n) => total + n, 0);
}
```

---

## 5. Objects and Arrays

An object literal is JavaScript's way of grouping related data without needing a class defined anywhere first:

```javascript
const user = {
  name: "Alex",
  age: 30,
  isActive: true,
};

user.name          // "Alex"  — dot access
user["name"]        // "Alex"  — bracket access, needed when the key is dynamic or not a valid identifier
```

Arrays are ordered and dynamically sized — no fixed length up front, no single declared element type:

```javascript
const numbers = [1, 2, 3];
numbers.push(4);          // [1, 2, 3, 4]
numbers.length             // 4
numbers[0]                  // 1
```

### Destructuring

Pulling values out of objects/arrays into standalone variables in one step — extremely common in real code, including everywhere in React:

```javascript
const user = { name: "Alex", age: 30 };
const { name, age } = user;          // name = "Alex", age = 30

const numbers = [1, 2, 3];
const [first, second] = numbers;      // first = 1, second = 2
```

### Spread

`...` expands an array or object's contents in place — for copying or merging:

```javascript
const original = { name: "Alex", age: 30 };
const updated = { ...original, age: 31 };   // copy original, override age → { name: "Alex", age: 31 }

const a = [1, 2];
const b = [3, 4];
const combined = [...a, ...b];               // [1, 2, 3, 4]
```

This is how you'll update state in React without directly mutating the original object — a pattern you'll see constantly once you're there.

---

## 6. Equality

JavaScript has two equality operators, and the difference is not optional trivia:

```javascript
5 == "5"     // true  — loose equality, allows type coercion before comparing
5 === "5"    // false — strict equality, no coercion, types must match too
```

**Always use `===` and `!==`.** Loose equality's coercion rules are inconsistent and a genuine source of bugs (`"" == 0` is `true`, `null == undefined` is `true` but `null == 0` is `false`). There is no good reason to reach for `==` in modern code.

### Truthy and falsy

`if` statements coerce any value to a boolean. Exactly these values are **falsy** — everything else is **truthy**:

```
false, 0, "", null, undefined, NaN
```

```javascript
if ("") { }        // does NOT run — empty string is falsy
if ("0") { }         // DOES run — non-empty string, even "0", is truthy
if ([]) { }            // DOES run — an empty array is still an object, and objects are always truthy
```

That last one trips people up — an empty array or object is truthy in JS, even though it "feels" empty.

---

## 7. Control Flow

Mostly identical to what you already know from C#. A quick mapping so you're not learning these from scratch:

- `for` loop → same idea, same syntax shape (`for (let i = 0; i < 10; i++)`).
- `foreach` → JavaScript's equivalent is `for...of`, shown below.
- `while` / `while (true)` → identical concept and syntax.
- `if`/`else`, `switch` → practically identical syntax to C#.

```javascript
for (const item of items) {          // this is your foreach — iterate over VALUES
  console.log(item);
}

for (const key in object) {            // iterates over an object's KEYS — a different thing, easy to confuse with `of`
  console.log(key);
}
```

`for...of` is what you'll reach for almost every time you're looping over an array's contents — treat it as a direct swap for `foreach`.

---

## 8. Array Methods (Important — Used Constantly)

Modern JavaScript strongly favors these over writing a manual `for` loop every time you need to transform a list. They take a bit to get used to, but you'll use them constantly, especially once you start rendering lists of data in React:

```javascript
const numbers = [1, 2, 3, 4, 5];

numbers.map(n => n * 2);              // [2, 4, 6, 8, 10] — transform each element, same length out
numbers.filter(n => n % 2 === 0);      // [2, 4]           — keep elements matching a condition
numbers.reduce((total, n) => total + n, 0);   // 15         — fold into a single value, second arg is the starting value
numbers.find(n => n > 3);               // 4                — first matching element, or undefined
numbers.some(n => n > 3);                // true             — does at least one element match?
numbers.every(n => n > 3);                // false            — do all elements match?
numbers.forEach(n => console.log(n));      // no return value — just an action per element, not a transform
```

Read `numbers.map(n => n * 2)` as: "for each `n` in `numbers`, give me back `n * 2`, as a new array." That's the whole pattern — the function you pass in describes what happens to *one* element, and the method applies it to all of them. `map`/`filter`/`reduce` are worth real fluency, not just recognition — `items.map(item => ...)` is specifically how you'll render array data as UI in React, over and over.

---

## 9. Classes — Read, Don't Write

JS has real `class` syntax:

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return `Hi, I'm ${this.name}`;
  }
}

const alex = new Person("Alex", 30);
alex.greet();          // "Hi, I'm Alex"
```

You need to be able to **read** this — you'll encounter classes in this exact shape here and there. But in this project specifically, **you will not be writing classes.** By convention, class-based code only lives in `lib/`, and most of `lib/` is written by me, not by you. If you find yourself reaching for a `class` to solve something outside `lib/`, that's a sign to stop and use a plain function or object instead — which is also just how most modern JS/React code is written day to day regardless of project convention.

---

## 10. Doing Things That Take Time: Promises and `async`/`await`

Anything that takes time — network requests, file reads, timers — doesn't finish instantly in JavaScript. Instead of blocking and waiting, JS represents "a value that will exist eventually" as a **Promise**.

```javascript
async function getUser() {
  const response = await fetch("https://api.example.com/user");
  const data = await response.json();
  return data;
}
```

Marking a function `async` means it can use the `await` keyword inside it, and it always returns a Promise itself. `await` pauses *that function* (not your whole program) until the Promise resolves, and hands you back the real value instead of the Promise wrapper.

You'll sometimes see the older, pre-`await` style too — worth recognizing even though you won't need to write it:

```javascript
getUser()
  .then(user => console.log(user))
  .catch(err => console.error(err));
```

With `async`/`await`, error handling goes back to plain `try`/`catch`, same shape as error handling in any language with exceptions:

```javascript
async function getUser() {
  try {
    const response = await fetch("https://api.example.com/user");
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch user:", err);
  }
}
```

This matters early because data fetching in Next.js — one of the very next guides — is built entirely on this pattern.

---

## 11. Self-Check

1. Why default to `const` over `let`, and what does `const` actually prevent?
2. Why does modern JS tooling lean on TypeScript instead of plain JavaScript?
3. What's the difference between `undefined` and `null`?
4. Why is `[]` truthy even though it's empty?
5. What does `numbers.map(n => n * 2)` return, and how is that different from what `numbers.forEach(...)` returns?
6. In this project specifically, where are you allowed to write a `class`?
7. What does `await` actually pause — the whole program, or just the function it's in?

If these are solid, you're ready for JSX and React — nearly everything above (arrow functions, destructuring, spread, `map`, template literals) shows up directly in the very first React examples you'll see.
