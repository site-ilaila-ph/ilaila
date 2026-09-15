"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Utensils } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { FoodCard } from "@/components/food-card";
import { Input } from "@/components/ui/input";
import { ErrorAlert } from "@/components/ui/error-alert";
import { api, ApiProblemError } from "@/lib/api/client";
import type { FoodListItem } from "./types";

export default function FoodsPage() {
  const [foods, setFoods] = useState<FoodListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstMount = useRef(true);

  const loadFoods = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const url = query ? `/api/foods?search=${encodeURIComponent(query)}` : "/api/foods";
      const data = await api<FoodListItem[]>(url);
      setFoods(data ?? []);
      setLoadError(null);
    } catch (error) {
      console.error("Failed to load foods:", error);
      setLoadError(
        error instanceof ApiProblemError
          ? error.problem.detail || error.problem.title
          : "Hindi na-load ang mga pagkain. Subukang muli mamaya."
      );
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      void loadFoods("");
    } else {
      debounceRef.current = setTimeout(() => loadFoods(searchQuery.trim()), 300);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, loadFoods]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <AppNav brandHref="/home" />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-muted-foreground">Naglo-load ng mga pagkain...</p>
        </div>
      </main>
    );
  }

  const hasResults = foods.length > 0;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppNav brandHref="/home" />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <ErrorAlert message={loadError} className="mb-6" onDismiss={() => setLoadError(null)} />
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Pamana ng Kainan
          </span>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Mga Pagkaing Pamana ng San Pedro
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Tuklasin ang mga tunay na lasa, tradisyunal na resipe, at malalim na pamana ng kultura ng luts
          </p>
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <Input
                type="search"
                placeholder="Hanapin ang pagkain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full transition placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
              {isSearching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground">
                  <Utensils size={12} />
                </span>
              )}
            </div>
          </div>
        </div>
        {!hasResults ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
            <h3 className="flex items-center justify-center gap-2 text-lg font-semibold">
              <Utensils aria-hidden="true" className="size-6 shrink-0 text-primary" />
              Walang nakitang tugmang pagkain
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Subukang isaayos ang iyong paghahanap upang makahanap ng higit pang mga pagkaing pamana.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {foods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
