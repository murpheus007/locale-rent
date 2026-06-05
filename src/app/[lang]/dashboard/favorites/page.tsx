"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { supabase } from "@/features/auth/services";
import { useProfile } from "@/features/dashboard/hooks";
import type { Property, Favorite } from "@/shared/types/database";
import { Heart, MapPin, Home, Trash2, ChevronRight, Bed, Bath, Users } from "lucide-react";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

interface FavoriteWithProperty extends Favorite {
  property: Property | null;
}

export default function FavoritesPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { profile } = useProfile();

  const [favorites, setFavorites] = useState<FavoriteWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("favorites")
        .select("*, property:properties(*)")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      setFavorites(data ?? []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  async function handleRemove(propertyId: string) {
    if (!profile) return;
    setRemoving(propertyId);
    try {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", profile.id)
        .eq("property_id", propertyId);
      setFavorites((prev) => prev.filter((f) => f.property_id !== propertyId));
    } catch {
      // silently fail
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Favorites</h1>
        <p className="text-mid text-sm mt-1">Properties you've saved for later</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-light flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-mid" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-2">No favorites yet</h3>
            <p className="text-mid text-sm mb-6">
              Browse properties and tap the heart icon to save your favorites.
            </p>
            <Link href={`/${locale}/search`}>
              <Button className="gap-2">
                Explore properties
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {favorites.map((fav) => {
            const property = fav.property;
            if (!property) return null;

            return (
              <Card key={fav.id} className="border-border overflow-hidden group">
                <div className="relative h-40 bg-light">
                  {property.image_urls?.[0] ? (
                    <img
                      src={property.image_urls[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-10 h-10 text-mid/30" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(property.id)}
                    disabled={removing === property.id}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-error hover:bg-white shadow-sm transition-colors"
                    aria-label="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <CardContent className="p-4 space-y-2">
                  <Link href={`/${locale}/property/${property.slug ?? property.id}`}>
                    <h3 className="font-semibold text-dark hover:text-primary transition-colors truncate">
                      {property.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-mid flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {property.city}, {property.country}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-mid">
                    {property.bedrooms != null && (
                      <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms}</span>
                    )}
                    {property.bathrooms != null && (
                      <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms}</span>
                    )}
                    {property.max_guests != null && (
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{property.max_guests}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-semibold text-dark">
                      {formatPrice(property.price_per_night_cents)}
                      <span className="text-mid font-normal text-xs">/night</span>
                    </span>
                    <Link href={`/${locale}/property/${property.slug ?? property.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1 text-primary h-8">
                        View
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
