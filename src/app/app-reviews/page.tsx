"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorAlert } from "@/components/ui/error-alert";
import { readProblemMessage } from "@/lib/api/client";

export default function SubmitAppReview() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    rating: 5,
    text: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/app-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: formData.userName || undefined,
          email: formData.email || undefined,
          rating: formData.rating,
          text: formData.text,
        }),
      });
      if (!response.ok) {
        throw new Error(await readProblemMessage(response, "Hindi naisumite ang review ng app"));
      }

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
      setSubmitError(error instanceof Error ? error.message : "Hindi naisumite ang review. Pakisubukang muli.");
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
            ← Bumalik sa Home
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Ibahagi ang Iyong Feedback</h1>
          <p className="text-muted-foreground">
            Tulungan kaming mapabuti ang Ilaila sa pamamagitan ng pagbabahagi ng iyong mga saloobin at karanasan
          </p>
        </div>

        {submitted && (
          <Card className="mb-8 border-emerald-200 bg-emerald-50">
            <CardContent className="py-4 text-center">
              <p className="font-semibold text-emerald-700">
                Salamat! Naipadala ang iyong review at kasalukuyang naghihintay ng pag-apruba.
              </p>
            </CardContent>
          </Card>
        )}

        <ErrorAlert message={submitError} className="mb-8" onDismiss={() => setSubmitError(null)} />

        <Card>
          <CardHeader>
            <CardTitle>Sumulat ng Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="userName">Pangalan (opsyonal)</Label>
                <Input
                  id="userName"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  placeholder="Iyong pangalan"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Iwanang blangko upang magsumite nang hindi nagpapakilala
                </p>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email (opsyonal)</Label>
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
                  1 = Hindi nasiyahan, 5 = Lubos na nasiyahan
                </p>
              </div>

              {/* Review Text */}
              <div>
                <Label htmlFor="text">Iyong Review</Label>
                <textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Sabihin sa amin ang iyong saloobin tungkol sa Ilaila. Ano ang nagustuhan mo? Ano ang maaari naming mapabuti?"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  rows={5}
                  minLength={10}
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.text.length}/1000 na karakter
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || formData.text.length < 10}
                className="w-full"
              >
                {isSubmitting ? "Nagpapadala..." : "Isumite ang Review"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Susuriin mula ng aming koponan ang iyong review bago ito ilathala.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Featured Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Ano ang Sinasabi ng mga Gumagamit</h2>
          <p className="text-muted-foreground mb-6">
            Dito lalabas ang mga review mula sa aming komunidad na naaprubahan na
          </p>
        </div>
      </div>
    </div>
  );
}
