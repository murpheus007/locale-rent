"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Shield, ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/features/auth/services";
import { becomeHost } from "@/features/dashboard/hooks";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils/cn";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

export default function OnboardingPage() {
  const router = useRouter();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const locale = getLocaleFromPathname(pathname);

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<"guest" | "host" | "both">("guest");
  const [loading, setLoading] = useState(false);
  
  // Profile form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");

  async function handleRoleSelect() {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.push(`/${locale}/auth/signin`);
        return;
      }

      // If user selected "host" or "both", become a host
      if (selectedRole === "host" || selectedRole === "both") {
        await becomeHost();
      }

      // Move to profile setup
      setStep(2);
    } catch (error) {
      console.error("Role selection failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSubmit() {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.push(`/${locale}/auth/signin`);
        return;
      }

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", authData.user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          city,
          country,
          bio,
          is_complete: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      // Move to completion step
      setStep(3);
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleFinish() {
    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                  s < step
                    ? "bg-primary text-primary-foreground"
                    : s === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-200 text-gray-400"
                )}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to LocaleRent! 🎉</CardTitle>
              <CardDescription>
                Let's get started. What would you like to do?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <button
                  onClick={() => setSelectedRole("guest")}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border-2 transition-all",
                    selectedRole === "guest"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-dark">I want to book places</h3>
                    <p className="text-sm text-mid mt-1">
                      Browse and book unique stays around the world
                    </p>
                  </div>
                  {selectedRole === "guest" && (
                    <Check className="w-5 h-5 text-primary mt-1" />
                  )}
                </button>

                <button
                  onClick={() => setSelectedRole("host")}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border-2 transition-all",
                    selectedRole === "host"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-dark">I want to host guests</h3>
                    <p className="text-sm text-mid mt-1">
                      List your property and earn money as a host
                    </p>
                  </div>
                  {selectedRole === "host" && (
                    <Check className="w-5 h-5 text-primary mt-1" />
                  )}
                </button>

                <button
                  onClick={() => setSelectedRole("both")}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border-2 transition-all",
                    selectedRole === "both"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <div className="flex -space-x-1">
                      <User className="w-4 h-4" />
                      <Shield className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-dark">Both — I want it all!</h3>
                    <p className="text-sm text-mid mt-1">
                      Book stays as a guest and host your own property
                    </p>
                  </div>
                  {selectedRole === "both" && (
                    <Check className="w-5 h-5 text-primary mt-1" />
                  )}
                </button>
              </div>

              <Button
                onClick={handleRoleSelect}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Profile Setup */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Complete your profile</CardTitle>
              <CardDescription>
                Tell us a bit about yourself so others can get to know you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleProfileSubmit}
                disabled={loading || !fullName}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Completion */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-center">You're all set! 🎉</CardTitle>
              <CardDescription className="text-center">
                Your profile is complete. Welcome to LocaleRent!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-dark">What's next?</h4>
                {selectedRole === "guest" || selectedRole === "both" ? (
                  <ul className="space-y-1 text-sm text-mid">
                    <li>✨ Browse properties and find your next stay</li>
                    <li>❤️ Save your favorite places</li>
                    <li>📅 Manage your bookings</li>
                  </ul>
                ) : null}
                {selectedRole === "host" || selectedRole === "both" ? (
                  <ul className="space-y-1 text-sm text-mid">
                    <li>🏠 List your first property</li>
                    <li>📸 Upload photos and set your price</li>
                    <li>💰 Start earning as a host</li>
                  </ul>
                ) : null}
              </div>

              <Button onClick={handleFinish} className="w-full">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
