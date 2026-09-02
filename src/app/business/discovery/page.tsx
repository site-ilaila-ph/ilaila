"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBusinessesAction } from "@/app/business/actions";
import type { BusinessListItem } from "@/app/business/services";

type Business = BusinessListItem;

export default function BusinessDiscoveryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBusinesses() {
      const result = await getBusinessesAction({});

      if (!isMounted) return;

      if (result.success) {
        setBusinesses(result.data ?? []);
      }

      setIsLoading(false);
    }

    void loadBusinesses();

    return () => {
      isMounted = false;
    };
  }, []);

  const allTags = Array.from(
    new Set(businesses.flatMap((b) => b.tags?.map((t) => t.value) ?? []))
  );

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (business.description && business.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (business.address && business.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag =
      selectedTag === "all" ||
      (business.tags && business.tags.some((t) => t.value === selectedTag));

    return matchesSearch && matchesTag;
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
              Ilaila
            </Link>
          </div>
        </nav>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p>Loading businesses...</p>
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
          <div className="flex gap-3">
            <Link
              href="/business/discovery"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium"
            >
              Businesses
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Local Ecosystem
          </span>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Discover Local Businesses
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Explore vibrant local businesses, cozy eateries, and authentic culinary spots in San Pedro.
          </p>

          <div className="mx-auto mt-8 max-w-md">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search businesses, addresses, descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-3 pr-4 pl-10 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setSelectedTag("all")}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  selectedTag === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    selectedTag === tag
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-card border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredBusinesses.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
            <div className="mb-3 text-4xl">🏪</div>
            <h3 className="text-lg font-semibold">No matching businesses found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search query or tag filter to discover more places.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBusinesses.map((business) => (
              <Link
                key={business.id}
                href={`/business/${business.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-lg bg-primary/10 p-2.5 text-xl">🏪</span>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition">
                      View Profile &rarr;
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold tracking-tight group-hover:text-primary transition">
                    {business.name}
                  </h3>
                  <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {business.description}
                  </p>
                </div>

                <div>
                  <p className="mb-4 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <span>📍</span> {business.address}
                  </p>

                  {business.tags && business.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/50">
                      {business.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-block rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                        >
                          {tag.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
