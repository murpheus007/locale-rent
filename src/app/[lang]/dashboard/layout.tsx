import { DashboardSidebar } from "@/shared/components/layout/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      <DashboardSidebar />
      <main className="flex-1 bg-light min-h-[calc(100vh-73px)]">
        {children}
      </main>
    </div>
  );
}
