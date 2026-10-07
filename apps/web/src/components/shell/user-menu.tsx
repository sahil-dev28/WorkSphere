"use client";

import { cn } from "@WorkSphere/ui/lib/utils";
import { KeyRound, LogOut, MoreHorizontal, Repeat } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import { Button } from "@WorkSphere/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@WorkSphere/ui/components/dropdown-menu";

import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { demoLoginAction, logoutAction } from "@/lib/actions/auth";
import type { DemoSession } from "@/lib/demo-credentials";
import { DEMO_ROLE_META, type DemoRole } from "@/lib/demo-roles";
import { ROLE_LABELS } from "@/lib/enums";
import { initials } from "@/lib/format";
import type { Me } from "@/lib/session";

function DemoSwitchItems({ demo }: { demo: DemoSession }) {
  const [pending, startTransition] = useTransition();
  const others = demo.available.filter((role) => role !== demo.current);

  if (others.length === 0) return null;

  function switchTo(role: DemoRole) {
    startTransition(async () => {
      const result = await demoLoginAction(role);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel>Switch demo role</DropdownMenuLabel>
        {others.map((role) => (
          <DropdownMenuItem key={role} disabled={pending} closeOnClick={false} onClick={() => switchTo(role)}>
            <Repeat /> Switch to {DEMO_ROLE_META[role].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
    </>
  );
}

export function AccountMenuItems({ demo }: { demo?: DemoSession | null }) {
  return (
    <>
      {demo ? <DemoSwitchItems demo={demo} /> : null}
      <ChangePasswordDialog
        nativeButton={false}
        trigger={
          <DropdownMenuItem closeOnClick={false}>
            <KeyRound /> Change password
          </DropdownMenuItem>
        }
      />
      <DropdownMenuSeparator />
      <form action={logoutAction}>
        <DropdownMenuItem
          variant="destructive"
          nativeButton
          render={<button type="submit" className="w-full" />}
        >
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

export function UserMenu({
  user,
  collapsed,
  demo,
}: {
  user: Me;
  collapsed: boolean;
  demo?: DemoSession | null;
}) {
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
          <AccountMenuItems demo={demo} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
