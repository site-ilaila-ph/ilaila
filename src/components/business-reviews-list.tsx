import { ThumbsUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import type { BusinessListItem } from "@/app/businesses/types";

interface BusinessReviewsListProps {
  reviews: BusinessListItem["reviews"];
  onUpvote: (reviewId: string) => void;
  isUpvoting: boolean;
  upvoteError: string | null;
  onDismissUpvoteError: () => void;
}

export function BusinessReviewsList({
  reviews,
  onUpvote,
  isUpvoting,
  upvoteError,
  onDismissUpvoteError,
}: BusinessReviewsListProps) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-4 text-2xl font-semibold">Mga Review</h2>
      {upvoteError && (
        <ErrorAlert
          message={upvoteError}
          className="mb-4"
          onDismiss={onDismissUpvoteError}
        />
      )}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{review.user.authUser.email ?? "Lokal na reviewer"}</h3>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>Pagkain: {review.foodQuality}/5</span>
                <span>Serbisyo: {review.service}/5</span>
                <span>Ambiance: {review.ambiance}/5</span>
                <span>Halaga: {review.value}/5</span>
              </div>
            </div>
            <p className="text-muted-foreground">{review.text}</p>
            <button
              onClick={() => onUpvote(review.id)}
              disabled={isUpvoting}
              className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary disabled:opacity-50"
            >
              <ThumbsUp className="size-3.5" /> {review.upvotes} nakatulong
            </button>
          </Card>
        ))}
      </div>
    </section>
  );
}

