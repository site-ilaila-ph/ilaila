"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Camera, ExternalLink, Image as ImageIcon, MapPin, Star, ThumbsUp, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { createClient } from "@/lib/supabase/client";
import { readProblemMessage } from "@/lib/api/client";
import type { BusinessListItem } from "../types";

export default function BusinessProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [business, setBusiness] = useState<BusinessListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuFilter, setMenuFilter] = useState("Lahat");
  const [menuSort, setMenuSort] = useState<"popular" | "price-low" | "price-high">("popular");
  const [reviewText, setReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reviewScores, setReviewScores] = useState({ foodQuality: 5, service: 5, ambiance: 5, value: 5 });
  const [relatedBusinesses, setRelatedBusinesses] = useState<BusinessListItem[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBusiness() {
      const resolvedParams = await params;
      const [businessResponse, businessesResponse] = await Promise.all([
        fetch(`/api/businesses?id=${encodeURIComponent(resolvedParams.id)}`),
        fetch("/api/businesses"),
      ]);

      if (!isMounted) return;

      if (!businessResponse.ok) {
        setLoadError(await readProblemMessage(businessResponse, "Hindi na-load ang detalya ng negosyong ito."));
      }

      const [businessData, businessesData] = await Promise.all([
        businessResponse.ok ? businessResponse.json() : Promise.resolve(null),
        businessesResponse.ok ? businessesResponse.json().catch(() => []) : Promise.resolve([]),
      ]);

      setBusiness(businessData ?? null);
      if (businessData) {
        const tags = new Set<string>(businessData.tags.map((tag: { value: string }) => tag.value));
        const related = (businessesData ?? []).filter((item: BusinessListItem) => item.id !== businessData.id && item.tags.some((tag) => tags.has(tag.value))).slice(0, 3);
        setRelatedBusinesses(related);
      }

      setIsLoading(false);
    }

    void loadBusiness();

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
          <p className="text-muted-foreground">Nilo-load ang mga detalye ng negosyo...</p>
        </div>
      </main>
    );
  }

  if (!business) {
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
          <p className="text-muted-foreground">Hindi natagpuan ang negosyo</p>
          <Link href="/businesses/discovery" className="mt-4 inline-block text-primary hover:underline">
            Bumalik sa mga negosyo
          </Link>
        </div>
      </main>
    );
  }

  const averageRating = business.reviews.length > 0
    ? Math.round(
        (business.reviews.reduce(
          (sum, r) => sum + (r.foodQuality + r.service + r.ambiance + r.value) / 4,
          0
        ) /
          business.reviews.length) *
          10
      ) / 10
    : 0;
  const metricRatings = [
    ["Kalidad ng pagkain", business.reviews.reduce((sum, review) => sum + review.foodQuality, 0)],
    ["Serbisyo", business.reviews.reduce((sum, review) => sum + review.service, 0)],
    ["Ambiance", business.reviews.reduce((sum, review) => sum + review.ambiance, 0)],
    ["Halaga", business.reviews.reduce((sum, review) => sum + review.value, 0)],
  ];

  const menuTags = ["Lahat"] as string[];
  const businessId = business.id;
  const visibleMenu = business.menuItems;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;
  const businessImages = business.images ?? [];
  const primaryImage = businessImages.find((img) => Boolean(img.url)) ?? businessImages[0];
  const activeImage = activeImageIndex !== null ? businessImages[activeImageIndex] : null;

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    setReviewMessage("");
    setReviewError(null);
    const supabase = createClient();
    const session = (await supabase.auth.getSession()).data.session!;
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        userId: session.user.id,
        businessId,
        text: reviewText,
        ...reviewScores,
      }),
    });

    if (response.ok) {
      setReviewMessage("Na-save na ang iyong review.");
      setReviewText("");
    } else {
      setReviewError(await readProblemMessage(response, "Hindi pa namin na-save ang iyong review. Subukang muli mamaya."));
    }
  }

  return (
    <main className="min-h-screen bg-brand-bg text-foreground">
      <nav className="border-b border-brand-border bg-brand-bg/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/home"
            className="font-heading text-xl font-bold tracking-tight text-primary"
          >
            Ilaila
          </Link>
          <Link href="/businesses/discovery" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Lahat ng negosyo
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-7xl px-6 py-12">
        <ErrorAlert message={loadError} className="mb-6" onDismiss={() => setLoadError(null)} />

        {/* Business Hero Banner Section */}
        <header className="mb-12 border-b border-brand-border pb-10">
          {primaryImage && primaryImage.url ? (
            <div className="relative mb-8 overflow-hidden rounded-2xl border border-brand-border bg-black shadow-xl">
              <div className="relative aspect-21/9 w-full min-h-[300px] sm:min-h-[400px]">
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.description || business.name}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-accent">
                    San Pedro, Laguna
                  </p>
                  <h1 className="font-heading text-4xl font-bold leading-none sm:text-6xl drop-shadow-md">
                    {business.name}
                  </h1>
                  {primaryImage.description && (
                    <p className="mt-2 max-w-2xl text-sm text-white/80 line-clamp-2">
                      {primaryImage.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 flex min-h-64 items-end rounded-2xl bg-brand-deep p-7 text-white sm:p-10">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">
                  San Pedro, Laguna
                </p>
                <h1 className="font-heading text-5xl font-bold leading-none sm:text-7xl">
                  {business.name}
                </h1>
              </div>
            </div>
          )}

          <p className="mb-7 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {business.description}
          </p>

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
              {business.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {tag.value}
                </span>
              ))}
            </div>
          )}

          {business.reviews.length > 0 && (
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-4">
              {metricRatings.map(([label, total]) => (
                <div key={label as string} className="border-l-2 border-brand-accent pl-3">
                  <p className="text-xs text-muted-foreground">{label as string}</p>
                  <p className="mt-1 font-semibold">
                    {((total as number) / business.reviews.length).toFixed(1)} / 5
                  </p>
                </div>
              ))}
            </div>
          )}
        </header>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="lg:col-span-2">
            {/* Dedicated Business Image Gallery Section */}
            <section className="mb-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                  <Camera className="size-6 text-primary" />
                  Mga Larawan ng Negosyo
                </h2>
                {businessImages.length > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {businessImages.length} {businessImages.length === 1 ? "larawan" : "mga larawan"}
                  </span>
                )}
              </div>

              {businessImages.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {businessImages.map((image, index) => (
                    <div
                      key={image.id || index}
                      onClick={() => setActiveImageIndex(index)}
                      className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
                    >
                      {image.url ? (
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                          <Image
                            src={image.url}
                            alt={image.description || business.name}
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
                            {image.description || business.name}
                          </p>
                        </div>
                      )}

                      {image.description && (
                        <div className="p-3 bg-card border-t border-border/50">
                          <p className="text-xs text-foreground line-clamp-2 font-medium">
                            {image.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <Camera className="mx-auto mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Wala pang mga opisyal na larawan ang negosyong ito.
                  </p>
                </div>
              )}
            </section>

            {business.history && (
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">Kasaysayan</h2>
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {business.history}
                </p>
              </section>
            )}

            {business.foods && business.foods.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">Mga Pagkaing Inihahain</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {business.foods.map((bf) => (
                    <Link
                      key={bf.id}
                      href={`/foods/${bf.food.id}`}
                      className="rounded-lg border border-border bg-card p-4 transition hover:border-primary hover:bg-card/50"
                    >
                      <h3 className="font-semibold text-primary hover:underline">
                        {bf.food.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {bf.food.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {business.menuItems && business.menuItems.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">Menu</h2>
                <div className="mb-5 flex flex-wrap gap-2">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {menuTags.map((item) => (
                      <button
                        key={item}
                        onClick={() => setMenuFilter(item)}
                        className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${
                          menuFilter === item
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-white"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <select
                    value={menuSort}
                    onChange={(event) => setMenuSort(event.target.value as typeof menuSort)}
                    className="rounded-full border border-border bg-white px-3 py-1.5 text-xs"
                  >
                    <option value="popular">Ayusin ang menu</option>
                    <option value="price-low">Presyo: mababa hanggang mataas</option>
                    <option value="price-high">Presyo: mataas hanggang mababa</option>
                  </select>
                </div>
                <div className="space-y-4">
                  {visibleMenu.map((item) => (
                    <div key={item.id} className="border-b border-border pb-4 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold text-primary">PHP {item.price.toString()}</p>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <span className="text-xs text-muted-foreground">Available</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {business.reviews && business.reviews.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">Mga Review</h2>
                <div className="space-y-4">
                  {business.reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-border bg-card p-6">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold">
                          {review.user.authUser.email ?? "Lokal na reviewer"}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>Pagkain: {review.foodQuality}/5</span>
                          <span>Serbisyo: {review.service}/5</span>
                          <span>Ambiance: {review.ambiance}/5</span>
                          <span>Halaga: {review.value}/5</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.text}</p>
                      <button
                        onClick={async () => {
                          const upvoteResponse = await fetch("/api/reviews", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "upvote", reviewId: review.id }),
                          });
                          if (!upvoteResponse.ok) {
                            setReviewError(
                              await readProblemMessage(
                                upvoteResponse,
                                "Hindi nagawa ang upvote. Subukang muli mamaya."
                              )
                            );
                          }
                        }}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                      >
                        <ThumbsUp className="size-3.5" /> {review.upvotes} nakatulong
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="border-t border-border pt-8">
              <h2 className="mb-4 font-heading text-2xl font-bold">Ibahagi ang iyong karanasan</h2>
              <form onSubmit={submitReview} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-4">
                  {Object.entries(reviewScores).map(([key, score]) => (
                    <label key={key} className="text-xs font-medium text-muted-foreground">
                      {key.replace(/([A-Z])/g, " $1")}
                      <select
                        value={score}
                        onChange={(event) =>
                          setReviewScores({
                            ...reviewScores,
                            [key]: Number(event.target.value),
                          })
                        }
                        className="mt-1 block w-full border border-border bg-white px-2 py-2 text-sm text-foreground"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>
                            {value} / 5
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Ano ang dapat malaman ng mga tao bago pumunta?"
                  rows={4}
                  className="w-full border border-border bg-white p-3 text-sm outline-none focus:border-primary"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    Sinasaklaw ng iyong review ang pagkain, serbisyo, ambiance, at halaga.
                  </span>
                  <Button type="submit">I-publish ang review</Button>
                </div>
                {reviewError && (
                  <ErrorAlert
                    message={reviewError}
                    className="mb-2"
                    onDismiss={() => setReviewError(null)}
                  />
                )}
                {reviewMessage && <p className="text-sm text-emerald-700">{reviewMessage}</p>}
              </form>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Impormasyon sa Pakikipag-ugnayan</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="flex items-center gap-1 font-medium text-muted-foreground">
                      <MapPin className="size-3.5 text-primary" /> Address
                    </dt>
                    <dd className="mt-1">{business.address}</dd>
                    <dd className="mt-1">
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        Buksan sa Google Maps <ExternalLink className="size-3" />
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Oras ng Bukas</dt>
                    <dd className="mt-1">{business.hours}</dd>
                  </div>
                </dl>
              </div>

              {/* Map & Google Maps Location Link */}
              <div className="overflow-hidden border border-border bg-white rounded-xl shadow-xs">
                <h3 className="p-6 pb-3 text-lg font-semibold">Hanapin sa mapa</h3>
                <iframe
                  title={`Map showing ${business.name}`}
                  className="h-52 w-full border-0"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${business.longitude - 0.01}%2C${business.latitude - 0.01}%2C${business.longitude + 0.01}%2C${business.latitude + 0.01}&layer=mapnik&marker=${business.latitude}%2C${business.longitude}`}
                />
                <a
                  className="flex items-center justify-between p-4 text-sm font-semibold text-primary hover:bg-primary/5 hover:underline border-t border-border transition"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4" /> Buksan sa Google Maps
                  </span>
                  <ExternalLink className="size-4" />
                </a>
              </div>

              {relatedBusinesses.length > 0 && (
                <div className="border border-border bg-white p-6 rounded-xl">
                  <h3 className="mb-4 text-lg font-semibold">Maaari mo ring magustuhan</h3>
                  <div className="space-y-4">
                    {relatedBusinesses.map((item) => (
                      <Link
                        key={item.id}
                        href={`/businesses/${item.id}`}
                        className="group block"
                      >
                        <p className="font-semibold group-hover:text-primary">{item.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>

      {/* Lightbox / Modal Image Viewer for Business Images */}
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
                  alt={activeImage.description || business.name}
                  fill
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-white">
                  <ImageIcon className="mb-4 size-16 text-muted-foreground" />
                  <p className="text-lg font-medium">{activeImage.description || business.name}</p>
                </div>
              )}
            </div>

            {activeImage.description && (
              <div className="p-4 sm:p-6 bg-card border-t border-border">
                <p className="text-sm sm:text-base font-semibold text-foreground">
                  {activeImage.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}