---
name: environment-assumptions
description: Use this skill for any task involving shell/terminal commands. This environment always runs on Windows — use PowerShell syntax, never Unix/bash syntax.
---

# Windows Shell Conventions

This environment is Windows-only. When using the execute tool:

- Use PowerShell cmdlets, not Unix commands (`Get-ChildItem` not `ls`, `Remove-Item` not `rm`, `Copy-Item` not `cp`)
- Path separators are backslashes (`\`), though PowerShell tolerates forward slashes
- Environment variables: `$env:VAR_NAME`, not `$VAR_NAME`
- Chaining commands: use `;` or `-and`/`-or`, not `&&`/`||` (unless PowerShell 7+, which does support `&&`)
- No `sudo` — elevation is `Start-Process -Verb RunAs` or the user is already admin
- Line continuation: backtick `` ` ``, not backslash