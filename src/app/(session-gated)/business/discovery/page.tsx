"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
import { getBusinessesAction } from "@/app/(session-gated)/business/actions";
import type { BusinessListItem } from "@/app/(session-gated)/business/services";
import { Button } from "@/lib/components/actions/button";

function ratingFor(business: BusinessListItem) {
  if (!business.reviews.length) return 0;
  return Math.round((business.reviews.reduce((sum, review) => sum + (review.foodQuality + review.service + review.ambiance + review.value) / 4, 0) / business.reviews.length) * 10) / 10;
}

export default function BusinessDiscoveryPage() {
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All places");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBusinessesAction({}).then((result) => {
      if (result.success) setBusinesses(result.data ?? []);
      setIsLoading(false);
    });
  }, []);

  const tags = useMemo(() => ["All places", ...new Set(businesses.flatMap((business) => business.tags.map((item) => item.value)))], [businesses]);
  const filtered = useMemo(() => businesses.filter((business) => {
    const searchable = `${business.name} ${business.description} ${business.address} ${business.tags.map((item) => item.value).join(" ")}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (tag === "All places" || business.tags.some((item) => item.value === tag));
  }), [businesses, query, tag]);
  const topRated = [...businesses].sort((a, b) => ratingFor(b) - ratingFor(a)).slice(0, 3);

  return (
    <main className="min-h-screen bg-brand-bg text-foreground">
      <nav className="border-b border-brand-border bg-brand-bg/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/home" className="font-heading text-xl font-bold tracking-tight text-primary">ilaila<span className="text-brand-accent">.</span></Link><div className="flex items-center gap-5 text-sm font-medium"><Link href="/foods" className="text-muted-foreground hover:text-foreground">Heritage foods</Link><Link href="/business/discovery" className="text-primary">Businesses</Link></div></div></nav>
      <section className="border-b border-brand-border bg-brand-bg-accent px-6 py-16 sm:py-24"><div className="mx-auto max-w-7xl"><p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-brand-accent">San Pedro, Laguna</p><div className="max-w-3xl"><h1 className="font-heading text-5xl font-bold leading-[0.98] tracking-tight sm:text-7xl">Find your next local favorite.</h1><p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Independent restaurants, neighborhood cafes, and places worth crossing town for.</p></div><div className="mt-10 flex max-w-2xl items-center gap-3 rounded-2xl border border-brand-border bg-white p-2 shadow-sm"><Search className="ml-3 size-5 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search places, food, or neighborhood" className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none" /><Button size="lg" className="hidden sm:inline-flex">Search</Button></div></div></section>
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        {topRated.length > 0 && <section className="mb-16"><div className="mb-6 flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-accent">Worth a visit</p><h2 className="mt-2 font-heading text-3xl font-bold">Community favorites</h2></div><span className="hidden text-sm text-muted-foreground sm:block">Based on local reviews</span></div><div className="grid gap-5 md:grid-cols-3">{topRated.map((business) => <BusinessCard key={business.id} business={business} featured />)}</div></section>}
        <section id="all-places"><div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-accent">The directory</p><h2 className="mt-2 font-heading text-3xl font-bold">Explore San Pedro</h2></div><div className="flex items-center gap-2 text-sm text-muted-foreground"><SlidersHorizontal className="size-4" />{filtered.length} {filtered.length === 1 ? "place" : "places"}</div></div><div className="mb-8 flex gap-2 overflow-x-auto pb-2">{tags.map((item) => <button key={item} onClick={() => setTag(item)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${tag === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white hover:border-primary"}`}>{item}</button>)}</div>{isLoading ? <p className="py-16 text-center text-muted-foreground">Finding local places...</p> : filtered.length === 0 ? <div className="border border-dashed border-border bg-white p-12 text-center"><p className="font-semibold">No places match that search.</p><button onClick={() => { setQuery(""); setTag("All places"); }} className="mt-2 text-sm text-primary underline">Clear filters</button></div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((business) => <BusinessCard key={business.id} business={business} />)}</div>}</section>
      </div>
    </main>
  );
}

function BusinessCard({ business, featured = false }: { business: BusinessListItem; featured?: boolean }) {
  const rating = ratingFor(business);
  return <Link href={`/business/${encodeURIComponent(business.name.toLowerCase().replaceAll(" ", "-"))}`} className={`group flex flex-col overflow-hidden border border-brand-border bg-white transition hover:-translate-y-1 hover:border-primary hover:shadow-lg ${featured ? "min-h-64" : "min-h-56"}`}><div className={`relative flex items-end bg-brand-deep p-5 text-white ${featured ? "h-36" : "h-28"}`}><div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,var(--color-brand-accent),transparent_38%)]" /><span className="relative text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">{business.tags[0]?.value ?? "Local place"}</span></div><div className="flex flex-1 flex-col p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-heading text-xl font-bold group-hover:text-primary">{business.name}</h3>{rating > 0 && <span className="flex shrink-0 items-center gap-1 text-sm font-semibold"><Star className="size-4 fill-brand-accent text-brand-accent" />{rating.toFixed(1)}</span>}</div><p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{business.description}</p><div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-muted-foreground"><span className="flex min-w-0 items-center gap-1 truncate"><MapPin className="size-3.5 shrink-0 text-primary" />{business.address}</span><ArrowRight className="size-4 shrink-0 text-primary transition group-hover:translate-x-1" /></div></div></Link>;
}

/*
 * LEGACY VERSION - intentionally disabled for reference.
 * The active implementation above replaces this original simple directory.
 *
 * "use client";
 * import { useEffect, useState } from "react";
 * import Link from "next/link";
 * import { getBusinessesAction } from "@/app/business/actions";
 * import type { BusinessListItem } from "@/app/business/services";
 *
 * type Business = BusinessListItem;
 *
 * export default function BusinessDiscoveryPage() {
 *   const [businesses, setBusinesses] = useState<Business[]>([]);
 *   const [isLoading, setIsLoading] = useState(true);
 *
 *   useEffect(() => {
 *     let isMounted = true;
 *     async function loadBusinesses() {
 *       const result = await getBusinessesAction({});
 *       if (!isMounted) return;
 *       if (result.success) setBusinesses(result.data ?? []);
 *       setIsLoading(false);
 *     }
 *     void loadBusinesses();
 *     return () => { isMounted = false; };
 *   }, []);
 *
 *   if (isLoading) return <main className="min-h-screen bg-background text-foreground"><nav className="border-b border-border bg-card/80 backdrop-blur"><div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4"><Link href="/home" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary">Ilaila</Link></div></nav><div className="mx-auto max-w-6xl px-6 py-20 text-center"><p>Loading businesses...</p></div></main>;
 *
 *   return <main className="min-h-screen bg-background text-foreground"><nav className="border-b border-border bg-card/80 backdrop-blur"><div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4"><Link href="/home" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary">Ilaila</Link><div className="flex gap-3"><Link href="/business/discovery" className="rounded-full border border-border px-4 py-2 text-sm font-medium">Businesses</Link></div></div></nav><div className="mx-auto max-w-6xl px-6 py-20"><div className="mb-12 text-center"><h1 className="mb-4 text-4xl font-bold tracking-tight">Discover Local Businesses</h1><p className="text-lg text-muted-foreground">Explore the vibrant food and business scene of San Pedro</p></div>{businesses.length === 0 ? <div className="rounded-lg border border-border bg-card p-8 text-center"><p className="text-muted-foreground">No businesses found</p></div> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{businesses.map((business) => <Link key={business.id} href={`/business/${business.id}`} className="group rounded-lg border border-border bg-card p-6 transition hover:shadow-lg"><h3 className="mb-2 text-lg font-semibold group-hover:text-primary">{business.name}</h3><p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{business.description}</p><p className="text-sm font-medium text-primary">{business.address}</p></Link>)}</div>}</div></main>;
 * }
 */
