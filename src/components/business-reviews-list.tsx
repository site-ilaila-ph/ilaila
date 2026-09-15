import Image from "next/image";
import { Image as ImageIcon, ThumbsUp } from "lucide-react";
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
            {review.images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {review.images.map((image) => (
                  <div key={image.id} className="overflow-hidden rounded-lg border border-border bg-muted">
                    {image.url ? (
                      <Image
                        src={image.url}
                        alt={image.description || "Larawan mula sa review"}
                        width={240}
                        height={160}
                        unoptimized
                        className="h-28 w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-28 w-full place-items-center text-muted-foreground">
                        <ImageIcon className="size-6" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

