"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "@/features/auth";

type RoleOption = "guest" | "host";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<RoleOption>("guest");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          role: role === "host" ? "host" : "user",
          isHost: role === "host",
          preferredLanguage,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save profile");
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16 bg-light">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark">Welcome to LocaleRent</h1>
          <p className="text-mid mt-2">
            Tell us a bit about yourself to get started.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <p className="text-error text-sm text-center bg-error-light px-4 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-sm font-medium text-dark">
                  Full name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">I want to</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("guest")}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      role === "guest"
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border text-mid hover:border-primary/50"
                    }`}
                  >
                    Book stays
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("host")}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      role === "host"
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border text-mid hover:border-primary/50"
                    }`}
                  >
                    List my property
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="language" className="text-sm font-medium text-dark">
                  Preferred language
                </label>
                <select
                  id="language"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving…" : "Complete setup"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-mid text-center">
          You can update these settings anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}
