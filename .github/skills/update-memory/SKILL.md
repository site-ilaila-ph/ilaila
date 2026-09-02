---
name: update-memory
description: Modify or correct an existing entry in .github/tmp/agent-memory.md in place, rather than adding a new line. Use when new information contradicts or supersedes a recorded fact.
tools: [read/readFile, edit/editFiles]
---

# update-memory

Replace the content of a specific existing entry in `.github/tmp/agent-memory.md` without duplicating it elsewhere.

## Input expected
- `section`: one of `Conventions`, `Known Issues`, `Recent Activity`
- `match`: text or keyword identifying which existing entry to update
- `new_entry`: the corrected/updated fact text

## Steps
1. Read `.github/tmp/agent-memory.md`.
2. Locate the target section and search its bullets for one matching `match`.
3. If no matching entry is found, stop and report "no matching entry found" — do not create a new one (that's `add-memory`'s job).
4. If more than one entry matches, stop and report the ambiguous matches for disambiguation rather than guessing.
5. If exactly one match: replace that bullet's text with the new entry, keeping the format:
   `- YYYY-MM-DD: <new_entry>`
   using today's date (not the original entry's date) to reflect when it was last confirmed accurate.
6. Save the file. Report what was changed, from what to what.