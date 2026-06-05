"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Calendar,
  MessageSquare,
  Heart,
  Star,
  Settings,
  Plus,
  LogOut,
  User,
} from "lucide-react";
import { signOut } from "@/features/auth/services";
import { useRouter } from "next/navigation";
import { useProfile, becomeHost } from "@/features/dashboard/hooks";
import { useState } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", key: "overview" },
  { href: "/dashboard/listings", icon: Home, label: "Listings", key: "listings" },
  { href: "/dashboard/bookings", icon: Calendar, label: "Bookings", key: "bookings" },
  { href: "/dashboard/messages", icon: MessageSquare, label: "Messages", key: "messages" },
  { href: "/dashboard/favorites", icon: Heart, label: "Favorites", key: "favorites" },
  { href: "/dashboard/reviews", icon: Star, label: "Reviews", key: "reviews" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", key: "settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocaleFromPathname(pathname);
  const { profile, loading: profileLoading } = useProfile();
  const isHost = profile?.is_host ?? false;

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === `/${locale}/dashboard` || pathname === "/dashboard";
    }
    return pathname.startsWith(`/${locale}${href}`) || pathname.startsWith(href);
  }

  const [becomingHost, setBecomingHost] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push(`/${locale}/auth/signin`);
  }

  async function handleBecomeHost() {
    setBecomingHost(true);
    try {
      await becomeHost();
      router.refresh();
    } catch {
      // silently fail
    } finally {
      setBecomingHost(false);
    }
  }

  return (
    <aside className="w-64 border-r border-border bg-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            LR
          </span>
          <span className="text-lg font-bold text-dark tracking-tight">
            LocaleRent
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          // Hide Listings nav for non-hosts
          if (item.key === "listings" && !isHost) return null;

          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-light text-primary"
                  : "text-mid hover:bg-light hover:text-dark"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {isHost ? (
          <Link
            href={`/${locale}/dashboard/listings/new`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Listing
          </Link>
        ) : (
          <button
            onClick={handleBecomeHost}
            disabled={becomingHost}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary-light text-primary hover:bg-primary/10 transition-colors w-full"
          >
            <Home className="w-5 h-5" />
            {becomingHost ? "Activating..." : "Become a Host"}
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-mid hover:bg-light hover:text-error transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
