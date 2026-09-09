---
name: delete-memory
description: Remove an entry from .github/tmp/agent-memory.md. Use when a fact is stale, resolved, or no longer true (e.g. a known issue that's been fixed).
tools: [read/readFile, edit/editFiles]
---

# delete-memory

Remove a specific entry from `.github/tmp/agent-memory.md`. This is destructive — be conservative about matching.

## Input expected
- `section`: one of `Conventions`, `Known Issues`, `Recent Activity`
- `match`: text or keyword identifying which entry to remove
- `reason` (optional): why it's being removed, for the report back to the caller

## Steps
1. Read `.github/tmp/agent-memory.md`.
2. Locate the target section and search its bullets for one matching `match`.
3. If no matching entry is found, stop and report "no matching entry found" — nothing to delete.
4. If more than one entry matches, stop and report the ambiguous matches instead of deleting any of them.
5. If exactly one match: remove that bullet entirely.
6. Save the file. Report what was removed and, if provided, why.