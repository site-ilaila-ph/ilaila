import Image from "next/image";
import type { FoodDetail } from "@/app/foods/types";
import type { LightboxImage } from "./image-lightbox";

interface FoodHeroProps {
  food: FoodDetail;
  primaryImage: LightboxImage | null;
}

export function FoodHero({ food, primaryImage }: FoodHeroProps) {
  return (
    <header className="mb-12">
      {primaryImage && primaryImage.url ? (
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-black shadow-xl">
          <div className="relative aspect-21/9 w-full min-h-[280px] sm:min-h-[380px]">
            <Image
              src={primaryImage.url}
              alt={primaryImage.description || food.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
              <div className="mb-3 flex flex-wrap gap-2">
                {food.isHeritage && (
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                    Pamanang Pagkain
                  </span>
                )}
                {food.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-xs text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl drop-shadow-md">
                {food.name}
              </h1>
              {primaryImage.description && (
                <p className="mt-2 max-w-2xl text-sm text-white/80 line-clamp-2 sm:text-base">
                  {primaryImage.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-2xl border border-border bg-card p-8 sm:p-12 pb-8 border-b">
          <div className="mb-3 flex flex-wrap gap-2">
            {food.isHeritage && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Pamanang Pagkain
              </span>
            )}
            {food.tags?.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{food.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{food.description}</p>
        </div>
      )}
    </header>
  );
}

