import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type ReviewScores = { foodQuality: number; service: number; ambiance: number; value: number };
export type ReviewImageDraft = { id: string; file: File; description: string; previewUrl: string };

interface BusinessReviewFormProps {
  reviewScores: ReviewScores;
  onReviewScoresChange: (scores: ReviewScores) => void;
  reviewText: string;
  onReviewTextChange: (text: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  isSubmitting: boolean;
  submitError: string | null;
  onDismissSubmitError: () => void;
}

export function BusinessReviewForm({
  reviewScores,
  onReviewScoresChange,
  reviewText,
  onReviewTextChange,
  onSubmit,
  isSubmitting,
  submitError,
  onDismissSubmitError,
}: BusinessReviewFormProps) {
  return (
    <section className="border-t border-border pt-8">
      <h2 className="mb-4 font-heading text-2xl font-bold">Ibahagi ang iyong karanasan</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-4">
          {(Object.keys(reviewScores) as (keyof ReviewScores)[]).map((key) => (
            <div key={key} className="text-xs font-medium text-muted-foreground">
              <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
              <Select
                value={String(reviewScores[key])}
                onValueChange={(value) => onReviewScoresChange({ ...reviewScores, [key]: Number(value) })}
              >
                <SelectTrigger className="mt-1 w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value} / 5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <Textarea
          value={reviewText}
          onChange={(event) => onReviewTextChange(event.target.value)}
          placeholder="Ano ang dapat malaman ng mga tao bago pumunta?"
          rows={4}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            Sinasaklaw ng iyong review ang pagkain, serbisyo, ambiance, at halaga.
          </span>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Nagpapadala..." : "Ipadala ang review"}
          </Button>
        </div>

        {submitError && (
          <ErrorAlert
            message={submitError}
            className="mt-4"
            onDismiss={onDismissSubmitError}
          />
        )}
      </form>
    </section>
  );
}

