"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Search,
  Trash2,
  Undo2,
  Utensils,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readProblemMessage } from "@/lib/api/client";
import { ErrorAlert } from "@/components/ui/error-alert";
interface FoodImage {
  id: string;
  url?: string | null;
  description: string;
  /** Newly added image that still needs a file upload. */
  isNew?: boolean;
  /** Existing image marked for removal (row + stored object). */
  removed?: boolean;
  file?: File | null;
  previewUrl?: string | null;
}

interface Food {
  id: string;
  name: string;
  description: string;
  history: string;
  preparation: string;
  recipe: string;
  culturalSignificance: string;
  isHeritage: boolean;
  images?: FoodImage[];
  _count?: {
    businesses: number;
  };
}

export default function ManageFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    history: "",
    preparation: "",
    recipe: "",
    culturalSignificance: "",
    isHeritage: true,
  });
  const [formImages, setFormImages] = useState<FoodImage[]>([]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      void loadFoods(searchQuery);
    }, searchQuery ? 300 : 0);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, loadFoods]);

  async function loadFoods(query: string) {
    try {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("filter", "name:contains:" + encodeURIComponent(query.trim()));
      }
      const qs = params.toString();
      const url = qs ? "/api/management/foods?" + qs : "/api/management/foods";
      const response = await fetch(url);
      if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to load foods"));
      const data = (await response.json()) as Food[];
      setFoods(data);
    } catch (error) {
      console.error("Failed to load foods:", error);
      setError(error instanceof Error ? error.message : "Failed to load foods");
    } finally {
      setIsLoading(false);
    }
  }

  function releaseObjectUrls(images: FoodImage[]) {
    for (const image of images) {
      if (image.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(image.previewUrl);
      }
    }
  }

  function resetForm() {
    releaseObjectUrls(formImages);
    setFormData({
      name: "",
      description: "",
      history: "",
      preparation: "",
      recipe: "",
      culturalSignificance: "",
      isHeritage: true,
    });
    setFormImages([]);
    setEditingId(null);
    setShowForm(false);
  }

  function addImageFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    setFormImages((current) => [
      ...current,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        url: null,
        description: "",
        isNew: true,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }

  function toggleRemoved(image: FoodImage) {
    if (image.isNew) {
      if (image.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(image.previewUrl);
      }
      setFormImages((current) => current.filter((img) => img.id !== image.id));
    } else {
      setFormImages((current) =>
        current.map((img) =>
          img.id === image.id ? { ...img, removed: !img.removed } : img
        )
      );
    }
  }

  function updateImageDescription(id: string, description: string) {
    setFormImages((current) =>
      current.map((img) => (img.id === id ? { ...img, description } : img))
    );
  }

  function moveImage(id: string, direction: -1 | 1) {
    setFormImages((current) => {
      const from = current.findIndex((img) => img.id === id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const activeImages = formImages.filter((img) => !img.removed);
      const removedImages = formImages.filter((img) => img.removed && !img.isNew);
      const form = new FormData();

      if (editingId) {
        const metadata = {
          id: editingId,
          ...formData,
          images: [
            ...activeImages.map((img, index) =>
              img.isNew
                ? { id: img.id, new: true, position: index, description: img.description }
                : { id: img.id, position: index, description: img.description }
            ),
            ...removedImages.map((img) => ({ id: img.id, remove: true })),
          ],
        };
        form.append("metadata", JSON.stringify(metadata));
        for (const img of activeImages) {
          if (img.isNew && img.file) form.append(`image:${img.id}`, img.file);
        }
        const response = await fetch(`/api/management/foods/${editingId}`, {
          method: "PATCH",
          body: form,
        });
        if (!response.ok) {
          throw new Error(await readProblemMessage(response, "Failed to save food"));
        }
      } else {
        const newImages = activeImages.filter((img) => img.isNew && img.file);
        const metadata = {
          food: { ...formData },
          images: newImages.map((img, index) => ({
            position: index,
            description: img.description,
          })),
        };
        form.append("metadata", JSON.stringify(metadata));
        for (const img of newImages) {
          if (img.file) form.append("images", img.file);
        }
        const response = await fetch("/api/management/foods", {
          method: "POST",
          body: form,
        });
        if (!response.ok) {
          throw new Error(await readProblemMessage(response, "Failed to save food"));
        }
      }

      resetForm();
      await loadFoods(searchQuery);
    } catch (error) {
      console.error("Failed to save food:", error);
      setError(error instanceof Error ? error.message : "Failed to save food");
    }
  }

  async function handleDelete(id: string) {
    if (
      confirm(
        "Sigurado ka bang gusto mong tanggalin ang pagkaing ito? Tatanggalin din ang mga larawan nito sa storage."
      )
    ) {
      try {
        const response = await fetch(
          `/api/foods/${id}?id=${encodeURIComponent(id)}`,
          { method: "DELETE" }
        );
        if (!response.ok) {
          throw new Error(await readProblemMessage(response, "Failed to delete food"));
        }
        await loadFoods(searchQuery);
      } catch (error) {
        console.error("Failed to delete food:", error);
        setError(error instanceof Error ? error.message : "Failed to delete food");
      }
    }
  }

  function startEditing(food: Food) {
    setEditingId(food.id);
    setFormData({
      name: food.name,
      description: food.description,
      history: food.history,
      preparation: food.preparation,
      recipe: food.recipe,
      culturalSignificance: food.culturalSignificance,
      isHeritage: food.isHeritage,
    });
    setFormImages(
      (food.images ?? []).map((img) => ({
        id: img.id,
        url: img.url ?? null,
        description: img.description ?? "",
        file: null,
      }))
    );
    setShowForm(true);
  }

  const visibleFoods = foods;

  return (
    <div className="px-1 py-2 sm:px-3 lg:px-5 lg:py-4">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Mga Pahina / Mga Pagkain</p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Mga Pagkain</h1>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm text-muted-foreground shadow-sm border border-border sm:w-64 sm:flex-none"><Search size={16} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Maghanap" className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground" /></div>
            <Button onClick={() => setShowForm(true)}>Magdagdag</Button>
            <button type="button" aria-label="Higit pang mga opsyon" className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-muted-foreground shadow-sm border border-border"><MoreHorizontal size={19} /></button>
          </div>
        </div>

        <ErrorAlert message={error} className="mb-6" onDismiss={() => setError(null)} />

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? "Mag-edit ng Pagkain" : "Magdagdag ng Bagong Pagkain"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      addImageFiles(e.target.files);
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
                              onChange={(e) => updateImageDescription(img.id, e.target.value)}
                              placeholder="Paglalarawan ng larawan (opsyonal)"
                              rows={2}
                              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                            />
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => moveImage(img.id, -1)}
                                disabled={index === 0}
                              >
                                <ChevronUp className="size-4" />
                                <span className="sr-only">Itaas</span>
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => moveImage(img.id, 1)}
                                disabled={index === formImages.length - 1}
                              >
                                <ChevronDown className="size-4" />
                                <span className="sr-only">Ibaba</span>
                              </Button>
                              <Button
                                type="button"
                                variant={img.removed ? "outline" : "destructive"}
                                size="sm"
                                onClick={() => toggleRemoved(img)}
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
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Kanselahin
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Ikinakarga ang mga pagkain...</p>
          </div>
        ) : visibleFoods.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Wala pang pagkain. Magdagdag ng isa upang magsimula!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_110px] gap-4 border-b border-border px-5 py-4 text-xs font-semibold text-muted-foreground"><span>Pagkain</span><span>Negosyo</span><span>Larawan</span><span>Uri</span><span /></div>
            {visibleFoods.map((food) => (
              <div key={food.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_110px] items-center gap-4 border-b border-border px-5 py-4 last:border-0 hover:bg-muted/50">
                  <div className="flex min-w-0 items-center gap-3">
                    {(() => {
                      const primaryImageUrl = food.images?.find((img) => img.url)?.url;
                      return primaryImageUrl ? (
                        <Image
                          src={primaryImageUrl}
                          alt=""
                          width={36}
                          height={36}
                          unoptimized
                          className="size-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                          <Utensils aria-hidden="true" className="size-4" />
                        </div>
                      );
                    })()}
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{food.name}</p><p className="truncate text-xs text-muted-foreground">{food.description}</p></div>
                  </div>
                  <span className="text-sm text-foreground">{food._count?.businesses || 0}</span><span className="text-sm text-foreground">{food.images?.length || 0}</span><span className="text-sm text-muted-foreground">{food.isHeritage ? "Pamanang-kultura" : "Karaniwan"}</span>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(food)}
                    >
                      Mag-edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(food.id)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
            ))}
            </div>
          </div>
        )}
      </div>
  );
}
