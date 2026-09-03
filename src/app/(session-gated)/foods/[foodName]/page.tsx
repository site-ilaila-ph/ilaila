"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFoodItemByNameAction } from "@/app/(session-gated)/foods/actions";
import type { FoodWithIncludes } from "@/app/(session-gated)/foods/services";

export default function SingleFoodPage({
  params,
}: {
  params: Promise<{ foodName: string }>;
}) {
  const [food, setFood] = useState<FoodWithIncludes | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFood() {
      const resolvedParams = await params;
      const decodedName = decodeURIComponent(resolvedParams.foodName);
      const result = await getFoodItemByNameAction(decodedName);

      if (!isMounted) return;

      if (result.success) {
        setFood(result.data ?? null);
      } else {
        setFood(null);
      }

      setIsLoading(false);
    }

    void loadFood();

    return () => {
      isMounted = false;
    };
  }, [params]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <nav className="border-b border-border bg-card/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
            >
              Ilaila
            </Link>
          </div>
        </nav>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-muted-foreground">Loading food details...</p>
        </div>
      </main>
    );
  }

  if (!food) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <nav className="border-b border-border bg-card/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
            >
              Ilaila
            </Link>
          </div>
        </nav>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-muted-foreground">Food not found</p>
          <Link href="/foods" className="mt-4 inline-block text-primary hover:underline">
            Back to foods
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
          >
            Ilaila
          </Link>
          <Link href="/foods" className="text-sm text-muted-foreground hover:text-foreground">
            Back to foods
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-12 border-b border-border pb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{food.name}</h1>
          {food.tags && food.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {food.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {tag.value}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {food.images && food.images.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-6 text-2xl font-semibold">Gallery</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {food.images.map((image) => (
                    <div
                      key={image.id}
                      className="overflow-hidden rounded-lg border border-border bg-muted"
                    >
                      <div className="aspect-video bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">{image.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold">History</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {food.history}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold">Preparation</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {food.preparation}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold">Recipe</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {food.recipe}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold">Cultural Significance</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {food.culturalSignificance}
              </p>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 rounded-lg border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-semibold">Available at</h2>
              {food.businesses && food.businesses.length > 0 ? (
                <div className="space-y-4">
                  {food.businesses.map((bf) => (
                    <Link
                      key={bf.id}
                      href={`/business/${bf.business.id}`}
                      className="block rounded-lg border border-border p-4 transition hover:border-primary hover:bg-card/50"
                    >
                      <h3 className="font-semibold text-primary hover:underline">
                        {bf.business.name}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {bf.business.address}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No businesses found serving this food</p>
              )}
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
