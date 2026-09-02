"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFoodItemsAction } from "@/app/foods/actions";
import type { FoodListItem } from "@/app/foods/services";

export default function FoodsPage() {
  const [foods, setFoods] = useState<FoodListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFoods() {
      const result = await getFoodItemsAction({});

      if (!isMounted) return;

      if (result.success) {
        setFoods(result.data ?? []);
      }

      setIsLoading(false);
    }

    void loadFoods();

    return () => {
      isMounted = false;
    };
  }, []);

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
          <p className="text-muted-foreground">Loading foods...</p>
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
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Heritage Foods of San Pedro
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover the culinary heritage and traditions of San Pedro
          </p>
        </div>

        {foods.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No foods found</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {foods.map((food) => (
              <Link
                key={food.id}
                href={`/foods/${encodeURIComponent(food.name)}`}
                className="group rounded-lg border border-border bg-card p-6 transition hover:border-primary hover:shadow-lg"
              >
                <h3 className="mb-2 text-lg font-semibold group-hover:text-primary">
                  {food.name}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {food.description}
                </p>
                {food.tags && food.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {food.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                      >
                        {tag.value}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
