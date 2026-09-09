# Queryable Commits Convention (QC)

Queryable Commits (QC) is a lightweight commit message specification designed to keep Git histories systematic, human-readable, and instantly queryable using standard shell tools (like `grep`).

It provides a simpler, action-oriented alternative to **Conventional Commits** by removing unnecessary verbosity while preserving strict machine parsability.

---

## 1. Syntax Overview

Queryable Commits supports two syntax modes depending on whether the action applies to a specific functional scope or the repository as a whole.

### Scoped Actions

Used when changes target a specific module, domain, or feature group.

```text
action<scope>: summary

```

### Unscoped Actions

Used for global changes, repository maintenance, or documentation that isn't tied to a single feature scope.

```text
action: summary

```

---

## 2. Action Definitions

Actions are divided into **Scoped** and **Unscoped** categories to enforce a clear boundary between domain-specific features and general repo upkeep.

### Scoped Actions

| Action | Purpose | Example |
| --- | --- | --- |
| `added` | Introduced a new feature or subfeature | `added<auth>: google oauth login flow` |
| `updated` | Modified existing feature behavior | `updated<billing>: stripe webhook timeout to 10s` |
| `removed` | Deleted a feature, endpoint, or component | `removed<ui>: legacy navigation drawer` |
| `fixed` | Resolved a bug in a feature or subfeature | `fixed<cart>: correct tax calculation on checkout` |

### Unscoped Actions

| Action | Purpose | Example |
| --- | --- | --- |
| `maintenance` | Tooling, dependencies, refactoring, or CI pipelines | `maintenance: upgrade typescript to v5.5` |
| `docs` | Documentation changes or additions | `docs: update setup guide in README` |
| `security` | Security patches outside of dependency upgrades | `security: sanitize user input on search box` |

---

## 3. Scope Definition

A **Scope** represents a high-level functional feature group or logical module in your application.

* **Examples:** `<auth>`, `<billing>`, `<search>`, `<notifications>`, `<users>`
* **Rule:** Keep scopes broad and domain-oriented rather than file-oriented (e.g., use `<auth>` instead of `<LoginButton.tsx>`).

---

## 4. Multiline Commit Structure

When extra context is required beyond the single-line summary, structure the commit into three distinct sections separated by blank lines.

```text
[Header]

[Body]

[Trailer]
```

### Breakdown of Sections

#### **Header**

The single-line summary adherence to the `action<scope>: summary` or `action: summary` syntax. Must remain under 50–72 characters.

#### **Body**

Freeform human-readable context explaining **why** the change was made and any relevant trade-offs. Free from rigid machine-parsing rules.

#### **Trailer**

HTTP-style key-value metadata blocks placed at the foot of the message, adhering to RFC 822 key-value pair mechanics for automated tools and platform tracking.

### Complete Multiline Example

```text
added<auth>: google oauth login flow

Implemented token verification via Google API v2 to support single sign-on.
Reduces login friction for new user onboarding.

Fixes: #123, #456
Co-authored-by: Jane <jane@ex.com>
Signed-off-by: Bob <bob@ex.com>
```