"use client";

import { cn } from "@WorkSphere/ui/lib/utils";
import { Check } from "lucide-react";
import { startTransition, useActionState, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@WorkSphere/ui/components/button";
import { Input } from "@WorkSphere/ui/components/input";
import { Label } from "@WorkSphere/ui/components/label";

import { ChangePasswordFields } from "@/components/auth/change-password-fields";
import { stagger } from "@/components/landing/stagger";
import { loginAction, type LoginState } from "@/lib/actions/auth";
import type { DemoAccount } from "@/lib/demo-credentials";
import { DEMO_ROLE_META, type DemoRole } from "@/lib/demo-roles";

const initialState: LoginState = {};

interface FormValues {
  email: string;
  password: string;
}

const STEPS = ["Pick a role", "Credentials fill in", "Click Sign in"];

export function LoginCard({ demoAccounts }: { demoAccounts: DemoAccount[] }) {
  const [state, dispatch, pending] = useActionState(loginAction, initialState);
  const [selected, setSelected] = useState<DemoRole | null>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: "", password: "" } });

  if (state.mustChangePassword) {
    return (
      <div className="flex w-full flex-col gap-4 rounded-xl border border-border bg-card/80 p-6 shadow-glow backdrop-blur-md min-[640px]:p-8">
        <h1 className="text-xl font-semibold tracking-tight">Set a new password</h1>
        <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          This account is using a temporary password. Choose a new one to continue.
        </div>
        <ChangePasswordFields />
      </div>
    );
  }

  function fillDemo(account: DemoAccount) {
    setValue("email", account.email, { shouldValidate: true });
    setValue("password", account.password, { shouldValidate: true });
    setSelected(account.role);
    submitRef.current?.focus();
  }

  function onValid(data: FormValues) {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    startTransition(() => {
      dispatch(formData);
    });
  }

  const emailField = register("email", { required: "Email is required" });
  const passwordField = register("password", { required: "Password is required" });

  return (
    <div
      className="animate-in-up relative w-full rounded-xl border border-border bg-card/80 p-6 shadow-glow backdrop-blur-md min-[640px]:p-8"
      style={stagger(2)}
    >
      <div
        aria-hidden
        className="absolute inset-x-8 -top-px h-px bg-linear-to-r from-transparent via-primary to-transparent"
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">Sign in to your workspace</h2>
          <p className="text-xs text-muted-foreground">
            {demoAccounts.length > 0
              ? "Explore the live demo with a ready-made account, or use your own credentials."
              : "Enter your credentials to continue."}
          </p>
        </div>

        {demoAccounts.length > 0 ? (
          <section aria-labelledby="demo-heading" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 id="demo-heading" className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Try the demo
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--glow-strong)]" />
                No sign-up
              </span>
            </div>

            <ol className="flex items-center gap-2 text-[11px] text-muted-foreground">
              {STEPS.map((step, index) => (
                <li key={step} className="flex items-center gap-1.5">
                  <span className="flex size-4 items-center justify-center rounded-full bg-primary/12 text-[10px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((account) => {
                const meta = DEMO_ROLE_META[account.role];
                const active = selected === account.role;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => fillDemo(account)}
                    aria-pressed={active}
                    className={cn(
                      "group relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border bg-background/60 px-2 py-3 text-center transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-px hover:border-primary/30 hover:shadow-glow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      active ? "border-primary/60 shadow-glow" : "border-border",
                    )}
                  >
                    {active ? (
                      <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    ) : null}
                    <span className={cn("flex size-9 items-center justify-center rounded-md", meta.tone)}>
                      <meta.icon className="size-4" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-xs font-semibold">{meta.shortLabel}</span>
                      <span className="text-[11px] text-muted-foreground">{meta.summary}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...emailField}
              onChange={(event) => {
                setSelected(null);
                return emailField.onChange(event);
              }}
            />
            {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...passwordField}
              onChange={(event) => {
                setSelected(null);
                return passwordField.onChange(event);
              }}
            />
            {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
          </div>

          {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}

          <Button ref={submitRef} type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>

          <p aria-live="polite" className="min-h-4 text-center text-xs text-muted-foreground">
            {selected ? (
              <>
                <span className="font-medium text-foreground">{DEMO_ROLE_META[selected].label}</span> credentials
                filled in — click Sign in to continue.
              </>
            ) : null}
          </p>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Access is provisioned by your administrator. Contact HR if you need an account.
        </p>
      </div>
    </div>
  );
}
