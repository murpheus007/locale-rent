"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth";
import { signOut } from "@/features/auth/services";
import { useRouter, usePathname } from "next/navigation";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

export function UserNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);

  async function handleSignOut() {
    await signOut();
    router.refresh();
  }

  if (loading) {
    return <div className="h-9 w-9 rounded-full bg-light animate-pulse" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/dashboard`}
          className="text-sm font-medium text-mid hover:text-primary transition-colors"
        >
          Dashboard
        </Link>
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
        href={`/${locale}/auth/signin`}
        className="text-sm font-medium text-dark hover:text-primary transition-colors hidden sm:inline-flex"
      >
        Sign in
      </Link>
      <Link
        href={`/${locale}/auth/signup`}
        className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
}
