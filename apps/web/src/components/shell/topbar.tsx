"use client";

import { PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import { Button } from "@WorkSphere/ui/components/button";

import { RolePill } from "@/components/employee/role-pill";
import { initials } from "@/lib/format";
import type { Me } from "@/lib/session";

import { getPageMeta } from "./page-meta";
import { useSidebar } from "./sidebar-provider";

export function Topbar({ user }: { user: Me }) {
  const pathname = usePathname();
  const { toggle } = useSidebar();
  const { title, subtitle } = getPageMeta(pathname);

  return (
    <header className="sticky top-0 z-10 hidden h-[66px] items-center justify-between gap-4 border-b border-border bg-card px-6 min-[860px]:flex">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggle}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="size-4" />
        </Button>
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-sm font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <RolePill role={user.role} />
        <Avatar className="size-8">
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
