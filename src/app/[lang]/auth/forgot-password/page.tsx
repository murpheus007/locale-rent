"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { createClient } from "@/shared/lib/supabase/client";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

export default function ForgotPasswordPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://locale-rent.vercel.app";
      const { error: otpError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectUrl}/auth/reset-password`,
      });
      if (otpError) throw otpError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-16 bg-light">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-dark">Check your email</h1>
          <p className="text-mid">
            We've sent a password reset link to <strong>{email}</strong>. Check your inbox and click the link to reset your password.
          </p>
          <Link href={`/${locale}/auth/signin`} className="text-primary underline inline-block mt-4">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16 bg-light">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark">Reset your password</h1>
          <p className="text-mid mt-2">Enter your email and we'll send you a reset link.</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            {error && <p className="text-error text-sm text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
            <div className="text-center text-sm">
              <Link href={`/${locale}/auth/signin`} className="text-mid hover:text-primary transition-colors">
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
