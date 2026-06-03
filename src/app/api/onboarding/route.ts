import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      role,
      isHost,
      preferredLanguage,
      bio,
      phone,
      city,
      country,
      avatarUrl,
    } = body;

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Server component context
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch {
              // Server component context
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        role: role === "host" ? "host" : "user",
        is_host: isHost === true,
        preferred_language: preferredLanguage || "en",
        bio: bio?.trim() || null,
        phone: phone?.trim() || null,
        city: city?.trim() || null,
        country: country?.trim() || null,
        avatar_url: avatarUrl || null,
      })
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Also update user_metadata so middleware check works consistently
    const { error: metaError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        role: role === "host" ? "host" : "user",
        preferred_language: preferredLanguage || "en",
      },
    });

    if (metaError) {
      // Don't fail the whole request if metadata update fails
      console.error("Failed to update user metadata:", metaError.message);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
