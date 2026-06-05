"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  Home,
  Calendar,
  Star,
  Heart,
  MessageSquare,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Search,
  Shield,
} from "lucide-react";
import { useProfile, useDashboardStats, useRecentActivity } from "@/features/dashboard/hooks";

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

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STAT_CARDS = [
  { key: "totalListings", label: "Listings", icon: Home, color: "bg-primary/10 text-primary" },
  { key: "activeBookings", label: "Bookings", icon: Calendar, color: "bg-secondary/10 text-secondary" },
  { key: "totalReviews", label: "Reviews", icon: Star, color: "bg-accent/10 text-accent-dark" },
  { key: "totalFavorites", label: "Favorites", icon: Heart, color: "bg-error/10 text-error" },
] as const;

export default function DashboardPage() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { profile, loading: profileLoading } = useProfile();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { activities, loading: activityLoading } = useRecentActivity();

  const isHost = profile?.is_host ?? false;
  const displayName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {profile?.full_name ? getInitials(profile.full_name) : "?"}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-dark">
              Welcome back, {displayName}!
            </h1>
            <p className="text-mid text-sm mt-0.5">
              {isHost
                ? "Here's what's happening with your properties."
                : "Here's an overview of your activity."}
            </p>
          </div>
        </div>
        {isHost && (
          <Link href={`/${locale}/dashboard/listings/new`}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Listing
            </Button>
          </Link>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          const value = stats[stat.key as keyof typeof stats] ?? 0;
          return (
            <Card key={stat.key} className="border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {statsLoading ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    <span className="text-2xl font-bold text-dark">{value}</span>
                  )}
                </div>
                <p className="text-sm text-mid">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <Card className="lg:col-span-1 border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-dark flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              {isHost && (
                <Link
                  href={`/${locale}/dashboard/listings/new`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary-light/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-dark">Create listing</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-mid group-hover:text-primary transition-colors" />
                </Link>
              )}
              <Link
                href={`/${locale}/search`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary-light/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Search className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-dark">Browse properties</span>
                </div>
                <ArrowRight className="w-4 h-4 text-mid group-hover:text-primary transition-colors" />
              </Link>
              <Link
                href={`/${locale}/dashboard/bookings`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary-light/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-sm font-medium text-dark">View bookings</span>
                </div>
                <ArrowRight className="w-4 h-4 text-mid group-hover:text-primary transition-colors" />
              </Link>
              <Link
                href={`/${locale}/dashboard/messages`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary-light/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-accent-dark" />
                  </div>
                  <span className="text-sm font-medium text-dark">Messages</span>
                </div>
                <ArrowRight className="w-4 h-4 text-mid group-hover:text-primary transition-colors" />
              </Link>
              <Link
                href={`/${locale}/dashboard/settings`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary-light/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-dark">Settings</span>
                </div>
                <ArrowRight className="w-4 h-4 text-mid group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2 border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-dark flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Recent Activity
              </h2>
              <Link
                href={`/${locale}/dashboard/bookings`}
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-light flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-mid" />
                </div>
                <p className="text-mid text-sm">No recent activity yet.</p>
                <p className="text-mid text-xs mt-1">
                  {isHost
                    ? "Create your first listing to get started!"
                    : "Start exploring properties to book your first stay."}
                </p>
                <div className="mt-4">
                  {isHost ? (
                    <Link href={`/${locale}/dashboard/listings/new`}>
                      <Button size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create listing
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/${locale}/search`}>
                      <Button size="sm" className="gap-2">
                        Explore properties
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-light transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === "booking"
                          ? "bg-secondary/10"
                          : activity.type === "review"
                          ? "bg-accent/10"
                          : "bg-primary/10"
                      }`}
                    >
                      {activity.type === "booking" ? (
                        <Calendar className="w-5 h-5 text-secondary" />
                      ) : activity.type === "review" ? (
                        <Star className="w-5 h-5 text-accent-dark" />
                      ) : (
                        <Heart className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark truncate">{activity.title}</p>
                      <p className="text-xs text-mid">{formatDate(activity.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Become a Host card (for guests) */}
      {!isHost && (
        <Card className="border-primary/20 bg-primary-light/30">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-dark text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Ready to start hosting?
              </h3>
              <p className="text-mid text-sm mt-0.5">
                List your property and start earning. It only takes a few minutes.
              </p>
            </div>
            <Link href={`/${locale}/dashboard/settings`}>
              <Button size="sm" className="gap-2">
                Become a Host
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Profile completion card (if profile is incomplete) */}
      {profile && !profile.bio && (
        <Card className="border-accent/30 bg-accent-light/30">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-dark text-sm">Complete your profile</h3>
              <p className="text-mid text-sm mt-0.5">
                Add a bio and photo to help others get to know you better.
              </p>
            </div>
            <Link href={`/${locale}/dashboard/settings`}>
              <Button variant="outline" size="sm" className="border-accent/30 text-accent-dark hover:bg-accent-light gap-2">
                Complete profile
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
