"use client";

import { startTransition, useEffect, useState } from "react";
import { MoreHorizontal, Search, Star } from "lucide-react";
import { getAllReviewsForManagement } from "@/app/(session-gated)/(admin-only)/management/services";
import { deleteReviewAction } from "@/app/(session-gated)/(admin-only)/management/actions";
import { Button } from "@/lib/components/actions/button";
import { Card, CardContent } from "@/lib/components/display/card";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    startTransition(() => {
      void loadReviews();
    });
  }, []);

  async function handleDelete(id: string) {
    if (confirm("Sigurado ka bang gusto mong tanggalin ang review na ito?")) {
      try {
        await deleteReviewAction(id);
        const data = await getAllReviewsForManagement();
        setReviews(data as Review[]);
      } catch (error) {
        console.error("Failed to delete review:", error);
      }
    }
  }

  const getAverageRating = (review: Review) => {
    return ((review.foodQuality + review.service + review.ambiance + review.value) / 4).toFixed(1);
  };

  const visibleReviews = reviews.filter((review) => {
    const query = searchQuery.toLowerCase();
    return !query || review.text.toLowerCase().includes(query) || review.business?.name.toLowerCase().includes(query) || review.user?.userName?.toLowerCase().includes(query) || review.user?.email.toLowerCase().includes(query);
  });

  return (
    <div className="px-1 py-2 sm:px-3 lg:px-5 lg:py-4">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-xs font-medium text-slate-400">Mga Pahina / Mga Review</p><h1 className="text-3xl font-bold tracking-tight text-slate-900">Mga Review</h1></div>
        <div className="flex w-full items-center gap-2 sm:w-auto"><div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm text-slate-400 shadow-sm sm:w-64 sm:flex-none"><Search size={16} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Maghanap" className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400" /></div><button type="button" aria-label="Higit pang mga opsyon" className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-slate-500 shadow-sm"><MoreHorizontal size={19} /></button></div>
      </div>

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
              <Card key={review.id} className="rounded-2xl border-slate-200 bg-white shadow-[0_8px_30px_rgba(65,93,145,0.08)] transition hover:border-blue-200">
                <CardContent className="py-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{review.business?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Ni {review.user?.userName || review.user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center gap-1 text-lg font-bold text-amber-500"><Star size={15} fill="currentColor" />{getAverageRating(review)}</p>
                      <p className="text-xs text-slate-400">Karaniwang Marka</p>
                    </div>
                  </div>

                  <p className="mb-3 text-sm">{review.text}</p>

                  <div className="mb-4 grid gap-2 text-xs md:grid-cols-4">
                    <div>
                      <span className="text-muted-foreground">Kalidad ng Pagkain:</span>
                      <p className="font-semibold">{review.foodQuality}/5</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Serbisyo:</span>
                      <p className="font-semibold">{review.service}/5</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Kapaligiran:</span>
                      <p className="font-semibold">{review.ambiance}/5</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Halaga:</span>
                      <p className="font-semibold">{review.value}/5</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                    >
                      Aprubahan
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                    >
                      Tanggalin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
