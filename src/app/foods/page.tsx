"use client";

import Link from "next/link";
import Image from "next/image";
import type { FoodListItem } from "./types";
import { useState, useEffect } from "react";

export default function FoodsPage() {
  const [foods, setFoods] = useState<FoodListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadFoods() {
      const response = await fetch("/api/foods");
      const data = await response.json();

      if (!isMounted) return;

      setFoods(data ?? []);
      setIsLoading(false);
    }

    void loadFoods();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (food.tags && food.tags.some((t) => t.value.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <nav className="border-b border-border bg-card/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
            >
              <Image src="/icon.svg" alt="Ilaila Logo" width={28} height={28} />
              <Image src="/icon.svg" alt="Ilaila Logo" width={28} height={28} />
              Ilaila
            </Link>
          </div>
        </nav>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-muted-foreground">Naglo-load ng mga pagkain...</p>
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

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Pamana ng Kainan
          </span>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Mga Pagkaing Pamana ng San Pedro
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Tuklasin ang mga tunay na lasa, tradisyunal na resipe, at malalim na pamana ng kultura ng lutuing San Pedro.
          </p>

          <div className="mx-auto mt-8 max-w-md">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                🔍
              </span>
              <input
                type="text"
                placeholder="Maghanap ng mga tradisyunal na ulam, sangkap, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-3 pr-4 pl-10 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {filteredFoods.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
            <div className="mb-3 text-4xl">🍲</div>
            <h3 className="text-lg font-semibold">Walang nakitang tugmang pagkain</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Subukang isaayos ang iyong paghahanap upang makahanap ng higit pang mga pagkaing pamana.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFoods.map((food) => (
              <Link
                key={food.id}
                href={`/foods/${food.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-lg bg-primary/10 p-2.5 text-xl">🍲</span>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition">
                      Tingnan ang Resipe &rarr;
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold tracking-tight group-hover:text-primary transition">
                    {food.name}
                  </h3>
                  <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {food.description}
                  </p>
                </div>

                {food.tags && food.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/50">
                    {food.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
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
