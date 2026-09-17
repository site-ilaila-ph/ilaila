"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { BusinessCard } from "@/components/business-card";
import { BusinessHero } from "@/components/business-hero";
import { BusinessGallery } from "@/components/business-gallery";
import { BusinessMenu, type MenuSort } from "@/components/business-menu";
import { BusinessReviewsList } from "@/components/business-reviews-list";
import { BusinessReviewForm, type ReviewScores, type ReviewImageDraft } from "@/components/business-review-form";
import { ImageLightbox, type LightboxImage } from "@/components/image-lightbox";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiProblemError } from "@/lib/api/client";
import type { BusinessListItem } from "../types";
import { Business } from "@/entities";

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
    .filter((item) => item.id !== business.id && item.tags.some((tag: string) => tags.has(tag)))
    .slice(0, 3);
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-brand-bg text-foreground">
      <AppNav
        brandHref="/home"
        className="border-b border-brand-border bg-brand-bg/90 backdrop-blur"
      >
        <Link
          href="/businesses/discovery"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Lahat ng negosyo
        </Link>
      </AppNav>
      {children}
    </main>
  );
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

  const businessQuery = useQuery<Business>({
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
      setReviewImages([]);
      void queryClient.invalidateQueries({ queryKey: ["business", id] });
    },
  });

  // TODO: Make it so we can only vote once.
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
          (business.reviews.reduce((sum: number, r: { foodQuality: number; service: number; ambiance: number; value: number }) => sum + (r.foodQuality + r.service + r.ambiance + r.value) / 4, 0) /
            business.reviews.length) *
            10
        ) / 10
      : 0;

  const metricRatings: [string, number][] = [
    ["Kalidad ng pagkain", business.reviews.reduce((sum: number, review: { foodQuality: number; service: number; ambiance: number; value: number }) => sum + review.foodQuality, 0)],
    ["Serbisyo", business.reviews.reduce((sum: number, review: { foodQuality: number; service: number; ambiance: number; value: number }) => sum + review.service, 0)],
    ["Ambiance", business.reviews.reduce((sum: number, review: { foodQuality: number; service: number; ambiance: number; value: number }) => sum + review.ambiance, 0)],
    ["Halaga", business.reviews.reduce((sum: number, review: { foodQuality: number; service: number; ambiance: number; value: number }) => sum + review.value, 0)],
  ];

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;
  const businessImages: LightboxImage[] = business.images ?? [];
  const primaryImage = businessImages.find((img) => Boolean(img.url)) ?? businessImages[0];
  const activeImage = activeImageIndex !== null ? businessImages[activeImageIndex] : null;

  return (
    <Shell>
      <article className="mx-auto max-w-7xl px-6 py-12">
        <BusinessHero
          business={business}
          primaryImage={primaryImage}
          averageRating={averageRating}
          metricRatings={metricRatings}
          googleMapsUrl={googleMapsUrl}
        />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="lg:col-span-2">
            <BusinessGallery
              images={businessImages}
              businessName={business.name}
              onSelectImage={setActiveImageIndex}
            />

            <BusinessMenu
              business={business}
              menuSort={menuSort}
              onMenuSortChange={setMenuSort}
              visibleMenu={visibleMenu}
            />

            <BusinessReviewsList
              reviews={business.reviews}
              onUpvote={(reviewId) => upvoteMutation.mutate(reviewId)}
              isUpvoting={upvoteMutation.isPending}
              upvoteError={upvoteMutation.error ? errorMessage(upvoteMutation.error, "Hindi nagawa ang upvote. Subukang muli mamaya.") : null}
              onDismissUpvoteError={() => upvoteMutation.reset()}
            />

            <BusinessReviewForm
              reviewScores={reviewScores}
              onReviewScoresChange={setReviewScores}
              reviewText={reviewText}
              onReviewTextChange={setReviewText}
              onSubmit={(e) => {
                e.preventDefault();
                submitReviewMutation.mutate();
              }}
              isSubmitting={submitReviewMutation.isPending}
              submitError={submitReviewMutation.error ? errorMessage(submitReviewMutation.error, "Hindi pa namin na-save ang iyong review. Subukang muli mamaya.") : null}
              onDismissSubmitError={() => submitReviewMutation.reset()}
            />
          </div>
        </div>

        {relatedBusinesses.length > 0 && (
          <aside className="border-t border-brand-border pt-12 mt-12">
            <h2 className="mb-6 font-heading text-2xl font-bold">Iba pang Negosyo</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedBusinesses.map((item) => (
                <BusinessCard key={item.id} business={item} />
              ))}
            </div>
          </aside>
        )}
      </article>

      <ImageLightbox
        isOpen={activeImageIndex !== null}
        onClose={() => setActiveImageIndex(null)}
        image={activeImage}
        fallbackTitle={business.name}
      />
    </Shell>
  );
}
