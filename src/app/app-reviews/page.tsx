"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { createAppReviewAction } from "@/app/app-reviews/actions";
import { getApprovedAppReviews } from "@/app/app-reviews/services";
import { Button } from "@/lib/components/actions/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/display/card";
import { Input } from "@/lib/components/form/inputs";
import { Label } from "@/lib/components/form/label";

interface Review {
  id: string;
  userName: string | null;
  rating: number;
  text: string;
  createdAt: Date;
  category?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "Needs significant improvement",
  2: "Could be better",
  3: "Good / Average",
  4: "Great experience",
  5: "Loved it!",
};

const CATEGORIES = ["General", "UI/UX Design", "Bug Report", "Feature Request"];

export default function SubmitAppReview({ initialReviews = [] }: { initialReviews?: Review[] }) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [status, setStatus] = useState<{ type: "error"; message: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadApprovedReviews() {
      try {
        const data = await getApprovedAppReviews();
        if (!isMounted) return;
        setReviews(data);
      } catch (error) {
        console.error("Failed to load approved app reviews:", error);
      }
    }

    void loadApprovedReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    rating: 5,
    category: "General",
    text: "",
  });

  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.text.trim().length < 10) return;

    setStatus(null);

    startTransition(async () => {
      try {
        const result = await createAppReviewAction({
          userName: formData.userName.trim() || undefined,
          email: formData.email.trim() || undefined,
          rating: formData.rating,
          text: `[${formData.category}] ${formData.text.trim()}`,
        });

        if (!result.success) {
          const message = "message" in result
            ? result.message
            : "globalErrors" in result
              ? result.globalErrors?.[0]
              : undefined;
          throw new Error(message ?? "Failed to submit review.");
        }

        setSubmitted(true);
      } catch (error) {
        setStatus({
          type: "error",
          message: error instanceof Error ? error.message : "Failed to submit review.",
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center px-6 py-4">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12 space-y-12">
        <header className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Share Your Feedback</h1>
          <p className="text-muted-foreground">
            Help us improve Ilaila by sharing your thoughts, bug reports, or feature ideas.
          </p>
        </header>

        {submitted ? (
          <Card className="border-emerald-500/20 bg-emerald-500/5 text-center p-8 transition-all duration-300">
            <CardContent className="space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-2xl font-bold">
                ✓
              </div>
              <h2 className="text-xl font-semibold">Feedback Submitted!</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Thank you for helping improve Ilaila. Your review is currently pending moderation and will appear publicly once approved.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ userName: "", email: "", rating: 5, category: "General", text: "" });
                }}
              >
                Submit Another Review
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle className="text-xl">Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              {status && (
                <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userName">Name (optional)</Label>
                    <Input
                      id="userName"
                      placeholder="Your name"
                      value={formData.userName}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      disabled={isPending}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to submit anonymously
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isPending}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label>Category</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 active:scale-95 ${
                          formData.category === cat
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Rating</Label>
                  <div 
                    className="mt-2 flex items-center gap-1.5"
                    onMouseLeave={() => setHoveredRating(null)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (hoveredRating ?? formData.rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredRating(star)}
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="p-1 rounded-md transition-transform duration-150 hover:scale-125 active:scale-90 focus-visible:outline-none"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors duration-150 ${
                              active
                                ? "fill-amber-400 text-amber-400"
                                : "fill-transparent text-muted-foreground/40"
                            }`}
                            strokeWidth={1.5}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-xs font-medium text-muted-foreground transition-opacity">
                      {RATING_LABELS[hoveredRating ?? formData.rating]}
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="text">Your Review</Label>
                  <textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Tell us what you think about Ilaila..."
                    rows={4}
                    minLength={10}
                    maxLength={1000}
                    required
                    disabled={isPending}
                    className="mt-1.5 w-full rounded-md border border-border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>Minimum 10 characters</span>
                    <span>{formData.text.length}/1000</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isPending || formData.text.trim().length < 10} 
                  className="w-full transition-transform active:scale-[0.99]"
                >
                  {isPending ? "Submitting..." : "Submit Review"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your review will be reviewed by our team before being published.
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        <section className="space-y-6 pt-6 border-t border-border">
          <div>
            <h2 className="text-xl font-bold">Community Feedback</h2>
            <p className="text-sm text-muted-foreground">Recent reviews and suggestions from verified users.</p>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No public reviews yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <Card key={rev.id} className="p-4 space-y-2 h-full border-border/60">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{rev.userName}</span>
                    <span>{rev.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${
                          s <= rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-transparent text-muted-foreground/30"
                        }`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/90">{rev.text}</p>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}