---

name: skill-architect

description: Creates, audits, simplifies, and fine-tunes skills for the master coding agent. Keeps skills narrowly scoped, useful, fast to apply, and non-overlapping.

---

# Skill Architect

Use this skill when creating, reviewing, restructuring, or optimizing skills used by the master agent.

The goal is to make the skill set **small, clear, effective, and fast**.

## When Creating a Skill

Determine:

* what capability the skill provides
* when master should apply it
* what knowledge belongs in the skill
* what belongs in repository context instead
* what boundaries the skill needs

Keep the skill focused on a single coherent capability.

Prefer a skill over a new agent when the capability can be applied directly by master without requiring an independent execution role.

## Skill Design Principles

### Keep skills small

A skill should contain only information that materially improves work in its domain.

Avoid:

* generic coding advice
* duplicated master instructions
* repository facts that can be discovered when needed
* long explanations of obvious behavior
* mandatory workflows for trivial cases
* unnecessary output templates

### Optimize for execution speed

Skills should help master act faster, not force additional process.

Avoid unnecessary:

* exploration
* planning
* validation
* documentation
* tool calls
* checkpoints
* handoffs

Prefer conditional guidance:

> "When X occurs, do Y."

over unconditional procedures:

> "Always perform X, Y, and Z."

### Define clear boundaries

Every skill should make clear:

* what it handles
* what it does not handle
* when it should be used
* which adjacent concerns belong elsewhere

Skills should not compete with each other.

When two skills overlap substantially, either merge them or establish a clear boundary.

### Preserve master ownership

Skills provide specialized knowledge and operating rules.

They do not become separate agents.

Do not add:

* agent identities
* handoff protocols
* completion reports
* peer-agent routing
* autonomous mission language

Master remains responsible for deciding, executing, integrating, and completing the task.

## Repository-Specific Information

Do not unnecessarily hard-code repository facts into reusable skills.

Prefer:

* stable domain principles in skills
* repository-specific paths and commands in repository instructions/context
* live documentation lookup for version-sensitive external APIs

Hard-code repository details only when they are genuinely necessary for the skill to function correctly.

## External Documentation

When a skill depends on version-specific external behavior:

* identify the relevant technology/version
* use authoritative documentation when available
* avoid relying on stale assumptions
* keep the skill's guidance version-appropriate

Do not copy large amounts of external documentation into a skill.

## Auditing Existing Skills

When reviewing a skill, check:

### Scope

Does it have one coherent purpose?

### Overlap

Does it duplicate another skill or master?

### Necessity

Does it contain information that actually improves execution?

### Cost

Does it force unnecessary reading, planning, tool calls, or validation?

### Clarity

Can master quickly determine when and how to apply it?

### Boundaries

Could it accidentally cause changes outside its intended domain?

### Accuracy

Are its technical claims still correct?

### Maintainability

Is the skill likely to remain useful as the repository evolves?

## Fine-Tuning

When optimizing an existing skill:

1. Preserve useful domain knowledge.
2. Remove duplicated master instructions.
3. Remove stale or repository-specific assumptions that do not belong there.
4. Replace unconditional procedures with conditional guidance where possible.
5. Remove unnecessary reporting and handoff behavior.
6. Simplify overly detailed instructions that do not materially affect outcomes.
7. Keep safety constraints that are genuinely relevant to the skill.
8. Ensure the resulting skill still covers its intended capability.

Prefer deleting instructions over adding instructions when removing friction improves behavior.

## Agent vs. Skill Decision

Use a **skill** when:

* master can perform the work itself
* the specialization is primarily knowledge/rules/patterns
* no independent lifecycle is required
* context switching does not require a separate execution role

Use a separate **agent** only when there is a genuine need for:

* independent execution
* isolation
* different tool permissions
* separate lifecycle
* autonomous parallel work
* a role that should not be performed directly by master

Default to a skill.

## Skill Quality Check

Before finalizing a skill, verify:

* its name matches its purpose
* its description clearly indicates when it applies
* it has one coherent domain
* it does not duplicate master unnecessarily
* it does not contain agent/handoff behavior
* it does not require unnecessary exploration
* it does not require unnecessary validation
* its technical guidance is accurate
* its boundaries are clear
* it improves execution rather than merely adding text

## Output

When creating or revising a skill, provide the complete skill definition rather than a discussion of the proposed changes.

When auditing without rewriting, identify:

* unnecessary instructions
* scope overlap
* stale assumptions
* execution-cost problems
* missing boundaries
* highest-impact improvements

## Goal

Build skills that make the master agent:

## **faster, more capable, more consistent, and no more complicated than necessary.**
