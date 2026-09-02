"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBusinessesAction } from "@/app/business/actions";
import { getFoodItemsAction, getTopRatedFoodsAction } from "@/app/foods/actions";
import type { BusinessListItem } from "@/app/business/services";
import type { FoodListItem } from "@/app/foods/services";

export default function HomePage() {
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
  const [foods, setFoods] = useState<FoodListItem[]>([]);
  const [topRatedFoods, setTopRatedFoods] = useState<(FoodListItem & { averageRating: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [businessesResult, foodsResult, topRatedResult] = await Promise.all([
        getBusinessesAction({}),
        getFoodItemsAction({}),
        getTopRatedFoodsAction(3),
      ]);

      if (!isMounted) return;

      if (businessesResult.success) {
        setBusinesses((businessesResult.data ?? []).slice(0, 3));
      }
      if (foodsResult.success) {
        setFoods((foodsResult.data ?? []).slice(0, 3));
      }
      if (topRatedResult.success) {
        setTopRatedFoods(topRatedResult.data ?? []);
      }

      setIsLoading(false);
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
          >
            Ilaila
          </Link>
          <div className="flex gap-3">
            <Link
              href="/auth/sign-in"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Welcome to Ilaila
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover the heritage food and business ecosystem of San Pedro
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-16">
          <Link
            href="/business/discovery"
            className="rounded-lg border border-border bg-card p-6 transition hover:border-primary hover:shadow-lg"
          >
            <div className="mb-4 text-3xl">🏪</div>
            <h2 className="mb-2 text-xl font-semibold">Discover Businesses</h2>
            <p className="text-sm text-muted-foreground">
              Browse local businesses and restaurants in San Pedro
            </p>
          </Link>

          <Link
            href="/foods"
            className="rounded-lg border border-border bg-card p-6 transition hover:border-primary hover:shadow-lg"
          >
            <div className="mb-4 text-3xl">🍲</div>
            <h2 className="mb-2 text-xl font-semibold">Heritage Foods</h2>
            <p className="text-sm text-muted-foreground">
              Learn about traditional foods and recipes
            </p>
          </Link>

          <Link
            href="/about/san-pedro"
            className="rounded-lg border border-border bg-card p-6 transition hover:border-primary hover:shadow-lg"
          >
            <div className="mb-4 text-3xl">📍</div>
            <h2 className="mb-2 text-xl font-semibold">About San Pedro</h2>
            <p className="text-sm text-muted-foreground">
              Discover the history and culture of the area
            </p>
          </Link>
        </div>

        {!isLoading && (
          <>
            {businesses.length > 0 && (
              <section className="mb-16">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Featured Businesses</h2>
                  <Link href="/business/discovery" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {businesses.map((business) => (
                    <Link
                      key={business.id}
                      href={`/business/${business.id}`}
                      className="rounded-lg border border-border bg-card p-6 transition hover:border-primary hover:shadow-lg"
                    >
                      <h3 className="mb-2 text-lg font-semibold hover:text-primary">
                        {business.name}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                        {business.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {business.address}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {foods.length > 0 && (
              <section className="mb-16">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Heritage Foods</h2>
                  <Link href="/foods" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {foods.map((food) => (
                    <Link
                      key={food.id}
                      href={`/foods/${encodeURIComponent(food.name)}`}
                      className="rounded-lg border border-border bg-card p-6 transition hover:border-primary hover:shadow-lg"
                    >
                      <h3 className="mb-2 text-lg font-semibold hover:text-primary">
                        {food.name}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                        {food.description}
                      </p>
                      {food.tags && food.tags.length > 0 && (
                        <div className="flex gap-1">
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
              </section>
            )}

            {topRatedFoods.length > 0 && (
              <section className="mb-16">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Top Rated Foods</h2>
                  <Link href="/foods" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {topRatedFoods.map((food) => (
                    <Link
                      key={food.id}
                      href={`/foods/${encodeURIComponent(food.name)}`}
                      className="rounded-lg border border-border bg-card p-6 transition hover:border-primary hover:shadow-lg"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-lg font-semibold hover:text-primary">
                          {food.name}
                        </h3>
                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1">
                          <span className="text-sm font-bold text-primary">
                            {food.averageRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-primary">⭐</span>
                        </div>
                      </div>
                      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                        {food.description}
                      </p>
                      {food.tags && food.tags.length > 0 && (
                        <div className="flex gap-1">
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
              </section>
            )}
          </>
        )}

        <section className="rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Want to learn more?</h2>
          <p className="mb-6 text-muted-foreground">
            Visit our about pages to learn more about San Pedro and our mission
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/about/the-team"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Meet the Team
            </Link>
            <Link
              href="/about/the-website"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              About Ilaila
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
