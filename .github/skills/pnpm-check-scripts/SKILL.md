---
name: pnpm-check-scripts
description: Tells you what are the pnpm scripts in the project. Use when unsure what scripts to use.
---

# Skill Instructions
Step 1: RUN IN POWERSHELL, replacing <project_root> with the actual project root path:
`cd <project_root>; node -e "const packageJSON=require('./package.json'); console.log(JSON.stringify(packageJSON.scripts ?? {}));"`