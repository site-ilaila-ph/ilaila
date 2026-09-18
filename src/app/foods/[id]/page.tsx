"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppNav } from "@/presentation/app-nav";
import { FoodHero } from "@/presentation/food-hero";
import { FoodGallery } from "@/presentation/food-gallery";
import { ImageLightbox, type LightboxImage } from "@/presentation/image-lightbox";
import { ErrorAlert } from "@/presentation/ui/error-alert";
import { api, ApiProblemError } from "@/lib/api/client";
import { FoodWithRelations } from "../types";


export default function FoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [food, setFood] = useState<FoodWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFood() {
      try {
        const data = await api<FoodWithRelations>(`/api/foods/${encodeURIComponent(id)}`);
        if (!isMounted) return;
        setFood(data);
        setLoadError(null);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load food:", error);
        setLoadError(
          error instanceof ApiProblemError
            ? error.problem.detail || error.problem.title
            : "Hindi na-load ang detalye ng pagkain. Subukang muli mamaya."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadFood();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <AppNav brandHref="/home" />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-muted-foreground">Naglo-load ng mga detalye ng pagkain...</p>
        </div>
      </main>
    );
  }

  if (!food) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <AppNav brandHref="/home" />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-muted-foreground">{loadError ?? "Hindi nahanap ang pagkain"}</p>
          <Link href="/foods" className="mt-4 inline-block text-primary hover:underline">
            Bumalik sa mga pagkain
          </Link>
        </div>
      </main>
    );
  }

  // Filter out broken/missing image URLs so only valid images display
  const foodImages: LightboxImage[] = (food.images ?? [])
    .map((img: { url?: string; description?: string }) => ({
      url: img.url ? (img.url.startsWith("http") ? img.url : img.url) : null,
      description: img.description,
      source: "Food Gallery",
    }))
    .filter((img: { url: string | null }) => Boolean(img.url));

  const businessImages: LightboxImage[] = (food.businesses ?? [])
    .flatMap((bf: { business: { name: string; images?: { url?: string; description?: string }[] } }) =>
      (bf.business?.images ?? [])
        .map((bImg: { url?: string; description?: string }) => ({
          url: bImg.url ? (bImg.url.startsWith("http") ? bImg.url : bImg.url) : null,
          description: `${bImg.description || food.name} (mula sa ${bf.business.name})`,
          source: bf.business.name,
        }))
        .filter((img) => Boolean(img.url))
    );

  const allImages = [...foodImages, ...businessImages];
  const primaryImage = allImages.find((img) => Boolean(img.url)) ?? allImages[0];
  const activeImage = activeImageIndex !== null ? allImages[activeImageIndex] : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppNav brandHref="/home">
        <Link href="/foods" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Bumalik sa mga pagkain
        </Link>
      </AppNav>

      <article className="mx-auto max-w-5xl px-6 py-12">
        <ErrorAlert message={loadError} className="mb-6" onDismiss={() => setLoadError(null)} />

        <FoodHero food={food} primaryImage={primaryImage} />

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FoodGallery
              images={allImages}
              foodName={food.name}
              onSelectImage={setActiveImageIndex}
            />

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold tracking-tight">Kasaysayan</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {food.history}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold tracking-tight">Paghahanda</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {food.preparation}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold tracking-tight">Resipe</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {food.recipe}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold tracking-tight">Kahalagahang Kultural</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {food.culturalSignificance}
              </p>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h2 className="mb-6 text-xl font-bold">Makukuha sa</h2>
              {food.businesses && food.businesses.length > 0 ? (
                <div className="space-y-4">
                  {food.businesses.map((bf: { id: string; business: { id: string; name: string; address?: string } }) => (
                    <Link
                      key={bf.id}
                      href={`/businesses/${bf.business.id}`}
                      className="group block rounded-xl border border-border p-4 transition-all hover:border-primary hover:bg-card/50 hover:shadow-xs"
                    >
                      <h3 className="font-semibold text-primary group-hover:underline">
                        {bf.business.name}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {bf.business.address}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Walang nakitang negosyong naghahain ng pagkaing ito sa kasalukuyan.
                </p>
              )}
            </div>
          </aside>
        </div>
      </article>

      <ImageLightbox
        isOpen={activeImageIndex !== null}
        onClose={() => setActiveImageIndex(null)}
        image={activeImage}
        fallbackTitle={food.name}
      />
    </main>
  );
}
