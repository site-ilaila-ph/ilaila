---

name: debugger

description: Guidance for diagnosing and fixing build failures, type errors, runtime failures, silent failures, swallowed errors, and dangerous fallback behavior with minimal, focused changes.

---

# Debugging

Use this skill when something is broken or behaving incorrectly, especially:

* build failures
* type-check failures
* compilation errors
* test failures caused by application code
* runtime errors
* silent failures
* swallowed exceptions
* dangerous fallback behavior
* missing error propagation
* configuration failures

The goal is to identify the actual cause and make the smallest correct fix.

## Diagnostic Workflow

### 1. Reproduce first

Run the narrowest relevant existing check or reproduce the failure directly.

Determine:

* what is failing
* where it fails
* whether the failure is deterministic
* whether the error is introduced by the current change

Do not start changing code based on assumptions.

### 2. Read the actual error

Use the complete error output, including:

* file and line
* stack trace
* error code
* type information
* preceding warnings that may explain the failure

Do not fix symptoms while ignoring the underlying cause.

### 3. Trace the failure

Follow the relevant execution path far enough to identify the source.

Inspect:

* callers
* inputs
* returned values
* relevant configuration
* imports/dependencies
* async boundaries
* error-handling boundaries

Do not explore unrelated parts of the repository.

### 4. Check common causes first

For build/type failures, quickly verify:

* generated artifacts are current
* dependencies are installed and compatible
* imports/exports are correct
* configuration matches the framework conventions
* Server/Client boundaries are valid
* path aliases resolve correctly
* environment/configuration required by the failing code exists

Use the repository's actual scripts and tooling.

When framework/library behavior is uncertain or version-specific, verify it against authoritative documentation rather than relying on memory.

### 5. Fix minimally

Prefer:

* correcting an incorrect type
* fixing an import/export
* adding a necessary null/undefined check
* correcting configuration
* fixing incorrect control flow
* restoring missing error propagation
* updating stale generated output through the normal repository workflow

Avoid:

* unrelated refactoring
* architecture changes
* stylistic rewrites
* renaming unrelated code
* opportunistic cleanup
* changing behavior beyond what is necessary to fix the failure

If the correct fix requires architectural changes, stop treating it as a minimal debugging fix and escalate the design decision to the master agent.

## Silent Failure Hunting

Look specifically for failure modes that make broken behavior appear successful.

### Swallowed errors

Watch for:

* empty `catch` blocks
* catches that ignore the exception
* errors converted to `null`, `undefined`, or empty collections without justification
* promises whose rejection is never handled

### Dangerous fallbacks

Be suspicious of defaults that conceal real failures, such as:

```ts
try {
  return await loadData();
} catch {
  return [];
}
```

A fallback is appropriate only when the absence/default value is genuinely valid behavior.

### Error propagation

Check for:

* lost original causes
* generic errors replacing useful context
* errors thrown across async boundaries without proper handling
* returning success after an operation failed
* partial operations without appropriate rollback or cleanup

Preserve useful error context and the original cause when rethrowing.

### Missing error handling

Pay attention to operations that can realistically fail:

* network requests
* database operations
* filesystem operations
* external services
* authentication/authorization boundaries
* transactions
* parsing and validation

Do not add elaborate error handling purely defensively. Handle failures that can occur and matter to the application's correctness.

### Logging

When logging is relevant, ensure the log contains enough context to diagnose the failure without exposing secrets or sensitive data.

Avoid:

* logging credentials
* logging tokens
* dumping sensitive request data
* logging the same error repeatedly without adding information

## Validation

After a fix:

1. Re-run the check that originally failed.
2. Run the smallest additional validation needed to detect regressions.
3. Confirm the original failure is actually resolved.
4. Stop once the relevant validation is clean.

Prefer focused validation over automatically running the entire project pipeline.

Do not treat unrelated pre-existing failures as part of the fix.

## Scope

This skill is for **diagnosis and minimal correction**.

Do not use it to:

* restructure working code
* redesign architecture
* perform general cleanup
* optimize performance without a demonstrated performance problem
* implement unrelated features
* rewrite tests merely for style

When the investigation reveals a larger design problem, preserve the evidence and let the master agent handle the broader change.

## Goal

Find the root cause, fix it with the smallest appropriate change, and verify that the failure is gone.

## **Diagnose precisely. Patch minimally. Validate directly.**
