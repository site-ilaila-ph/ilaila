"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { MoreHorizontal, Trash2, Utensils } from "lucide-react";
import { ManagementHeader } from "@/presentation/management-header";
import { ManagementSearchBar } from "@/presentation/management-search-bar";
import { FoodForm, type FoodFormData, type FoodFormImage } from "@/presentation/food-form";
import { Button } from "@/presentation/ui/button";
import { Card, CardContent } from "@/presentation/ui/card";
import { ErrorAlert } from "@/presentation/ui/error-alert";
import { readProblemMessage } from "@/lib/api/client";

interface Food {
  id: string;
  name: string;
  description: string;
  history: string;
  preparation: string;
  recipe: string;
  culturalSignificance: string;
  isHeritage: boolean;
  _count?: { businesses: number };
  images?: FoodFormImage[];
}

export default function ManageFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<FoodFormData>({
    name: "",
    description: "",
    history: "",
    preparation: "",
    recipe: "",
    culturalSignificance: "",
    isHeritage: true,
  });

  const [formImages, setFormImages] = useState<FoodFormImage[]>([]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadFoods(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  async function loadFoods(query: string = "") {
    try {
      const url = query
        ? `/api/foods?search=${encodeURIComponent(query)}`
        : "/api/foods";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(await readProblemMessage(response, "Failed to load foods"));
      }
      const data = await response.json();
      setFoods(data);
    } catch (error) {
      console.error("Failed to load foods:", error);
      setError(error instanceof Error ? error.message : "Failed to load foods");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    for (const img of formImages) {
      if (img.isNew && img.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(img.previewUrl);
      }
    }
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

  function toggleRemoved(image: FoodFormImage) {
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
      current.map((img) =>
        img.id === id ? { ...img, description } : img
      )
    );
  }

  function moveImage(id: string, delta: number) {
    setFormImages((current) => {
      const index = current.findIndex((img) => img.id === id);
      if (index === -1) return current;
      const nextIndex = index + delta;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const form = new FormData();
      const activeImages = formImages.filter((img) => !img.removed);

      if (editingId) {
        const removedImages = formImages.filter((img) => !img.isNew && img.removed);
        const metadata = {
          food: { ...formData },
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
      (food.images ?? []).map((img, index) => ({
        id: img.id,
        url: img.url,
        description: img.description,
        position: index,
        isNew: false,
        removed: false,
      }))
    );
    setShowForm(true);
  }

  const visibleFoods = foods;

  return (
    <div className="px-1 py-2 sm:px-3 lg:px-5 lg:py-4">
      <ManagementHeader
        breadcrumb="Mga Pahina / Mga Pagkain"
        title="Mga Pagkain"
      >
        <ManagementSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <Button onClick={() => setShowForm(true)}>Magdagdag</Button>
        <button
          type="button"
          aria-label="Higit pang mga opsyon"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-muted-foreground shadow-sm border border-border"
        >
          <MoreHorizontal size={19} />
        </button>
      </ManagementHeader>

      <ErrorAlert message={error} className="mb-6" onDismiss={() => setError(null)} />

      {showForm && (
        <FoodForm
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          formImages={formImages}
          onAddImageFiles={addImageFiles}
          onMoveImage={moveImage}
          onToggleRemoved={toggleRemoved}
          onUpdateImageDescription={updateImageDescription}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
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
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_110px] gap-4 border-b border-border px-5 py-4 text-xs font-semibold text-muted-foreground">
              <span>Pagkain</span>
              <span>Negosyo</span>
              <span>Larawan</span>
              <span>Uri</span>
              <span />
            </div>
            {visibleFoods.map((food) => (
              <div
                key={food.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_110px] items-center gap-4 border-b border-border px-5 py-4 last:border-0 hover:bg-muted/50"
              >
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
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{food.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{food.description}</p>
                  </div>
                </div>
                <span className="text-sm text-foreground">{food._count?.businesses || 0}</span>
                <span className="text-sm text-foreground">{food.images?.length || 0}</span>
                <span className="text-sm text-muted-foreground">
                  {food.isHeritage ? "Pamanang-kultura" : "Karaniwan"}
                </span>
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
