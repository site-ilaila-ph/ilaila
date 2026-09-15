import Image from "next/image";
import { ChevronDown, ChevronUp, Undo2, Utensils, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FoodFormData {
  name: string;
  description: string;
  history: string;
  preparation: string;
  recipe: string;
  culturalSignificance: string;
  isHeritage: boolean;
}

export interface FoodFormImage {
  id: string;
  url: string | null;
  description: string;
  isNew?: boolean;
  file?: File;
  previewUrl?: string;
  removed?: boolean;
  position?: number;
}

interface FoodFormProps {
  editingId: string | null;
  formData: FoodFormData;
  setFormData: React.Dispatch<React.SetStateAction<FoodFormData>>;
  formImages: FoodFormImage[];
  onAddImageFiles: (files: FileList | null) => void;
  onMoveImage: (id: string, delta: number) => void;
  onToggleRemoved: (image: FoodFormImage) => void;
  onUpdateImageDescription: (id: string, description: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function FoodForm({
  editingId,
  formData,
  setFormData,
  formImages,
  onAddImageFiles,
  onMoveImage,
  onToggleRemoved,
  onUpdateImageDescription,
  onSubmit,
  onCancel,
}: FoodFormProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{editingId ? "Mag-edit ng Pagkain" : "Magdagdag ng Bagong Pagkain"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Pangalan ng Pagkain</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ilagay ang pangalan ng pagkain"
                required
              />
            </div>
            <div>
              <Label htmlFor="isHeritage">Pagkaing Pamanang-kultura</Label>
              <label className="flex items-center gap-2">
                <input
                  id="isHeritage"
                  type="checkbox"
                  checked={formData.isHeritage}
                  onChange={(e) => setFormData({ ...formData, isHeritage: e.target.checked })}
                />
                <span>Itala bilang pagkaing pamanang-kultura</span>
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Paglalarawan</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ilagay ang paglalarawan ng pagkain"
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              rows={2}
              required
            />
          </div>

          <div>
            <Label htmlFor="food-images">Mga Larawan ng Pagkain</Label>
            <Input
              id="food-images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={(e) => {
                onAddImageFiles(e.target.files);
                e.target.value = "";
              }}
            />
            {formImages.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {formImages.map((img, index) => (
                  <li
                    key={img.id}
                    className={`flex items-start gap-3 rounded-lg border border-border bg-background p-2 ${img.removed ? "opacity-50" : ""}`}
                  >
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                      {img.previewUrl ? (
                        <Image
                          src={img.previewUrl}
                          alt={`Preview ng larawan ${index + 1}`}
                          width={120}
                          height={80}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : img.url ? (
                        <Image
                          src={img.url}
                          alt={img.description || `Larawan ${index + 1}`}
                          width={120}
                          height={80}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-muted-foreground">
                          <Utensils aria-hidden="true" className="size-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        {img.removed
                          ? "Tatanggalin sa pag-save"
                          : img.isNew
                            ? "Bagong larawan"
                            : "Umiiral na larawan"}
                      </p>
                      <textarea
                        value={img.description}
                        onChange={(e) => onUpdateImageDescription(img.id, e.target.value)}
                        placeholder="Paglalarawan ng larawan (opsyonal)"
                        rows={2}
                        className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onMoveImage(img.id, -1)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="size-4" />
                          <span className="sr-only">Itaas</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onMoveImage(img.id, 1)}
                          disabled={index === formImages.length - 1}
                        >
                          <ChevronDown className="size-4" />
                          <span className="sr-only">Ibaba</span>
                        </Button>
                        <Button
                          type="button"
                          variant={img.removed ? "outline" : "destructive"}
                          size="sm"
                          onClick={() => onToggleRemoved(img)}
                        >
                          {img.removed ? <Undo2 className="size-4" /> : <X className="size-4" />}
                          <span className="sr-only">{img.removed ? "Ibalik" : "Alisin"}</span>
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Wala pang larawan. Pumili ng isa o higit pang mga file sa itaas.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="history">Kasaysayan</Label>
            <textarea
              id="history"
              value={formData.history}
              onChange={(e) => setFormData({ ...formData, history: e.target.value })}
              placeholder="Ilagay ang kasaysayan at pinagmulan ng pagkain"
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="preparation">Paghahanda</Label>
            <textarea
              id="preparation"
              value={formData.preparation}
              onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
              placeholder="Ilagay ang proseso ng paghahanda"
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="recipe">Resipe</Label>
            <textarea
              id="recipe"
              value={formData.recipe}
              onChange={(e) => setFormData({ ...formData, recipe: e.target.value })}
              placeholder="Ilagay ang buong resipe"
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="culturalSignificance">Kahalagahang Kultural</Label>
            <textarea
              id="culturalSignificance"
              value={formData.culturalSignificance}
              onChange={(e) => setFormData({ ...formData, culturalSignificance: e.target.value })}
              placeholder="Ipaliwanag ang kahalagahang kultural"
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">{editingId ? "I-update" : "Gumawa ng"} Pagkain</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Kanselahin
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

