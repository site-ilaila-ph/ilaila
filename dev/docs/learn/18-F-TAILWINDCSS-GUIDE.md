# Tailwind CSS

Back when this curriculum was first planned out, this was flagged directly: *"'no CSS' doesn't mean zero conceptual load — utility-class philosophy is a real paradigm shift... worth a short primer, not a skip."* This is that primer — on top of the CSS Fundamentals guide, which is the actual prerequisite here. Everything below assumes you already know what padding, margin, `display`, and the flexbox/grid axes actually are; this guide is just the naming convention Tailwind puts on top of them. `create-next-app` already set Tailwind up for you (you answered "Yes" to it back in the Next.js guides) — nothing to install here, just how to actually use it.

---

## 1. The Paradigm Shift

Traditional CSS: name a class, write rules for it in a separate file, reference the name in your markup.

```css
/* styles.css */
.card {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```
```html
<div class="card">...</div>
```

Tailwind: skip naming and the separate file entirely. Apply pre-defined utility classes — each one doing exactly one small thing — directly in your markup:

```tsx
<div className="p-4 rounded-lg bg-white shadow">...</div>
```

`p-4` is padding, `rounded-lg` is border-radius, `bg-white` is background-color, `shadow` is the box-shadow. No `.card` class was ever defined anywhere — the styling lives entirely in the `className` string, right next to the markup it affects.

This is a real shift, not just shorter syntax: you stop naming things (no more debating what to call a class, no more BEM conventions), and you stop context-switching between a `.tsx` file and a separate `.css` file to see or change how something looks. The tradeoff, and the thing that takes adjustment, is that `className` strings get long and can look noisy at first — that's a real cost, addressed in Section 8.

> **Try it**: in any component from your `components-playground` or Vite playgrounds, replace a plain `<div>` with `<div className="p-4 rounded-lg bg-white shadow">Hello</div>` and look at it in the browser. Then delete one class at a time and reload, watching exactly which visual effect disappears — the fastest way to build an intuition for what each utility actually does.

---

## 2. The Core Utility Categories

```tsx
// Spacing
<div className="p-4">        {/* padding: all sides */}
<div className="px-4 py-2">   {/* padding: x-axis, y-axis */}
<div className="pt-2 pb-4">    {/* padding: top, bottom individually */}
<div className="m-4">           {/* margin, same pattern as padding */}
<div className="gap-4">          {/* gap between flex/grid children */}

// Sizing
<div className="w-full h-screen">   {/* width: 100%, height: 100vh */}
<div className="w-64">                {/* fixed width, from the spacing scale */}
<div className="max-w-md">             {/* max-width, a named breakpoint-like size */}

// Typography
<p className="text-sm font-bold text-center">
<p className="text-2xl leading-tight tracking-wide">

// Color
<div className="bg-blue-500 text-white">
<div className="border-gray-300">

// Flexbox and Grid
<div className="flex items-center justify-between">
<div className="grid grid-cols-3 gap-4">

// Borders and shadow
<div className="border rounded-lg shadow-md">
```

The naming is consistent and, once you've seen a handful, genuinely guessable: `p`/`m` for padding/margin, `t`/`r`/`b`/`l`/`x`/`y` for direction, `bg`/`text`/`border` for what's being colored, `w`/`h` for dimensions. You won't memorize all of these up front — you'll look them up constantly at first (the Tailwind docs' search is fast) and it'll stick from repetition, the same way you didn't memorize every array method the first time you saw them.

---

## 3. The Spacing Scale — Not Arbitrary Pixels

`p-4` isn't "4 pixels" — Tailwind uses a consistent numeric scale where each step is `0.25rem` (4px at the default browser font size, per the `rem` unit from the CSS Fundamentals guide):

```
p-0   = 0
p-1   = 0.25rem  (4px)
p-2   = 0.5rem   (8px)
p-4   = 1rem     (16px)
p-8   = 2rem     (32px)
```

The scale isn't linear-by-1 (there's no `p-3.5` in most cases) — it's deliberately a constrained set of values, and that constraint is a feature: it keeps spacing across an entire app visually consistent, because everyone's reaching from the same limited set of choices rather than picking arbitrary pixel values per component. Fighting the scale (see Section 7 for when you genuinely need to) should be the exception, not the default.

---

## 4. Responsive Design: Mobile-First Prefixes

```tsx
<div className="text-sm md:text-lg lg:text-2xl">
```

Tailwind is **mobile-first**: an unprefixed utility (`text-sm`) applies at every screen size by default, and a prefixed one (`md:text-lg`) *overrides* it starting at that breakpoint and up. Read the line above as: "small text by default; at medium screens and wider, make it large; at large screens and wider, make it extra large." Not "only apply at that exact size" — each breakpoint prefix means "this size and everything wider," stacking on top of the unprefixed base.

Standard breakpoints, smallest to largest: `sm:` `md:` `lg:` `xl:` `2xl:`. You don't need to memorize the exact pixel values — the ordering and "mobile-first, override upward" behavior is what actually matters.

> **Try it**: build `<p className="text-sm md:text-lg lg:text-2xl">Resize me</p>`, open the browser, and manually resize the window (or use dev tools' device toolbar) slowly from narrow to wide — watch the text size step up at each breakpoint, not smoothly, but in discrete jumps.

---

## 5. State Variants

Same prefix pattern as responsive breakpoints, applied to interaction states and other conditions instead of screen size:

```tsx
<button className="bg-blue-500 hover:bg-blue-600 focus:ring-2 disabled:opacity-50">
  Click me
</button>
```

`hover:`, `focus:`, `active:`, `disabled:` — each applies its utility only in that state, layered on top of the base classes. `dark:` works the same way for dark-mode-specific styling. These compose with responsive prefixes too: `md:hover:bg-blue-600` means "on medium screens and up, when hovered."

---

## 6. Conditional Classes in JSX

Since `className` is just a string, everything from the JSX guide's conditional rendering applies directly — no Tailwind-specific syntax needed:

```tsx
function Badge({ isActive }: { isActive: boolean }) {
  return (
    <span className={isActive ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
```

Once you're combining several conditional classes at once, a plain ternary inside a template literal gets unwieldy fast. The standard fix is a small utility function — commonly named `cn` — built on the `clsx` package, that lets you pass classes conditionally as an object or list and merges them into one clean string:

```tsx
import { cn } from "@/lib/utils";     // a small wrapper most projects set up once

function Badge({ isActive }: { isActive: boolean }) {
  return (
    <span className={cn("px-2 py-1 rounded", isActive ? "bg-green-500" : "bg-gray-300")}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
```

`cn` (or `clsx` directly) is worth reaching for the moment a `className` has more than one condition in it — same "stop cramming logic into a JSX expression" instinct from the conditional rendering section of the JSX guide, applied to class strings specifically.

---

## 7. Arbitrary Values: The Escape Hatch

For the rare case where nothing in the scale fits — a specific pixel value from a design file, a one-off color — square-bracket syntax lets you specify an exact value:

```tsx
<div className="w-[327px] top-[13px] bg-[#1da1f2]">
```

Use this sparingly. Reaching for arbitrary values constantly is a sign you're fighting the scale instead of using it — a design that genuinely needs pixel-perfect one-off values everywhere is a design problem more than a Tailwind problem. It's there for real exceptions, not as a routine substitute for the standard scale from Section 3.

---

## 8. Long `className` Strings: Extract a Component, Not a CSS Class

The real cost of utility classes shows up here: a genuinely styled element can accumulate a long `className`. The Tailwind-native escape hatch is `@apply` (bundling several utilities under one custom CSS class name, back in a stylesheet) — but in a React/Next.js codebase, the more idiomatic fix is the same one from React Fundamentals: **extract a component.**

```tsx
// Instead of repeating this everywhere:
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium">
  Save
</button>

// Extract it once:
function Button({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium" {...props}>
      {children}
    </button>
  );
}
```

This is exactly the "composition over configuration" pattern from React Fundamentals' Section 12, applied to styling specifically — the long `className` gets written once, inside the component, and every usage site just writes `<Button>Save</Button>`. Reach for a component before reaching for `@apply` in this codebase; it keeps styling colocated with the one place that actually needs to know the utility list, and it's just a React component, not a second styling system to learn.

---

## 9. Configuration: CSS-First (v4)

Older Tailwind tutorials show a `tailwind.config.js` file — **current Tailwind (v4) doesn't use one by default.** Configuration lives directly in CSS, via `@theme`, in your global stylesheet (`src/app/globals.css` in a Next.js project):

```css
@import "tailwindcss";

@theme {
  --color-brand: #6366f1;
  --font-display: "Inter", sans-serif;
}
```

Once defined, these become real utility classes automatically — `bg-brand`, `text-brand`, `font-display` — usable anywhere in your JSX exactly like any built-in utility. You likely won't be the one adding custom theme tokens day to day, but recognize this shape (`@theme { --color-... }` inside `globals.css`) as where a project's custom colors and fonts actually live, rather than a `tailwind.config.js` you might go looking for based on an older tutorial.

---

## 10. Self-Check

1. What's the fundamental difference between writing a `.card` class in a stylesheet and using `p-4 rounded-lg bg-white shadow` directly in JSX?
2. Why is `p-4` not simply "4 pixels," and why does the constrained scale matter?
3. What does `md:text-lg` actually mean — "only at medium screens," or something broader?
4. What does `hover:bg-blue-600` do if the element has no other `bg-` class at all?
5. When a `className` needs more than one condition, why reach for `cn`/`clsx` instead of a longer ternary inside a template literal?
6. Why is extracting a React component generally preferred over `@apply` in this codebase?
7. Where do custom theme colors and fonts actually live in current (v4) Tailwind, and what old file should you stop expecting to find them in?