"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { useAuth } from "@/features/auth";
import { Camera, ArrowRight, ArrowLeft, Check, User, Home, MapPin, FileText, Globe, PartyPopper } from "lucide-react";

const TOTAL_STEPS = 6;

const STEP_CONFIG = [
  { icon: User, label: "Welcome" },
  { icon: Home, label: "Role" },
  { icon: Camera, label: "Photo" },
  { icon: FileText, label: "About" },
  { icon: MapPin, label: "Contact" },
  { icon: PartyPopper, label: "Done" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

const COUNTRIES = [
  "Nigeria", "United States", "United Kingdom", "Canada", "Germany",
  "France", "Ghana", "Kenya", "South Africa", "Australia",
  "Netherlands", "Belgium", "Spain", "Italy", "Other",
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Form data
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"guest" | "host">("guest");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  const locale =
    typeof window !== "undefined"
      ? window.location.pathname.match(/^\/(en|fr|de)(\/|$)/)?.[1] ?? "en"
      : "en";

  function nextStep() {
    setError(null);
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function prevStep() {
    setError(null);
    if (step > 1) setStep(step - 1);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/avatars", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAvatarUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
      setAvatarPreview(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!fullName.trim()) {
      setError("Full name is required");
      setStep(1);
      return;
    }

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
          bio: bio.trim(),
          phone: phone.trim(),
          city: city.trim(),
          country: country.trim(),
          avatarUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save profile");
      }

      router.replace(`/${locale}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-background to-light/50 flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-light border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            {STEP_CONFIG.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = i + 1 === step;
              const isDone = i + 1 < step;
              return (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      isDone
                        ? "bg-primary text-primary-foreground"
                        : isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-light text-mid border border-border"
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  {i < STEP_CONFIG.length - 1 && (
                    <div
                      className={`w-8 sm:w-12 h-0.5 mx-1 ${
                        isDone ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-mid text-center">
            Step {step} of {TOTAL_STEPS}: {STEP_CONFIG[step - 1].label}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Step 1: Welcome + Full Name */}
          {step === 1 && (
            <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-dark">
                    Welcome{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
                  </h1>
                  <p className="text-mid">
                    Let's set up your profile. What should we call you?
                  </p>
                </div>

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
                    placeholder="e.g. Damian Chidera"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="language" className="text-sm font-medium text-dark">
                    Preferred language
                  </label>
                  <select
                    id="language"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button onClick={nextStep} className="w-full h-11" disabled={!fullName.trim()}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Role Selection */}
          {step === 2 && (
            <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-dark">What brings you here?</h1>
                  <p className="text-mid">You can always change this later.</p>
                </div>

                {error && (
                  <p className="text-error text-sm text-center bg-error-light px-4 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("guest")}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      role === "guest"
                        ? "border-primary bg-primary-light/30 shadow-md"
                        : "border-border hover:border-primary/50 bg-background"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-dark mb-1">I want to book stays</h3>
                    <p className="text-sm text-mid">
                      Discover and book unique properties around the world.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("host")}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      role === "host"
                        ? "border-primary bg-primary-light/30 shadow-md"
                        : "border-border hover:border-primary/50 bg-background"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-dark mb-1">I want to list my property</h3>
                    <p className="text-sm text-mid">
                      Earn income by renting out your space to guests.
                    </p>
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={prevStep} className="flex-1 h-11">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={nextStep} className="flex-1 h-11">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Avatar Upload */}
          {step === 3 && (
            <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-dark">Add a profile photo</h1>
                  <p className="text-mid">Help others recognize you. You can skip this for now.</p>
                </div>

                {error && (
                  <p className="text-error text-sm text-center bg-error-light px-4 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group"
                  >
                    <Avatar className="w-28 h-28 ring-4 ring-border group-hover:ring-primary/50 transition-all">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} alt="Preview" />
                      ) : (
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                          {fullName ? getInitials(fullName) : <User className="w-10 h-10" />}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="h-9"
                  >
                    {loading ? "Uploading…" : avatarPreview ? "Change photo" : "Upload photo"}
                  </Button>

                  <p className="text-xs text-mid">JPEG, PNG, WebP or GIF. Max 5MB.</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={prevStep} className="flex-1 h-11">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={nextStep} className="flex-1 h-11">
                    {avatarPreview ? "Continue" : "Skip"} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Bio */}
          {step === 4 && (
            <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-dark">Tell us about yourself</h1>
                  <p className="text-mid">
                    {role === "host"
                      ? "Guests love to know their host. Share a bit about yourself and your property."
                      : "A short bio helps hosts feel comfortable welcoming you."}
                  </p>
                </div>

                {error && (
                  <p className="text-error text-sm text-center bg-error-light px-4 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="bio" className="text-sm font-medium text-dark">
                    Bio <span className="text-mid">(optional)</span>
                  </label>
                  <Textarea
                    id="bio"
                    placeholder={
                      role === "host"
                        ? "e.g. I'm a software engineer who loves hosting travelers in my cozy Lagos apartment..."
                        : "e.g. I'm a digital nomad who loves exploring new cities and meeting locals..."
                    }
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-mid text-right">{bio.length}/500</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={prevStep} className="flex-1 h-11">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={nextStep} className="flex-1 h-11">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Contact Info */}
          {step === 5 && (
            <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-dark">How can we reach you?</h1>
                  <p className="text-mid">This helps with bookings and communication.</p>
                </div>

                {error && (
                  <p className="text-error text-sm text-center bg-error-light px-4 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-medium text-dark">
                      Phone number <span className="text-mid">(optional)</span>
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 705 613 8784"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="city" className="text-sm font-medium text-dark">
                      City <span className="text-mid">(optional)</span>
                    </label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="e.g. Lagos"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="country" className="text-sm font-medium text-dark">
                      Country <span className="text-mid">(optional)</span>
                    </label>
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={prevStep} className="flex-1 h-11">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={nextStep} className="flex-1 h-11">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Congrats */}
          {step === 6 && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <PartyPopper className="w-10 h-10 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-dark">You're all set, {fullName.split(" ")[0]}!</h1>
                  <p className="text-mid max-w-sm mx-auto">
                    {role === "host"
                      ? "Your profile is ready. Start by creating your first property listing."
                      : "Your profile is ready. Start exploring properties and book your first stay!"}
                  </p>
                </div>

                {/* Profile summary */}
                <div className="bg-light rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} alt={fullName} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(fullName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-dark text-sm">{fullName}</p>
                      <p className="text-xs text-mid">
                        {role === "host" ? "Host" : "Guest"} · {city}{city && country ? ", " : ""}{country}
                      </p>
                    </div>
                  </div>
                  {bio && (
                    <p className="text-sm text-mid line-clamp-2">{bio}</p>
                  )}
                </div>

                {error && (
                  <p className="text-error text-sm text-center bg-error-light px-4 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={prevStep} className="flex-1 h-11">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={handleComplete} className="flex-1 h-11" disabled={loading}>
                    {loading ? "Saving…" : (
                      <>Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
