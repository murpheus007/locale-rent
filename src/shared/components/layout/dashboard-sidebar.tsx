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
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
} from "lucide-react";
import { signOut } from "@/features/auth/services";
import { useRouter } from "next/navigation";
import { useProfile, becomeHost } from "@/features/dashboard/hooks";
import { useState } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils/cn";

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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function DashboardSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
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

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview", key: "overview" },
    { href: "/dashboard/listings", icon: Home, label: "Listings", key: "listings", hostOnly: true },
    { href: "/dashboard/bookings", icon: Calendar, label: "Bookings", key: "bookings" },
    { href: "/dashboard/messages", icon: MessageSquare, label: "Messages", key: "messages" },
    { href: "/dashboard/favorites", icon: Heart, label: "Favorites", key: "favorites" },
    { href: "/dashboard/reviews", icon: Star, label: "Reviews", key: "reviews" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings", key: "settings" },
  ];

  const sidebarContent = (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-border transition-all duration-300 h-full",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-border shrink-0">
        {!collapsed && (
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              LR
            </span>
            <span className="text-base font-bold text-dark tracking-tight">
              LocaleRent
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href={`/${locale}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground mx-auto">
            LR
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-lg text-mid hover:bg-light hover:text-dark transition-colors hidden lg:flex",
            collapsed && "mx-auto mt-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Profile Card */}
      <div className={cn("px-3 py-4 border-b border-border shrink-0", collapsed && "px-2")}>
        {profileLoading ? (
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Skeleton className="w-10 h-10 rounded-full" />
            {!collapsed && (
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            )}
          </div>
        ) : (
          <Link
            href={`/${locale}/dashboard/settings`}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg hover:bg-light transition-colors group",
              collapsed && "justify-center"
            )}
          >
            <Avatar className="w-10 h-10 shrink-0">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {profile?.full_name ? getInitials(profile.full_name) : <User className="w-4 h-4" />}
                </AvatarFallback>
              )}
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark truncate group-hover:text-primary transition-colors">
                  {profile?.full_name ?? "Your Profile"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isHost ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      <Shield className="w-2.5 h-2.5" /> Host
                    </span>
                  ) : (
                    <span className="text-[10px] text-mid">Guest</span>
                  )}
                </div>
              </div>
            )}
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.hostOnly && !isHost) return null;

          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary-light text-primary"
                  : "text-mid hover:bg-light hover:text-dark",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className={cn("px-3 py-4 border-t border-border space-y-1 shrink-0", collapsed && "px-2")}>
        {isHost ? (
          <Link
            href={`/${locale}/dashboard/listings/new`}
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary-dark transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "New Listing" : undefined}
          >
            <Plus className="w-5 h-5 shrink-0" />
            {!collapsed && <span>New Listing</span>}
          </Link>
        ) : (
          <button
            onClick={handleBecomeHost}
            disabled={becomingHost}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary-light text-primary hover:bg-primary/10 transition-colors w-full",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Become a Host" : undefined}
          >
            <Home className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{becomingHost ? "Activating..." : "Become a Host"}</span>}
          </button>
        )}
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-mid hover:bg-light hover:text-error transition-colors w-full text-left",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="relative z-10 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
