"use client";

import { useEffect, useState } from "react";
import {
  getAllAppReviews,
  getAppReviewStats,
  getPendingAppReviews,
} from "@/app/(session-gated)/app-reviews/services";
import {
  updateAppReviewStatusAction,
  deleteAppReviewAction,
} from "@/app/(session-gated)/app-reviews/actions";
import { Button } from "@/lib/components/actions/button";
import { Card, CardContent } from "@/lib/components/display/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/navigation/tabs";

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

export default function ManageAppReviews() {
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [pendingReviews, setPendingReviews] = useState<AppReview[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    averageRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allReviews, pendingReviewsData, statsData] = await Promise.all([
        getAllAppReviews(),
        getPendingAppReviews(),
        getAppReviewStats(),
      ]);
      setReviews(allReviews as AppReview[]);
      setPendingReviews(pendingReviewsData as AppReview[]);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load app reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await updateAppReviewStatusAction({ id, isApproved: true });
      await loadData();
    } catch (error) {
      console.error("Failed to approve review:", error);
    }
  }

  async function handleReject(id: string) {
    try {
      await updateAppReviewStatusAction({ id, isApproved: false });
      await loadData();
    } catch (error) {
      console.error("Failed to reject review:", error);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteAppReviewAction(id);
        await loadData();
      } catch (error) {
        console.error("Failed to delete review:", error);
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Manage App Reviews</h1>
          <p className="mt-1 text-muted-foreground">Moderate and manage user reviews for the application</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-12">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="mt-2 text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {stats.averageRating.toFixed(1)}/5
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading reviews...</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingReviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {reviews.length === 0 ? (
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
                            <p className="font-semibold">
                              {review.user?.userName || review.userName || "Anonymous"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {review.user?.email || review.email || "No email"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-2xl font-bold text-primary">
                                {review.rating}
                              </span>
                              <span className="text-muted-foreground">/5</span>
                            </div>
                            <div className="inline-block rounded-full px-3 py-1 text-xs font-semibold" 
                              style={{
                                backgroundColor: review.isApproved ? "var(--color-success)" : "var(--color-warning)",
                                color: "white"
                              }}>
                              {review.isApproved ? "Approved" : "Pending"}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-foreground mb-4">{review.text}</p>

                        <div className="flex gap-2">
                          {!review.isApproved && (
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => handleApprove(review.id)}
                            >
                              Approve
                            </Button>
                          )}
                          {review.isApproved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(review.id)}
                            >
                              Unapprove
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
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
            </TabsContent>

            <TabsContent value="pending">
              {pendingReviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No pending reviews</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <Card key={review.id} className="border-yellow-200">
                      <CardContent className="py-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <p className="font-semibold">
                              {review.user?.userName || review.userName || "Anonymous"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {review.user?.email || review.email || "No email"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-2xl font-bold text-primary">
                                {review.rating}
                              </span>
                              <span className="text-muted-foreground">/5</span>
                            </div>
                            <div className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-yellow-500 text-white">
                              Pending
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-foreground mb-4">{review.text}</p>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => handleApprove(review.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(review.id)}
                          >
                            Reject & Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
