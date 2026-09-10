import Link from "next/link";

export default function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-(--surface)/75 shadow-sm shadow-primary/10 backdrop-blur-xl supports-[backdrop-filter]:bg-(--surface)/60">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">I</span>
          Ilaila
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/sign-in" className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Sign In
          </Link>
          <Link href="/auth/sign-up" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
