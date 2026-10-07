import { redirect } from "next/navigation";

import { QueryProvider } from "@/components/providers/query-provider";
import { Sidebar } from "@/components/shell/sidebar";
import { SidebarProvider } from "@/components/shell/sidebar-provider";
import { Topbar } from "@/components/shell/topbar";
import { MobileTabBar, MobileTopBar } from "@/components/shell/mobile-nav";
import { RouteTransition } from "@/components/shell/route-transition";
import { SESSION_EXPIRED_PATH } from "@/lib/constants";
import { getMe } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();

  if (!user) {
    redirect(SESSION_EXPIRED_PATH);
  }

  if (user.mustChangePassword) {
    redirect("/change-password");
  }

  return (
    <QueryProvider>
      <SidebarProvider>
        <div className="flex min-h-svh">
          <Sidebar user={user} />
          <div className="relative flex min-w-0 flex-1 flex-col">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-glow" />
            <MobileTopBar user={user} />
            <Topbar />
            <main className="relative flex-1 pb-20 min-[860px]:pb-0">
              <RouteTransition>{children}</RouteTransition>
            </main>
            <MobileTabBar user={user} />
          </div>
        </div>
      </SidebarProvider>
    </QueryProvider>
  );
}
