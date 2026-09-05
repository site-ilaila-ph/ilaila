# Testing With Vitest

Vitest is the test runner this project uses — same core API you'd recognize from Jest if you've ever seen it (`describe`, `it`, `expect`), but built on Vite, which means it understands TypeScript, JSX/TSX, and ES modules natively, with no separate transpilation config to fight — same reasoning that made pnpm and the whole Node.js toolchain click together the way they do.

---

## 0. Setup, In `components-playground`

```powershell
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom vite-tsconfig-paths
```

`vitest.config.ts` at the project root:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

`environment: "jsdom"` simulates a browser DOM in Node, so component tests have a real `document` to render into — without it, anything using `render()` from Testing Library has nothing to render onto. `tsconfigPaths()` makes `@/` imports (like `@/lib/prisma`) resolve inside tests the same way they already do in your actual app code.

```typescript
// vitest.setup.ts
import "@testing-library/jest-dom";
```

This one import adds DOM-specific matchers (`toBeInTheDocument()`, `toHaveTextContent()`) you'll use constantly in component tests — without it, `expect(element).toBeInTheDocument()` doesn't exist.

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

`pnpm test` runs once and exits (what you'd run in CI); `pnpm test:watch` reruns automatically as files change — the one you'll actually have open while writing code.

---

## 1. Anatomy of a Test

```typescript
// math.test.ts
import { describe, it, expect } from "vitest";

function add(a: number, b: number) {
  return a + b;
}

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("handles negative numbers", () => {
    expect(add(-1, 1)).toBe(0);
  });
});
```

`describe` groups related tests under a shared label; `it` (or `test` — identical, both exist) is one actual test case, named as a sentence describing the expected behavior; `expect(...).toBe(...)` is the assertion. Files ending in `.test.ts`/`.test.tsx` (or inside a `__tests__` folder) are picked up automatically — no manual registration, same "the file system decides" spirit as Next.js routing, just applied to test discovery instead.

### `toBe` vs. `toEqual`

```typescript
expect(5).toBe(5);                          // primitive equality — fine
expect({ name: "Alex" }).toBe({ name: "Alex" });    // FAILS — different object references
expect({ name: "Alex" }).toEqual({ name: "Alex" });   // PASSES — deep structural equality
```

`toBe` is `===` — reference equality for objects/arrays, same distinction from the JS Essentials guide's equality section. Two separately-created objects with identical contents are `===` false but structurally equal — `toEqual` checks structure/contents instead of reference, and is what you actually want for objects and arrays nearly every time.

> **Try it**: write both assertions above and run `pnpm test:watch` — watch the `toBe` one fail with a "these look identical but aren't equal" message, then switch it to `toEqual` and watch it pass with the exact same objects.

---

## 2. Testing Plain Functions and Zod Schemas

The simplest, and most valuable, tests you'll write — no rendering, no DOM, just calling a function and checking its output. This is exactly where the Zod guide's schemas belong:

```typescript
// user-schema.test.ts
import { describe, it, expect } from "vitest";
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

describe("CreateUserSchema", () => {
  it("accepts valid input", () => {
    const result = CreateUserSchema.safeParse({ name: "Alex", email: "alex@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = CreateUserSchema.safeParse({ name: "Alex", email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = CreateUserSchema.safeParse({ name: "", email: "alex@example.com" });
    expect(result.success).toBe(false);
  });
});
```

Straight from the Zod guide's own `.safeParse()` result shape — `result.success` is exactly the discriminated union covered there, so `expect(result.success).toBe(false)` is a completely natural assertion, not new vocabulary.

---

## 3. Testing Server Actions

A Server Action, per the Server/Client Components guide, isn't React at all — it's a plain async function. Test it exactly like one, no special tooling required:

```typescript
// actions.test.ts
import { describe, it, expect, vi } from "vitest";
import { createUser } from "./actions";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: vi.fn().mockResolvedValue({ id: 1, name: "Alex", email: "alex@example.com" }),
    },
  },
}));

describe("createUser", () => {
  it("returns success with an id for valid input", async () => {
    const result = await createUser({ name: "Alex", email: "alex@example.com" });
    expect(result).toEqual({ success: true, id: 1 });
  });

  it("returns an error for an invalid email, without touching the database", async () => {
    const result = await createUser({ name: "Alex", email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});
```

`vi.mock("@/lib/prisma", ...)` replaces the real Prisma client with a fake one for this test file — you're testing `createUser`'s own logic (validation, the shape of what it returns), not whether Prisma or SQLite actually work, which is a separate concern entirely. `vi.fn().mockResolvedValue(...)` creates a fake function that returns a resolved Promise with whatever value you give it — standing in for the real `prisma.user.create` call.

> **Try it**: run the mocked test above, then temporarily change `createUser`'s validation logic to accept invalid emails, rerun, and watch the second test fail — confirming the test actually exercises real logic in the action, not just the mock.

---

## 4. Testing React Components

```powershell
pnpm add -D @vitejs/plugin-react
```

```tsx
// counter.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./counter";

describe("Counter", () => {
  it("starts at 0 and increments on click", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    expect(screen.getByText("0")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "+1" }));

    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
```

`render(<Counter />)` mounts the component into the simulated DOM from Section 0's `jsdom` environment. `screen.getByRole("button", { name: "+1" })` finds the button **the way a real user would identify it** — by its accessible role and visible text — not by digging into component internals or CSS class names. This is Testing Library's core philosophy, worth stating directly: **test behavior, not implementation.** A test that queries by `data-testid` or internal state is coupled to how the component happens to be built; a test that queries by role and text is coupled to what the component actually does for a user, and survives a refactor that changes internals without changing behavior.

`userEvent.setup()` plus `await user.click(...)` simulates a real click — including the same browser event sequence a real click produces — more faithfully than calling `fireEvent.click` directly (which still exists, but `userEvent` is the current, more realistic default).

> **Try it**: build `Counter` from the React Fundamentals guide, write this test, run it, watch it pass. Then break `Counter`'s `onClick` on purpose (make it decrement instead of increment) and rerun — watch the test fail with a clear message showing it expected `"1"` and found something else.

---

## 5. Testing Custom Hooks

```tsx
// use-toggle.test.ts
import { describe, it, expect, act } from "vitest";
import { renderHook } from "@testing-library/react";
import { useToggle } from "./use-toggle";

describe("useToggle", () => {
  it("starts at the given initial value and flips on toggle", () => {
    const { result } = renderHook(() => useToggle(false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1]();   // call the toggle function
    });

    expect(result.current[0]).toBe(true);
  });
});
```

`renderHook` runs a hook outside of any actual component — useful for testing a custom hook (from React Fundamentals' Section 11) in isolation, without needing to build a throwaway component just to call it from. `act(...)` wraps anything that triggers a state update, ensuring React finishes processing it before your next assertion runs — without it, you can end up asserting against a stale value from before the update settled.

---

## 6. Mocking `fetch` and External Calls

```typescript
import { vi, describe, it, expect, beforeEach } from "vitest";

describe("getGitHubUser", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ name: "Vercel" }),
    }));
  });

  it("returns the user's name", async () => {
    const user = await getGitHubUser();
    expect(user.name).toBe("Vercel");
  });
});
```

`vi.stubGlobal("fetch", ...)` replaces the global `fetch` for the duration of the test — the same idea as mocking Prisma in Section 3, applied to any external call. `beforeEach` re-runs before every `it` in the block, so each test starts from a clean, predictable mock instead of leaking state between tests.

---

## 7. Async Assertions: `waitFor`

Some updates don't happen synchronously with the action that triggers them — a `useEffect` fetching data, for instance. Asserting immediately after a click can run before that update has actually landed:

```tsx
import { waitFor } from "@testing-library/react";

it("shows the user's name after loading", async () => {
  render(<UserProfile userId="1" />);

  expect(screen.getByText("Loading...")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText("Alex")).toBeInTheDocument();
  });
});
```

`waitFor` retries its callback until it stops throwing (or times out) — the correct tool whenever you're asserting on something that updates asynchronously, rather than adding an arbitrary `setTimeout` and hoping it was long enough.

---

## 8. Coverage, Briefly

```powershell
pnpm vitest run --coverage
```

Produces a report of which lines/branches your tests actually exercised. Useful as a signal for genuinely untested code paths — not useful as a target to maximize for its own sake. 100% coverage with weak assertions (`expect(true).toBe(true)` scattered everywhere) is worse than 70% coverage of the paths that actually matter — coverage tells you what ran, not whether you checked the right thing about it.

---

## 9. Self-Check

1. Why does a project need `environment: "jsdom"` configured before any component test will work?
2. What's the practical difference between `toBe` and `toEqual`, and why does it matter for objects specifically?
3. Why can a Server Action be tested without any special React testing tooling?
4. What does `vi.mock("@/lib/prisma", ...)` actually let you avoid needing, when testing a Server Action?
5. Why does Testing Library encourage querying by role and text (`getByRole`) instead of by `data-testid` or CSS class?
6. When would you reach for `renderHook` instead of testing a hook through a real component?
7. Why is `waitFor` necessary for some assertions but not others?