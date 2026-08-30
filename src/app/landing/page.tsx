import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <nav className="border-b border-[color:var(--border)] bg-[color:var(--surface)]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-[color:var(--primary)]"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-semibold text-white">
              I
            </span>
            Ilaila
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--muted)]"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--muted)]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
        <span className="mb-4 rounded-full bg-[color:var(--primary-muted)] px-3 py-1 text-sm font-medium text-[color:var(--primary)]">
          Discover great food businesses
        </span>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
          Showcase and explore food businesses in one place.
        </h1>
        <p className="mb-8 max-w-2xl text-lg leading-8 text-[color:var(--text-secondary)]">
          Find standout cafés, bakeries, food trucks, and local eateries with a
          simple, warm, and modern experience.
        </p>
        <Link
          href="/home"
          className="rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Browse businesses
        </Link>
      </main>
    </div>
  );
}
