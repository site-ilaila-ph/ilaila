"use client";

import { useEffect, useState } from "react";
import { getAllReviewsForManagement } from "@/app/management/services";
import { deleteReviewAction } from "@/app/management/actions";
import { Button } from "@/lib/components/actions/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/display/card";

interface Review {
  id: string;
  text: string;
  foodQuality: number;
  service: number;
  ambiance: number;
  value: number;
  createdAt: Date;
  user?: {
    email: string;
    userName: string | null;
  };
  business?: {
    name: string;
  };
}

export default function ManageReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const data = await getAllReviewsForManagement();
      setReviews(data as Review[]);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReviewAction(id);
        await loadReviews();
      } catch (error) {
        console.error("Failed to delete review:", error);
      }
    }
  }

  const getAverageRating = (review: Review) => {
    return ((review.foodQuality + review.service + review.ambiance + review.value) / 4).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Manage Reviews</h1>
          <p className="mt-1 text-muted-foreground">Moderate and manage customer reviews</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No reviews yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="py-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{review.business?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        By {review.user?.userName || review.user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{getAverageRating(review)}</p>
                      <p className="text-xs text-muted-foreground">Average Rating</p>
                    </div>
                  </div>

                  <p className="mb-3 text-sm">{review.text}</p>

                  <div className="mb-4 grid gap-2 text-xs md:grid-cols-4">
                    <div>
                      <span className="text-muted-foreground">Food Quality:</span>
                      <p className="font-semibold">{review.foodQuality}/5</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Service:</span>
                      <p className="font-semibold">{review.service}/5</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ambiance:</span>
                      <p className="font-semibold">{review.ambiance}/5</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Value:</span>
                      <p className="font-semibold">{review.value}/5</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
