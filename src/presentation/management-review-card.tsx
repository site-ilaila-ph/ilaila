import { Star } from "lucide-react";
import { Button } from "@/presentation/ui/button";
import { Card, CardContent } from "@/presentation/ui/card";

export interface ManagementReviewItem {
  id: string;
  text: string;
  foodQuality: number;
  service: number;
  ambiance: number;
  value: number;
  createdAt: string;
  business?: { name: string };
  user?: { email: string; userName: string | null };
}

interface ManagementReviewCardProps {
  review: ManagementReviewItem;
  averageRating: string;
  onDelete: (id: string) => void;
}

export function ManagementReviewCard({
  review,
  averageRating,
  onDelete,
}: ManagementReviewCardProps) {
  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm transition hover:border-primary/50">
      <CardContent className="py-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="font-semibold">{review.business?.name}</p>
            <p className="text-sm text-muted-foreground">
              Ni {review.user?.userName || review.user?.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="flex items-center gap-1 text-lg font-bold text-primary">
              <Star size={15} fill="currentColor" />
              {averageRating}
            </p>
            <p className="text-xs text-muted-foreground">Karaniwang Marka</p>
          </div>
        </div>

        <p className="mb-3 text-sm">{review.text}</p>

        <div className="mb-4 grid gap-2 text-xs md:grid-cols-4">
          <div>
            <span className="text-muted-foreground">Kalidad ng Pagkain:</span>
            <p className="font-semibold">{review.foodQuality}/5</p>
          </div>
          <div>
            <span className="text-muted-foreground">Serbisyo:</span>
            <p className="font-semibold">{review.service}/5</p>
          </div>
          <div>
            <span className="text-muted-foreground">Kapaligiran:</span>
            <p className="font-semibold">{review.ambiance}/5</p>
          </div>
          <div>
            <span className="text-muted-foreground">Halaga:</span>
            <p className="font-semibold">{review.value}/5</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Aprubahan
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(review.id)}
          >
            Tanggalin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

