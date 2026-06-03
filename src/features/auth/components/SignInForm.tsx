"use client";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { signIn, signInWithMagicLink } from "@/features/auth/services";
import type { SignInInput, MagicLinkInput } from "@/features/auth/types";
import { useState } from "react";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const input: SignInInput = { email, password };
      await signIn(input);
      const locale = window.location.pathname.match(/^\/(en|fr|de)(\/|$)/)?.[1] ?? "en";
      window.location.href = `/${locale}/dashboard`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const input: MagicLinkInput = { email };
      await signInWithMagicLink(input);
      setMagicLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  }

  if (magicLinkSent) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <p className="text-mid text-center">Check your email for a magic link to sign in.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6 space-y-4">
        {error && <p className="text-error text-sm text-center">{error}</p>}

        <form onSubmit={handlePasswordSignIn} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-sm text-mid">
          <span>or </span>
          <button
            type="button"
            className="text-primary underline"
            onClick={handleMagicLink}
            disabled={loading || !email}
          >
            Send magic link
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
