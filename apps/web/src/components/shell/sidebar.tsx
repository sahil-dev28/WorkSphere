"use client";

import { cn } from "@WorkSphere/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tooltip, TooltipContent, TooltipTrigger } from "@WorkSphere/ui/components/tooltip";

import type { DemoSession } from "@/lib/demo-credentials";
import type { Me } from "@/lib/session";

import { LogoMark } from "./logo-mark";
import { getSidebarNavItems, type NavItem } from "./nav-items";
import { useSidebar } from "./sidebar-provider";
import { UserMenu } from "./user-menu";

const GROUP_LABELS: Record<NavItem["group"], string> = {
  workspace: "Workspace",
  account: "Account",
};

function NavLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_var(--border)]"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {active ? (
        <span aria-hidden className="absolute top-2 bottom-2 -left-2 w-0.5 rounded-full bg-sidebar-primary" />
      ) : null}
      <item.icon className={cn("size-4 shrink-0", active && "text-sidebar-primary")} />
      {collapsed ? null : item.label}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

export function Sidebar({ user, demo }: { user: Me; demo?: DemoSession | null }) {
  const items = getSidebarNavItems(user.role);
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const groups = (["workspace", "account"] as const)
    .map((group) => ({ group, items: items.filter((item) => item.group === group) }))
    .filter(({ items: groupItems }) => groupItems.length > 0);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-150 min-[860px]:flex",
        collapsed ? "w-16" : "w-[244px]",
      )}
    >
      <div className={cn("flex items-center gap-2 px-4 pt-4 pb-2", collapsed && "justify-center px-0")}>
        <LogoMark />
        {collapsed ? null : (
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">WorkSphere</span>
        )}
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {groups.map(({ group, items: groupItems }) => (
          <div key={group} className="flex flex-col gap-0.5">
            {collapsed ? (
              <div className="my-2 h-px bg-sidebar-border" />
            ) : (
              <span className="px-2.5 pt-3 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                {GROUP_LABELS[group]}
              </span>
            )}
            {groupItems.map((item) => (
              <NavLink key={item.href} item={item} active={pathname === item.href} collapsed={collapsed} />
            ))}
          </div>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="p-2">
        <UserMenu user={user} collapsed={collapsed} demo={demo} />
      </div>
    </aside>
  );
}
