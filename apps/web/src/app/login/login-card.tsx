"use client";

import { startTransition, useActionState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@WorkSphere/ui/components/button";
import { Input } from "@WorkSphere/ui/components/input";
import { Label } from "@WorkSphere/ui/components/label";

import { ChangePasswordFields } from "@/components/auth/change-password-fields";
import { DemoLoginProvider, DemoRoleButton } from "@/components/demo-role-button";
import { loginAction, type LoginState } from "@/lib/actions/auth";
import type { DemoRole } from "@/lib/demo-roles";

const initialState: LoginState = {};

interface FormValues {
  email: string;
  password: string;
}

export function LoginCard({ demoRoles }: { demoRoles: DemoRole[] }) {
  const [state, dispatch, pending] = useActionState(loginAction, initialState);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: "", password: "" } });

  if (state.mustChangePassword) {
    return (
      <div className="flex w-full max-w-[400px] flex-col gap-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Set a new password
        </h1>
        <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          This account is using a temporary password. Choose a new one to
          continue.
        </div>
        <ChangePasswordFields />
      </div>
    );
  }

  function onValid(data: FormValues) {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    startTransition(() => {
      dispatch(formData);
    });
  }

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Sign in to your workspace
        </h1>
        <p className="text-xs text-muted-foreground">
          {demoRoles.length > 0
            ? "Enter your credentials, or pick a role below to explore the demo."
            : "Enter your credentials to continue."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onValid)}
        noValidate
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email", {
              required: "Email is required",
            })}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password", {
              required: "Password is required",
            })}
          />
          {errors.password ? (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        {state.error ? (
          <p className="text-xs text-destructive">{state.error}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      {demoRoles.length > 0 ? (
        <>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Or explore the demo
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <DemoLoginProvider>
            <div className="flex flex-col gap-2">
              {demoRoles.map((role) => (
                <DemoRoleButton key={role} role={role} />
              ))}
            </div>
          </DemoLoginProvider>
        </>
      ) : null}

      <p className="text-center text-xs text-muted-foreground">
        Access is provisioned by your administrator. Contact HR if you need an
        account.
      </p>
    </div>
  );
}
