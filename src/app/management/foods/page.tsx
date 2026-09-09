"use client";

import { useEffect, useState } from "react";
import { getAllBusinessesForManagement, getAllFoodsForManagement } from "@/app/management/services";
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
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    history: "",
    preparation: "",
    recipe: "",
    culturalSignificance: "",
    isHeritage: true,
    businessId: "",
  });

  useEffect(() => {
    loadFoods();
  }, []);

  async function loadFoods() {
    try {
      const [foodData, businessData] = await Promise.all([
        getAllFoodsForManagement(),
        getAllBusinessesForManagement(),
      ]);
      setFoods(foodData as Food[]);
      setBusinesses(businessData.map((business) => ({ id: business.id, name: business.name })));
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
        const result = await updateFoodAction({ id: editingId, ...formData });
        if (!result.success) throw new Error("Food could not be updated. Check your admin session.");
      } else {
        const result = await createFoodAction(formData);
        if (!result.success) throw new Error("Food could not be created. Check your admin session.");
      }
      resetForm();
      await loadFoods();
    } catch (error) {
      console.error("Failed to save food:", error);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this food item?")) {
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
      businessId: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Foods</h1>
            <p className="mt-1 text-muted-foreground">Create and manage heritage food items</p>
          </div>
          <Button onClick={() => setShowForm(true)}>Add Food</Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Food" : "Add New Food"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Food Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter food name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="isHeritage">Heritage Food</Label>
                    <label className="flex items-center gap-2">
                      <input
                        id="isHeritage"
                        type="checkbox"
                        checked={formData.isHeritage}
                        onChange={(e) => setFormData({ ...formData, isHeritage: e.target.checked })}
                      />
                      <span>Mark as heritage food</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter food description"
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                    rows={2}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="businessId">Business</Label>
                  <select
                    id="businessId"
                    value={formData.businessId}
                    onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  >
                    <option value="">Not associated with a business</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>{business.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="history">History</Label>
                  <textarea
                    id="history"
                    value={formData.history}
                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                    placeholder="Enter food history and origins"
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="preparation">Preparation</Label>
                  <textarea
                    id="preparation"
                    value={formData.preparation}
                    onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
                    placeholder="Enter preparation process"
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="recipe">Recipe</Label>
                  <textarea
                    id="recipe"
                    value={formData.recipe}
                    onChange={(e) => setFormData({ ...formData, recipe: e.target.value })}
                    placeholder="Enter full recipe"
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="culturalSignificance">Cultural Significance</Label>
                  <textarea
                    id="culturalSignificance"
                    value={formData.culturalSignificance}
                    onChange={(e) => setFormData({ ...formData, culturalSignificance: e.target.value })}
                    placeholder="Explain the cultural significance"
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingId ? "Update" : "Create"} Food</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading foods...</p>
          </div>
        ) : foods.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No foods yet. Add one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {foods.map((food) => (
              <Card key={food.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{food.name}</h3>
                    <p className="text-sm text-muted-foreground">{food.description.substring(0, 100)}...</p>
                    <div className="mt-2 flex gap-4 text-xs">
                      <span>Associated Businesses: {food._count?.businesses || 0}</span>
                      <span>Images: {food._count?.images || 0}</span>
                      <span>Type: {food.isHeritage ? "Heritage" : "Regular"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
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
                          businessId: "",
                        });
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(food.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
