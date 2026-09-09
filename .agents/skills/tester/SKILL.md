---

name: tester

description: Guidance for writing, maintaining, running, and reviewing tests, including unit, integration, E2E, TDD, CI validation, and test-coverage analysis.

---

# Testing

Use this skill when:

* adding or changing tests
* fixing a bug that should gain regression coverage
* developing a feature with meaningful behavioral logic
* maintaining E2E tests
* validating CI/test gates
* reviewing test coverage or test quality
* investigating flaky tests

The goal is to provide tests that **meaningfully verify behavior without unnecessary test complexity**.

## Choosing the Test Level

Choose the narrowest test type that adequately verifies the behavior.

### Unit

Use for:

* isolated pure logic
* utility functions
* calculations
* transformations
* validation rules

### Integration

Use when behavior crosses boundaries such as:

* API handlers
* database operations
* authentication flows
* external service integration
* multiple application modules working together

### E2E

Use for critical user journeys where integration between the real application layers matters.

Do not add E2E coverage merely because a unit or integration test already verifies the behavior adequately.

Do not require every change to have all three test types.

## TDD

For new behavior or bug fixes where tests can naturally drive the implementation, prefer:

1. **Red** — write a test describing the desired behavior.
2. Run it and confirm it fails for the expected reason.
3. **Green** — make the smallest implementation that passes.
4. Run the test again.
5. **Refactor** — improve the implementation while keeping tests green.

TDD is a technique, not a reason to manufacture tests before trivial changes.

## Test Behavior

Prefer testing observable behavior rather than implementation details.

Good tests should:

* have clear names
* contain meaningful assertions
* isolate relevant state
* avoid unnecessary coupling to implementation structure
* fail when the intended behavior breaks

Avoid:

* assertions that merely prove code executed
* brittle implementation-detail assertions
* shared mutable state between tests
* test-order dependencies
* excessive mocking that removes the behavior under test

## Edge Cases

Consider relevant cases such as:

* null/undefined values
* empty input
* boundary values
* invalid input
* error paths
* failed dependencies
* unusual characters and Unicode
* large inputs
* concurrency/race conditions

Do not test every theoretical edge case when it has no meaningful risk.

Prioritize cases that could realistically break the application's contract.

## E2E

When writing or maintaining E2E tests:

* prefer semantic and stable locators
* use test IDs when appropriate
* avoid brittle CSS/XPath selectors
* wait for actual application conditions rather than fixed sleeps
* isolate test data and state
* keep journeys focused on meaningful user behavior

Use page-object or equivalent abstractions when they genuinely improve maintainability.

Prioritize E2E coverage by risk and user impact.

When a test is flaky:

1. determine whether the flakiness is caused by the test or application
2. fix the underlying cause where possible
3. do not hide legitimate failures by simply weakening assertions
4. when temporary quarantine is necessary, document the reason and follow-up

Capture useful failure artifacts when the test framework supports them.

## CI and Validation

Before modifying CI/testing workflows:

* inspect the relevant workflow files
* inspect the package scripts they invoke
* use existing repository commands
* do not invent replacement commands

Run the narrowest relevant validation first.

For broader validation, use the repository's established CI pipeline.

Do not automatically run the entire pipeline after every small test edit when a focused test is sufficient.

Do not claim a test, gate, or CI check passed unless it was actually run or its result is otherwise directly available.

## Coverage Review

When reviewing coverage:

1. Identify changed behavior.
2. Map that behavior to existing tests.
3. Determine whether the tests would catch meaningful regressions.
4. Check assertions and isolation.
5. Identify gaps by importance.

Classify gaps as:

* **Critical** — important behavior is effectively untested.
* **Important** — meaningful regression risk remains.
* **Nice-to-have** — additional coverage would be useful but is not necessary.

Also identify genuinely strong existing coverage rather than reporting only deficiencies.

## Test Failures

When a test fails:

* determine whether the failure is in the application or test
* reproduce it
* inspect the failure and relevant code
* avoid changing a test merely to make it green unless the test is actually incorrect

For build/type failures preventing tests from running, use the debugging skill.

## Boundaries

This skill focuses on testing.

Use other skills for:

* application bugs → debugging skill
* general restructuring → refactoring skill
* database/schema design → database skill
* UI implementation → frontend skill
* deployment/CI infrastructure → deployment skill

Testing may expose problems in these areas; do not silently absorb unrelated architectural work.

## Goal

Tests should be:

## **behavior-focused, meaningful, deterministic, maintainable, and proportionate to the risk of the code they protect.**
