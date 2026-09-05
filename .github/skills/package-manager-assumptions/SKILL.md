---
name: package-manager-assumptions
description: Use this skill before running any install, add, remove, or script command in this project. The package manager is always pnpm — never npm or yarn.
---

# Package Manager: pnpm

This project always uses **pnpm**. Never default to `npm` or `yarn` — do not check for `package-lock.json` or `yarn.lock` as the deciding factor; pnpm is fixed for this environment.

## Commands

| Action | Command |
|---|---|
| Install all deps | `pnpm install` |
| Add a package | `pnpm add <pkg>` |
| Add a dev dependency | `pnpm add -D <pkg>` |
| Remove a package | `pnpm remove <pkg>` |
| Run a script | `pnpm <script>` (not `pnpm run` — both work, but prefer the short form) |
| Run a one-off binary | `pnpm dlx <pkg>` (not `npx`) |
| Execute within workspace | `pnpm --filter <workspace> <command>` |

## Rules

- Never generate or modify `package-lock.json` or `yarn.lock` — only `pnpm-lock.yaml` is valid here. If either of those files appears, flag it as unexpected rather than working around it.
- Do not suggest `npm install` or `yarn add` in any output, including comments, docs, or command examples.
- If the project has workspaces, use `pnpm --filter` rather than `cd`-ing into a subpackage and running a local install.