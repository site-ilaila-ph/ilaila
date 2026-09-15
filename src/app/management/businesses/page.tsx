"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readProblemMessage } from "@/lib/api/client";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Route } from "next";
interface BusinessImage {
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

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  hours: string;
  history: string | null;
  isPublished: boolean;
  images?: BusinessImage[];
  reviews?: unknown[];
  foods?: unknown[];
}

export default function ManageBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    latitude: 0,
    longitude: 0,
    hours: "",
    history: "",
  });
  const [formImages, setFormImages] = useState<BusinessImage[]>([]);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const response = await fetch("/api/businesses");
      if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to load businesses"));
      const data = await response.json();
      setBusinesses(data as Business[]);
    } catch (error) {
      console.error("Failed to load businesses:", error);
      setError(error instanceof Error ? error.message : "Failed to load businesses");
    } finally {
      setIsLoading(false);
    }
  }

  function releaseObjectUrls(images: BusinessImage[]) {
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
      address: "",
      latitude: 0,
      longitude: 0,
      hours: "",
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

  function toggleRemoved(image: BusinessImage) {
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
        url: img.url ?? null,
        description: img.description ?? "",
        file: null,
      }))
    );
    setShowForm(true);
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
        const response = await fetch(`/api/businesses/${editingId}`, {
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
        const response = await fetch(`/api/businesses/${id}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pamahalaan ang mga Negosyo</h1>
            <p className="mt-1 text-muted-foreground">Gumawa, mag-edit, at magtanggal ng mga listahan ng negosyo</p>
          </div>
          <Button onClick={() => setShowForm(true)}>Magdagdag ng Negosyo</Button>
        </div>

        <ErrorAlert message={error} className="mb-6" onDismiss={() => setError(null)} />

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? "Mag-edit ng Negosyo" : "Magdagdag ng Bagong Negosyo"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                              onChange={(e) => updateImageDescription(img.id, e.target.value)}
                              placeholder="Paglalarawan ng larawan (opsyonal)"
                              rows={2}
                              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                            />
                            <div className="flex items-center gap-1">
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
