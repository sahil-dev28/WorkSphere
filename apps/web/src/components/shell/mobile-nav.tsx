"use client";

import { cn } from "@WorkSphere/ui/lib/utils";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@WorkSphere/ui/components/dropdown-menu";

import { Button } from "@WorkSphere/ui/components/button";

import { useCommandPalette } from "@/components/command-palette/command-palette";
import { ModeToggle } from "@/components/mode-toggle";
import { initials } from "@/lib/format";
import type { DemoSession } from "@/lib/demo-credentials";
import type { Me } from "@/lib/session";

import { LogoMark } from "./logo-mark";
import { getMobileNavItems } from "./nav-items";
import { AccountMenuItems } from "./user-menu";

export function MobileTopBar({ user, demo }: { user: Me; demo?: DemoSession | null }) {
  const { openPalette } = useCommandPalette();

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/70 px-4 py-3 backdrop-blur-md min-[860px]:hidden">
      <div className="flex items-center gap-2">
        <LogoMark />
        <span className="text-sm font-semibold tracking-tight">WorkSphere</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={openPalette} aria-label="Search">
          <Search />
        </Button>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<button type="button" className="cursor-pointer rounded-full" aria-label="Account menu" />}
          >
            <Avatar className="size-8">
              <AvatarFallback colorKey={user.name}>{initials(user.name)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <AccountMenuItems demo={demo} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function MobileTabBar({ user }: { user: Me }) {
  const pathname = usePathname();
  const items = getMobileNavItems(user.role);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-md min-[860px]:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                active && "bg-primary/12 text-primary",
              )}
            >
              <item.icon className="size-4" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
