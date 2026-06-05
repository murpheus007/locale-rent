"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { supabase } from "@/features/auth/services";
import { useProfile } from "@/features/dashboard/hooks";
import type { Booking, Property } from "@/shared/types/database";
import {
  Calendar,
  MapPin,
  Home,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  disputed: { label: "Disputed", icon: AlertCircle, color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
};

type Tab = "upcoming" | "past" | "cancelled";

export default function BookingsPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { profile } = useProfile();

  const [tab, setTab] = useState<Tab>("upcoming");
  const [bookings, setBookings] = useState<(Booking & { property: Property | null })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const now = new Date().toISOString();
      let query = supabase
        .from("bookings")
        .select("*, property:properties(*)")
        .or(`guest_id.eq.${profile.id},host_id.eq.${profile.id}`)
        .order("check_in_date", { ascending: tab === "past" || tab === "cancelled" });

      if (tab === "upcoming") {
        query = query.gte("check_in_date", now).in("status", ["pending", "confirmed"]);
      } else if (tab === "past") {
        query = query.lt("check_out_date", now).eq("status", "completed");
      } else {
        query = query.eq("status", "cancelled");
      }

      const { data } = await query;
      setBookings(data ?? []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [profile, tab]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Bookings</h1>
        <p className="text-mid text-sm mt-1">Manage your bookings and reservations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-light rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-dark shadow-sm"
                : "text-mid hover:text-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-5 flex gap-4">
                <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-light flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-mid" />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-2">No {tab} bookings</h3>
            <p className="text-mid text-sm mb-6">
              {tab === "upcoming"
                ? "You don't have any upcoming bookings yet."
                : tab === "past"
                ? "You haven't completed any bookings yet."
                : "You don't have any cancelled bookings."}
            </p>
            <Link href={`/${locale}/search`}>
              <Button className="gap-2">
                Browse properties
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusConfig = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;
            return (
              <Card key={booking.id} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Property image */}
                    <div className="w-full sm:w-32 h-32 sm:h-auto shrink-0 bg-light">
                      {booking.property?.image_urls?.[0] ? (
                        <img
                          src={booking.property.image_urls[0]}
                          alt={booking.property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-mid/30" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-dark">
                              {booking.property?.title ?? "Unknown property"}
                            </h3>
                            {booking.property && (
                              <p className="text-sm text-mid flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {booking.property.city}, {booking.property.country}
                              </p>
                            )}
                          </div>
                          <Badge className={`${statusConfig.color} border-0 shrink-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-mid">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(booking.check_in_date)} — {formatDate(booking.check_out_date)}
                          </span>
                          <span>{booking.nights} night{booking.nights !== 1 ? "s" : ""}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <span className="font-semibold text-dark">
                          {formatPrice(booking.total_price_cents)}
                          <span className="text-mid font-normal text-sm ml-1">total</span>
                        </span>
                        <Link href={`/${locale}/dashboard/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1 text-primary">
                            View details
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
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
