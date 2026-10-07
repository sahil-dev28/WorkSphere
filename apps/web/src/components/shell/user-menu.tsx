"use client";

import { cn } from "@WorkSphere/ui/lib/utils";
import { KeyRound, LogOut, MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import { Button } from "@WorkSphere/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@WorkSphere/ui/components/dropdown-menu";

import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { logoutAction } from "@/lib/actions/auth";
import { ROLE_LABELS } from "@/lib/enums";
import { initials } from "@/lib/format";
import type { Me } from "@/lib/session";

export function AccountMenuItems() {
  return (
    <>
      <ChangePasswordDialog
        trigger={
          <DropdownMenuItem closeOnClick={false}>
            <KeyRound /> Change password
          </DropdownMenuItem>
        }
      />
      <DropdownMenuSeparator />
      <form action={logoutAction}>
        <DropdownMenuItem variant="destructive" render={<button type="submit" className="w-full" />}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </form>
    </>
  );
}

function UserAvatar({ user }: { user: Me }) {
  return (
    <Avatar className="size-8">
      <AvatarFallback colorKey={user.name}>{initials(user.name)}</AvatarFallback>
    </Avatar>
  );
}

export function UserMenu({ user, collapsed }: { user: Me; collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-sidebar-border bg-card p-2",
        collapsed && "justify-center border-transparent bg-transparent p-0",
      )}
    >
      {collapsed ? null : (
        <>
          <UserAvatar user={user} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-medium text-foreground">{user.name}</span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            collapsed ? (
              <button type="button" className="cursor-pointer rounded-full" aria-label="Account menu" />
            ) : (
              <Button variant="ghost" size="icon-sm" aria-label="Account menu" />
            )
          }
        >
          {collapsed ? <UserAvatar user={user} /> : <MoreHorizontal />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-48">
          <AccountMenuItems />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
