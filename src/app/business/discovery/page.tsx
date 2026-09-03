"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBusinessesAction } from "@/app/business/actions";
import type { BusinessListItem } from "@/app/business/services";

type Business = BusinessListItem;

export default function BusinessDiscoveryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
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
          <p>Nilo-load ang mga negosyo...</p>
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
              Mga Negosyo
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            Tuklasin ang mga Lokal na Negosyo
          </h1>
          <p className="text-lg text-muted-foreground">
            Tuklasin ang masiglang mundo ng pagkain at negosyo sa San Pedro
          </p>
        </div>

        {businesses.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Walang nakitang negosyo</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/business/${business.id}`}
                className="group rounded-lg border border-border bg-card p-6 transition hover:shadow-lg"
              >
                <h3 className="mb-2 text-lg font-semibold group-hover:text-primary">
                  {business.name}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {business.description}
                </p>
                <p className="text-sm text-primary font-medium">
                  {business.address}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
