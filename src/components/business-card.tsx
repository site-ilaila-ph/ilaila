import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { BusinessListItem } from "@/app/businesses/types";

export function ratingFor(business: BusinessListItem): number {
  if (!business.reviews.length) return 0;
  const sum = business.reviews.reduce(
    (acc: number, r: { foodQuality: number; service: number; ambiance: number; value: number }) => acc + (r.foodQuality + r.service + r.ambiance + r.value) / 4,
    0
  );
  return Math.round((sum / business.reviews.length) * 10) / 10;
}

interface BusinessCardProps {
  business: BusinessListItem;
  featured?: boolean;
}

export function BusinessCard({ business, featured }: BusinessCardProps) {
  const rating = ratingFor(business);
  const primaryImageUrl = business.images?.find((img: { url?: string }) => Boolean(img.url))?.url;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;

  return (
    <Card
      className={`group flex flex-col overflow-hidden rounded-xl border-brand-border p-0 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg ${
        featured ? "min-h-72" : "min-h-64"
      }`}
    >
      <Link href={`/businesses/${business.id}`} className="relative block">
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
            <Badge className="absolute bottom-3 left-3 bg-black/60 text-white backdrop-blur-xs hover:bg-black/60">
              {business.tags[0] ?? "Lokal na lugar"}
            </Badge>
          </div>
        ) : (
          <div className={`relative flex items-end bg-brand-deep p-5 text-white ${featured ? "h-36" : "h-28"}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,var(--color-brand-accent),transparent_38%)]" />
            <span className="relative text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {business.tags[0] ?? "Lokal na lugar"}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/businesses/${business.id}`}>
            <h3 className="font-heading text-xl font-bold transition group-hover:text-primary">{business.name}</h3>
          </Link>
          {rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
              <Star className="size-4 fill-brand-accent text-brand-accent" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{business.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-brand-border/60 pt-4 text-xs text-muted-foreground">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center gap-1 truncate font-medium text-primary hover:underline"
            title="Buksan ang exact location sa Google Maps"
          >
            <MapPin className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{business.address}</span>
            <ExternalLink className="ml-0.5 size-3 shrink-0" />
          </a>
          <Link
            href={`/businesses/${business.id}`}
            className="ml-auto inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline"
          >
            Detalye <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

