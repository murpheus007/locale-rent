"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/features/auth/services";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Checking your sign-in…");

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session) {
          setStatus("Sign-in confirmed. Redirecting…");
          router.replace("/dashboard");
        } else {
          setStatus("No session found. Redirecting to sign in…");
          router.replace("/auth/signin");
        }
      } catch {
        setStatus("Something went wrong. Redirecting to sign in…");
        router.replace("/auth/signin");
      }
    }
    const timer = setTimeout(handleCallback, 500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16 bg-light">
      <div className="w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-dark">{status}</h1>
        <p className="text-mid">Please wait while we confirm your session.</p>
      </div>
    </div>
  );
}
