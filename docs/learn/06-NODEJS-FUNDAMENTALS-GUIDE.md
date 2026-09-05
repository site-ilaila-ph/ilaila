# Node.js Fundamentals

Back in the JavaScript Essentials guide, `node app.js` was a black box — "trust me, it runs your file." This guide opens that box, and covers everything around it: how modules connect files together, how packages get installed and managed, and the version-management layer (nvm, Corepack, pnpm) you'll actually use day to day on this project.

---

## 1. What Node.js Actually Is

JavaScript was originally a browser-only language — its whole first decade of existence, it could only run inside a web page, with no way to read files, open network sockets, or do anything outside the browser sandbox.

**Node.js takes the same JavaScript engine Chrome uses (V8) and runs it outside the browser**, as a standalone program on your machine, with a different set of built-in capabilities — file system access, networking, process control — replacing the browser-specific ones (no `document`, no `window`, no DOM, none of that exists in Node).

So "Node.js" is two things bundled together: the V8 engine that actually executes JavaScript, and a set of Node-specific APIs (`fs`, `path`, `http`, and more) that give that JavaScript something useful to do on a regular computer instead of inside a web page.

```powershell
node app.js
```

Now the "magic" is just: Node starts up, loads `app.js`, executes it top to bottom using V8, and exits when there's nothing left to do (or keeps running if something — like a server — is still listening for events).

```powershell
node                # no file argument: drops you into the REPL — an interactive JS prompt, same engine
```

The REPL (Read-Eval-Print Loop) is worth knowing about for quick one-off checks (`node`, then type an expression, see the result immediately) — same idea as testing something in a scratch file, but faster.

---

## 2. Modules: Connecting Files Together

A real project is never one file. Modules are how one JavaScript file uses code defined in another. Node actually supports **two different module systems**, and knowing both — and that they're different — matters, because you'll see both in real code.

### CommonJS (the original Node system)

```javascript
// math.js
function add(a, b) {
  return a + b;
}

module.exports = { add };
```

```javascript
// app.js
const { add } = require("./math.js");
console.log(add(2, 3));   // 5
```

`require()` and `module.exports` — this was Node's original, and for a long time only, module system. You'll still see it constantly in older code, tooling configs, and plenty of published packages.

### ES Modules (the modern, standardized system)

```javascript
// math.js
export function add(a, b) {
  return a + b;
}
```

```javascript
// app.js
import { add } from "./math.js";
console.log(add(2, 3));   // 5
```

`import`/`export` is the standardized JavaScript module syntax (part of the language itself now, not a Node-specific invention) and is what modern projects — including the one you're about to work on — use by default.

### Why both exist, and how Node picks one

Node needs to know which system a given file is using before it runs it. This is controlled by your `package.json` (covered next):

```json
{
  "type": "module"
}
```

With `"type": "module"` set, Node treats `.js` files as ES Modules (`import`/`export`). Without it, Node defaults to treating `.js` files as CommonJS (`require`/`module.exports`). You can also force either one on a per-file basis regardless of that setting using the `.mjs` (always ES Module) or `.cjs` (always CommonJS) extensions.

You don't need to memorize every edge case here — just recognize that if you ever see `require()` fail with a confusing error in a modern-looking project, or `import` fail in an older one, this mismatch is very often why.

---

## 3. npm, `package.json`, and `node_modules`

**npm** (Node Package Manager) ships with Node automatically and is the original tool for installing and managing third-party JavaScript code — the equivalent of NuGet in the C# world.

### `package.json`

The manifest file at the root of every Node project. It declares the project's name, version, scripts, and — critically — its **dependencies**:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  },
  "dependencies": {
    "react": "^19.0.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0"
  }
}
```

- **`dependencies`** — packages your actual running application needs.
- **`devDependencies`** — packages only needed while developing/building (linters, test tools) but not shipped in the final app.
- **`scripts`** — named shortcuts for common commands, run with `npm run <name>` (or just `npm start`/`npm test` for those two specific conventional names). `npm run dev` runs whatever command is defined under `"dev"` above.

### Semantic versioning, and what `^` means

Package versions follow `MAJOR.MINOR.PATCH` (e.g., `19.2.1`) — major for breaking changes, minor for new backward-compatible features, patch for bug fixes. The `^` in `"^19.0.0"` means "this version or later, but not the next major version" — so npm/pnpm is allowed to install `19.3.0` automatically, but not `20.0.0`. A bare version with no `^` or `~` pins that exact version, no automatic updates at all.

### `node_modules`

Where all installed packages actually live on disk — every dependency, and every dependency-of-a-dependency, unpacked into files here. This folder is:

- **Regenerable** — never edit anything inside it by hand, and never commit it to Git (it belongs in `.gitignore`, and normally already is).
- **Often huge** — a "hello world" project can easily pull in hundreds of transitive dependencies.

### The lockfile

Alongside `package.json`, you'll see `package-lock.json` (npm), or, on this project specifically, `pnpm-lock.yaml` (pnpm — more below). `package.json` says "I want React version `^19.0.0`" — a range. The lockfile records the *exact* version that was actually resolved and installed, so that everyone on the team, and your deployment server, installs bit-for-bit the same dependency tree instead of "whatever satisfies the range today." **Always commit the lockfile.**

---

## 4. `nvm` — Node Version Manager

Different projects can require different Node versions, and "just install one Node globally" breaks the moment you're on two projects with incompatible requirements at once. `nvm` solves this by letting you install multiple Node versions side by side and switch between them per-project.

```powershell
nvm install 22          # install a specific Node version
nvm list                 # see installed versions
nvm use 22                 # switch the active version in this terminal session
```

Many projects include an `.nvmrc` file at the root — a single line naming the version the project expects (e.g., `22`). Running `nvm use` with no argument inside such a project reads that file and switches automatically, so you don't have to remember or guess which version a given project wants.

(Note: on Windows specifically, the tool is `nvm-windows`, a separate project from the Mac/Linux `nvm` — functionally similar, same core commands, different installer.)

---

## 5. Corepack — Managing the Package Manager Itself

Just like Node itself has versions, so does your **package manager** (npm, pnpm, yarn — more below), and pinning a specific one per-project matters for the same lockfile-consistency reasons.

**Corepack** ships with Node itself (no separate install) and manages package-manager versions without you installing them globally by hand:

```powershell
corepack enable          # turn Corepack on, one-time setup
```

Once enabled, a project's `package.json` can declare which package manager and version it expects:

```json
{
  "packageManager": "pnpm@9.12.0"
}
```

With that field present, running `pnpm` inside the project automatically uses exactly that version — Corepack fetches it transparently if it's not already available locally. You don't manually install pnpm at all; Corepack is the thing standing in front of it, making sure everyone on the team (and CI) is running the identical version the project was built against.

---

## 6. pnpm — The Package Manager This Project Uses

**pnpm** is a drop-in alternative to npm — same core commands, same `package.json`/dependency model — with a fundamentally different storage strategy underneath.

### Why pnpm instead of npm

npm (and originally yarn) install a full, separate copy of every package into every project's `node_modules`. If you have ten projects all using React, you have ten full copies of React on disk.

pnpm keeps a single **content-addressable store** on your machine — one real copy of each package version, ever — and uses filesystem links to make it appear inside each project's `node_modules`. Same dependencies, dramatically less disk usage, and meaningfully faster installs once that global store is warm.

pnpm is also **stricter** in a way that catches real bugs: npm historically let a project accidentally `import` a package it never declared in its own `package.json`, as long as *something else* in the tree happened to depend on it (a "phantom dependency"). pnpm's linking structure makes that fail loudly instead of silently working until someone else's install doesn't happen to include that indirect package.

### Commands you'll actually use

```powershell
pnpm install              # install everything listed in package.json (also just `pnpm i`)
pnpm add <package>          # add a new dependency, e.g. pnpm add zod
pnpm add -D <package>         # add a new devDependency, e.g. pnpm add -D eslint
pnpm remove <package>           # remove a dependency
pnpm run dev                     # run a script defined in package.json (also just `pnpm dev`, no `run` needed)
pnpm dlx <package>                 # run a package's CLI once without installing it into the project at all
```

`pnpm dlx` is worth knowing separately — it's for one-off tool invocations (a project scaffolder, a codemod) you don't want sitting in your dependency tree permanently.

---

## 7. Putting It Together: What Actually Happens

When you clone this project fresh and get it running, here's what's actually occurring, command by command:

```powershell
nvm use                # reads .nvmrc, switches to the Node version this project expects
corepack enable          # (one-time, machine-wide) lets Corepack manage package manager versions
pnpm install               # reads package.json + pnpm-lock.yaml, downloads/links exact dependency versions into node_modules
pnpm dev                     # runs the "dev" script from package.json — for this project, starts the Next.js dev server
```

None of this is magic anymore — `.nvmrc` is a text file with a version number in it, `pnpm install` is populating a folder based on a manifest and a lockfile, and `pnpm dev` is just running a named shell command. The next guide (Next.js) is where `pnpm dev` actually starts producing something you can look at in a browser.

---

## 8. Self-Check

1. What two things does "Node.js" actually bundle together?
2. What's the practical difference between CommonJS (`require`) and ES Modules (`import`), and what setting in `package.json` decides which one your `.js` files use?
3. Why should `node_modules` never be committed to Git, and what file *should* be committed to keep everyone's installed dependencies identical?
4. What problem does `nvm` solve that a single globally installed Node version can't?
5. What does Corepack actually manage, and how is that different from what `nvm` manages?
6. Name one concrete advantage pnpm has over npm.

If these are solid, you're ready for the Next.js guide — `pnpm dev` from Section 7 is where that one picks up.
