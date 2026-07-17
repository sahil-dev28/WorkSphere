import { LogOut } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import { Badge } from "@WorkSphere/ui/components/badge";

import { logoutAction } from "@/lib/actions/auth";
import type { Me } from "@/lib/session";

import { getSidebarNavItems } from "./nav-items";

const ROLE_LABELS: Record<Me["role"], string> = {
  super_admin: "Super Admin",
  hr_manager: "HR Manager",
  employee: "Employee",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Sidebar({ user }: { user: Me }) {
  const items = getSidebarNavItems(user.role);

  return (
    <aside className="sticky top-0 hidden h-svh w-[244px] shrink-0 flex-col border-r border-border bg-card min-[860px]:flex">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex size-6 items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
          W
        </div>
        <span className="text-sm font-semibold tracking-tight">WorkSphere</span>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2 border-t border-border px-3 py-3">
        <Avatar className="size-8">
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-xs font-medium">{user.name}</span>
          <Badge variant="secondary" className="w-fit">
            {ROLE_LABELS[user.role]}
          </Badge>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
