"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/features/auth/services";
import type { Property } from "@/shared/types/database";

// ─── Get current user's profile ID ───
async function getProfileId(): Promise<string | null> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", authData.user.id)
    .single();
  return profile?.id ?? null;
}

// ─── Listings list (for host dashboard) ───
export function useListings() {
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const profileId = await getProfileId();
      if (!profileId) {
        setListings([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("host_id", profileId)
        .order("created_at", { ascending: false });
      setListings(data ?? []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { listings, loading, refetch: load };
}

// ─── Single listing by ID ───
export function useListing(id: string) {
  const [listing, setListing] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();
      setListing(data);
    } catch {
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { listing, loading, refetch: load };
}

// ─── Create listing ───
export async function createListing(input: {
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  postal_code?: string;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  max_guests?: number;
  price_per_night_cents: number;
  cleaning_fee_cents?: number;
  service_fee_cents?: number;
  amenities?: string[];
  house_rules?: string;
  cancellation_policy?: string;
  instant_booking?: boolean;
  image_urls?: string[];
  slug: string;
}): Promise<Property> {
  const profileId = await getProfileId();
  if (!profileId) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("properties")
    .insert({
      ...input,
      host_id: profileId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Update listing ───
export async function updateListing(
  id: string,
  input: Partial<Property>
): Promise<Property> {
  const { data, error } = await supabase
    .from("properties")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Delete listing ───
export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw error;
}

// ─── Toggle publish status ───
export async function togglePublish(id: string, isPublished: boolean): Promise<void> {
  const { error } = await supabase
    .from("properties")
    .update({ is_published: isPublished })
    .eq("id", id);
  if (error) throw error;
}

// ─── Search / browse published listings ───
export function useSearchListings(filters?: {
  city?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  max_guests?: number;
}) {
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("properties")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (filters?.city) query = query.ilike("city", `%${filters.city}%`);
      if (filters?.property_type) query = query.eq("property_type", filters.property_type);
      if (filters?.min_price) query = query.gte("price_per_night_cents", filters.min_price);
      if (filters?.max_price) query = query.lte("price_per_night_cents", filters.max_price);
      if (filters?.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
      if (filters?.max_guests) query = query.gte("max_guests", filters.max_guests);

      const { data } = await query;
      setListings(data ?? []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [filters?.city, filters?.property_type, filters?.min_price, filters?.max_price, filters?.bedrooms, filters?.max_guests]);

  useEffect(() => { load(); }, [load]);

  return { listings, loading, refetch: load };
}
