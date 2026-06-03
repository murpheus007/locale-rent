"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth";
import { signOut } from "@/features/auth/services";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { user, loading } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.refresh();
  }

  if (loading) {
    return <div className="h-9 w-9 rounded-full bg-light animate-pulse" />;
  }

  if (user) {
    const needsOnboarding = !user.email; // placeholder; real check via profile API
    return (
      <div className="flex items-center gap-3">
        {needsOnboarding ? (
          <Link
            href="/onboarding"
            className="text-sm font-medium bg-warning text-warning-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Complete setup
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="text-sm font-medium text-mid hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
        )}
        <button
          onClick={handleSignOut}
          className="text-sm font-medium text-mid hover:text-error transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/signin"
        className="text-sm font-medium text-dark hover:text-primary transition-colors hidden sm:inline-flex"
      >
        Sign in
      </Link>
      <Link
        href="/auth/signup"
        className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
}
