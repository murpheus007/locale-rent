"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/features/auth/services";
import type { Profile } from "@/shared/types/database";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { profile, loading, refetch: load };
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalListings: 0,
    activeBookings: 0,
    totalReviews: 0,
    totalFavorites: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setLoading(false);
        return;
      }
      const userId = authData.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, is_host")
        .eq("user_id", userId)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      const profileId = profile.id;

      const [listingsRes, bookingsRes, reviewsRes, favoritesRes] = await Promise.all([
        profile.is_host
          ? supabase.from("properties").select("id", { count: "exact", head: true }).eq("host_id", profileId)
          : Promise.resolve({ count: 0 }),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .or(`guest_id.eq.${profileId},host_id.eq.${profileId}`)
          .in("status", ["pending", "confirmed"]),
        profile.is_host
          ? supabase.from("reviews").select("id", { count: "exact", head: true }).eq("host_id", profileId)
          : Promise.resolve({ count: 0 }),
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", profileId),
      ]);

      setStats({
        totalListings: listingsRes.count ?? 0,
        activeBookings: bookingsRes.count ?? 0,
        totalReviews: reviewsRes.count ?? 0,
        totalFavorites: favoritesRes.count ?? 0,
        unreadMessages: 0,
      });
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stats, loading, refetch: load };
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<
    { id: string; type: "booking" | "review" | "favorite"; title: string; date: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", authData.user.id)
        .single();

      if (!profile) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const profileId = profile.id;

      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, status, created_at, property_id")
        .or(`guest_id.eq.${profileId},host_id.eq.${profileId}`)
        .order("created_at", { ascending: false })
        .limit(5);

      const items: { id: string; type: "booking" | "review" | "favorite"; title: string; date: string }[] = [];

      if (bookings) {
        for (const b of bookings) {
          const { data: property } = await supabase
            .from("properties")
            .select("title")
            .eq("id", b.property_id)
            .single();
          items.push({
            id: b.id,
            type: "booking",
            title: `${b.status === "confirmed" ? "Booking confirmed" : b.status === "pending" ? "New booking request" : "Booking update"} — ${property?.title ?? "Unknown property"}`,
            date: b.created_at,
          });
        }
      }

      setActivities(items);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { activities, loading, refetch: load };
}

// ─── Become a host ───
export async function becomeHost(): Promise<void> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("Not authenticated");

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ is_host: true, role: "host" })
    .eq("user_id", authData.user.id);

  if (profileError) throw new Error(profileError.message);

  // Also update user_metadata
  const { error: metaError } = await supabase.auth.updateUser({
    data: { role: "host" },
  });

  if (metaError) throw new Error(metaError.message);
}
