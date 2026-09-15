"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { BusinessCard, ratingFor } from "@/components/business-card";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiProblemError } from "@/lib/api/client";
import type { BusinessListItem } from "../types";

const tags = [
  "Lahat",
  "Kainan",
  "Kapehan",
  "Panghimagas",
  "Pamana",
  "Inumin",
  "Pasalubong",
];

async function fetchBusinesses(): Promise<BusinessListItem[]> {
  return api<BusinessListItem[]>("/api/businesses");
}

export default function BusinessDiscoveryPage() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("Lahat");

  const { data: businesses = [], isLoading, error } = useQuery({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
  });

  const filtered = useMemo(
    () =>
      businesses.filter((business) => {
        const matchesQuery =
          business.name.toLowerCase().includes(query.toLowerCase()) ||
          business.description.toLowerCase().includes(query.toLowerCase()) ||
          business.address.toLowerCase().includes(query.toLowerCase());

        const matchesTag = tag === "Lahat" || business.tags.includes(tag);

        return matchesQuery && matchesTag;
      }),
    [businesses, query, tag]
  );

  const topRated = useMemo(
    () => [...filtered].sort((a, b) => ratingFor(b) - ratingFor(a)).slice(0, 3),
    [filtered]
  );

  return (
    <main className="min-h-screen bg-brand-bg text-foreground">
      <AppNav
        brandHref="/home"
        brandTitle="ilaila"
        brandSubtitle={<span className="text-brand-accent">.</span>}
        className="border-b border-brand-border bg-brand-bg/90 backdrop-blur"
        containerClassName="max-w-7xl px-6 py-5"
      >
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link href="/foods" className="text-muted-foreground hover:text-foreground">
            Pagkaing pamana
          </Link>
          <Link href="/businesses/discovery" className="text-primary">
            Mga Negosyo
          </Link>
        </div>
      </AppNav>

      <section className="border-b border-brand-border bg-brand-bg-accent px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-brand-accent">
            San Pedro, Laguna
          </p>
          <div className="max-w-3xl">
            <h1 className="font-heading text-5xl font-bold leading-[0.98] tracking-tight sm:text-7xl">
              Tuklasin ang iyong susunod na paboritong lugar.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Mga independiyenteng restawran, kapitbahay na kapehan, at mga lokal na negosyo na handang ibigay ang
              pinakamagandang karanasan sa San Pedro, Laguna.
            </p>
          </div>
        </div>
      </section>

      <div className="border-b border-brand-border bg-card/40 px-6 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Maghanap ng lugar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tags.map((t) => (
              <Button
                key={t}
                variant={tag === t ? "default" : "outline"}
                size="sm"
                className="shrink-0 shadow-xs"
                onClick={() => setTag(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-7xl px-6 pt-6">
          <ErrorAlert
            message={
              error instanceof ApiProblemError
                ? error.problem.detail || error.problem.title
                : error instanceof Error
                  ? error.message
                  : "Failed to load businesses"
            }
          />
        </div>
      )}

      {isLoading ? (
        <div className="px-6 py-8">
          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-brand-border bg-brand-bg/50 px-6 py-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Mga Napapaborito</h2>
                <Link href="/businesses/discovery" className="text-sm text-primary hover:underline">
                  Tingnan lahat
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topRated.map((business) => (
                  <BusinessCard key={business.id} business={business} featured />
                ))}
              </div>
            </div>
          </div>

          <div className="border-b border-brand-border bg-brand-bg/30 px-6 py-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Lahat ng Mga Negosyo</h2>
                <span className="text-sm text-muted-foreground">{filtered.length} na lugar</span>
              </div>
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">Walang nakitang lugar.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}