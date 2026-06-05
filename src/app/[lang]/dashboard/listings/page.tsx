"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Plus,
  Home,
  MapPin,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Bed,
  Bath,
  Users,
  DollarSign,
} from "lucide-react";
import { useListings, togglePublish, deleteListing } from "@/features/properties/hooks";
import type { Property } from "@/shared/types/database";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function ListingCard({ listing, locale, onRefresh }: { listing: Property; locale: string; onRefresh: () => void }) {
  const [actionLoading, setActionLoading] = useState(false);

  async function handleTogglePublish() {
    setActionLoading(true);
    try {
      await togglePublish(listing.id, !listing.is_published);
      onRefresh();
    } catch {
      // silently fail
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;
    setActionLoading(true);
    try {
      await deleteListing(listing.id);
      onRefresh();
    } catch {
      // silently fail
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Card className="border-border overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 bg-light">
        {listing.image_urls && listing.image_urls.length > 0 ? (
          <img
            src={listing.image_urls[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-12 h-12 text-mid/30" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={listing.is_published ? "default" : "secondary"} className={listing.is_published ? "bg-success text-white" : ""}>
            {listing.is_published ? "Published" : "Draft"}
          </Badge>
          {listing.verification_status !== "verified" && (
            <Badge variant="outline" className="bg-white/90">
              {listing.verification_status === "pending" ? "Pending review" : "Rejected"}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-dark truncate">{listing.title}</h3>
          <p className="text-sm text-mid flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {listing.city}, {listing.country}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-mid">
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{listing.bedrooms}</span>
          )}
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{listing.bathrooms}</span>
          )}
          {listing.max_guests != null && (
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{listing.max_guests}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="font-semibold text-dark flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {formatPrice(listing.price_per_night_cents)}
            <span className="text-mid font-normal text-sm">/night</span>
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleTogglePublish} disabled={actionLoading}>
              {listing.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Link href={`/${locale}/dashboard/listings/${listing.id}`}>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={actionLoading} className="text-error hover:text-error">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ListingsPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { listings, loading, refetch } = useListings();

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">My Listings</h1>
          <p className="text-mid text-sm mt-1">
            {listings.length} {listings.length === 1 ? "property" : "properties"} listed
          </p>
        </div>
        <Link href={`/${locale}/dashboard/listings/new`}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {/* Listings grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-light flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-mid" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-2">No listings yet</h3>
            <p className="text-mid text-sm mb-6 max-w-sm mx-auto">
              Create your first property listing to start hosting guests and earning income.
            </p>
            <Link href={`/${locale}/dashboard/listings/new`}>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create your first listing
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} locale={locale} onRefresh={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
