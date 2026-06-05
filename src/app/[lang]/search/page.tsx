"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SlidersHorizontal, MapPin, Bed, Users, DollarSign, X } from "lucide-react";
import { useSearchListings } from "@/features/properties/hooks";
import type { Property } from "@/shared/types/database";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

const PROPERTY_TYPES = [
  { value: "", label: "All types" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "room", label: "Room" },
  { value: "loft", label: "Loft" },
  { value: "cabin", label: "Cabin" },
  { value: "cottage", label: "Cottage" },
];

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function PropertyCard({ property, locale }: { property: Property; locale: string }) {
  return (
    <Card className="border-border overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-light">
        {property.image_urls && property.image_urls.length > 0 ? (
          <img
            src={property.image_urls[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-10 h-10 text-mid/30" />
          </div>
        )}
        {property.instant_booking && (
          <span className="absolute top-3 left-3 text-xs bg-primary text-white px-2 py-0.5 rounded">
            Instant Book
          </span>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-dark text-sm truncate">{property.title}</h3>
          {property.rating != null && (
            <span className="text-xs text-mid flex items-center gap-0.5 flex-shrink-0">
              ★ {property.rating}
            </span>
          )}
        </div>
        <p className="text-xs text-mid">{property.city}, {property.country}</p>
        <div className="flex items-center gap-3 text-xs text-mid">
          {property.bedrooms != null && <span>{property.bedrooms} bed</span>}
          {property.max_guests != null && <span>{property.max_guests} guests</span>}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold text-dark text-sm">
            {formatPrice(property.price_per_night_cents)} <span className="text-mid font-normal">/night</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SearchPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocaleFromPathname(pathname);

  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filters = {
    city: city || undefined,
    property_type: propertyType || undefined,
    min_price: minPrice ? Math.round(parseFloat(minPrice) * 100) : undefined,
    max_price: maxPrice ? Math.round(parseFloat(maxPrice) * 100) : undefined,
    bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
  };

  const { listings, loading } = useSearchListings(filters);

  function clearFilters() {
    setCity("");
    setPropertyType("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
  }

  const hasFilters = city || propertyType || minPrice || maxPrice || bedrooms;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Search header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-dark">Find your perfect stay</h1>

        {/* Search bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mid" />
            <Input
              placeholder="Where do you want to go?"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button
            variant="outline"
            className="h-11 gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-mid">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-mid">Min Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mid" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="pl-8 h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-mid">Max Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mid" />
                    <Input
                      type="number"
                      placeholder="Any"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="pl-8 h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-mid">Bedrooms</label>
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mid" />
                    <Input
                      type="number"
                      placeholder="Any"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="pl-8 h-9"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="sm" onClick={clearFilters} className="h-9 gap-1">
                    <X className="w-3 h-3" /> Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-mid mb-4">
          {loading ? "Searching..." : `${listings.length} properties found`}
        </p>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-border overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-light flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-mid" />
              </div>
              <h3 className="text-lg font-semibold text-dark mb-2">No properties found</h3>
              <p className="text-mid text-sm mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((property) => (
              <PropertyCard key={property.id} property={property} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
