# Next.js: Images and Metadata

Two smaller, self-contained pieces — how images actually get served in a Next.js app, and how page titles/SEO metadata work. Both are file-system-adjacent conventions, same spirit as the routing guide, just for images and `<head>` content instead of pages.

---

## 1. Why `next/image` Instead of `<img>`

A plain `<img>` loads whatever size file you point it at, in whatever format it already is, with no lazy-loading unless you add it yourself — and it reserves no space until the image actually loads, which is a real, common cause of content jumping around as a page loads (a "layout shift").

```tsx
import Image from "next/image";

export default function Avatar() {
  return <Image src="/profile.jpg" alt="Profile photo" width={200} height={200} />;
}
```

`next/image` handles several things automatically that you'd otherwise hand-roll: it resizes the image to fit the space it's actually displayed at, serves modern formats (WebP/AVIF) to browsers that support them, lazy-loads images below the fold by default, and — because `width`/`height` are required — reserves the correct space before the image loads, preventing the layout shift a plain `<img>` doesn't protect against.

> **Try it**: drop a real image into `public/profile.jpg` in `components-playground`, render `<Image src="/profile.jpg" alt="..." width={200} height={200} />`, then open the Network tab and reload — look at the actual file that downloads. It won't match your original file's format or size exactly; that's the automatic optimization happening.

---

## 2. Local vs. Remote Images

**Local** (anything in `public/`, or imported directly): Next.js can read the file itself and infer `width`/`height` automatically:

```tsx
import profilePic from "@/public/profile.jpg";

export default function Avatar() {
  return <Image src={profilePic} alt="Profile photo" />;   // width/height inferred — no need to specify
}
```

**Remote** (a URL to an image hosted elsewhere): Next.js can't inspect a file it doesn't have on disk, so `width` and `height` become **required**, and — for a real security reason, not just an inconvenience — the domain has to be explicitly allowed first:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
```

```tsx
<Image src="https://avatars.githubusercontent.com/u/1" alt="GitHub avatar" width={200} height={200} />
```

Without adding the hostname to `remotePatterns`, Next.js refuses to optimize (and by default, refuses to render) an image from that domain — this is deliberate: allowing arbitrary remote images to flow through your own server's image optimizer unchecked is a real vector for abuse (someone using your server to proxy and resize images that have nothing to do with your app). You explicitly allow-list the domains you actually trust.

---

## 3. `fill` — When You Don't Know the Size Up Front

Sometimes an image needs to fill a container whose size is determined by CSS (a card, a hero banner) rather than the image's own fixed dimensions:

```tsx
<div style={{ position: "relative", width: "100%", height: "300px" }}>
  <Image src={profilePic} alt="Banner" fill style={{ objectFit: "cover" }} />
</div>
```

`fill` makes the image expand to cover its parent container completely — but this requires the parent to have `position: relative` (or another positioned value) set, exactly the same requirement from the CSS Fundamentals guide's positioning section: an absolutely-positioned element (which is what `fill` uses internally) needs a positioned ancestor to size itself against. `objectFit: "cover"` (same `object-fit` CSS property, just written the React inline-style way) controls how the image crops to fill that space without distorting.

> **Try it**: build the `fill` example above, then delete `position: "relative"` from the parent `div` and reload — watch the image blow up to fill the entire page instead of just its intended container, a direct, visible consequence of the CSS Fundamentals positioning rule.

---

## 4. `priority` — For Above-the-Fold Images

```tsx
<Image src={heroImage} alt="Hero" width={1200} height={600} priority />
```

By default, `next/image` lazy-loads — it doesn't fetch the image until it's about to scroll into view, which is exactly right for images further down a page. But the single largest image visible immediately on page load (a hero banner, an above-the-fold photo) benefits from the opposite treatment: `priority` tells Next.js to preload it immediately instead of lazily, since delaying it would delay the page's perceived load time. Use it sparingly — on the one or two images genuinely visible without scrolling, not everywhere.

---

## 5. Metadata: Static

Every `page.tsx` or `layout.tsx` can export a `metadata` object controlling the page's `<title>`, description, and other `<head>` content — no manual `<head>` JSX required:

```tsx
// src/app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about our project.",
};

export default function AboutPage() {
  return <h1>About</h1>;
}
```

This is a plain exported object, not a component — Next.js reads it at build/request time and injects the actual `<title>`/`<meta>` tags into the page's `<head>` itself. Same "the file decides the behavior" pattern from the routing guide's special files, just for metadata instead of rendering.

### Title templates

```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: "%s | My App",
    default: "My App",
  },
};
```

```tsx
// src/app/about/page.tsx
export const metadata: Metadata = {
  title: "About",   // renders as "About | My App", per the parent template
};
```

A `title.template` in a layout applies to every nested page's title automatically — set it once at the root, and every page's title gets the suffix without repeating it per page.

---

## 6. Metadata: Dynamic — `generateMetadata`

For a page whose title genuinely depends on data — a product page's title should be the product's actual name, not a hardcoded string — export an async function instead of a plain object:

```tsx
// src/app/products/[id]/page.tsx
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });

  return {
    title: product?.name ?? "Product not found",
    description: product?.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  return <h1>{product?.name}</h1>;
}
```

Same `params: Promise<{ id: string }>` shape from the routing guide's dynamic segments section — `generateMetadata` receives and awaits `params` exactly like the page component does, since it's resolving the same dynamic route. Notice both `generateMetadata` and `ProductPage` independently fetch the same product here — that's expected and fine: Next.js automatically deduplicates identical fetch/data calls made during the same request, so this isn't the double-database-hit it looks like at first glance.

> **Try it**: build `ProductPage` with `generateMetadata` above (using a hardcoded product lookup if you don't have real seed data), visit `/products/1`, and check the actual browser tab title — confirm it shows the product's real name, not a static placeholder.

---

## 7. Common Metadata Fields

```tsx
export const metadata: Metadata = {
  title: "Product Page",
  description: "A great product.",
  openGraph: {
    title: "Product Page",
    description: "A great product.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};
```

`openGraph` controls how the page appears when shared on social platforms (Slack, Twitter/X, etc.) — the preview card's title, description, and image, distinct from the browser tab's own title/description. Worth setting deliberately on any page meant to be shared, since without it, platforms fall back to guessing from the page's visible content, inconsistently.

---

## 8. Self-Check

1. What real problem does `next/image` requiring `width`/`height` actually solve?
2. Why does a remote image's domain need to be added to `remotePatterns` before it will render?
3. Why does `fill` require `position: relative` on its parent, and where does that requirement actually come from?
4. When should you reach for `priority`, and why not on every image?
5. What's the difference between a plain exported `metadata` object and `generateMetadata`, and when does a page need the latter?
6. Why does `generateMetadata` receive `params` as a `Promise`, consistent with what other guide's convention?
7. What does `openGraph` control that the page's own `title`/`description` don't?