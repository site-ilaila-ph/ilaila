---

name: refactor

description: Guidance for behavior-preserving code cleanup, readability improvements, dead-code removal, duplicate consolidation, and adherence to established code-style and abstraction conventions.

---

# Refactoring

Use this skill for:

* readability improvements
* simplifying existing code
* removing dead code
* removing unused dependencies/exports
* consolidating duplication
* reducing unnecessary abstraction
* improving naming and structure
* technical-debt cleanup
* consistency with established project conventions

The defining constraint is:

**Behavior must remain unchanged.**

## Core Principles

### Clarity over cleverness

Prefer code that is easier to read and understand over code that is merely shorter or more technically sophisticated.

### Preserve behavior

Do not change:

* public behavior
* data semantics
* error behavior
* side effects
* timing-sensitive behavior
* API contracts

unless the task explicitly requests a behavioral change.

Do not assume a refactor is behavior-preserving merely because the new code appears equivalent.

### Follow existing conventions

Use the project's established:

* naming conventions
* component patterns
* abstraction boundaries
* import style
* architectural boundaries
* formatting conventions

Look for existing patterns before introducing a new one.

### Refactor with purpose

Simplify code when the resulting implementation is genuinely easier to maintain.

Do not refactor merely because code could theoretically be written differently.

## Readability

Useful transformations include:

* extracting genuinely complex logic into well-named functions
* replacing deeply nested control flow with clearer structure
* simplifying unnecessarily complicated conditionals
* replacing confusing callback chains with clearer async control flow where behavior is preserved
* removing unnecessary intermediate abstractions
* using descriptive names
* breaking overly long expressions into understandable pieces
* removing nested ternaries when they harm readability

Do not mechanically apply these transformations.

The resulting code should be clearer than the original.

## Duplication

When consolidating duplicate logic:

1. Identify whether the implementations are actually behaviorally equivalent.
2. Determine which implementation best represents the shared behavior.
3. Extract or consolidate only the genuinely common portion.
4. Update all consumers.
5. Verify the behavior of affected callers.

Do not create a generic abstraction merely because two pieces of code look superficially similar.

## Dead Code

Use available static-analysis tooling when removing potentially unused:

* files
* exports
* dependencies
* imports
* variables
* functions

Classify candidates by confidence:

* **SAFE** — strong evidence of being unused
* **CAREFUL** — static analysis may miss dynamic or indirect usage
* **RISKY** — public API, runtime discovery, dynamic loading, or other uncertain usage

Before removing something, where relevant:

* search for references
* check dynamic/string-based usage
* check public exports
* consider configuration-driven usage
* inspect relevant tests
* inspect history when the reason for the code is unclear

Do not remove something solely because a static-analysis tool says it is unused when runtime discovery could still reference it.

## Cleanup

Appropriate cleanup can include:

* unused imports
* obsolete commented-out code
* stray debugging output
* redundant helpers
* unnecessary wrappers
* obviously unreachable code

Do not combine unrelated cleanup with a focused refactor unless it materially improves the same change.

## Abstraction

Avoid both extremes:

* duplicated logic that should clearly be shared
* abstractions whose complexity exceeds the duplication they remove

Be especially cautious with:

* single-use wrappers
* generic utilities created for one call site
* abstractions that obscure simple control flow

Prefer the simplest structure that remains clear and maintainable.

## Boundaries

Do not silently cross architectural boundaries while refactoring.

Be especially careful with:

* Server/Client boundaries
* API contracts
* database interfaces
* public exports
* routing boundaries
* shared component interfaces

A refactor that requires changing architecture or behavior is no longer a routine refactor.

## Validation

Validate behavior after meaningful refactoring.

Use the narrowest appropriate checks first.

Depending on the change, this may include:

* type checking
* linting
* focused tests
* relevant integration tests
* build validation

For dead-code or duplicate removal, verify that affected consumers still work.

Do not claim behavior was preserved without performing an appropriate validation.

Do not fix unrelated failures discovered during validation.

## When to Stop

Stop and let the broader implementation/design process handle the work when:

* the requested cleanup requires behavior changes
* the correct abstraction is unclear
* multiple architectural approaches are plausible
* the change requires redesign rather than simplification
* removing code could affect an unknown external consumer

Do not guess your way through an architectural decision.

## Goal

Produce code that is:

## **clearer, simpler, less duplicated, and easier to maintain — without changing what it does.**
