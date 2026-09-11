"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
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
    fetch("/api/businesses")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await readProblemMessage(response, `Failed to load businesses: ${response.status}`));
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Expected businesses array");
        }

        return data as BusinessListItem[];
      })
      .then((data) => {
        setBusinesses(data);
      })
      .catch((error) => {
        console.error(error);
        setLoadError(error instanceof Error ? error.message : "Failed to load businesses");
        setBusinesses([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const tags = useMemo(() => ["Lahat ng lugar", ...new Set(businesses.flatMap((business) => business.tags.map((item) => item.value)))], [businesses]);
  const filtered = useMemo(() => businesses.filter((business) => {
    const searchable = `${business.name} ${business.description} ${business.address} ${business.tags.map((item) => item.value).join(" ")}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (tag === "Lahat ng lugar" || business.tags.some((item) => item.value === tag));
  }), [businesses, query, tag]);
  const topRated = [...businesses].sort((a, b) => ratingFor(b) - ratingFor(a)).slice(0, 3);

  return (
    <main className="min-h-screen bg-brand-bg text-foreground">
      <nav className="border-b border-brand-border bg-brand-bg/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/home" className="font-heading text-xl font-bold tracking-tight text-primary">ilaila<span className="text-brand-accent">.</span></Link><div className="flex items-center gap-5 text-sm font-medium"><Link href="/foods" className="text-muted-foreground hover:text-foreground">Pagkaing pamana</Link><Link href="/businesses/discovery" className="text-primary">Mga Negosyo</Link></div></div></nav>
      <section className="border-b border-brand-border bg-brand-bg-accent px-6 py-16 sm:py-24"><div className="mx-auto max-w-7xl"><p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-brand-accent">San Pedro, Laguna</p><div className="max-w-3xl"><h1 className="font-heading text-5xl font-bold leading-[0.98] tracking-tight sm:text-7xl">Tuklasin ang iyong susunod na paboritong lugar.</h1><p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Mga independiyenteng restawran, kapitbahay na kapehan, at mga lugar na sulit puntahan.</p></div><div className="mt-10 flex max-w-2xl items-center gap-3 rounded-2xl border border-brand-border bg-white p-2 shadow-sm"><Search className="ml-3 size-5 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Maghanap ng lugar, pagkain, o kapitbahayan" className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none" /><Button size="lg" className="hidden sm:inline-flex">Hanapin</Button></div></div></section>
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <ErrorAlert message={loadError} className="mb-4" onDismiss={() => setLoadError(null)} />
        {topRated.length > 0 && <section className="mb-16"><div className="mb-6 flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-accent">Sulit bisitahin</p><h2 className="mt-2 font-heading text-3xl font-bold">Mga paboritong sikat sa komunidad</h2></div><span className="hidden text-sm text-muted-foreground sm:block">Batay sa mga lokal na review</span></div><div className="grid gap-5 md:grid-cols-3">{topRated.map((business) => <BusinessCard key={business.id} business={business} featured />)}</div></section>}
        <section id="all-places"><div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-accent">Ang direktoryo</p><h2 className="mt-2 font-heading text-3xl font-bold">Tuklasin ang San Pedro</h2></div><div className="flex items-center gap-2 text-sm text-muted-foreground"><SlidersHorizontal className="size-4" />{filtered.length} {filtered.length === 1 ? "lugar" : "mga lugar"}</div></div><div className="mb-8 flex gap-2 overflow-x-auto pb-2">{tags.map((item) => <button key={item} onClick={() => setTag(item)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${tag === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white hover:border-primary"}`}>{item}</button>)}</div>{isLoading ? <p className="py-16 text-center text-muted-foreground">Hinahanap ang mga lokal na lugar...</p> : filtered.length === 0 ? <div className="border border-dashed border-border bg-white p-12 text-center"><p className="font-semibold">Walang lugar na tumugma sa iyong paghahanap.</p><button onClick={() => { setQuery(""); setTag("Lahat ng lugar"); }} className="mt-2 text-sm text-primary underline">I-clear ang mga filter</button></div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((business) => <BusinessCard key={business.id} business={business} />)}</div>}</section>
      </div>
    </main>
  );
}

function BusinessCard({ business, featured = false }: { business: BusinessListItem; featured?: boolean }) {
  const rating = ratingFor(business);
  const primaryImageUrl = business.images?.find((img) => Boolean(img.url))?.url;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;

  return (
    <div className={`group flex flex-col overflow-hidden rounded-xl border border-brand-border bg-white transition hover:-translate-y-1 hover:border-primary hover:shadow-lg ${featured ? "min-h-72" : "min-h-64"}`}>
      <Link href={`/businesses/${business.id}`} className="block relative">
        {primaryImageUrl ? (
          <div className={`relative w-full overflow-hidden bg-muted ${featured ? "h-44" : "h-36"}`}>
            <Image
              src={primaryImageUrl}
              alt={business.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
              {business.tags[0]?.value ?? "Lokal na lugar"}
            </span>
          </div>
        ) : (
          <div className={`relative flex items-end bg-brand-deep p-5 text-white ${featured ? "h-36" : "h-28"}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,var(--color-brand-accent),transparent_38%)]" />
            <span className="relative text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
              {business.tags[0]?.value ?? "Lokal na lugar"}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/businesses/${business.id}`}>
            <h3 className="font-heading text-xl font-bold group-hover:text-primary transition">
              {business.name}
            </h3>
          </Link>
          {rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
              <Star className="size-4 fill-brand-accent text-brand-accent" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {business.description}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-brand-border/60 text-xs text-muted-foreground">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center gap-1 truncate text-primary hover:underline font-medium"
            title="Buksan ang exact location sa Google Maps"
          >
            <MapPin className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{business.address}</span>
            <ExternalLink className="size-3 shrink-0 ml-0.5" />
          </a>

          <Link
            href={`/businesses/${business.id}`}
            className="inline-flex items-center gap-1 text-primary hover:underline font-medium shrink-0 ml-auto"
          >
            Detalle <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}