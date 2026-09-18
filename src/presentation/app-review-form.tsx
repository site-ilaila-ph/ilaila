import { Button } from "@/presentation/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/ui/card";
import { Input } from "@/presentation/ui/input";
import { Label } from "@/presentation/ui/label";

export interface AppReviewFormData {
  userName: string;
  email: string;
  rating: number;
  text: string;
}

interface AppReviewFormProps {
  formData: AppReviewFormData;
  setFormData: React.Dispatch<React.SetStateAction<AppReviewFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function AppReviewForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}: AppReviewFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sumulat ng Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
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
  );
}

