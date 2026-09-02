import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-(--surface)/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              I
            </span>
            Ilaila
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
        <span className="mb-4 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-primary">
          Explore San Pedro&apos;s food culture
        </span>
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Find the food and<br />
          people that matter
        </h1>
        <p className="mb-8 max-w-2xl text-lg leading-8 text-muted-foreground">
          Look for restaurants, food traditions, and recipes from San Pedro. See what people think. Connect with the community.
        </p>
        <div className="mb-16 flex flex-wrap justify-center gap-3">
          <Link
            href="/home"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Browse Now
          </Link>
          <Link
            href="/about/the-website"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            Learn More
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-16 w-full">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 text-4xl">🏪</div>
            <h3 className="mb-2 text-lg font-semibold">Local Restaurants</h3>
            <p className="text-sm text-muted-foreground">
              Find where to eat in San Pedro. See what&apos;s good, what&apos;s popular, and where your friends go.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 text-4xl">🍲</div>
            <h3 className="mb-2 text-lg font-semibold">Traditional Dishes</h3>
            <p className="text-sm text-muted-foreground">
              Learn about the foods that are part of San Pedro. Recipes, stories, and what makes them special.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 text-4xl">📍</div>
            <h3 className="mb-2 text-lg font-semibold">Real Reviews</h3>
            <p className="text-sm text-muted-foreground">
              Read what people actually think. Leave your own review. Help others find great food.
            </p>
          </div>
        </div>

        <section className="mb-16 w-full rounded-xl border border-border bg-card/50 p-8">
          <h2 className="mb-6 text-3xl font-bold">Why use Ilaila</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-primary">It&apos;s just for San Pedro</h3>
              <p className="text-sm text-muted-foreground">
                We focus on one place. You get real information about the food and restaurants here, not generic content from everywhere.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-primary">Help local places</h3>
              <p className="text-sm text-muted-foreground">
                When you review a restaurant or share about a food, you&apos;re directly helping the people who run these places.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-primary">Keep stories alive</h3>
              <p className="text-sm text-muted-foreground">
                Traditional dishes and family recipes matter. We document them so they don&apos;t get forgotten.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-primary">Find what&apos;s good</h3>
              <p className="text-sm text-muted-foreground">
                See honest reviews from real people. Discover places and foods you&apos;ll actually enjoy.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full rounded-xl border border-border bg-linear-to-r from-primary/10 to-secondary p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Ready to start exploring?</h2>
          <p className="mb-6 text-muted-foreground">
            Sign up to save restaurants, leave reviews, and see what other people recommend
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Get Started
          </Link>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <h4 className="mb-4 font-semibold">Ilaila</h4>
              <p className="text-sm text-muted-foreground">
                Food and restaurants in San Pedro
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Browse</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/business/discovery" className="hover:text-primary">Restaurants</Link></li>
                <li><Link href="/foods" className="hover:text-primary">Dishes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Learn</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about/the-website" className="hover:text-primary">About</Link></li>
                <li><Link href="/about/san-pedro" className="hover:text-primary">San Pedro</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/sign-in" className="hover:text-primary">Sign In</Link></li>
                <li><Link href="/auth/sign-up" className="hover:text-primary">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Ilaila</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
