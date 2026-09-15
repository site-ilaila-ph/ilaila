"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { ManagementHeader } from "@/components/management-header";
import { ManagementSearchBar } from "@/components/management-search-bar";
import { ManagementReviewCard, type ManagementReviewItem } from "@/components/management-review-card";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { readProblemMessage } from "@/lib/api/client";

export default function ManageReviews() {
  const [reviews, setReviews] = useState<ManagementReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const response = await fetch("/api/management/reviews");
      if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to load reviews"));
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      setError(error instanceof Error ? error.message : "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Sigurado ka bang gusto mong tanggalin ang review na ito?")) {
      try {
        const response = await fetch(`/api/management/reviews?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to delete review"));
        await loadReviews();
      } catch (error) {
        console.error("Failed to delete review:", error);
        setError(error instanceof Error ? error.message : "Failed to delete review");
      }
    }
  }

  const getAverageRating = (review: ManagementReviewItem) => {
    return ((review.foodQuality + review.service + review.ambiance + review.value) / 4).toFixed(1);
  };

  const visibleReviews = reviews.filter((review) => {
    const query = searchQuery.toLowerCase();
    return !query || review.text.toLowerCase().includes(query) || review.business?.name.toLowerCase().includes(query) || review.user?.userName?.toLowerCase().includes(query) || review.user?.email.toLowerCase().includes(query);
  });

  return (
    <div className="px-1 py-2 sm:px-3 lg:px-5 lg:py-4">
      <ManagementHeader
        breadcrumb="Mga Pahina / Mga Review"
        title="Mga Review"
      >
        <ManagementSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <button
          type="button"
          aria-label="Higit pang mga opsyon"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-muted-foreground border border-border shadow-sm transition hover:text-primary"
        >
          <MoreHorizontal size={19} />
        </button>
      </ManagementHeader>

      <ErrorAlert message={error} className="mb-4" onDismiss={() => setError(null)} />

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Ikinakarga ang mga review...</p>
        </div>
      ) : visibleReviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Wala pang review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleReviews.map((review) => (
            <ManagementReviewCard
              key={review.id}
              review={review}
              averageRating={getAverageRating(review)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
