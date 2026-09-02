"use client";

import Link from "next/link";
import { useEffect } from "react";

const revealSelector = ".landing-reveal";

export default function LandingPage() {
  useEffect(() => {
    const revealItems = document.querySelectorAll(revealSelector);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -72px 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-(--primary-muted) text-foreground">
      <style>{`
        @keyframes landingFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .landing-reveal { opacity: 0; transform: translateY(28px); }
        .landing-reveal.is-visible {
          animation: landingFadeUp 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .landing-reveal:nth-child(2) {
          animation-delay: 100ms;
        }

        .landing-reveal:nth-child(3) {
          animation-delay: 200ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-reveal,
          .landing-reveal.is-visible {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
      <nav className="sticky top-0 z-50 border-b border-border bg-(--surface)/75 shadow-sm shadow-primary/10 backdrop-blur-xl supports-[backdrop-filter]:bg-(--surface)/60">
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
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
          Find the food and
          <br />
          people that matter
        </h1>
        <p className="mb-8 max-w-2xl text-lg leading-8 text-muted-foreground">
          Look for restaurants, food traditions, and recipes from San Pedro. See
          what people think. Connect with the community.
        </p>
        <div className="mb-16 flex flex-wrap justify-center gap-3">
          <Link
            href="/home"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Browse Now
          </Link>
          <Link
            href="/about/the-website"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition duration-200 ease-out hover:-translate-y-1 hover:bg-muted hover:shadow-md active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Learn More
          </Link>
        </div>

        <div className="mb-16 grid w-full gap-6 md:grid-cols-3 md:gap-8">
          <div className="landing-reveal flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-md shadow-primary/5 transition duration-300 ease-out hover:-translate-y-2 hover:border-primary/60 hover:bg-secondary hover:shadow-xl hover:shadow-primary/15">
            <div className="mb-4 text-4xl">🏪</div>
            <h3 className="mb-2 text-lg font-semibold">Local Restaurants</h3>
            <p className="text-sm text-muted-foreground">
              Find where to eat in San Pedro. See what&apos;s good, what&apos;s
              popular, and where your friends go.
            </p>
          </div>

          <div className="landing-reveal flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-md shadow-primary/5 transition duration-300 ease-out hover:-translate-y-2 hover:border-primary/60 hover:bg-secondary hover:shadow-xl hover:shadow-primary/15">
            <div className="mb-4 text-4xl">🍲</div>
            <h3 className="mb-2 text-lg font-semibold">Traditional Dishes</h3>
            <p className="text-sm text-muted-foreground">
              Learn about the foods that are part of San Pedro. Recipes,
              stories, and what makes them special.
            </p>
          </div>

          <div className="landing-reveal flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-md shadow-primary/5 transition duration-300 ease-out hover:-translate-y-2 hover:border-primary/60 hover:bg-secondary hover:shadow-xl hover:shadow-primary/15">
            <div className="mb-4 text-4xl">📍</div>
            <h3 className="mb-2 text-lg font-semibold">Real Reviews</h3>
            <p className="text-sm text-muted-foreground">
              Read what people actually think. Leave your own review. Help
              others find great food.
            </p>
          </div>
        </div>

        <section className="landing-reveal mb-16 w-full rounded-xl border border-border bg-card/80 p-8 shadow-xl shadow-primary/10 md:p-10">
          <h2 className="mb-6 text-3xl font-bold">Why use Ilaila</h2>
          <div className="grid gap-x-16 gap-y-10 text-left md:grid-cols-2">
            <div className="rounded-lg border border-border/70 bg-background/40 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <h3 className="mb-2 font-semibold text-primary">
                It&apos;s just for San Pedro
              </h3>
              <p className="text-sm text-muted-foreground">
                We focus on one place. You get real information about the food
                and restaurants here, not generic content from everywhere.
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/40 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <h3 className="mb-2 font-semibold text-primary">
                Help local places
              </h3>
              <p className="text-sm text-muted-foreground">
                When you review a restaurant or share about a food, you&apos;re
                directly helping the people who run these places.
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/40 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <h3 className="mb-2 font-semibold text-primary">
                Keep stories alive
              </h3>
              <p className="text-sm text-muted-foreground">
                Traditional dishes and family recipes matter. We document them
                so they don&apos;t get forgotten.
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/40 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <h3 className="mb-2 font-semibold text-primary">
                Find what&apos;s good
              </h3>
              <p className="text-sm text-muted-foreground">
                See honest reviews from real people. Discover places and foods
                you&apos;ll actually enjoy.
              </p>
            </div>
          </div>
        </section>

        <section className="landing-reveal w-full rounded-xl border border-primary/20 bg-linear-to-br from-primary/20 via-secondary to-background p-8 text-center shadow-xl shadow-primary/15 md:p-10">
          <h2 className="mb-4 text-2xl font-bold">Ready to start exploring?</h2>
          <p className="mb-6 text-muted-foreground">
            Sign up to save restaurants, leave reviews, and see what other
            people recommend
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Get Started
          </Link>
        </section>
      </main>

      <footer className="border-t border-[#26332f] bg-linear-to-br from-[#26332f] via-[#303b36] to-[#1f2926] text-[#f2f5ef] shadow-[0_-16px_36px_-18px_#26332f]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 border-b border-white/15 pb-10 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h4 className="mb-3 font-semibold text-[#f2f5ef]">Ilaila</h4>
              <p className="text-sm text-[#f2f5ef]/75">
                Food and restaurants in San Pedro
              </p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-[#f2f5ef]">Browse</h4>
              <ul className="space-y-3 text-sm text-[#f2f5ef]/75">
                <li>
                  <Link
                    href="/business/discovery"
                    className="inline-flex rounded-sm transition duration-200 hover:translate-x-1 hover:text-[#dcefe5] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcefe5]"
                  >
                    Restaurants
                  </Link>
                </li>
                <li>
                  <Link
                    href="/foods"
                    className="inline-flex rounded-sm transition duration-200 hover:translate-x-1 hover:text-[#dcefe5] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcefe5]"
                  >
                    Dishes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-[#f2f5ef]">Learn</h4>
              <ul className="space-y-3 text-sm text-[#f2f5ef]/75">
                <li>
                  <Link
                    href="/about/the-website"
                    className="inline-flex rounded-sm transition duration-200 hover:translate-x-1 hover:text-[#dcefe5] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcefe5]"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about/san-pedro"
                    className="inline-flex rounded-sm transition duration-200 hover:translate-x-1 hover:text-[#dcefe5] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcefe5]"
                  >
                    San Pedro
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-[#f2f5ef]">Account</h4>
              <ul className="space-y-3 text-sm text-[#f2f5ef]/75">
                <li>
                  <Link
                    href="/auth/sign-in"
                    className="inline-flex rounded-sm transition duration-200 hover:translate-x-1 hover:text-[#dcefe5] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcefe5]"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/sign-up"
                    className="inline-flex rounded-sm transition duration-200 hover:translate-x-1 hover:text-[#dcefe5] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcefe5]"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-center text-sm text-[#f2f5ef]/65">
            <p>&copy; 2026 Ilaila</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
