"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Camera, Image as ImageIcon, X, ZoomIn } from "lucide-react";
import type { FoodWithRelations } from "../types";
import { ErrorAlert } from "@/components/ui/error-alert";
import { readProblemMessage } from "@/lib/api/client";

interface DisplayImage {
  id: string;
  url: string | null;
  description: string;
  source?: string;
}

export default function SingleFoodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [food, setFood] = useState<FoodWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFood() {
      const resolvedParams = await params;
      const response = await fetch(`/api/foods?id=${encodeURIComponent(resolvedParams.id)}`);

      if (response.ok) {
        const data = await response.json();
        if (isMounted) setFood(data ?? null);
      } else if (isMounted) {
        setLoadError(await readProblemMessage(response, "Hindi na-load ang detalya ng pagkaing ito."));
      }

      if (isMounted) setIsLoading(false);
    }

    void loadFood();

    return () => {
      isMounted = false;
    };
  }, [params]);

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
          <p className="text-muted-foreground">Naglo-load ng mga detalye ng pagkain...</p>
        </div>
      </main>
    );
  }

  if (!food) {
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
          <p className="text-muted-foreground">{loadError ?? "Hindi nahanap ang pagkain"}</p>
          <Link href="/foods" className="mt-4 inline-block text-primary hover:underline">
            Bumalik sa mga pagkain
          </Link>
        </div>
      </main>
    );
  }

  // Collect all images (direct food images and business images)
  const foodImages: DisplayImage[] = (food.images ?? []).map((img) => ({
    id: img.id,
    url: img.url,
    description: img.description,
    source: "Food Gallery",
  }));

  const businessImages: DisplayImage[] = (food.businesses ?? []).flatMap((bf) =>
    (bf.business?.images ?? []).map((bImg) => ({
      id: bImg.id,
      url: bImg.url,
      description: `${bImg.description || food.name} (mula sa ${bf.business.name})`,
      source: bf.business.name,
    }))
  );

  const allImages = [...foodImages, ...businessImages];
  const primaryImage = allImages.find((img) => Boolean(img.url)) ?? allImages[0];
  const activeImage = activeImageIndex !== null ? allImages[activeImageIndex] : null;

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
          <Link href="/foods" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Bumalik sa mga pagkain
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-5xl px-6 py-12">
        <ErrorAlert message={loadError} className="mb-6" onDismiss={() => setLoadError(null)} />

        {/* Hero Section with Featured Food Image */}
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
                    {food.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-xs text-white"
                      >
                        {tag.value}
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
                {food.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                  >
                    {tag.value}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{food.name}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{food.description}</p>
            </div>
          )}
        </header>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Dedicated Food Images Gallery Section */}
            <section className="mb-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                  <Camera className="size-6 text-primary" />
                  Mga Larawan ng Pagkain
                </h2>
                {allImages.length > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {allImages.length} {allImages.length === 1 ? "larawan" : "mga larawan"}
                  </span>
                )}
              </div>

              {allImages.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {allImages.map((image, index) => (
                    <div
                      key={image.id || index}
                      onClick={() => setActiveImageIndex(index)}
                      className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
                    >
                      {image.url ? (
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          <Image
                            src={image.url}
                            alt={image.description || food.name}
                            width={640}
                            height={360}
                            unoptimized
                            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xs">
                              <ZoomIn className="size-4" /> Lumaki
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex aspect-video w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 p-4 text-center">
                          <ImageIcon className="mb-2 size-8 text-primary/60" />
                          <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                            {image.description || food.name}
                          </p>
                        </div>
                      )}

                      {image.description && (
                        <div className="p-3 bg-card border-t border-border/50">
                          <p className="text-xs text-foreground line-clamp-2 font-medium">
                            {image.description}
                          </p>
                          {image.source && (
                            <span className="mt-1 block text-[10px] text-muted-foreground">
                              Pinagmulan: {image.source}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <Camera className="mx-auto mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Wala pang mga opisyal na larawan ang pagkaing ito.
                  </p>
                </div>
              )}
            </section>

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
                  {food.businesses.map((bf) => (
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

      {/* Lightbox / Modal Image Viewer */}
      {activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] max-w-4xl w-full overflow-hidden rounded-2xl bg-card border border-border shadow-2xl flex flex-col">
            <button
              onClick={() => setActiveImageIndex(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/90 focus:outline-hidden"
              aria-label="Isara"
            >
              <X className="size-5" />
            </button>

            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] sm:min-h-[450px]">
              {activeImage.url ? (
                <Image
                  src={activeImage.url}
                  alt={activeImage.description || food.name}
                  fill
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-white">
                  <ImageIcon className="mb-4 size-16 text-muted-foreground" />
                  <p className="text-lg font-medium">{activeImage.description || food.name}</p>
                </div>
              )}
            </div>

            {activeImage.description && (
              <div className="p-4 sm:p-6 bg-card border-t border-border">
                <p className="text-sm sm:text-base font-semibold text-foreground">
                  {activeImage.description}
                </p>
                {activeImage.source && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pinagmulan: {activeImage.source}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

