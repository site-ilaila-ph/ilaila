import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
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
  reviewImages: ReviewImageDraft[];
  onAddReviewImages: (files: FileList | null) => void;
  onRemoveReviewImage: (id: string) => void;
  onUpdateImageDescription: (id: string, description: string) => void;
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
  reviewImages,
  onAddReviewImages,
  onRemoveReviewImage,
  onUpdateImageDescription,
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

        <div>
          <Label htmlFor="review-images" className="text-xs font-medium text-muted-foreground">
            Mga Larawan (opsyonal)
          </Label>
          <Input
            id="review-images"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="mt-1"
            onChange={(event) => {
              onAddReviewImages(event.target.files);
              event.target.value = "";
            }}
          />
          {reviewImages.length > 0 && (
            <ul className="mt-3 space-y-2">
              {reviewImages.map((image, index) => (
                <li key={image.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-2">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={image.previewUrl}
                      alt={`Preview ng larawan ${index + 1}`}
                      width={120}
                      height={80}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Textarea
                      value={image.description}
                      onChange={(event) => onUpdateImageDescription(image.id, event.target.value)}
                      placeholder="Paglalarawan ng larawan (opsyonal)"
                      rows={2}
                      className="text-sm"
                    />
                    <Button type="button" variant="destructive" size="sm" onClick={() => onRemoveReviewImage(image.id)}>
                      <X className="size-4" />
                      <span className="sr-only">Alisin</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
            {isSubmitting ? "Nagpapadala..." : "I-publish ang review"}
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

