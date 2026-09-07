# Abstraction and DRY

Two ideas underneath almost everything else in this curriculum, made explicit now that you've actually used them dozens of times without them being named. This isn't new material so much as it's naming a pattern you've already been living in.

---

## 1. What Abstraction Actually Is

**Abstraction is hiding complexity behind a simpler interface, so the person using it doesn't need to understand — or even think about — what's happening underneath.**

The clearest way to see it is to build one yourself. Say three different components each need to display a user's initials next to their avatar, and each one does this inline:

```tsx
// Before — the same logic, written out fresh in three different places
function UserBadge({ name }: { name: string }) {
  const initials = name.trim().split(/\s+/).map(part => part[0]).join("").toUpperCase().slice(0, 2);
  return <span>{initials}</span>;
}

function CommentAuthor({ name }: { name: string }) {
  const initials = name.trim().split(/\s+/).map(part => part[0]).join("").toUpperCase().slice(0, 2);
  return <span>{initials}</span>;
}
```

Nobody reading `CommentAuthor` actually cares about `.split(/\s+/)` or `.slice(0, 2)` — that's incidental detail in the way of what the component is really trying to say: "show this person's initials." Pull it out:

```typescript
// src/lib/get-initials.ts
export function getInitials(name: string): string {
  return name.trim().split(/\s+/).map(part => part[0]).join("").toUpperCase().slice(0, 2);
}
```

```tsx
// After — the messy detail is hidden behind a name that says what it does
function UserBadge({ name }: { name: string }) {
  return <span>{getInitials(name)}</span>;
}
```

That's a real abstraction, one you built yourself: `getInitials(name)` is the simple interface; the regex, the mapping, the truncation are the complexity now hidden behind it. Every caller gets to think in terms of "initials," never in terms of string manipulation — exactly the same relationship `prisma.user.findMany()` has to SQL, just at a much smaller, everyday scale, and one you're the actual author of rather than something a library handed you.

A few more, all things you'd plausibly write yourself on this project rather than import:

- **A `useDebounce` custom hook** — hides `setTimeout`/`clearTimeout` timing logic and cleanup behind a value that just "settles" after the user stops typing. Every search box that uses it never has to think about timers again.
- **A `formatCurrency(cents)` helper** — hides `Intl.NumberFormat`'s verbose configuration behind one call; every place displaying a price just calls it, without re-deriving the right locale/currency options each time.
- **A `Card` component** (Tailwind guide, Section 8) — hides a long, specific `className` string behind `<Card>`; every usage site thinks in terms of "a card," never in terms of the exact utility classes that produce one.

Every one of these is the same move: find some genuinely fiddly detail, give it a name that describes *what* it does rather than *how*, and let everyone else in the codebase stop thinking about the how.

---

## 2. Layers, Not a Single Trick

Abstraction isn't a one-time move — it's layers, each one built on the layer below, each one hiding that layer's complexity from the layer above. `getInitials` sits on top of plain JavaScript string methods; a component using `getInitials` sits on top of that; a page rendering that component sits on top of *that*. The stack goes further than your own code too:

```
Your component's onClick handler
        ↓ hides
useState's internals
        ↓ hides
React's reconciliation algorithm
        ↓ hides
Browser DOM APIs
        ↓ hides
The browser's actual rendering engine
```

You've climbed exactly this kind of stack throughout this curriculum, deliberately, in order: PowerShell hides raw system calls, Node hides V8's internals, pnpm hides manually managing dependency files, Tailwind hides hand-written CSS, Prisma hides SQL, `toServerAction()` (once you see it) will hide raw `"use server"` boilerplate. Each layer is a real abstraction over the one below it — and notably, **this curriculum taught you the layer underneath nearly every abstraction it gave you** (CSS before Tailwind, JS before JSX, raw Server Actions before `toServerAction()`). That was deliberate: abstractions occasionally leak — behave in a way that only makes sense if you understand what's underneath — and when that happens, the only way out is knowing the layer you've been insulated from.

---

## 3. DRY: Don't Repeat Yourself

**DRY means: a given piece of knowledge or logic should exist in exactly one place in your codebase — not copy-pasted anywhere it's needed.**

This is subtly different from just "don't write the same lines of code twice" — it's specifically about **knowledge**. Two pieces of code can look textually different but represent the same underlying fact; DRY is violated when that one fact has to be updated in multiple places to stay correct.

You've already built real DRY fixes, more than once:

- **`z.infer<typeof UserSchema>`** (Zod guide, Section 4) — instead of maintaining a Zod schema *and* a separate hand-written `interface User` that has to be kept in sync by hand forever, the type is derived from the schema. One source of truth; the interface can't drift from the validation because it's not a separate thing at all.
- **Custom hooks** (React Fundamentals, Section 11) — `useWindowWidth` exists specifically because the same `useState`+`useEffect`+listener pattern showing up in multiple components is the same knowledge ("how do I track window width") duplicated. Extracting the hook means that knowledge lives in one place; every component that needs it just asks for it.
- **Component extraction** (Tailwind guide, Section 8) — a `Button` component with a long `className` exists so that "what a button looks like" is one fact, defined once, instead of the same utility-class string pasted at every call site, silently drifting apart the moment someone edits one copy and not the others.
- **`toServerAction()`** (once you see the real guide) — almost certainly exists because the `safeParse`-then-structured-result pattern from the Server Actions guide was the same knowledge repeated at the top of every single action. Wrapping it means that pattern is defined once, not reimplemented per action.

Every one of these is the same move: find the same knowledge showing up more than once, and give it exactly one home.

---

## 4. DRY Is Not Absolute — the Danger of Abstracting Too Early

Here's the part that's easy to miss if DRY sounds like an unconditional rule: **duplicating something twice is often completely fine.** The real risk isn't under-abstracting — it's abstracting *too early*, on the wrong thing, before you actually know what the shared knowledge really is.

A common trap: two pieces of code look structurally similar today, so you extract a shared function or component to "avoid repeating yourself" — but they're similar by coincidence, not because they represent the same underlying concept. The moment one of them needs to change for a reason the other doesn't, you're stuck: either you add a parameter that only makes sense for one caller (the abstraction gets uglier and more confusing every time this happens again), or you break the abstraction back apart, having paid the cost of building and then unwinding it.

This is the same caution the React Fundamentals guide gave for `useMemo`/`useCallback`: **premature use is a real, common code smell, not a sign of foresight.** A rough guideline worth internalizing (sometimes called the "rule of three"): tolerate duplication the first time, and often even the second — extract the shared abstraction once you're looking at a *third* occurrence and can see, concretely, what's actually the same across all of them. By the third instance, you're abstracting from real evidence instead of a guess.

---

## 5. Telling the Two Cases Apart

Ask, before extracting anything: **if I change this abstraction for one caller's sake, does that change make sense for every other caller too?**

- If yes — genuinely the same knowledge, just expressed in multiple places — DRY it up. That's a `useWindowWidth`, a `Button`, a `z.infer`.
- If no — the similarity was coincidental, and forcing them together just means every future change has to thread a needle between callers that never actually wanted the same thing — leave them separate, even if it means a few duplicated lines.

Duplicated code is a cost you can see immediately (a few extra lines) and undo easily (extract it later, once the pattern is confirmed). A wrong abstraction is a cost you often don't see until much later, and it's considerably more expensive to undo, because by then several things depend on it. Given the choice under uncertainty, slight duplication is usually the cheaper mistake.

---

## 6. Self-Check

1. In your own words, what does "abstraction" mean — not "hiding code," but hiding what, from whom, and why?
2. Why is `prisma.user.findMany()` a good example of an abstraction, specifically?
3. Why is DRY described as being about "knowledge," not just "identical lines of code"?
4. What specific repeated knowledge did extracting a custom hook like `useWindowWidth` eliminate?
5. What's the actual risk of abstracting two pieces of code together too early — what does it cost you if they turn out not to be the same thing after all?
6. What's the "rule of three," and why is the third occurrence a meaningfully better time to abstract than the first?
7. What's the one question worth asking before extracting a shared abstraction from two similar-looking pieces of code?

---

If you've worked through this one, you've made it through nearly the entire curriculum — from not knowing what a terminal's current directory was, to writing typed Server Actions validated with Zod, querying a real database through Prisma, and now naming the actual design instinct (abstraction, DRY, knowing when *not* to abstract) that separates code that's pleasant to work in from code that isn't. That's a genuinely large amount of ground covered. Well done getting here.