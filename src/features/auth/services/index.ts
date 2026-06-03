import { createBrowserClient } from "@supabase/ssr";
import type { SignUpInput, SignInInput, MagicLinkInput } from "@/features/auth/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

function getRedirectUrl(): string {
  // Use env var if set (for production), otherwise fall back to window.origin (for dev)
  return process.env.NEXT_PUBLIC_APP_URL
    || process.env.NEXT_PUBLIC_SITE_URL
    || (typeof window !== "undefined" ? window.location.origin : "https://locale-rent.vercel.app");
}

export async function signUp(input: SignUpInput) {
  const { email, password, fullName, preferredLanguage } = input;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName ?? "",
        preferred_language: preferredLanguage ?? "en",
      },
      emailRedirectTo: `${getRedirectUrl()}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(input: SignInInput) {
  const { email, password } = input;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithMagicLink(input: MagicLinkInput) {
  const { error } = await supabase.auth.signInWithOtp({
    email: input.email,
    options: {
      emailRedirectTo: `${getRedirectUrl()}/auth/callback`,
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
