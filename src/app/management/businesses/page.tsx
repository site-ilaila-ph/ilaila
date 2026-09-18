"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Route } from "next";
import { Search } from "lucide-react";
import { ManagementHeader } from "@/presentation/management-header";
import { BusinessForm, type BusinessFormData, type BusinessFormImage } from "@/presentation/business-form";
import { Button } from "@/presentation/ui/button";
import { Card, CardContent } from "@/presentation/ui/card";
import { ErrorAlert } from "@/presentation/ui/error-alert";
import { Input } from "@/presentation/ui/input";
import { readProblemMessage } from "@/lib/api/client";

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  hours: string;
  history?: string;
  isPublished: boolean;
  reviews: Array<{ id: string }>;
  foods: Array<{ id: string }>;
  images?: BusinessFormImage[];
}

export default function ManageBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    description: "",
    address: "",
    latitude: 14.3597,
    longitude: 121.0509,
    hours: "9am - 5pm",
    history: "",
  });

  const [formImages, setFormImages] = useState<BusinessFormImage[]>([]);


  const loadBusinesses = useCallback(async function() {
    try {
      const url = searchQuery
        ? `/api/businesses?search=${encodeURIComponent(searchQuery)}`
        : "/api/businesses";
      const response = await fetch(url);
      if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to load businesses"));
      const data = await response.json();
      setBusinesses(data);
    } catch (error) {
      console.error("Failed to load businesses:", error);
      setError(error instanceof Error ? error.message : "Failed to load businesses");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    requestIdleCallback(loadBusinesses);
  }, [loadBusinesses, searchQuery]);

  function resetForm() {
    for (const img of formImages) {
      if (img.isNew && img.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(img.previewUrl);
      }
    }
    setFormData({
      name: "",
      description: "",
      address: "",
      latitude: 14.3597,
      longitude: 121.0509,
      hours: "9am - 5pm",
      history: "",
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

  function toggleRemoved(image: BusinessFormImage) {
    if (image.isNew) {
      if (image.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(image.previewUrl);
      }
      setFormImages((current) => current.filter((img) => img.id !== image.id));
    } else {
      setFormImages((current) =>
        current.map((img) => (img.id === image.id ? { ...img, removed: !img.removed } : img))
      );
    }
  }

  function updateImageDescription(id: string, description: string) {
    setFormImages((current) =>
      current.map((img) => (img.id === id ? { ...img, description } : img))
    );
  }

  function startEditing(business: Business) {
    setEditingId(business.id);
    setFormData({
      name: business.name,
      description: business.description,
      address: business.address,
      latitude: business.latitude,
      longitude: business.longitude,
      hours: business.hours,
      history: business.history ?? "",
    });
    setFormImages(
      (business.images ?? []).map((img) => ({
        id: img.id,
        url: img.url,
        description: img.description,
        isNew: false,
        removed: false,
      }))
    );
    setShowForm(true);
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
          business: { ...formData },
          images: [
            ...activeImages.map((img) =>
              img.isNew
                ? { id: img.id, new: true, description: img.description }
                : { id: img.id, description: img.description }
            ),
            ...removedImages.map((img) => ({ id: img.id, remove: true })),
          ],
        };
        form.append("metadata", JSON.stringify(metadata));
        for (const img of activeImages) {
          if (img.isNew && img.file) form.append(`image:${img.id}`, img.file);
        }
        const response = await fetch(`/api/management/businesses/${editingId}`, {
          method: "PATCH",
          body: form,
        });
        if (!response.ok) {
          throw new Error(await readProblemMessage(response, "Failed to save business"));
        }
      } else {
        const newImages = activeImages.filter((img) => img.isNew && img.file);
        const metadata = {
          business: { ...formData },
          images: newImages.map((img) => ({ description: img.description })),
        };
        form.append("metadata", JSON.stringify(metadata));
        for (const img of newImages) {
          if (img.file) form.append("images", img.file);
        }
        const response = await fetch("/api/businesses", {
          method: "POST",
          body: form,
        });
        if (!response.ok) {
          throw new Error(await readProblemMessage(response, "Failed to save business"));
        }
      }

      resetForm();
      await loadBusinesses();
    } catch (error) {
      console.error("Failed to save business:", error);
      setError(error instanceof Error ? error.message : "Failed to save business");
    }
  }

  async function handleDelete(id: string) {
    if (
      confirm(
        "Sigurado ka bang gusto mong tanggalin ang negosyong ito? Tatanggalin din ang mga larawan nito sa storage."
      )
    ) {
      try {
        const response = await fetch(`/api/management/businesses/${id}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to delete business"));
        await loadBusinesses();
      } catch (error) {
        console.error("Failed to delete business:", error);
        setError(error instanceof Error ? error.message : "Failed to delete business");
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <ManagementHeader
          title="Pamahalaan ang mga Negosyo"
          subtitle="Gumawa, mag-edit, at magtanggal ng mga listahan ng negosyo"
        >
          <Button onClick={() => setShowForm(true)}>Magdagdag ng Negosyo</Button>
        </ManagementHeader>

        <ErrorAlert message={error} className="mb-6" onDismiss={() => setError(null)} />

        <div className="mb-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Maghanap ng negosyo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {showForm && (
          <BusinessForm
            editingId={editingId}
            formData={formData}
            setFormData={setFormData}
            formImages={formImages}
            onAddImageFiles={addImageFiles}
            onToggleRemoved={toggleRemoved}
            onUpdateImageDescription={updateImageDescription}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Ikinakarga ang mga negosyo...</p>
          </div>
        ) : businesses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Wala pang negosyo. Gumawa ng isa upang magsimula!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {businesses.map((business) => (
              <Card key={business.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{business.name}</h3>
                    <p className="text-sm text-muted-foreground">{business.address}</p>
                    <div className="mt-2 flex gap-4 text-xs">
                      <span>Mga Review: {business.reviews?.length || 0}</span>
                      <span>Mga Pagkain: {business.foods?.length || 0}</span>
                      <span>Mga Larawan: {business.images?.length || 0}</span>
                      <span>Katayuan: {business.isPublished ? "Nailathala" : "Hindi pa nailathala"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/businesses/${business.id}` as Route}>
                      <Button variant="outline" size="sm">
                        Tingnan
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(business)}
                    >
                      Mag-edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(business.id)}
                    >
                      Tanggalin
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
