"use client";

import { cn } from "@WorkSphere/ui/lib/utils";
import { KeyRound, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import { Badge } from "@WorkSphere/ui/components/badge";

import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { ModeToggle } from "@/components/mode-toggle";
import { logoutAction } from "@/lib/actions/auth";
import { ROLE_LABELS } from "@/lib/enums";
import { initials } from "@/lib/format";
import type { Me } from "@/lib/session";

import { getSidebarNavItems } from "./nav-items";
import { useSidebar } from "./sidebar-provider";

export function Sidebar({ user }: { user: Me }) {
  const items = getSidebarNavItems(user.role);
  const { collapsed } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-150 min-[860px]:flex",
        collapsed ? "w-16" : "w-[244px]",
      )}
    >
      <div
        className={cn(
          "flex gap-2 px-4 py-4",
          collapsed ? "flex-col items-center" : "items-center justify-between",
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex size-6 shrink-0 items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
            W
          </div>
          {collapsed ? null : (
            <span className="truncate text-sm font-semibold tracking-tight">WorkSphere</span>
          )}
        </div>
        <ModeToggle />
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-none px-2.5 py-2 text-xs font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {collapsed ? null : item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div
        className={cn(
          "flex items-center gap-2 border-t border-sidebar-border bg-sidebar-accent px-3 py-3",
          collapsed && "flex-col justify-center",
        )}
      >
        <Avatar className="size-8 shrink-0 ring-2 ring-sidebar-ring">
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>

        {collapsed ? null : (
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-xs font-medium">{user.name}</span>
            <Badge variant="secondary" className="w-fit">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        )}

        <ChangePasswordDialog
          trigger={
            <button
              type="button"
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-sidebar-accent-foreground"
              aria-label="Change password"
              title={collapsed ? "Change password" : undefined}
            >
              <KeyRound className="size-4" />
            </button>
          }
        />

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-sidebar-accent-foreground"
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
