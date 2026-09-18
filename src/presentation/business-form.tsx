import Image from "next/image";
import { Camera, Undo2, X } from "lucide-react";
import { Button } from "@/presentation/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/ui/card";
import { Input } from "@/presentation/ui/input";
import { Label } from "@/presentation/ui/label";

export interface BusinessFormData {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  hours: string;
  history: string;
}

export interface BusinessFormImage {
  id: string;
  url: string | null;
  description: string;
  isNew?: boolean;
  file?: File;
  previewUrl?: string;
  removed?: boolean;
}

interface BusinessFormProps {
  editingId: string | null;
  formData: BusinessFormData;
  setFormData: React.Dispatch<React.SetStateAction<BusinessFormData>>;
  formImages: BusinessFormImage[];
  onAddImageFiles: (files: FileList | null) => void;
  onToggleRemoved: (image: BusinessFormImage) => void;
  onUpdateImageDescription: (id: string, description: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function BusinessForm({
  editingId,
  formData,
  setFormData,
  formImages,
  onAddImageFiles,
  onToggleRemoved,
  onUpdateImageDescription,
  onSubmit,
  onCancel,
}: BusinessFormProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{editingId ? "Mag-edit ng Negosyo" : "Magdagdag ng Bagong Negosyo"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Pangalan ng Negosyo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ilagay ang pangalan ng negosyo"
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Tirahan</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ilagay ang address"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Paglalarawan</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ilagay ang paglalarawan ng negosyo"
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="business-images">Mga Larawan ng Negosyo</Label>
            <Input
              id="business-images"
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
                          <Camera aria-hidden="true" className="size-5" />
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
              <p className="mt-3 text-xs text-muted-foreground">
                Wala pang larawan. Maaari kang magdagdag ng isa o higit pa.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="history">Kasaysayan</Label>
            <textarea
              id="history"
              value={formData.history}
              onChange={(e) => setFormData({ ...formData, history: e.target.value })}
              placeholder="Ilagay ang kasaysayan ng negosyo"
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="hours">Oras ng Operasyon</Label>
              <Input
                id="hours"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder="9am - 5pm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">{editingId ? "I-update" : "Gumawa ng"} Negosyo</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Kanselahin
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

