"use client";

import { startTransition, useActionState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@WorkSphere/ui/components/button";
import { Input } from "@WorkSphere/ui/components/input";
import { Label } from "@WorkSphere/ui/components/label";

import { changePasswordAction, type ChangePasswordState } from "@/lib/actions/auth";

const initialState: ChangePasswordState = {};

interface FormValues {
  currentPassword: string;
  newPassword: string;
}

// Shared between the forced-change state on the login card, the standalone
// /change-password page, and the voluntary ChangePasswordDialog — same
// backend call, same fields, different wrapper. cancelSlot is dialog-agnostic
// on purpose (just a ReactNode) so this component never has to know about
// Dialog itself — only the dialog wrapper passes one.
export function ChangePasswordFields({ cancelSlot }: { cancelSlot?: ReactNode }) {
  const [state, dispatch, pending] = useActionState(changePasswordAction, initialState);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { currentPassword: "", newPassword: "" } });

  function onValid(data: FormValues) {
    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("newPassword", data.newPassword);
    startTransition(() => {
      dispatch(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.currentPassword}
          {...register("currentPassword", { required: "Current password is required" })}
        />
        {errors.currentPassword ? (
          <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.newPassword}
          {...register("newPassword", {
            required: "New password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          })}
        />
        {errors.newPassword ? (
          <p className="text-xs text-destructive">{errors.newPassword.message}</p>
        ) : null}
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
