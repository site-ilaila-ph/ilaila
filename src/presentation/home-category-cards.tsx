import Link from "next/link";
import { MapPin, Store, Utensils } from "lucide-react";

export function HomeCategoryCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3 mb-16">
      <Link
        href="/businesses/discovery"
        className="rounded-lg border border-border bg-card p-6 transition hover:border-primary hover:shadow-lg"
      >
        <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
          <Store aria-hidden="true" className="size-6 shrink-0 text-primary" />
          Tuklasin ang mga negosyo
        </h2>
        <p className="text-sm text-muted-foreground">
          Mag-browse ng mga lokal na negosyo at restawran sa San Pedro
        </p>
      </Link>

      <Link
        href="/foods"
        className="rounded-lg border border-border bg-card p-6 transition hover:border-primary hover:shadow-lg"
      >
        <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
          <Utensils aria-hidden="true" className="size-6 shrink-0 text-primary" />
          Mga pagkaing pamana
        </h2>
        <p className="text-sm text-muted-foreground">
          Alamin ang tungkol sa mga tradisyonal na pagkain at recipe
        </p>
      </Link>

      <Link
        href="/about/san-pedro"
        className="rounded-lg border border-border bg-card p-6 transition hover:border-primary hover:shadow-lg"
      >
        <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
          <MapPin aria-hidden="true" className="size-6 shrink-0 text-primary" />
          Tungkol sa San Pedro
        </h2>
        <p className="text-sm text-muted-foreground">
          Tuklasin ang kasaysayan at kultura ng lugar
        </p>
      </Link>
    </div>
  );
}

