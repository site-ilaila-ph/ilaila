"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Search, Trash2 } from "lucide-react";
import { getAllFoodsForManagement } from "@/app/management/services";
import {
  createFoodAction,
  updateFoodAction,
  deleteFoodAction,
} from "@/app/management/actions";
import { Button } from "@/lib/components/actions/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/display/card";
import { Input } from "@/lib/components/form/inputs";
import { Label } from "@/lib/components/form/label";

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
      const data = await getAllFoodsForManagement();
      setFoods(data as Food[]);
    } catch (error) {
      console.error("Failed to load foods:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateFoodAction({ id: editingId, ...formData });
      } else {
        await createFoodAction(formData);
      }
      resetForm();
      await loadFoods();
    } catch (error) {
      console.error("Failed to save food:", error);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Sigurado ka bang gusto mong tanggalin ang pagkaing ito?")) {
      try {
        await deleteFoodAction(id);
        await loadFoods();
      } catch (error) {
        console.error("Failed to delete food:", error);
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
            <p className="mb-2 text-xs font-medium text-slate-400">Mga Pahina / Mga Pagkain</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mga Pagkain</h1>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm text-slate-400 shadow-sm sm:w-64 sm:flex-none"><Search size={16} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Maghanap" className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400" /></div>
            <Button onClick={() => setShowForm(true)}>Magdagdag</Button>
            <button type="button" aria-label="Higit pang mga opsyon" className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-slate-500 shadow-sm"><MoreHorizontal size={19} /></button>
          </div>
        </div>

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
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(65,93,145,0.08)]">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_110px] gap-4 border-b border-slate-100 px-5 py-4 text-xs font-semibold text-slate-400"><span>Pagkain</span><span>Negosyo</span><span>Larawan</span><span>Uri</span><span /></div>
            {visibleFoods.map((food) => (
              <div key={food.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_110px] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-slate-50/70">
                  <div className="flex min-w-0 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-600">🍲</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-700">{food.name}</p><p className="truncate text-xs text-slate-400">{food.description}</p></div></div>
                  <span className="text-sm text-slate-600">{food._count?.businesses || 0}</span><span className="text-sm text-slate-600">{food._count?.images || 0}</span><span className="text-sm text-slate-500">{food.isHeritage ? "Pamanang-kultura" : "Karaniwan"}</span>
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
