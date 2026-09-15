"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Camera, ExternalLink, Image as ImageIcon, MapPin, Star, ThumbsUp, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiProblemError } from "@/lib/api/client";
import type { BusinessListItem } from "../types";

type ReviewScores = { foodQuality: number; service: number; ambiance: number; value: number };
type ReviewImageDraft = { id: string; file: File; description: string; previewUrl: string };
type MenuSort = "popular" | "price-low" | "price-high";

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiProblemError) return error.problem.detail || error.problem.title || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

async function fetchBusiness(id: string): Promise<BusinessListItem | null> {
  return api<BusinessListItem | null>(`/api/businesses?id=${encodeURIComponent(id)}`);
}

async function fetchRelatedBusinesses(business: BusinessListItem): Promise<BusinessListItem[]> {
  const all = await api<BusinessListItem[]>("/api/businesses");
  const tags = new Set(business.tags);
  return (all ?? [])
    .filter((item) => item.id !== business.id && item.tags.some((tag) => tags.has(tag)))
    .slice(0, 3);
}

export default function BusinessProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const [menuSort, setMenuSort] = useState<MenuSort>("popular");
  const [reviewText, setReviewText] = useState("");
  const [reviewScores, setReviewScores] = useState<ReviewScores>({
    foodQuality: 5,
    service: 5,
    ambiance: 5,
    value: 5,
  });
  const [reviewImages, setReviewImages] = useState<ReviewImageDraft[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const businessQuery = useQuery({
    queryKey: ["business", id],
    queryFn: () => fetchBusiness(id),
  });
  const business = businessQuery.data ?? null;

  const relatedQuery = useQuery({
    queryKey: ["business-related", business?.id],
    queryFn: () => fetchRelatedBusinesses(business!),
    enabled: Boolean(business),
  });
  const relatedBusinesses = relatedQuery.data ?? [];

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append(
        "metadata",
        JSON.stringify({
          review: { businessId: id, text: reviewText, ...reviewScores },
          images: reviewImages.map((image) => ({ description: image.description })),
        })
      );
      for (const image of reviewImages) form.append("images", image.file);
      return api(`/api/businesses/${id}/reviews`, { method: "POST", body: form });
    },
    onSuccess: () => {
      setReviewText("");
      clearReviewImages(reviewImages);
      setReviewImages([]);
      void queryClient.invalidateQueries({ queryKey: ["business", id] });
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const form = new FormData();
      form.append("metadata", JSON.stringify({ id: reviewId, upvote: true }));
      return api(`/api/businesses/${id}/reviews/${reviewId}?id=${encodeURIComponent(reviewId)}`, {
        method: "PATCH",
        body: form,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["business", id] });
    },
  });

  const visibleMenu = useMemo(() => {
    const items = [...(business?.menuItems ?? [])];
    if (menuSort === "price-low") items.sort((a, b) => Number(a.price) - Number(b.price));
    if (menuSort === "price-high") items.sort((a, b) => Number(b.price) - Number(a.price));
    return items;
  }, [business?.menuItems, menuSort]);

  function addReviewImages(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    setReviewImages((current) => [
      ...current,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        description: "",
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }

  function removeReviewImage(imageId: string) {
    setReviewImages((current) => {
      const target = current.find((img) => img.id === imageId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return current.filter((img) => img.id !== imageId);
    });
  }

  function updateReviewImageDescription(imageId: string, description: string) {
    setReviewImages((current) => current.map((img) => (img.id === imageId ? { ...img, description } : img)));
  }

  function clearReviewImages(images: { previewUrl: string }[]) {
    for (const image of images) URL.revokeObjectURL(image.previewUrl);
  }

  if (businessQuery.isLoading) {
    return (
      <Shell>
        <div className="mx-auto max-w-7xl space-y-6 px-6 py-12">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </Shell>
    );
  }

  if (businessQuery.error) {
    return (
      <Shell>
        <div className="mx-auto max-w-7xl px-6 py-12">
          <ErrorAlert message={errorMessage(businessQuery.error, "Hindi na-load ang detalya ng negosyong ito.")} />
        </div>
      </Shell>
    );
  }

  if (!business) {
    return (
      <Shell>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-muted-foreground">Hindi natagpuan ang negosyo</p>
          <Link href="/businesses/discovery" className="mt-4 inline-block text-primary hover:underline">
            Bumalik sa mga negosyo
          </Link>
        </div>
      </Shell>
    );
  }

  const averageRating =
    business.reviews.length > 0
      ? Math.round(
          (business.reviews.reduce((sum, r) => sum + (r.foodQuality + r.service + r.ambiance + r.value) / 4, 0) /
            business.reviews.length) *
            10
        ) / 10
      : 0;
  const metricRatings: [string, number][] = [
    ["Kalidad ng pagkain", business.reviews.reduce((sum, review) => sum + review.foodQuality, 0)],
    ["Serbisyo", business.reviews.reduce((sum, review) => sum + review.service, 0)],
    ["Ambiance", business.reviews.reduce((sum, review) => sum + review.ambiance, 0)],
    ["Halaga", business.reviews.reduce((sum, review) => sum + review.value, 0)],
  ];

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;
  const businessImages = business.images ?? [];
  const primaryImage = businessImages.find((img) => Boolean(img.url)) ?? businessImages[0];
  const activeImage = activeImageIndex !== null ? businessImages[activeImageIndex] : null;

  return (
    <Shell>
      <article className="mx-auto max-w-7xl px-6 py-12">
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
              {business.tags.map((tag) => (
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

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="lg:col-span-2">
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
                    <Card
                      key={image.id || index}
                      onClick={() => setActiveImageIndex(index)}
                      className="group cursor-pointer gap-0 overflow-hidden rounded-xl p-0 transition-all hover:border-primary/50 hover:shadow-lg"
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
                          <p className="line-clamp-2 text-xs font-medium text-muted-foreground">
                            {image.description || business.name}
                          </p>
                        </div>
                      )}
                      {image.description && (
                        <div className="border-t border-border/50 p-3">
                          <p className="line-clamp-2 text-xs font-medium text-foreground">{image.description}</p>
                        </div>
                      )}
                    </Card>
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
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{business.history}</p>
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
                      <h3 className="font-semibold text-primary hover:underline">{bf.food.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{bf.food.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {business.menuItems && business.menuItems.length > 0 && (
              <section className="mb-12">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Menu</h2>
                  <Select value={menuSort} onValueChange={(value) => setMenuSort(value as MenuSort)}>
                    <SelectTrigger className="w-56 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Ayusin ang menu</SelectItem>
                      <SelectItem value="price-low">Presyo: mababa hanggang mataas</SelectItem>
                      <SelectItem value="price-high">Presyo: mataas hanggang mababa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  {visibleMenu.map((item) => (
                    <div key={item.id} className="border-b border-border pb-4 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                        <p className="font-semibold text-primary">PHP {item.price.toString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {business.reviews && business.reviews.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold">Mga Review</h2>
                {upvoteMutation.error && (
                  <ErrorAlert
                    message={errorMessage(upvoteMutation.error, "Hindi nagawa ang upvote. Subukang muli mamaya.")}
                    className="mb-4"
                    onDismiss={() => upvoteMutation.reset()}
                  />
                )}
                <div className="space-y-4">
                  {business.reviews.map((review) => (
                    <Card key={review.id} className="p-6">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold">{review.user.authUser.email ?? "Lokal na reviewer"}</h3>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>Pagkain: {review.foodQuality}/5</span>
                          <span>Serbisyo: {review.service}/5</span>
                          <span>Ambiance: {review.ambiance}/5</span>
                          <span>Halaga: {review.value}/5</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.text}</p>
                      {review.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {review.images.map((image) => (
                            <div key={image.id} className="overflow-hidden rounded-lg border border-border bg-muted">
                              {image.url ? (
                                <Image
                                  src={image.url}
                                  alt={image.description || "Larawan mula sa review"}
                                  width={240}
                                  height={160}
                                  unoptimized
                                  className="h-28 w-full object-cover"
                                />
                              ) : (
                                <div className="grid h-28 w-full place-items-center text-muted-foreground">
                                  <ImageIcon className="size-6" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => upvoteMutation.mutate(review.id)}
                        disabled={upvoteMutation.isPending}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary disabled:opacity-50"
                      >
                        <ThumbsUp className="size-3.5" /> {review.upvotes} nakatulong
                      </button>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            <section className="border-t border-border pt-8">
              <h2 className="mb-4 font-heading text-2xl font-bold">Ibahagi ang iyong karanasan</h2>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitReviewMutation.mutate();
                }}
                className="space-y-3"
              >
                <div className="grid gap-3 sm:grid-cols-4">
                  {(Object.keys(reviewScores) as (keyof ReviewScores)[]).map((key) => (
                    <div key={key} className="text-xs font-medium text-muted-foreground">
                      <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                      <Select
                        value={String(reviewScores[key])}
                        onValueChange={(value) => setReviewScores({ ...reviewScores, [key]: Number(value) })}
                      >
                        <SelectTrigger className="mt-1 w-full text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((value) => (
                            <SelectItem key={value} value={String(value)}>
                              {value} / 5
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="review-images" className="text-xs font-medium text-muted-foreground">
                    Mga Larawan (opsyonal)
                  </Label>
                  <Input
                    id="review-images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="mt-1"
                    onChange={(event) => {
                      addReviewImages(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  {reviewImages.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {reviewImages.map((image, index) => (
                        <li key={image.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-2">
                          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                            <Image
                              src={image.previewUrl}
                              alt={`Preview ng larawan ${index + 1}`}
                              width={120}
                              height={80}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <Textarea
                              value={image.description}
                              onChange={(event) => updateReviewImageDescription(image.id, event.target.value)}
                              placeholder="Paglalarawan ng larawan (opsyonal)"
                              rows={2}
                              className="text-sm"
                            />
                            <Button type="button" variant="destructive" size="sm" onClick={() => removeReviewImage(image.id)}>
                              <X className="size-4" />
                              <span className="sr-only">Alisin</span>
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Ano ang dapat malaman ng mga tao bago pumunta?"
                  rows={4}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    Sinasaklaw ng iyong review ang pagkain, serbisyo, ambiance, at halaga.
                  </span>
                  <Button type="submit" disabled={submitReviewMutation.isPending}>
                    {submitReviewMutation.isPending ? "Nagpapadala..." : "I-publish ang review"}
                  </Button>
                </div>
                {submitReviewMutation.error && (
                  <ErrorAlert
                    message={errorMessage(
                      submitReviewMutation.error,
                      "Hindi pa namin na-save ang iyong review. Subukang muli mamaya."
                    )}
                    className="mb-2"
                    onDismiss={() => submitReviewMutation.reset()}
                  />
                )}
                {submitReviewMutation.isSuccess && (
                  <p className="text-sm font-medium text-primary">Na-save na ang iyong review.</p>
                )}
              </form>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card className="p-6">
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
              </Card>

              <Card className="gap-0 overflow-hidden p-0">
                <h3 className="p-6 pb-3 text-lg font-semibold">Hanapin sa mapa</h3>
                <iframe
                  title={`Map showing ${business.name}`}
                  className="h-52 w-full border-0"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${business.longitude - 0.01}%2C${
                    business.latitude - 0.01
                  }%2C${business.longitude + 0.01}%2C${business.latitude + 0.01}&layer=mapnik&marker=${
                    business.latitude
                  }%2C${business.longitude}`}
                />
                <a
                  className="flex items-center justify-between border-t border-border p-4 text-sm font-semibold text-primary transition hover:bg-primary/5 hover:underline"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4" /> Buksan sa Google Maps
                  </span>
                  <ExternalLink className="size-4" />
                </a>
              </Card>

              {relatedBusinesses.length > 0 && (
                <Card className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">Maaari mo ring magustuhan</h3>
                  <div className="space-y-4">
                    {relatedBusinesses.map((item) => (
                      <Link key={item.id} href={`/businesses/${item.id}`} className="group block">
                        <p className="font-semibold group-hover:text-primary">{item.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </aside>
        </div>
      </article>

      <Dialog open={activeImage !== null} onOpenChange={(open) => !open && setActiveImageIndex(null)}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0" showCloseButton>
          <div className="relative flex min-h-[300px] flex-1 items-center justify-center bg-black sm:min-h-[450px]">
            {activeImage?.url ? (
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
                <p className="text-lg font-medium">{activeImage?.description || business.name}</p>
              </div>
            )}
          </div>
          {activeImage?.description && (
            <div className="border-t border-border p-4 sm:p-6">
              <p className="text-sm font-semibold text-foreground sm:text-base">{activeImage.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-brand-bg text-foreground">
      <nav className="border-b border-brand-border bg-brand-bg/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/home" className="font-heading text-xl font-bold tracking-tight text-primary">
            Ilaila
          </Link>
          <Link
            href="/businesses/discovery"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Lahat ng negosyo
          </Link>
        </div>
      </nav>
      {children}
    </main>
  );
}