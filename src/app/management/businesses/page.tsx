"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAllBusinessesForManagement } from "@/app/management/services";
import { createBusinessAction, updateBusinessAction, deleteBusinessAction } from "@/app/management/actions";
import { uploadBusinessImages } from "@/app/management/business-image-upload";
import { Button } from "@/lib/components/actions/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/display/card";
import { Input } from "@/lib/components/form/inputs";
import { Label } from "@/lib/components/form/label";
import {
  buildBusinessAddressFromChoices,
  getBusinessMapEmbedUrl,
  getStreetOptionsForBarangay,
  SAN_PEDRO_BARANGAYS,
  SAN_PEDRO_LANDMARK_OPTIONS,
} from "@/lib/business-address";

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  hours: string;
  isPublished: boolean;
  latitude?: number;
  longitude?: number;
  _count?: {
    reviews: number;
    foods: number;
  };
}

type AddressChoiceState = {
  inSanPedro: boolean;
  barangay: string;
  street: string;
  landmark: string;
};

export default function ManageBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [addressChoices, setAddressChoices] = useState<AddressChoiceState>({
    inSanPedro: true,
    barangay: SAN_PEDRO_BARANGAYS[0],
    street: getStreetOptionsForBarangay(SAN_PEDRO_BARANGAYS[0])[0] ?? "",
    landmark: SAN_PEDRO_LANDMARK_OPTIONS[0],
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    hours: "",
    history: "",
    latitude: 14.3595,
    longitude: 121.0473,
  });

  const addressPreview = useMemo(
    () => buildBusinessAddressFromChoices(addressChoices),
    [addressChoices],
  );
  const streetOptions = getStreetOptionsForBarangay(addressChoices.barangay);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const data = await getAllBusinessesForManagement();
      setBusinesses(data as Business[]);
    } catch (error) {
      console.error("Failed to load businesses:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      const coverImageUrls = coverImageFile ? await uploadBusinessImages([coverImageFile]) : [];
      const galleryImageUrls = galleryImageFiles.length > 0 ? await uploadBusinessImages(galleryImageFiles) : [];
      const result = editingId
        ? await updateBusinessAction({
            id: editingId,
            ...formData,
            address: addressPreview.address,
            latitude: addressPreview.coordinates.latitude,
            longitude: addressPreview.coordinates.longitude,
            coverImageUrl: coverImageUrls[0],
            galleryImageUrls,
          })
        : await createBusinessAction({
            ...formData,
            address: addressPreview.address,
            latitude: addressPreview.coordinates.latitude,
            longitude: addressPreview.coordinates.longitude,
            coverImageUrl: coverImageUrls[0],
            galleryImageUrls,
          });
      if (!result.success) throw new Error("Business could not be saved. Check your admin session.");
      resetForm();
      await loadBusinesses();
    } catch (error) {
      console.error("Failed to save business:", error);
      setFormError(error instanceof Error ? error.message : "Failed to save business.");
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this business?")) {
      try {
        const result = await deleteBusinessAction(id);
        if (!result.success) {
          setFormError("Business could not be deleted. Check your administrator session and try again.");
          return;
        }
        await loadBusinesses();
      } catch (error) {
        console.error("Failed to delete business:", error);
        setFormError(error instanceof Error ? error.message : "Business could not be deleted.");
      }
    }
  }

  function resetForm() {
    setAddressChoices({
      inSanPedro: true,
      barangay: SAN_PEDRO_BARANGAYS[0],
      street: getStreetOptionsForBarangay(SAN_PEDRO_BARANGAYS[0])[0] ?? "",
      landmark: SAN_PEDRO_LANDMARK_OPTIONS[0],
    });
    setFormData({
      name: "",
      description: "",
      address: "",
      hours: "",
      history: "",
      latitude: 14.3595,
      longitude: 121.0473,
    });
    setEditingId(null);
    setCoverImageFile(null);
    setGalleryImageFiles([]);
    setFormError(null);
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Businesses</h1>
            <p className="mt-1 text-muted-foreground">Create, edit, and delete business listings</p>
          </div>
          <Button onClick={() => setShowForm(true)}>Add Business</Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Business" : "Add New Business"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Business Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter business name"
                      required
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <Label>Location setup</Label>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Is this in San Pedro?</p>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            checked={addressChoices.inSanPedro}
                            onChange={() => setAddressChoices((current) => ({ ...current, inSanPedro: true }))}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            checked={!addressChoices.inSanPedro}
                            onChange={() => setAddressChoices((current) => ({ ...current, inSanPedro: false }))}
                          />
                          No
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="barangay">Barangay</Label>
                      <select
                        id="barangay"
                        value={addressChoices.barangay}
                        onChange={(e) => {
                          const barangay = e.target.value;
                          setAddressChoices((current) => ({
                            ...current,
                            barangay,
                            street: getStreetOptionsForBarangay(barangay)[0] ?? "",
                          }));
                        }}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                      >
                        {SAN_PEDRO_BARANGAYS.map((barangay) => (
                          <option key={barangay} value={barangay}>{barangay}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="street">Street</Label>
                      <select
                        id="street"
                        value={addressChoices.street}
                        disabled={streetOptions.length === 0}
                        onChange={(e) => setAddressChoices((current) => ({ ...current, street: e.target.value }))}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                      >
                        {streetOptions.map((street) => (
                          <option key={street} value={street}>{street}</option>
                        ))}
                      </select>
                      {streetOptions.length === 0 && <p className="mt-1 text-xs text-muted-foreground">No street options are available for this barangay.</p>}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="landmark">Landmark</Label>
                      <select
                        id="landmark"
                        value={addressChoices.landmark}
                        onChange={(e) => setAddressChoices((current) => ({ ...current, landmark: e.target.value }))}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                      >
                        {SAN_PEDRO_LANDMARK_OPTIONS.map((landmark) => (
                          <option key={landmark} value={landmark}>{landmark}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 rounded-md border border-border bg-background p-3">
                    <Label>Selected address</Label>
                    <Input value={addressPreview.address} readOnly />
                    <p className="text-xs text-muted-foreground">{addressPreview.landmark}</p>
                    <iframe
                      title="business-location-map-preview"
                      src={getBusinessMapEmbedUrl(addressPreview.address)}
                      className="h-56 w-full rounded-md border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter business description"
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="history">History</Label>
                  <textarea
                    id="history"
                    value={formData.history}
                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                    placeholder="Enter business history"
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      placeholder="9am - 5pm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="business-cover-image">Cover image</Label>
                  <Input
                    id="business-cover-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => setCoverImageFile(e.target.files?.[0] ?? null)}
                  />
                </div>

                <div>
                  <Label htmlFor="business-gallery-images">Additional images</Label>
                  <Input
                    id="business-gallery-images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={(e) => {
                      setGalleryImageFiles((currentFiles) => [...currentFiles, ...Array.from(e.target.files ?? [])]);
                      e.currentTarget.value = "";
                    }}
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    {galleryImageFiles.length > 0 ? `${galleryImageFiles.length} additional image${galleryImageFiles.length === 1 ? "" : "s"} selected` : "These images appear below the business details."}
                  </p>
                </div>

                {formError && <p className="text-sm text-destructive">{formError}</p>}

                <div className="flex gap-2">
                  <Button type="submit">{editingId ? "Update" : "Create"} Business</Button>
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
            <p className="text-muted-foreground">Loading businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No businesses yet. Create one to get started!</p>
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
                      <span>Reviews: {business._count?.reviews || 0}</span>
                      <span>Foods: {business._count?.foods || 0}</span>
                      <span>Status: {business.isPublished ? "Published" : "Draft"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/business/${business.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(business.id);
                        const parsedBarangay = business.address.includes("Brgy.")
                          ? business.address.split("Brgy.")[1].split(",")[0].trim()
                          : SAN_PEDRO_BARANGAYS[0];
                        const parsedStreet = business.address.split(",")[0].trim();
                        setAddressChoices({
                          inSanPedro: true,
                          barangay: parsedBarangay,
                          street: parsedStreet,
                          landmark: SAN_PEDRO_LANDMARK_OPTIONS[0],
                        });
                        setFormData({
                          name: business.name,
                          description: business.description,
                          address: business.address,
                          hours: business.hours,
                          history: "",
                          latitude: business.latitude ?? 14.3595,
                          longitude: business.longitude ?? 121.0473,
                        });
                        setCoverImageFile(null);
                        setGalleryImageFiles([]);
                        setFormError(null);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(business.id)}
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
