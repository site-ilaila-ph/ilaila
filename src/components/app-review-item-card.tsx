import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface AppReviewItem {
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

interface AppReviewItemCardProps {
  review: AppReviewItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AppReviewItemCard({
  review,
  onApprove,
  onReject,
  onDelete,
}: AppReviewItemCardProps) {
  return (
    <Card key={review.id}>
      <CardContent className="py-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="font-semibold">
              {review.user?.userName || review.userName || "Hindi nakilala"}
            </p>
            <p className="text-sm text-muted-foreground">
              {review.user?.email || review.email || "Walang email"}
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
            <div
              className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: review.isApproved ? "var(--color-success)" : "var(--color-warning)",
                color: "white",
              }}
            >
              {review.isApproved ? "Naaprubahan" : "Nakabinbin"}
            </div>
          </div>
        </div>

        <p className="text-sm text-foreground mb-4">{review.text}</p>

        <div className="flex gap-2">
          {!review.isApproved && (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90"
              onClick={() => onApprove(review.id)}
            >
              Aprubahan
            </Button>
          )}
          {review.isApproved && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(review.id)}
            >
              Bawiin ang Pag-apruba
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(review.id)}
          >
            Tanggalin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

