"use client";

import { useState } from "react";
import Link from "next/link";
import { createAppReviewAction } from "@/app/app-reviews/actions";
import { Button } from "@/lib/components/actions/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/display/card";
import { Input } from "@/lib/components/form/inputs";
import { Label } from "@/lib/components/form/label";

export default function SubmitAppReview() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    rating: 5,
    text: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createAppReviewAction({
        userName: formData.userName || undefined,
        email: formData.email || undefined,
        rating: formData.rating,
        text: formData.text,
      });

      setSubmitted(true);
      setFormData({
        userName: "",
        email: "",
        rating: 5,
        text: "",
      });

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Share Your Feedback</h1>
          <p className="text-muted-foreground">
            Help us improve Ilaila by sharing your thoughts and experience
          </p>
        </div>

        {submitted && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="py-4 text-center">
              <p className="font-semibold text-green-700">
                Thank you! Your review has been submitted and is pending approval.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="userName">Name (optional)</Label>
                <Input
                  id="userName"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  placeholder="Your name"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to submit anonymously
                </p>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>

              {/* Rating */}
              <div>
                <Label htmlFor="rating">Rating</Label>
                <div className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: value })}
                      className={`h-12 w-12 rounded-lg font-bold text-lg transition-all ${
                        formData.rating === value
                          ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                          : "border-2 border-border hover:border-primary hover:bg-card"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  1 = Not satisfied, 5 = Very satisfied
                </p>
              </div>

              {/* Review Text */}
              <div>
                <Label htmlFor="text">Your Review</Label>
                <textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Tell us what you think about Ilaila. What do you like? What could we improve?"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  rows={5}
                  minLength={10}
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.text.length}/1000 characters
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || formData.text.length < 10}
                className="w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your review will be reviewed by our team before being published.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Featured Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">What Users Say</h2>
          <p className="text-muted-foreground mb-6">
            Approved reviews from our community will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
