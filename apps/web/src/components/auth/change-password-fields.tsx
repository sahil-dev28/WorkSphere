"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { Button } from "@WorkSphere/ui/components/button";
import { Input } from "@WorkSphere/ui/components/input";
import { Label } from "@WorkSphere/ui/components/label";

import { changePasswordAction, type ChangePasswordState } from "@/lib/actions/auth";

const initialState: ChangePasswordState = {};

// Shared between the forced-change state on the login card, the standalone
// /change-password page, and the voluntary ChangePasswordDialog — same
// backend call, same fields, different wrapper. cancelSlot is dialog-agnostic
// on purpose (just a ReactNode) so this component never has to know about
// Dialog itself — only the dialog wrapper passes one.
export function ChangePasswordFields({ cancelSlot }: { cancelSlot?: ReactNode }) {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}

      <div className={cancelSlot ? "flex flex-col-reverse gap-2 min-[500px]:flex-row min-[500px]:justify-end" : undefined}>
        {cancelSlot}
        <Button type="submit" className={cancelSlot ? undefined : "w-full"} disabled={pending}>
          {pending ? "Updating..." : "Update password"}
        </Button>
      </div>
    </form>
  );
}
