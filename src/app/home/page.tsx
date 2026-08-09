"use client";

import Link from "next/link";
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <nav className="border-b border-[color:var(--border)] bg-[color:var(--surface)]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-[color:var(--primary)]"
          >
            Ilaila
          </Link>
        </div>
      </nav>
      <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-sm ring-1 ring-[color:var(--border)]/70">
          <div className="mb-6 inline-flex rounded-full bg-[color:var(--primary-muted)] px-3 py-1 text-sm font-medium text-[color:var(--primary)]">
            Featured today
          </div>
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
            Welcome to the home page
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[color:var(--text-secondary)]">
            This is a polished placeholder card for the main experience while
            the real food business content is being built.
          </p>
        </div>
      </main>
    </div>
  );
}
