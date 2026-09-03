---
name: pnpm-check-scripts
description: Check script names before assuming scripts. Never guess pnpm script names (dev, start, build, test, etc) — always verify against package.json first, since naming varies by project.
---

# Skill Instructions

Never assume a script name exists just because it's common (`dev`, `start`, `build`, `test`, `lint`). Project conventions vary — verify first.

Step 1: RUN IN POWERSHELL, replacing `<project_root>` with the actual project root path:

```powershell
cd <project_root>; node -e "const packageJSON=require('./package.json'); console.log(JSON.stringify(packageJSON.scripts ?? {}));"
```

Step 2: Match the requested action (e.g. "run dev server", "run tests") against the actual keys returned — not against a guessed default name.

Step 3: Run the confirmed script with `pnpm <script>`.

## Rules

- Do not run `pnpm dev`, `pnpm start`, `pnpm build`, etc. without having first confirmed that key exists in `scripts`.
- If the intended action has no obviously matching script name, ask or report available scripts rather than guessing the closest-sounding one.