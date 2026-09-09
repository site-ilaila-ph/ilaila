---

name: optimizer

description: Guidance for profiling and optimizing runtime performance, rendering, memory usage, database and network efficiency, and bundle size.

---

# Performance

Use this skill when:

* code is slow
* users report performance problems
* bundle size has grown
* rendering is unnecessarily expensive
* memory usage grows unexpectedly
* queries or network requests are inefficient
* a dedicated performance review is requested

The goal is to improve performance **without changing intended behavior**.

## Core Principle

**Measure first. Optimize second. Measure again.**

Do not optimize based solely on assumptions or stylistic preferences.

Prefer a measured bottleneck over a theoretically inefficient pattern that has no meaningful impact.

## Profiling

Start by identifying the relevant performance dimension:

* server/runtime execution
* browser rendering
* JavaScript execution
* bundle size
* database queries
* network latency
* memory usage

Use the profiling and measurement tools appropriate to the stack.

Examples include:

* browser performance/devtools profiling
* framework profiling
* production/build statistics
* database query plans and timings
* runtime profiling
* memory snapshots

Record a baseline when practical.

## Algorithmic Performance

Look for avoidable computational costs such as:

* nested iteration over large datasets
* repeated linear searches
* unnecessary repeated sorting
* repeated expensive transformations
* unnecessary deep cloning
* repeated parsing/serialization
* expensive work performed inside frequently executed loops

Prefer appropriate data structures such as maps and sets when they materially reduce lookup cost.

Do not replace straightforward code with complex algorithms without evidence that the complexity matters.

## Rendering Performance

For component-based UIs, investigate:

* unnecessary re-renders
* expensive calculations during rendering
* unstable props causing avoidable child renders
* unnecessarily large rendered lists
* heavy components loaded when they are not needed
* missing route/component boundaries for code splitting

Potential techniques include:

* memoizing genuinely expensive computations
* stabilizing values when reference identity causes measurable work
* virtualizing genuinely large lists
* lazy loading heavy components
* moving expensive work out of render paths

Do not add `memo`, `useMemo`, or `useCallback` mechanically.

Use them when profiling or clear component behavior shows they provide value.

Use stable unique keys for dynamic lists. Avoid array indexes when list order or membership can change.

## Bundle Performance

Investigate:

* unnecessarily large dependencies
* importing more of a library than required
* duplicate dependencies
* unused code
* unnecessarily eager imports
* missing code-splitting opportunities

Prefer simple changes with measurable benefit.

Do not replace a dependency solely because another option is theoretically smaller when the actual bundle impact is negligible or the replacement increases complexity.

## Database Performance

When database access is a bottleneck:

* inspect query count
* inspect query latency
* look for N+1 patterns
* select only required data
* batch independent/related operations where appropriate
* paginate large datasets
* verify indexes support important access patterns
* inspect query plans when appropriate

Coordinate schema/index changes with the database skill when they go beyond a localized query improvement.

Do not add indexes speculatively without considering actual query patterns and write/storage cost.

## Network Performance

Look for:

* sequential independent requests
* redundant requests
* unnecessarily large payloads
* missing caching
* excessive polling
* rapid repeated requests
* avoidable round trips

Potential improvements include:

* parallelizing independent work
* batching requests
* appropriate caching
* debouncing high-frequency interactions
* reducing payload size

Preserve correctness, invalidation behavior, and failure semantics.

## Memory

Look for patterns such as:

* event listeners without cleanup
* timers/subscriptions without cleanup
* unbounded caches
* collections that continually grow
* retained references to large objects
* resources that are not released

Confirm that the suspected retention path actually exists before changing lifecycle behavior.

## Performance Targets

Use real project requirements and measured baselines as the primary targets.

General web performance guidance can be used as a reference, but do not treat generic thresholds as mandatory acceptance criteria for every feature.

Focus on:

* regressions
* user-visible latency
* critical-path performance
* resource usage
* measurable improvements relative to baseline

## Workflow

1. Reproduce or measure the performance issue.
2. Establish a baseline when practical.
3. Identify the highest-impact bottleneck.
4. Determine the likely cause using evidence.
5. Apply the smallest targeted optimization.
6. Measure again.
7. Verify behavior has not changed.
8. Stop when the bottleneck is sufficiently addressed.

Do not optimize unrelated code while working on a specific performance problem.

## Validation

Use the narrowest meaningful validation.

Examples:

* rendering change → compare render behavior/performance
* bundle change → compare build output
* query change → compare query count/latency/plan
* runtime change → compare execution time or resource usage
* memory change → compare retained resources/snapshots

Run relevant tests and type checks when appropriate.

Do not claim an improvement without measuring it when measurement is reasonably available.

Distinguish clearly between:

* measured impact
* estimated impact
* no available measurement

## Scope

This skill covers performance optimization.

Use other skills for the underlying concern when appropriate:

* database schema/migrations → database skill
* visual design/accessibility → frontend skill
* correctness failures → debugging skill
* general restructuring → refactoring skill

Performance considerations may still inform those changes, but do not expand a performance task into unrelated work.

## Goal

Make the application:

## **measurably faster, lighter, and more efficient without unnecessary complexity or behavioral changes.**
