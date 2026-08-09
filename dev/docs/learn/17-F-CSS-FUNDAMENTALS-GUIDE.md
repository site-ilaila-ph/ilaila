# CSS Fundamentals (Read, Not Write)

This project styles everything with Tailwind — you won't be hand-writing `.css` files. But every Tailwind utility class is a thin, convenient skin over a real CSS property, and the Tailwind guide leaned on concepts (the box model, flexbox axes, the spacing scale) it never actually explained. This guide fills that in. Same relationship classes have to `lib/`: you won't write much of this yourself, but you need to genuinely understand it — to know what a utility class is actually doing, to read your browser's dev tools, and to make sense of the occasional real stylesheet (`globals.css`) that still exists in a Tailwind project.

---

## 1. What a CSS Rule Actually Is

```css
p {
  color: blue;
  font-size: 16px;
}
```

A **selector** (`p` — every `<p>` element) plus a block of **declarations** (`property: value;` pairs). That's the entire grammar of CSS — everything else in this guide is which properties exist and what values they accept.

**The cascade, briefly**: when two rules target the same element and set the same property, CSS needs a tiebreaker. Roughly: a more *specific* selector wins over a less specific one (an ID beats a class, a class beats a tag name), and among equally specific rules, the one that appears **later** in the stylesheet wins. This is where "cascading" in the name comes from. You don't need to master specificity scoring to read code — just recognize that when something's styled unexpectedly, "another rule is winning" is a real, common cause, and your browser's dev tools (Section 9) will show you exactly which rule that is.

---

## 2. The Box Model

Every single element on a page is, fundamentally, a rectangular box made of four layers, nested inside each other:

```
┌─────────────────────────────────┐
│           margin                │  ← space OUTSIDE the box, pushes other elements away
│  ┌─────────────────────────┐    │
│  │         border           │   │  ← a visible (or invisible) line around the box
│  │  ┌─────────────────┐     │   │
│  │  │     padding       │    │   │  ← space INSIDE the box, between border and content
│  │  │  ┌───────────┐    │    │   │
│  │  │  │  content   │   │    │   │  ← the actual text/image/children
│  │  │  └───────────┘    │    │   │
│  │  └─────────────────┘     │   │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

```css
.box {
  padding: 16px;    /* space between the border and the content */
  border: 1px solid black;
  margin: 24px;       /* space between this box's border and whatever's next to it */
}
```

**The one gotcha every project eventually hits**: does `width` include padding and border, or not? By CSS's original default (`box-sizing: content-box`), `width` sets *only* the content area — add padding and border, and the box visually grows bigger than the `width` you set. Nearly every modern project, including anything using Tailwind, switches this globally to `box-sizing: border-box`, where `width` includes padding and border — set `width: 200px`, and the box is genuinely 200px wide regardless of how much padding you add, with the content area shrinking to make room instead. Tailwind's default reset already does this for you — worth knowing it's happening, since "why isn't my width doing what I expect" is almost always a `box-sizing` question when it comes from outside a Tailwind-managed project.

> **Try it**: open any page in your browser, right-click an element, choose Inspect, and find the "Computed" or "Box Model" panel in dev tools. It draws exactly this nested-rectangle diagram, with real numbers, for whatever element you selected — the single most useful dev tools panel for understanding layout issues, and the direct real-world version of the diagram above.

---

## 3. `display`: How an Element Occupies Space

```css
div  { display: block; }         /* default for div, p, h1... — takes the full width available, stacks vertically */
span { display: inline; }         /* default for span, a, strong... — flows within text, width/height are ignored */
img  { display: inline-block; }    /* flows like inline, but respects width/height like block */
```

`block` elements stack top to bottom and take the full available width by default — think `<div>`, `<p>`, `<h1>`. `inline` elements flow left-to-right like words in a sentence and **ignore** any `width`/`height`/vertical `margin` you set on them — think `<span>`, `<a>`, `<strong>`. This distinction is exactly why "why won't my width apply" is sometimes a `display` problem rather than a box-model problem — an inline element silently ignoring `width` looks identical, in dev tools, to a mistake, until you check what `display` value it actually has.

`display: none` removes an element from the page entirely — no space reserved, as if it weren't in the markup at all (different from just making it invisible, which would still leave a gap).

---

## 4. Flexbox: One-Dimensional Layout

Flexbox lays out a row or a column of items, distributing space between them. Two axes matter, and almost every flexbox concept is really just "which axis are we talking about":

```
flex-direction: row (the default)

   main axis  →  →  →  →  →  →  →
   ┌──────┐  ┌──────┐  ┌──────┐
 ↕ │ item │  │ item │  │ item │     ↕ cross axis
   └──────┘  └──────┘  └──────┘
```

```css
.container {
  display: flex;
  flex-direction: row;         /* or "column" — flips which axis is "main" */
  justify-content: center;       /* alignment along the MAIN axis */
  align-items: center;            /* alignment along the CROSS axis */
  gap: 16px;                        /* space between items */
  flex-wrap: wrap;                    /* let items drop to a new line instead of overflowing */
}
```

`justify-content` and `align-items` are the two properties everyone confuses at first — the fix is remembering they're bound to a specific axis, not to "horizontal" and "vertical" directly. In the default `row` direction, `justify-content` controls left-right spacing and `align-items` controls up-down alignment — but switch to `flex-direction: column`, and those two properties **swap which physical direction they control**, because "main axis" is now vertical.

Straight from the Tailwind guide: `flex items-center justify-between` is `display: flex`, `align-items: center`, `justify-content: space-between` — the utility names map directly onto the real properties, once you know what those properties actually do.

> **Try it**: build a plain HTML page (or reuse a JSX playground component) with three `<div>`s inside a `display: flex` container. Toggle `flex-direction` between `row` and `column`, and watch `justify-content: center` visibly change which direction it's centering along — the fastest way to actually internalize the axis-swap behavior instead of just reading about it.

---

## 5. Grid: Two-Dimensional Layout

Where flexbox handles one row or column, Grid lays out both rows and columns at once, in a defined structure:

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);    /* 3 equal-width columns */
  grid-template-rows: auto auto;              /* 2 rows, each sized to fit its content */
  gap: 16px;
}
```

`repeat(3, 1fr)` means "3 columns, each taking an equal fraction (`1fr` = 1 fraction unit) of the available space" — the most common grid pattern by far. Reach for Grid when you're laying out a genuine 2D structure (a photo gallery, a dashboard of cards in rows and columns); reach for Flexbox when you're really just arranging a single row or column (a nav bar, a button group). This maps directly onto the Tailwind guide's `grid grid-cols-3 gap-4` — same properties, utility-named.

---

## 6. Positioning, Briefly

```css
.box { position: static; }     /* default — normal document flow, top/left/etc. do nothing */
.box { position: relative; }    /* normal flow, but top/left/etc. now nudge it FROM its normal position */
.box { position: absolute; }     /* removed from normal flow entirely, positioned relative to nearest positioned ancestor */
.box { position: fixed; }         /* positioned relative to the browser window, stays put when scrolling */
.box { position: sticky; }         /* normal flow until a scroll threshold, then behaves like fixed */
```

The one relationship worth remembering: `position: absolute` positions an element relative to its nearest ancestor that has `position: relative` (or `absolute`/`fixed`) set — not the whole page, unless nothing up the tree has one. This is why you'll sometimes see an apparently pointless `relative` on a parent with no offset values of its own — it's there specifically to anchor an `absolute`ly positioned child inside it, not to move the parent itself.

---

## 7. Units

```css
width: 320px;      /* pixels — an absolute, fixed size */
padding: 1rem;       /* relative to the ROOT element's font size (usually 16px by default → 1rem = 16px) */
font-size: 1.2em;      /* relative to THIS element's own (or inherited) font size — compounds when nested */
width: 50%;              /* relative to the parent element's size */
height: 100vh;             /* relative to the viewport (browser window) height — 100vh = full screen height */
```

`rem` is what Tailwind's entire spacing scale (from the Tailwind guide's Section 3) is actually built on — `p-4` compiles to `padding: 1rem`, and that scale exists specifically so spacing stays proportional if a user's base font size differs from the default, rather than being locked to a raw pixel count. `em` is similar but relative to the *current* element rather than the root, which means nested `em` values compound — a real, historical source of confusing bugs, and part of why `rem` became the more common default for consistent spacing.

---

## 8. Reading Computed Styles: The Real Payoff

Every utility class you write eventually becomes real CSS a browser actually applies — and dev tools let you see exactly that, translated back into the vocabulary of this guide:

> **Try it**: build any element with a handful of Tailwind classes (`p-4 flex items-center gap-2 rounded-lg bg-blue-500`), right-click it in the browser, Inspect, and open the "Computed" styles panel. Find `padding: 16px`, `display: flex`, `align-items: center`, `gap: 8px` listed there as real, resolved CSS — proof that `p-4` and `flex items-center gap-2` were never a separate styling language, just a naming convention over exactly what you just learned in this guide.

This is genuinely the most useful habit from this whole guide: whenever a layout does something confusing, dev tools' Computed panel shows you the real box model and real property values being applied — not the Tailwind class names, the actual CSS underneath them, which is the language your debugging has to happen in either way.

---

## 9. Self-Check

1. In the box model, what's the difference between padding and margin — which one is "inside" the border and which is "outside"?
2. Why does `box-sizing: border-box` matter for how `width` behaves, and why does it matter that Tailwind sets this globally?
3. Why might a `<span>` silently ignore a `width` you set on it?
4. In `flex-direction: column`, does `justify-content` control horizontal or vertical alignment — and why does that flip from the `row` default?
5. When would you reach for Grid instead of Flexbox?
6. Why does `position: absolute` sometimes require a `position: relative` on a parent that otherwise has no positioning styles of its own?
7. What does `rem` scale with that `px` doesn't, and why does that matter for Tailwind's spacing scale specifically?
8. When you inspect a Tailwind-styled element in dev tools' Computed panel, what will you actually see — Tailwind class names, or something else?