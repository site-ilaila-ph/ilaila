<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-context -->
Reference `dev/docs/*` documentation if unsure.
<!-- END:project-context -->

<!-- BEGIN:agent-workflow-instructions -->
# Agent Workflow Instructions

## Reducing Distraction and Unnecessary Planning

All agents must stay within the user's stated goal, files, constraints, and requested output. Do not broaden the task, perform opportunistic cleanup, investigate unrelated code, or invent follow-up work. When an ambiguity blocks the requested work, ask one focused question; otherwise make the smallest change that satisfies the request.

-   **Direct tasks:** Act directly when the request is small, local, or has an obvious implementation path. Do not delegate navigation, explanation, a single-file change, a focused bug fix, a test run, or a simple configuration edit.
-   **Navigation tasks:** The `master` agent reasons through the repository directly when the user asks where code, files, directories, or related functionality lives.
-   **Complex tasks:** The `master` agent keeps an internal checklist and executes complex work itself; a written plan is only needed when the user asks for one.
-   **Specialists:** Choose the narrowest capable specialist. Do not chain agents for unrelated improvements. If a specialist discovers work outside its scope, report it instead of expanding the task.
-   **Completion:** Do not stop after planning, analysis, or a recommendation when the user asked for implementation. Continue through implementation and the narrowest available validation, then report only the requested outcome and relevant blockers.

## Master Agent Workflow

The `master` agent is the single general-purpose project agent. It may inspect, edit, test, and repair code directly, including navigation questions. It delegates only to the narrowest domain specialist when that specialist is materially better suited to the request. Domain specialists return their work to `master`.

## Branch And Commit Safety

- Never create a commit while the current branch is `main`.
- Before committing, verify the current branch with `git branch --show-current`.
- If the current branch is `main`, create or switch to a dedicated working branch first, then commit there.
- Do not switch branches or create a branch automatically when no commit has been requested; preserve the user's current worktree and branch.
<!-- END:agent-workflow-instructions -->