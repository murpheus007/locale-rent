"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { supabase } from "@/features/auth/services";
import { useProfile } from "@/features/dashboard/hooks";
import type { Review, Property, Profile } from "@/shared/types/database";
import { Star, ChevronRight, Home } from "lucide-react";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ReviewWithDetails extends Review {
  property: Property | null;
  guest: Profile | null;
}

export default function ReviewsPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { profile } = useProfile();

  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // Get reviews where user is the host (received) or guest (written)
      const { data } = await supabase
        .from("reviews")
        .select("*, property:properties(*)")
        .or(`host_id.eq.${profile.id},guest_id.eq.${profile.id}`)
        .order("created_at", { ascending: false });

      if (!data) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // Enrich with guest profile
      const enriched: ReviewWithDetails[] = [];
      for (const review of data) {
        const { data: guestProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", review.guest_id)
          .single();

        enriched.push({
          ...review,
          property: review.property ?? null,
          guest: guestProfile,
        });
      }

      setReviews(enriched);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const isHost = profile?.is_host ?? false;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Reviews</h1>
        <p className="text-mid text-sm mt-1">
          {isHost ? "Reviews from your guests" : "Reviews you've written"}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-light flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-mid" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-2">No reviews yet</h3>
            <p className="text-mid text-sm">
              {isHost
                ? "Reviews from guests will appear here after their stay."
                : "Reviews you write after your stays will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-border">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {review.guest?.avatar_url ? (
                        <AvatarImage src={review.guest.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {review.guest?.full_name?.[0] ?? "?"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-dark">
                        {review.guest?.full_name ?? "Anonymous"}
                      </p>
                      <p className="text-xs text-mid">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {review.property && (
                  <Link
                    href={`/${locale}/property/${review.property.slug ?? review.property.id}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Home className="w-3.5 h-3.5" />
                    {review.property.title}
                  </Link>
                )}

                {review.comment && (
                  <p className="text-sm text-dark leading-relaxed">{review.comment}</p>
                )}

                {review.response_text && (
                  <div className="bg-light rounded-lg p-3 mt-2">
                    <p className="text-xs font-medium text-mid mb-1">Your response:</p>
                    <p className="text-sm text-dark">{review.response_text}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
