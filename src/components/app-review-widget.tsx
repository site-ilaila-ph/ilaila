"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { readProblemMessage } from "@/lib/api/client";

interface AppReview {
  id: string;
  text: string;
  rating: number;
  userName: string | null;
  email: string | null;
  isApproved: boolean;
  createdAt: Date;
  user?: {
    email: string;
    userName: string | null;
  };
}

export function AppReviewsWidget({ limit = 3 }: { limit?: number }) {
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetch("/api/app-reviews?type=approved");
        if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to fetch approved reviews"));
        const data = await response.json();
        setReviews((data as AppReview[]).slice(0, limit));
      } catch (error) {
        console.error("Failed to load reviews:", error);
        setLoadError(error instanceof Error ? error.message : "Failed to fetch approved reviews");
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, [limit]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-red-700">{loadError}</p>
          {!loadError && (
            <>
              <p className="text-muted-foreground mb-4">No reviews yet</p>
              <Link href="/app-reviews">
                <Button variant="outline" size="sm">
                  Be the first to review
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="py-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="font-semibold">
                  {review.user?.userName || review.userName || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-primary">{review.rating}</span>
                <span className="text-muted-foreground">/5</span>
              </div>
            </div>
            <p className="text-sm text-foreground line-clamp-3">{review.text}</p>
          </CardContent>
        </Card>
      ))}
      
      {reviews.length >= limit && (
        <Link href="/app-reviews" className="block">
          <Button variant="outline" className="w-full">
            View All Reviews
          </Button>
        </Link>
      )}
    </div>
  );
}
