import Link from "next/link";
import Image from "next/image";
import { Utensils } from "lucide-react";
import type { Route } from "next";
import type { FoodListItem } from "@/app/foods/types";

interface FoodCardProps {
  food: FoodListItem;
}

export function FoodCard({ food }: FoodCardProps) {
  const primaryImageUrl = food.images?.find((img) => Boolean(img.url))?.url;

  return (
    <Link
      href={("/foods/" + food.id) as Route}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
    >
      {primaryImageUrl ? (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={primaryImageUrl}
            alt={food.name}
            width={400}
            height={225}
            unoptimized
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-lg bg-primary/10 p-2.5 text-xl">
            <Utensils aria-hidden="true" className="size-5 text-primary" />
          </span>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition">
            Tingnan ang Resipe &rarr;
          </span>
        </div>
        <h3 className="mb-2 text-xl font-bold tracking-tight group-hover:text-primary transition">
          {food.name}
        </h3>
        <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {food.description}
        </p>
        {food.tags && food.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/50">
            {food.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

