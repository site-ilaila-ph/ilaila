---
name: environment-assumptions
description: Use this skill for any task involving shell/terminal commands. This environment always runs on Linux — use bash syntax, never PowerShell syntax.
---

# Linux Shell Conventions

This environment is Linux-only. When using the execute tool:

- Use standard Linux bash commands (`ls`, `rm`, `cp`, `mv`, `grep`, `find`)
- Path separators are forward slashes (`/`)
- Environment variables: `$VAR_NAME`
- Chaining commands: `&&`, `||`, `;`
- Line continuation: `\`