"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Star,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Coffee,
  Wind,
  Tv,
  Shirt,
  PawPrint,
  Briefcase,
  DoorOpen,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
} from "lucide-react";
import { useListing } from "@/features/properties/hooks";
import { useState } from "react";

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  "WiFi": Wifi,
  "Parking": Car,
  "Pool": Waves,
  "Gym": Dumbbell,
  "Coffee Maker": Coffee,
  "Air Conditioning": Wind,
  "TV": Tv,
  "Washer": Shirt,
  "Pet Friendly": PawPrint,
  "Workspace": Briefcase,
  "Self Check-in": DoorOpen,
};

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { listing, loading } = useListing(slug);
  const [currentImage, setCurrentImage] = useState(0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center py-20">
        <h1 className="text-2xl font-bold text-dark mb-2">Property not found</h1>
        <p className="text-mid">This listing may have been removed or is no longer available.</p>
      </div>
    );
  }

  const images = listing.image_urls ?? [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Title & location */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-dark">{listing.title}</h1>
        <p className="text-mid flex items-center gap-1 mt-1">
          <MapPin className="w-4 h-4" />
          {listing.address}, {listing.city}, {listing.country}
        </p>
      </div>

      {/* Image gallery */}
      {images.length > 0 && (
        <div className="relative rounded-xl overflow-hidden bg-light">
          <div className="aspect-[16/9] relative">
            <img
              src={images[currentImage]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-dark" />
                </button>
                <button
                  onClick={() => setCurrentImage((p) => (p === images.length - 1 ? 0 : p + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-dark" />
                </button>
                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {currentImage + 1} / {images.length}
                </span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === currentImage ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-mid">
              <Bed className="w-4 h-4" /> {listing.bedrooms ?? "—"} bedrooms
            </span>
            <span className="flex items-center gap-1.5 text-mid">
              <Bath className="w-4 h-4" /> {listing.bathrooms ?? "—"} bathrooms
            </span>
            <span className="flex items-center gap-1.5 text-mid">
              <Users className="w-4 h-4" /> Up to {listing.max_guests ?? "—"} guests
            </span>
            {listing.rating != null && (
              <span className="flex items-center gap-1.5 text-mid">
                <Star className="w-4 h-4 fill-accent text-accent" /> {listing.rating} ({listing.review_count} reviews)
              </span>
            )}
            {listing.instant_booking && (
              <Badge variant="outline" className="text-primary border-primary/30">Instant Book</Badge>
            )}
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="font-semibold text-dark mb-2">About this property</h2>
              <p className="text-mid whitespace-pre-line leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div>
              <h2 className="font-semibold text-dark mb-3">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.amenities.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity] ?? Wifi;
                  return (
                    <div key={amenity} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border">
                      <Icon className="w-4 h-4 text-mid" />
                      <span className="text-sm text-dark">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* House rules */}
          {listing.house_rules && (
            <div>
              <h2 className="font-semibold text-dark mb-2">House Rules</h2>
              <p className="text-mid whitespace-pre-line">{listing.house_rules}</p>
            </div>
          )}

          {/* Cancellation */}
          {listing.cancellation_policy && (
            <div>
              <h2 className="font-semibold text-dark mb-2">Cancellation Policy</h2>
              <p className="text-mid whitespace-pre-line">{listing.cancellation_policy}</p>
            </div>
          )}
        </div>

        {/* Booking sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-border sticky top-24">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-dark">{formatPrice(listing.price_per_night_cents)}</span>
                <span className="text-mid">/ night</span>
              </div>

              {listing.cleaning_fee_cents != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-mid">Cleaning fee</span>
                  <span className="text-dark">{formatPrice(listing.cleaning_fee_cents)}</span>
                </div>
              )}
              {listing.service_fee_cents != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-mid">Service fee</span>
                  <span className="text-dark">{formatPrice(listing.service_fee_cents)}</span>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <Button className="w-full h-11">Book Now</Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-10 gap-2">
                    <Heart className="w-4 h-4" /> Save
                  </Button>
                  <Button variant="outline" className="flex-1 h-10 gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>
              </div>

              <p className="text-xs text-mid text-center">You won't be charged yet</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
