---
name: add-memory
description: Append a new entry to a section of .github/tmp/agent-memory.md. Use when a new durable fact, convention, or known issue is discovered.
tools: [read/readFile, edit/editFiles]
---

# add-memory

Append one entry to the specified section of `.github/tmp/agent-memory.md`. Never create duplicate facts — if an equivalent entry already exists in that section, skip the write and report that it was already present instead.

## Input expected
- `section`: one of `Conventions`, `Known Issues`, `Recent Activity` (create the section header if the file or section doesn't exist yet)
- `entry`: the fact to record, as plain text

## Steps
1. Read `.github/tmp/agent-memory.md`. If it doesn't exist, create it with the standard structure:
```markdown
   # Project Memory

   ## Conventions

   ## Known Issues

   ## Recent Activity
```
2. Locate the target section.
3. Check existing entries in that section for near-duplicates of the new entry. If one exists, stop and report "already recorded" — do not write.
4. Otherwise append a new bullet under that section, dated:
   `- YYYY-MM-DD: <entry>`
5. If the section is `Recent Activity` and it now has more than 10 entries, trim the oldest down to 10 before writing.
6. Save the file. Report what was added and where.