# pnpm

The Node.js Fundamentals guide introduced pnpm briefly — what it is, why it exists instead of npm, and the handful of commands you'd use daily. This guide goes further: the parts of pnpm you'll actually run into on a real, ongoing project, not just the first `pnpm install`.

---

## 1. Quick Recap

pnpm is a package manager — same role as npm, same `package.json`, same fundamental idea of "declare what you depend on, install it." The difference that matters: instead of copying a full, separate set of dependency files into every project's `node_modules`, pnpm keeps one real copy of each package version in a global, content-addressable store on your machine, and links it into each project. Less disk space, faster installs, and it happens to catch a class of bug npm doesn't (covered next).

---

## 2. The Command Set, In Full

```powershell
pnpm install              # install everything from package.json + pnpm-lock.yaml (alias: pnpm i)
pnpm add <package>          # add a new dependency
pnpm add -D <package>         # add a new devDependency (alias: --save-dev)
pnpm add -E <package>           # install and pin the EXACT version, no ^ range (alias: --save-exact)
pnpm add -g <package>              # install globally, available as a CLI command anywhere (alias: --global)
pnpm remove <package>                # remove a dependency (alias: pnpm rm, pnpm un)
pnpm update                            # update dependencies within their allowed semver ranges
pnpm update <package>                    # update just one
pnpm update --latest                       # ignore the ^ range and update to the actual latest, including breaking changes
pnpm outdated                                # list what's installed vs. what's actually available
```

`pnpm update --latest` is worth treating with real caution — it deliberately ignores the version ranges declared in `package.json` and can pull in breaking changes. Regular `pnpm update` respects the `^`/`~` ranges from the Node.js guide and is the safe default.

### Running things

```powershell
pnpm run dev            # run the "dev" script from package.json
pnpm dev                  # same thing — "run" is optional for script names that don't collide with a real pnpm command
pnpm exec <command>          # run a locally-installed CLI tool's binary, from this project's node_modules/.bin
pnpm dlx <package>              # run a package's CLI once, without installing it into the project at all
```

`pnpm exec` vs `pnpm dlx` is a real, useful distinction: `exec` runs something already declared as a dependency of this project (so everyone on the team gets the same version, from the lockfile). `dlx` fetches and runs something on the fly, for a one-off task, without adding it to `package.json` at all — a scaffolding tool you'll run once, not something the project depends on going forward.

---

## 3. Reading `pnpm-lock.yaml`

You don't need to hand-edit this file, ever — but you should recognize what it's for when you see it in a diff. It records the exact, resolved version of every package and every one of *their* dependencies (the full transitive tree), so `pnpm install` produces bit-for-bit identical `node_modules` on any machine, regardless of what's newly published upstream since the last install.

**Always commit `pnpm-lock.yaml`.** If you see it change in your `git diff` after running `pnpm add` or `pnpm install`, that's expected and correct — stage it and commit it along with your `package.json` change, in the same commit. A `package.json` change without a matching lockfile update is a red flag in review — it usually means someone edited the file by hand instead of using `pnpm add`/`pnpm remove`.

If `pnpm-lock.yaml` and `package.json` ever disagree (someone hand-edited one without the other), `pnpm install` will complain rather than silently guessing. Fix the mismatch by re-running the correct `pnpm add`/`remove` command instead of editing either file by hand.

---

## 4. Why pnpm Sometimes Refuses to Install Something: Phantom Dependencies

Briefly mentioned in the Node.js guide, worth seeing directly here. Suppose your project uses `left-pad`, and `left-pad` itself happens to depend on `some-helper`. With npm's older, flatter `node_modules` structure, your own code could `import "some-helper"` directly — it would work, because it happened to physically be there — even though you never declared it in your own `package.json`.

pnpm's linking structure doesn't allow this: only packages you've actually declared as dependencies are importable from your own code. If you try to import something you never `pnpm add`ed, it fails, loudly, immediately — even if some other dependency happens to also use it. This is deliberate. The fix is always the same: `pnpm add` the thing you're actually using directly, rather than relying on it being there by accident.

---

## 5. Approving Build Scripts

Some packages run scripts during installation (compiling native code, downloading a binary) — a real and historically abused vector for supply-chain attacks (a malicious package running arbitrary code the moment it's installed). pnpm, by default, **blocks these install scripts** until you explicitly approve them:

```powershell
pnpm approve-builds
```

This opens an interactive list of packages requesting to run install scripts — you choose which to allow. If something you just installed seems to be missing a compiled piece, or a postinstall step didn't run, this is very often why — check `pnpm approve-builds` before assuming something else is broken. This is a real, deliberate difference from npm's historical default of just running everything automatically, and it's a genuine security improvement, not friction for its own sake.

---

## 6. `.npmrc` — Project-Level pnpm Configuration

A `.npmrc` file (the name is historical, shared with npm; pnpm reads the same format) at the project root configures pnpm's behavior for that project specifically:

```ini
auto-install-peers=true
strict-peer-dependencies=false
```

You won't usually create this yourself — but recognize it as pnpm's project-level config file when you see it, the same category of thing as `.vscode/settings.json` from the VS Code guide: checked into the repo, shared team-wide, not personal.

---

## 7. Peer Dependencies

Some packages don't bundle their own copy of a dependency — they expect *you* to have a compatible version installed already, and declare that expectation as a **peer dependency**. React component libraries do this constantly: they need React to exist in your project, but don't want to install their own separate copy of it (you'd end up with two React instances, which genuinely breaks things).

```
WARN  Issue with peer dependencies found
your-project
├─┬ some-ui-library
│ └── ✕ unmet peer react@^18.0.0: found 17.0.2
```

A warning like this means: `some-ui-library` expects React 18+, but your project has React 17 installed. Not always fatal, but worth actually reading rather than reflexively ignoring — a peer dependency mismatch is a common, real source of confusing runtime bugs (two copies of a library, or an incompatible version silently in use) that show up nowhere near where the actual problem is.

---

## 8. Workspaces (Monorepos)

If a repository contains multiple packages that depend on each other — a shared `ui` package, an `api` package, a `web` app all in one repo — pnpm supports **workspaces**, declared in a `pnpm-workspace.yaml` at the repo root:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

This tells pnpm to treat every folder matching those patterns as its own package, installable and linkable against each other from a single `pnpm install` at the root. You may or may not encounter this depending on how this specific project is structured — mentioned here so the term isn't a mystery if you see `pnpm-workspace.yaml` or a `--filter` flag in a command:

```powershell
pnpm --filter web dev          # run the "dev" script, but only in the package named "web"
pnpm --filter "./packages/*" build   # run "build" across every package matching this path pattern
```

---

## 9. Managing the Store Directly

```powershell
pnpm store path        # where the global content-addressable store actually lives on disk
pnpm store prune         # remove packages from the store no longer referenced by any project
```

You'll rarely need these day to day — mentioned so that if disk space genuinely becomes a concern, or something in the store seems corrupted, you know these exist rather than reaching for manually deleting `node_modules` folders and hoping.

---

## 10. When Something Seems Broken

A short, genuinely useful troubleshooting order before assuming something is deeply wrong:

1. `pnpm install` again — confirms you're not just out of sync with a `package.json`/lockfile change someone else made.
2. Check `pnpm approve-builds` — a blocked install script is a common, silent cause of "this package doesn't seem to work."
3. Delete `node_modules` and reinstall (`Remove-Item -Recurse node_modules` from the PowerShell guide, then `pnpm install`) — resolves most genuinely corrupted local state, since the store itself is separate and untouched.
4. Only as a last resort, `pnpm store prune` and reinstall — this touches the shared global store, not just this project.

---

## 11. Self-Check

1. What's the practical difference between `pnpm exec` and `pnpm dlx`?
2. Why should `pnpm-lock.yaml` always be committed alongside a `package.json` change, in the same commit?
3. What is a "phantom dependency," and how does pnpm's structure prevent it?
4. Why does pnpm block install scripts by default, and what command approves them?
5. What problem do peer dependencies solve, and what does a peer dependency warning actually mean?
6. What does `pnpm-workspace.yaml` declare, and what does `--filter` do with it?