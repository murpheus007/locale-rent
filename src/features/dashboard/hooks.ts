"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/features/auth/services";
import type { Profile } from "@/shared/types/database";

// Extended profile type with new role fields
interface ProfileWithRoles extends Profile {
  active_role?: "guest" | "host";
  user_roles?: { role: "guest" | "host" }[];
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileWithRoles | null>(null);
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

      // Fetch profile with active_role
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (!profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Fetch user's roles from user_roles table
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", profileData.id);

      const userRoles = rolesData?.map((r) => ({ role: r.role })) ?? [];

      setProfile({
        ...profileData,
        active_role: profileData.active_role ?? "guest",
        user_roles: userRoles,
      });
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, loading, refetch: load };
}

// Helper to check if user has a specific role
export function useHasRole(role: "guest" | "host"): boolean {
  const { profile } = useProfile();
  return profile?.user_roles?.some((r) => r.role === role) ?? false;
}

// Helper to check if user is in host mode
export function useIsHostMode(): boolean {
  const { profile } = useProfile();
  return profile?.active_role === "host";
}

// Switch active role
export async function switchRole(newRole: "guest" | "host"): Promise<void> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("Not authenticated");

  // Call the database function to switch role
  const { error } = await supabase.rpc("switch_active_role", {
    new_role: newRole,
  });

  if (error) throw new Error(error.message);
}

// Become a host (add host role)
export async function becomeHost(): Promise<void> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("Not authenticated");

  // Call the database function to become a host
  const { error } = await supabase.rpc("become_host");

  if (error) throw new Error(error.message);
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
  const { profile, loading: profileLoading } = useProfile();

  const load = useCallback(async () => {
    if (profileLoading) return;

    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!profileData) {
        setLoading(false);
        return;
      }

      const profileId = profileData.id;
      const isHostMode = profile?.active_role === "host";

      const [listingsRes, bookingsRes, reviewsRes, favoritesRes] =
        await Promise.all([
          isHostMode
            ? supabase
                .from("properties")
                .select("id", { count: "exact", head: true })
                .eq("host_id", profileId)
            : Promise.resolve({ count: 0 }),
          supabase
            .from("bookings")
            .select("id", { count: "exact", head: true })
            .or(`guest_id.eq.${profileId},host_id.eq.${profileId}`)
            .in("status", ["pending", "confirmed"]),
          isHostMode
            ? supabase
                .from("reviews")
                .select("id", { count: "exact", head: true })
                .eq("host_id", profileId)
            : Promise.resolve({ count: 0 }),
          supabase
            .from("favorites")
            .select("id", { count: "exact", head: true })
            .eq("user_id", profileId),
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
  }, [profile, profileLoading]);

  useEffect(() => {
    load();
  }, [load]);

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

      const items: {
        id: string;
        type: "booking" | "review" | "favorite";
        title: string;
        date: string;
      }[] = [];

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
            title: `${
              b.status === "confirmed"
                ? "Booking confirmed"
                : b.status === "pending"
                ? "New booking request"
                : "Booking update"
            } — ${property?.title ?? "Unknown property"}`,
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

  useEffect(() => {
    load();
  }, [load]);

  return { activities, loading, refetch: load };
}
