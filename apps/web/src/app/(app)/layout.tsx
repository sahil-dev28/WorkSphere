import { redirect } from "next/navigation";

import { Sidebar } from "@/components/shell/sidebar";
import { MobileTabBar, MobileTopBar } from "@/components/shell/mobile-nav";
import { getMe } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();

  if (!user) {
    redirect("/login");
  }

  if (user.mustChangePassword) {
    redirect("/change-password");
  }

  return (
    <div className="flex min-h-svh">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar user={user} />
        <main className="flex-1 pb-16 min-[860px]:pb-0">{children}</main>
        <MobileTabBar user={user} />
      </div>
    </div>
  );
}
