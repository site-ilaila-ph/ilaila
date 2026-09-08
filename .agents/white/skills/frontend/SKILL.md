---

name: frontend

description: Guidance for user-facing UI work including styling, layout, visual hierarchy, responsive behavior, accessibility, design-system consistency, and on-page SEO.

---

# Frontend

Use this skill for:

* component styling
* layout and spacing
* visual hierarchy
* typography and color
* responsive behavior
* design-system consistency
* accessibility
* interaction and visual polish
* on-page SEO

This skill is for the presentation layer. Keep business logic, backend behavior, and data access separate unless the UI change genuinely requires integration with them.

## Core Standards

### Responsive Design

UI changes should work across relevant:

* mobile
* tablet
* desktop

Do not optimize only for one viewport when the component can reasonably be used at others.

Prefer the existing responsive patterns and breakpoint conventions in the repository.

### Accessibility

Preserve or improve accessibility for every element being changed.

Pay particular attention to:

* semantic HTML
* accessible names
* keyboard navigation
* visible focus states
* sufficient color contrast
* sensible focus order
* appropriate ARIA
* form labels and error messaging
* touch target size
* dynamic content announcements where necessary

Do not remove focus indicators purely for aesthetics.

Do not replace semantic elements with generic containers when doing so harms accessibility.

### Component and Design-System Consistency

Reuse existing:

* design tokens
* spacing conventions
* typography
* colors
* component primitives
* variants
* utility functions

Before creating a new pattern, look for an existing one that already solves the problem.

For component variants, extend the repository's existing variant mechanism rather than introducing ad-hoc conditional styling.

Do not introduce new UI libraries, icon sets, fonts, or other dependencies unless the task requires them.

Use the repository's established icon system.

### Scope

Make the smallest coherent UI change that satisfies the request.

Do not turn a local styling request into a redesign.

Do not perform unrelated component cleanup or refactoring.

When a UI change crosses into application logic, preserve the existing data flow and make only the integration necessary for the requested behavior.

## Accessibility Audits

For a dedicated accessibility review, check:

### Perceivable

* text alternatives for meaningful non-text content
* sufficient contrast
* content reflow
* usable behavior at increased zoom/text size

### Operable

* keyboard accessibility
* visible focus
* logical focus order
* no keyboard traps
* appropriate target size
* alternatives to gesture-only interactions

### Understandable

* consistent navigation and controls
* clear labels
* useful validation errors
* actionable error messages
* consistent component behavior

### Robust

* appropriate name/role/value
* compatibility with assistive technologies
* dynamic state changes announced where appropriate

Flag common problems such as:

* non-descriptive links
* unlabeled icon-only controls
* keyboard traps
* inaccessible custom controls
* fixed layouts that prevent reflow
* autoplaying media without appropriate controls

## On-Page SEO

When the task involves SEO, prioritize actual technical issues rather than generic optimization advice.

### Critical

* crawl/index blockers
* conflicting robots directives
* broken canonical targets or canonical loops
* important broken internal links
* problematic redirect chains

### High

* missing or duplicate page titles
* missing or poor meta descriptions
* invalid heading structure
* missing or malformed structured data where appropriate
* significant performance regressions affecting important pages

### Medium

* weak alternative text
* weak anchor text
* orphaned pages
* thin or duplicated content
* keyword cannibalization

Keep SEO recommendations tied to the actual site structure and implementation.

## Implementation

Before changing a component:

1. Identify the existing component/token/pattern that most closely matches the requested UI.
2. Reuse it where practical.
3. Make the smallest coherent change.
4. Include responsive and accessibility behavior in the same implementation.
5. Check the resulting UI at relevant viewport sizes.

Do not invent a new design convention merely because it is technically convenient.

## Validation

Validate proportionally.

For visual changes, prefer actually inspecting the resulting UI when that capability is available.

For interactive changes, verify relevant:

* keyboard behavior
* focus behavior
* responsive behavior
* form states
* loading/error/empty states

For route-level changes, validate the affected route through the repository's normal development workflow when practical.

Run relevant lint/type/test checks when the change warrants them rather than automatically running every project gate.

Never claim a visual or accessibility check was performed when it was not.

## Decision Making

Use existing repository conventions whenever they resolve the design decision.

Ask for clarification only when an important product/design decision cannot reasonably be inferred from the existing UI.

Otherwise choose the simplest consistent implementation.

## Goal

Build interfaces that are:

## **consistent, responsive, accessible, visually coherent, and minimal in implementation complexity.**
