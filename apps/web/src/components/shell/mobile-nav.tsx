"use client";

import { KeyRound, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@WorkSphere/ui/components/dropdown-menu";

import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { logoutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/format";
import type { Me } from "@/lib/session";

import { getMobileNavItems } from "./nav-items";

export function MobileTopBar({ user }: { user: Me }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 min-[860px]:hidden">
      <div className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
          W
        </div>
        <span className="text-sm font-semibold tracking-tight">WorkSphere</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button type="button" className="cursor-pointer" aria-label="Account menu">
              <Avatar className="size-7">
                <AvatarFallback className="text-[10px]">{initials(user.name)}</AvatarFallback>
              </Avatar>
            </button>
          }
        />
        <DropdownMenuContent align="end">
          <ChangePasswordDialog
            trigger={
              <DropdownMenuItem closeOnClick={false}>
                <KeyRound /> Change Password
              </DropdownMenuItem>
            }
          />
          <form action={logoutAction}>
            <DropdownMenuItem render={<button type="submit" className="w-full" />}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function MobileTabBar({ user }: { user: Me }) {
  const pathname = usePathname();
  const items = getMobileNavItems(user.role);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-card min-[860px]:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
