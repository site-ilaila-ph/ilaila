"use client";

import { useState } from "react";
import { AppNav } from "@/presentation/app-nav";
import { AppReviewForm } from "@/presentation/app-review-form";
import { Card, CardContent } from "@/presentation/ui/card";
import { ErrorAlert } from "@/presentation/ui/error-alert";
import { api } from "@/lib/api/client";

export default function AppReviewsPage() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    rating: 5,
    text: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await api("/api/app-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setSubmitted(true);
      setFormData({
        userName: "",
        email: "",
        rating: 5,
        text: "",
      });

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
      <AppNav backHref="/home" backLabel="← Bumalik sa Home" />

      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Ibahagi ang Iyong Paghuhusga</h1>
          <p className="text-muted-foreground">
            Tulungan kaming mapabuti ang Ilaila sa pamamagitan ng pagbabahagi ng iyong mga saloobin at karanasan
          </p>
        </div>

        {submitted && (
          <Card className="mb-8 border-primary/30 bg-primary/10">
            <CardContent className="py-4 text-center">
              <p className="font-semibold text-primary">
                Salamat! Naipadala ang iyong review at kasalukuyang naghihintay ng pag-apruba.
              </p>
            </CardContent>
          </Card>
        )}

        <ErrorAlert message={submitError} className="mb-8" onDismiss={() => setSubmitError(null)} />

        <AppReviewForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

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
