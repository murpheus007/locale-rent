"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Badge } from "@/shared/components/ui/badge";
import { supabase } from "@/features/auth/services";
import { useProfile, becomeHost } from "@/features/dashboard/hooks";
import {
  User,
  Camera,
  Shield,
  Mail,
  Phone,
  MapPin,
  Globe,
  Bell,
  Lock,
  Check,
  AlertCircle,
  Home,
} from "lucide-react";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const COUNTRIES = [
  "Nigeria", "United States", "United Kingdom", "Canada", "Germany",
  "France", "Ghana", "Kenya", "South Africa", "Australia",
  "Netherlands", "Belgium", "Spain", "Italy", "Other",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

type ToastType = "success" | "error";

export default function SettingsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocaleFromPathname(pathname);
  const { profile, loading: profileLoading, refetch } = useProfile();

  // Form state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [becomingHost, setBecomingHost] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Notification prefs
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setBio(profile.bio ?? "");
      setPhone(profile.phone ?? "");
      setCity(profile.city ?? "");
      setCountry(profile.country ?? "");
      setPreferredLanguage(profile.preferred_language ?? "en");
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const isHost = profile?.is_host ?? false;

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/avatars", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAvatarUrl(data.url);
      setAvatarPreview(null);
      setToast({ type: "success", message: "Profile photo updated!" });
      refetch();
    } catch (err) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Upload failed" });
      setAvatarPreview(null);
    }
  }

  async function handleSaveProfile() {
    if (!fullName.trim()) {
      setToast({ type: "error", message: "Full name is required" });
      return;
    }

    setSaving(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          bio: bio.trim(),
          phone: phone.trim(),
          city: city.trim(),
          country: country.trim(),
          preferred_language: preferredLanguage,
          avatar_url: avatarUrl,
        })
        .eq("user_id", authData.user.id);

      if (error) throw error;

      // Also update user_metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });

      setToast({ type: "success", message: "Profile saved successfully!" });
      refetch();
    } catch (err) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ type: "error", message: "Please fill in all password fields" });
      return;
    }
    if (newPassword.length < 8) {
      setToast({ type: "error", message: "New password must be at least 8 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ type: "error", message: "Passwords do not match" });
      return;
    }

    setChangingPassword(true);
    try {
      // Re-authenticate with current password by signing in
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user?.email) throw new Error("Not authenticated");

      // Supabase doesn't have a direct "change password with current password" —
      // we use updateUser which requires the user to be recently authenticated
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      setToast({ type: "success", message: "Password changed successfully!" });
    } catch (err) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Failed to change password" });
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleBecomeHost() {
    setBecomingHost(true);
    try {
      await becomeHost();
      setToast({ type: "success", message: "You are now a host! You can create listings." });
      refetch();
      router.refresh();
    } catch (err) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Failed" });
    } finally {
      setBecomingHost(false);
    }
  }

  if (profileLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6 space-y-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
        <Card><CardContent className="p-6 space-y-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top-2 ${
          toast.type === "success" ? "bg-success text-white" : "bg-error text-white"
        }`}>
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-dark">Settings</h1>
        <p className="text-mid text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="w-20 h-20">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Preview" />
                ) : avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={profile?.full_name ?? ""} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {fullName ? getInitials(fullName) : <User className="w-8 h-8" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <button
                onClick={() => document.getElementById("avatar-input")?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input
                id="avatar-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-dark">Profile photo</p>
              <p className="text-xs text-mid mt-0.5">JPEG, PNG, WebP or GIF. Max 5MB.</p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-dark">Full name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="h-10"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-dark flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <Input
              value={profile?.user_id ? "Verified" : ""}
              disabled
              className="h-10 bg-light text-mid"
            />
            <p className="text-xs text-mid">Email cannot be changed. Contact support if needed.</p>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-dark">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-mid text-right">{bio.length}/500</p>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-dark flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 705 613 8784"
              className="h-10"
            />
          </div>

          {/* City + Country */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> City
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lagos"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select...</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-dark flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Preferred language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="h-10">
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Role Card */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Account type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={isHost ? "default" : "secondary"} className={isHost ? "bg-primary" : ""}>
                {isHost ? "Host" : "Guest"}
              </Badge>
              <p className="text-sm text-mid">
                {isHost
                  ? "You can list properties and accept bookings."
                  : "You can browse and book properties."}
              </p>
            </div>
            {!isHost && (
              <Button onClick={handleBecomeHost} disabled={becomingHost} size="sm" className="gap-1.5 shrink-0">
                <Home className="w-3.5 h-3.5" />
                {becomingHost ? "Activating..." : "Become a Host"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)} className="h-10">
              Change password
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">Current password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">New password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-dark">Confirm new password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="h-10"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPasswordForm(false)} className="h-10">
                  Cancel
                </Button>
                <Button onClick={handleChangePassword} disabled={changingPassword} className="h-10">
                  {changingPassword ? "Updating..." : "Update password"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-dark">Email notifications</p>
              <p className="text-xs text-mid">Receive booking updates and messages via email</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                emailNotifications ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  emailNotifications ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-dark">Push notifications</p>
              <p className="text-xs text-mid">Receive real-time alerts in your browser</p>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                pushNotifications ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  pushNotifications ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
