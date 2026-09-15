"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, MapPin, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { readProblemMessage } from "@/lib/api/client";
import type { BusinessListItem } from "../types";

function ratingFor(business: BusinessListItem) {
  if (!business.reviews.length) return 0;
  return Math.round((business.reviews.reduce((sum, review) => sum + (review.foodQuality + review.service + review.ambiance + review.value) / 4, 0) / business.reviews.length) * 10) / 10;
}

export default function BusinessDiscoveryPage() {
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("Lahat ng lugar");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetch("/api/businesses")
      .then(r => {
        if (!r.ok) throw new Error(await readProblemMessage(r, `Failed to load businesses: ${r.status}`));
        return r.json();
      })
      .then(data => { if (isMounted) { if (Array.isArray(data)) setBusinesses(data as BusinessListItem[]); setIsLoading(false); } })
      .catch(err => {
        console.error(err);
        if (isMounted) {
          setLoadError(err instanceof Error ? err.message : "Failed to load businesses");
          setBusinesses([]);
          setIsLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!query.trim()) return;
    const params = new URLSearchParams();
    params.set("filter", "name:contains:" + encodeURIComponent(query.trim()));
    const url = "/api/businesses?" + params.toString();
    let isMounted = true;
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(await readProblemMessage(r, `Failed to load businesses: ${r.status}`));
        return r.json();
      })
      .then(data => { if (isMounted) { if (Array.isArray(data)) setBusinesses(data as BusinessListItem[]); } })
      .catch(err => console.error(err));
    return () => { isMounted = false; };
  }, [query]);

  const tags = useMemo(() => ["Lahat ng lugar", ...new Set(businesses.flatMap((business) => business.tags.map((item) => item.value)))], [businesses]);
  const filtered = useMemo(() => {
    if (tag === "Lahat ng lugar") return businesses;
    return businesses.filter((business) => business.tags.some((item) => item.value === tag));
  }, [businesses, tag]);
  const topRated = useMemo(() => [...filtered].sort((a, b) => ratingFor(b) - ratingFor(a)).slice(0, 3), [filtered]);

  return (
    <main className="min-h-screen bg-brand-bg text-foreground">
      <nav className="border-b border-brand-border bg-brand-bg/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/home" className="font-heading text-xl font-bold tracking-tight text-primary">ilaila<span className="text-brand-accent">.</span></Link><div className="flex items-center gap-5 text-sm font-medium"><Link href="/foods" className="text-muted-foreground hover:text-foreground">Pagkaing pamana</Link><Link href="/businesses/discovery" className="text-primary">Mga Negosyo</Link></div></div></nav>
      <section className="border-b border-brand-border bg-brand-bg-accent px-6 py-16 sm:py-24"><div className="mx-auto max-w-7xl"><p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-brand-accent">San Pedro, Laguna</p><div className="max-w-3xl"><h1 className="font-heading text-5xl font-bold leading-[0.98] tracking-tight sm:text-7xl">Tuklasin ang iyong susunod na paboritong lugar.</h1><p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Mga independiyenteng restawran, kapitbahay na kapehan, at mga lokal na negosyo na handang ibigay ang pinakamagandang karanasan sa San Pedro, Laguna.</p></div></div></section>

      <div className="border-b border-brand-border bg-card/40 px-6 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Maghanap ng lugar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              variant="secondary"
              className="rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground shadow-xs"
              onClick={() => { if (query.trim()) { const p = new URLSearchParams(); p.set("filter", "name:contains:" + encodeURIComponent(query.trim())); window.location.href = "/businesses/discovery?" + p.toString(); } }}
            >
              Hanapin
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tags.map((t) => (
              <Button
                key={t}
                variant={tag === t ? "default" : "outline"}
                size="sm"
                className="shrink-0 border border-border bg-card text-xs font-medium shadow-xs"
                onClick={() => setTag(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-brand-border bg-brand-bg/50 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Mga Napapaborito</h2>
            <Link href="/businesses/discovery" className="text-sm text-primary hover:underline">Tingnan lahat</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topRated.map((business) => <BusinessCard key={business.id} business={business} featured={true} />)}
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
              {filtered.map((business) => <BusinessCard key={business.id} business={business} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function BusinessCard({ business, featured }: { business: BusinessListItem; featured?: boolean }) {
  const rating = ratingFor(business);
  const primaryImageUrl = business.images?.find((img) => Boolean(img.url))?.url;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;

  return (
    <div className={`group flex flex-col overflow-hidden rounded-xl border border-brand-border bg-card transition hover:-translate-y-1 hover:border-primary hover:shadow-lg ${featured ? "min-h-72" : "min-h-64"}`}>
      <Link href={`/businesses/${business.id}`} className="block relative">
        {primaryImageUrl ? (
          <div className={`relative w-full overflow-hidden bg-muted ${featured ? "h-44" : "h-36"}`}>
            <Image src={primaryImageUrl} alt={business.name} fill unoptimized className="object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
              {business.tags[0]?.value ?? "Lokal na lugar"}
            </span>
          </div>
        ) : (
          <div className={`relative flex items-end bg-brand-deep p-5 text-white ${featured ? "h-36" : "h-28"}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,var(--color-brand-accent),transparent_38%)]" />
            <span className="relative text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {business.tags[0]?.value ?? "Lokal na lugar"}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/businesses/${business.id}`}>
            <h3 className="font-heading text-xl font-bold group-hover:text-primary transition">{business.name}</h3>
          </Link>
          {rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
              <Star className="size-4 fill-brand-accent text-brand-accent" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{business.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-brand-border/60 text-xs text-muted-foreground">
          <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-1 truncate text-primary hover:underline font-medium" title="Buksan ang exact location sa Google Maps">
            <MapPin className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{business.address}</span>
            <ExternalLink className="size-3 shrink-0 ml-0.5" />
          </a>
          <Link href={`/businesses/${business.id}`} className="inline-flex items-center gap-1 text-primary hover:underline font-medium shrink-0 ml-auto">
            Detalle <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
