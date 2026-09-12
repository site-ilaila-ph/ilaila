"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readProblemMessage } from "@/lib/api/client";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Route } from "next";
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
  _count?: {
    reviews: number;
    foods: number;
  };
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
    imageData: "",
  });

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const response = await fetch("/api/management/businesses");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...formData };
      const response = await fetch("/api/management/businesses", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: editingId ? JSON.stringify({ id: editingId, ...payload }) : JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await readProblemMessage(response, "Failed to save business"));
      }
      resetForm();
      await loadBusinesses();
    } catch (error) {
      console.error("Failed to save business:", error);
      setError(error instanceof Error ? error.message : "Failed to save business");
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Sigurado ka bang gusto mong tanggalin ang negosyong ito?")) {
      try {
        const response = await fetch(`/api/management/businesses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!response.ok) throw new Error(await readProblemMessage(response, "Failed to delete business"));
        await loadBusinesses();
      } catch (error) {
        console.error("Failed to delete business:", error);
        setError(error instanceof Error ? error.message : "Failed to delete business");
      }
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      address: "",
      latitude: 0,
      longitude: 0,
      hours: "",
      history: "",
      imageData: "",
    });
    setEditingId(null);
    setShowForm(false);
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
                  <Label htmlFor="business-image">Larawan ng Negosyo</Label>
                  <Input
                    id="business-image"
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
                    <Image src={formData.imageData} alt="Preview ng negosyo" width={240} height={140} unoptimized className="mt-3 h-28 w-48 rounded-lg object-cover" />
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
                      <span>Mga Review: {business._count?.reviews || 0}</span>
                      <span>Mga Pagkain: {business._count?.foods || 0}</span>
                      <span>Katayuan: {business.isPublished ? "Nailathala" : "Hindi pa nailathala"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/management/businesses/${business.id}` as Route}>
                      <Button variant="outline" size="sm">
                        Tingnan
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(business.id);
                        setFormData({
                          name: business.name,
                          description: business.description,
                          address: business.address,
                          latitude: business.latitude,
                          longitude: business.longitude,
                          hours: business.hours,
                          history: business.history ?? "",
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
