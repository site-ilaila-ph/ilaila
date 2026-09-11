"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Search, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readProblemMessage } from "@/lib/api/client";
import { ErrorAlert } from "@/components/ui/error-alert";
interface Food {
  id: string;
  name: string;
  description: string;
  isHeritage: boolean;
  _count?: {
    businesses: number;
    images: number;
  };
}

export default function ManageFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    history: "",
    preparation: "",
    recipe: "",
    culturalSignificance: "",
    isHeritage: true,
    imageData: "",
  });

  useEffect(() => {
    loadFoods();
  }, []);

  async function loadFoods() {
    try {
      const response = await fetch("/api/management/foods");
      if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to load foods"));
      const data = await response.json();
      setFoods(data as Food[]);
    } catch (error) {
      console.error("Failed to load foods:", error);
      setError(error instanceof Error ? error.message : "Failed to load foods");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...formData };
      const response = await fetch("/api/management/foods", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: editingId ? JSON.stringify({ id: editingId, ...payload }) : JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await readProblemMessage(response, "Failed to save food"));
      }
      resetForm();
      await loadFoods();
    } catch (error) {
      console.error("Failed to save food:", error);
      setError(error instanceof Error ? error.message : "Failed to save food");
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Sigurado ka bang gusto mong tanggalin ang pagkaing ito?")) {
      try {
        const response = await fetch(`/api/management/foods?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to delete food"));
        await loadFoods();
      } catch (error) {
        console.error("Failed to delete food:", error);
        setError(error instanceof Error ? error.message : "Failed to delete food");
      }
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      history: "",
      preparation: "",
      recipe: "",
      culturalSignificance: "",
      isHeritage: true,
      imageData: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  const visibleFoods = foods.filter((food) => {
    const query = searchQuery.toLowerCase();
    return !query || food.name.toLowerCase().includes(query) || food.description.toLowerCase().includes(query);
  });

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
                  <Label htmlFor="food-image">Larawan ng Pagkain</Label>
                  <Input
                    id="food-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setFormData((current) => ({ ...current, imageData: String(reader.result) }));
                      reader.readAsDataURL(file);
                    }}
                  />
                  {formData.imageData && (
                    <Image src={formData.imageData} alt="Preview ng pagkain" width={240} height={140} unoptimized className="mt-3 h-28 w-48 rounded-lg object-cover" />
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
                  <div className="flex min-w-0 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground"><Utensils aria-hidden="true" className="size-4" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{food.name}</p><p className="truncate text-xs text-muted-foreground">{food.description}</p></div></div>
                  <span className="text-sm text-foreground">{food._count?.businesses || 0}</span><span className="text-sm text-foreground">{food._count?.images || 0}</span><span className="text-sm text-muted-foreground">{food.isHeritage ? "Pamanang-kultura" : "Karaniwan"}</span>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(food.id);
                        setFormData({
                          name: food.name,
                          description: food.description,
                          history: "",
                          preparation: "",
                          recipe: "",
                          culturalSignificance: "",
                          isHeritage: food.isHeritage,
                          imageData: "",
                        });
                        setShowForm(true);
                      }}
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
