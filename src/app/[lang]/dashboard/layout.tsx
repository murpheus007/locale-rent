"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/shared/components/layout/dashboard-sidebar";
import { Menu } from "lucide-react";
import { useProfile } from "@/features/dashboard/hooks";

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "en";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocaleFromPathname(pathname);
  const { profile, loading } = useProfile();

  // Check if profile is complete, redirect to onboarding if not
  useEffect(() => {
    if (!loading && profile && !profile.is_complete && !pathname.includes("/onboarding")) {
      router.push(`/${locale}/dashboard/onboarding`);
    }
  }, [loading, profile, pathname, router, locale]);

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setSidebarCollapsed(saved === "true");
    }
  }, []);

  function handleToggle() {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  // Close mobile sidebar on route change
  function handleMobileClose() {
    setMobileOpen(false);
  }

  // Don't render layout while checking profile
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render sidebar on onboarding page
  if (pathname.includes("/onboarding")) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggle}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar — minimal, just hamburger for mobile */}
        <header className="h-14 border-b border-border bg-white flex items-center px-4 shrink-0 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-mid hover:bg-light hover:text-dark transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 text-sm font-semibold text-dark">LocaleRent</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
