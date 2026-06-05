"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ImagePlus, X, Loader2, ArrowLeft } from "lucide-react";
import { createListing, updateListing } from "@/features/properties/hooks";
import type { Property } from "@/shared/types/database";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "room", label: "Room" },
  { value: "loft", label: "Loft" },
  { value: "cabin", label: "Cabin" },
  { value: "cottage", label: "Cottage" },
  { value: "other", label: "Other" },
];

const AMENITIES_OPTIONS = [
  "WiFi", "Kitchen", "Air Conditioning", "Heating", "Washer", "Dryer",
  "TV", "Parking", "Pool", "Gym", "Hot Tub", "Balcony", "Garden",
  "Pet Friendly", "Smoke Detector", "Fire Extinguisher", "First Aid Kit",
  "Workspace", "Dishwasher", "Microwave", "Coffee Maker", "Hair Dryer",
  "Iron", "Self Check-in", "Luggage Drop-off",
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

interface Props {
  mode: "create" | "edit";
  listing?: Property | null;
}

export default function ListingForm({ mode, listing }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(listing?.image_urls ?? []);
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [title, setTitle] = useState(listing?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [address, setAddress] = useState(listing?.address ?? "");
  const [city, setCity] = useState(listing?.city ?? "");
  const [country, setCountry] = useState(listing?.country ?? "");
  const [postalCode, setPostalCode] = useState(listing?.postal_code ?? "");
  const [propertyType, setPropertyType] = useState<string>(listing?.property_type ?? "apartment");
  const [bedrooms, setBedrooms] = useState(listing?.bedrooms?.toString() ?? "");
  const [bathrooms, setBathrooms] = useState(listing?.bathrooms?.toString() ?? "");
  const [maxGuests, setMaxGuests] = useState(listing?.max_guests?.toString() ?? "");
  const [pricePerNight, setPricePerNight] = useState(
    listing?.price_per_night_cents ? (listing.price_per_night_cents / 100).toString() : ""
  );
  const [cleaningFee, setCleaningFee] = useState(
    listing?.cleaning_fee_cents ? (listing.cleaning_fee_cents / 100).toString() : ""
  );
  const [serviceFee, setServiceFee] = useState(
    listing?.service_fee_cents ? (listing.service_fee_cents / 100).toString() : ""
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(listing?.amenities ?? []);
  const [houseRules, setHouseRules] = useState(listing?.house_rules ?? "");
  const [cancellationPolicy, setCancellationPolicy] = useState(listing?.cancellation_policy ?? "");
  const [instantBooking, setInstantBooking] = useState(listing?.instant_booking ?? false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/property-images", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        newUrls.push(data.url);
      }
      setImageUrls((prev) => [...prev, ...newUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload images");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleAmenity(amenity: string) {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) return setError("Title is required");
    if (!address.trim()) return setError("Address is required");
    if (!city.trim()) return setError("City is required");
    if (!country.trim()) return setError("Country is required");
    if (!pricePerNight || parseFloat(pricePerNight) <= 0) return setError("Price per night is required");

    setLoading(true);

    try {
      const slug = listing?.slug || generateSlug(title);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        slug,
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
        postal_code: postalCode.trim() || undefined,
        property_type: propertyType as Property["property_type"],
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseFloat(bathrooms) : undefined,
        max_guests: maxGuests ? parseInt(maxGuests) : undefined,
        price_per_night_cents: Math.round(parseFloat(pricePerNight) * 100),
        cleaning_fee_cents: cleaningFee ? Math.round(parseFloat(cleaningFee) * 100) : undefined,
        service_fee_cents: serviceFee ? Math.round(parseFloat(serviceFee) * 100) : undefined,
        amenities: selectedAmenities,
        house_rules: houseRules.trim() || undefined,
        cancellation_policy: cancellationPolicy.trim() || undefined,
        instant_booking: instantBooking,
        image_urls: imageUrls,
      };

      if (mode === "create") {
        const newListing = await createListing(payload);
        router.replace(`/${locale}/dashboard/listings/${newListing.id}`);
      } else if (listing) {
        await updateListing(listing.id, payload);
        router.replace(`/${locale}/dashboard/listings`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-dark">
            {mode === "create" ? "Create New Listing" : "Edit Listing"}
          </h1>
          <p className="text-mid text-sm mt-0.5">
            {mode === "create"
              ? "Fill in the details to list your property."
              : "Update your property details."}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-error text-sm bg-error-light px-4 py-3 rounded-lg">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-dark">Photos</h2>
            <p className="text-sm text-mid">Add up to 10 photos. First photo will be the cover image.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-light group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-2 left-2 text-xs bg-primary text-white px-2 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {imageUrls.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-mid hover:text-primary transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <ImagePlus className="w-6 h-6" />
                  )}
                  <span className="text-xs">{uploading ? "Uploading..." : "Add photo"}</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-dark">Basic Information</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark">Title *</label>
              <Input
                placeholder="e.g. Cozy Downtown Apartment with City View"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark">Description</label>
              <Textarea
                placeholder="Describe your property, what makes it special, nearby attractions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={2000}
              />
              <p className="text-xs text-mid text-right">{description.length}/2000</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">Property Type *</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-dark">Location</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark">Address *</label>
              <Input
                placeholder="Street address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">City *</label>
                <Input placeholder="e.g. Lagos" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">Country *</label>
                <Input placeholder="e.g. Nigeria" value={country} onChange={(e) => setCountry(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">Postal Code</label>
                <Input placeholder="Optional" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-dark">Property Details</h2>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">Bedrooms</label>
                <Input type="number" min="0" placeholder="e.g. 2" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">Bathrooms</label>
                <Input type="number" min="0" step="0.5" placeholder="e.g. 1.5" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">Max Guests</label>
                <Input type="number" min="1" placeholder="e.g. 4" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-dark">Pricing</h2>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">Price per night (USD) *</label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="e.g. 75.00"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">Cleaning fee (USD)</label>
                <Input type="number" min="0" step="0.01" placeholder="Optional" value={cleaningFee} onChange={(e) => setCleaningFee(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">Service fee (USD)</label>
                <Input type="number" min="0" step="0.01" placeholder="Optional" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-dark">Amenities</h2>
            <p className="text-sm text-mid">Select all that apply to your property.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {AMENITIES_OPTIONS.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <span className="text-sm text-dark">{amenity}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rules & Policies */}
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-dark">Rules & Policies</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark">House Rules</label>
              <Textarea
                placeholder="e.g. No smoking, No parties, Quiet hours after 10pm..."
                value={houseRules}
                onChange={(e) => setHouseRules(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark">Cancellation Policy</label>
              <Textarea
                placeholder="e.g. Free cancellation up to 48 hours before check-in..."
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                rows={3}
              />
            </div>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-colors">
              <Checkbox checked={instantBooking} onCheckedChange={(v) => setInstantBooking(!!v)} />
              <div>
                <span className="text-sm font-medium text-dark">Instant Booking</span>
                <p className="text-xs text-mid">Allow guests to book without waiting for your approval.</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" className="h-11 px-8" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : (
              mode === "create" ? "Create Listing" : "Save Changes"
            )}
          </Button>
          <Button type="button" variant="outline" className="h-11" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
