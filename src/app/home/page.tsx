"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/app-nav";
import { HomeCategoryCards } from "@/components/home-category-cards";
import { HomeLearnMore } from "@/components/home-learn-more";
import { ErrorAlert } from "@/components/ui/error-alert";
import { readProblemMessage } from "@/lib/api/client";
import type { BusinessListItem } from "@/app/businesses/types";
import type { FoodListItem } from "@/app/foods/types";

export default function HomePage() {
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
  const [foods, setFoods] = useState<FoodListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [businessesResponse, foodsResponse] = await Promise.all([
        fetch("/api/businesses"),
        fetch("/api/foods"),
      ]);

      if (!isMounted) return;

      const failed = [businessesResponse, foodsResponse].find((response) => !response.ok);
      if (failed) {
        setLoadError(await readProblemMessage(failed, "Hindi na-load ang nilalaman. Subukang muli mamaya."));
      }

      const [businessesData, foodsData] = await Promise.all([
        businessesResponse.ok ? businessesResponse.json() : Promise.resolve([]),
        foodsResponse.ok ? foodsResponse.json() : Promise.resolve([]),
      ]);

      setBusinesses(businessesData ?? []);
      setFoods(foodsData ?? []);

      setIsLoading(false);
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav brandHref="/">
        <Link
          href="/auth/sign-out"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
        >
          Mag-sign out
        </Link>
      </AppNav>

      <main className="mx-auto max-w-6xl px-6 py-20">
        <ErrorAlert message={loadError} className="mb-6" onDismiss={() => setLoadError(null)} />
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Maligayang pagdating sa Ilaila
          </h1>
          <p className="text-lg text-muted-foreground">
            Tuklasin ang pamanang pagkain at mga negosyo ng San Pedro
          </p>
        </div>

        <HomeCategoryCards />

        {!isLoading && (
          <>
            {businesses.length > 0 && (
              <section className="mb-16">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Mga tampok na negosyo</h2>
                  <Link href="/businesses/discovery" className="text-sm text-primary hover:underline">
                    Tingnan lahat
                  </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {businesses.map((business) => {
                    const primaryImageUrl = business.images?.find((img) => Boolean(img.url))?.url;

                    return (
                      <Link
                        key={business.id}
                        href={`/businesses/${business.id}`}
                        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary hover:shadow-lg"
                      >
                        {primaryImageUrl ? (
                          <div className="relative aspect-video w-full overflow-hidden bg-muted">
                            <Image
                              src={primaryImageUrl}
                              alt={business.name}
                              width={400}
                              height={225}
                              unoptimized
                              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        ) : null}

                        <div className="p-6">
                          <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition">
                            {business.name}
                          </h3>
                          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                            {business.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {business.address}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {foods.length > 0 && (
              <section className="mb-16">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Mga pagkaing pamana</h2>
                  <Link href="/foods" className="text-sm text-primary hover:underline">
                    Tingnan lahat
                  </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {foods.map((food) => (
                    <Link
                      key={food.id}
                      href={`/foods/${food.id}`}
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
                              key={tag}
                              className="inline-block rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                            >
                              {tag}
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

        <HomeLearnMore />
      </main>
    </div>
  );
}
