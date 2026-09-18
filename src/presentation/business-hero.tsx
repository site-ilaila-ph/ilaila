import Image from "next/image";
import { ExternalLink, MapPin, Star } from "lucide-react";
import type { BusinessListItem } from "@/app/businesses/types";
import type { LightboxImage } from "./image-lightbox";

interface BusinessHeroProps {
  business: BusinessListItem;
  primaryImage?: LightboxImage;
  averageRating: number;
  metricRatings: [string, number][];
  googleMapsUrl: string;
}

export function BusinessHero({
  business,
  primaryImage,
  averageRating,
  metricRatings,
  googleMapsUrl,
}: BusinessHeroProps) {
  return (
    <header className="mb-12 border-b border-brand-border pb-10">
      {primaryImage?.url ? (
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-brand-border bg-black shadow-xl">
          <div className="relative aspect-21/9 min-h-75 w-full sm:min-h-[400px]">
            <Image
              src={primaryImage.url}
              alt={primaryImage.description || business.name}
              fill
              unoptimized
              priority
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-10">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-accent">
                San Pedro, Laguna
              </p>
              <h1 className="font-heading text-4xl font-bold leading-none drop-shadow-md sm:text-6xl">
                {business.name}
              </h1>
              {primaryImage.description && (
                <p className="mt-2 max-w-2xl line-clamp-2 text-sm text-white/80">{primaryImage.description}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 flex min-h-64 items-end rounded-2xl bg-primary p-7 text-white sm:p-10">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              San Pedro, Laguna
            </p>
            <h1 className="font-heading text-5xl font-bold leading-none sm:text-7xl">{business.name}</h1>
          </div>
        </div>
      )}

      <p className="mb-7 max-w-3xl text-lg leading-relaxed text-muted-foreground">{business.description}</p>

      <div className="flex flex-wrap gap-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Rating</p>
          <p className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Star className="size-5 fill-brand-accent text-brand-accent" />
            {averageRating}/5
          </p>
          <p className="text-xs text-muted-foreground">({business.reviews.length} na review)</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Lokasyon</p>
          <p className="text-lg font-semibold">{business.address}</p>
          <a
            className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin className="size-3.5" /> Buksan sa Google Maps <ExternalLink className="size-3" />
          </a>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Oras ng Bukas</p>
          <p className="text-lg font-semibold">{business.hours}</p>
        </div>
      </div>

      {business.tags && business.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {business.tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              {tag}
            </span>
          ))}
        </div>
      )}

      {business.reviews.length > 0 && (
        <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-4">
          {metricRatings.map(([label, total]) => (
            <div key={label} className="border-l-2 border-brand-accent pl-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 font-semibold">{(total / business.reviews.length).toFixed(1)} / 5</p>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

