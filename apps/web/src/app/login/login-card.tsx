"use client";

import type { LucideIcon } from "lucide-react";
import { ShieldCheck, User, Users } from "lucide-react";
import { useActionState, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@WorkSphere/ui/components/button";
import { Input } from "@WorkSphere/ui/components/input";
import { Label } from "@WorkSphere/ui/components/label";

import { ChangePasswordFields } from "@/components/auth/change-password-fields";
import { loginAction, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = {};

interface DemoRole {
  role: "super_admin" | "hr_manager" | "employee";
  label: string;
  summary: string;
  email: string;
  password: string;
  icon: LucideIcon;
  badgeClassName: string;
}

// Real, permanent seeded accounts — not fabricated. hr.demo@ was created
// specifically for this (Priya Shah's real password isn't known to us), and
// already driven through its forced-change flow so it's stable long-term.
const DEMO_ROLES: DemoRole[] = [
  {
    role: "super_admin",
    label: "Super Admin",
    summary: "Full access · manage roles & delete",
    email: "admin@worksphere.dev",
    password: "ChangeMe123!",
    icon: ShieldCheck,
    badgeClassName: "bg-primary/15 text-primary",
  },
  {
    role: "hr_manager",
    label: "HR Manager",
    summary: "Create, edit & view · no delete",
    email: "hr.demo@worksphere.dev",
    password: "HrManagerDemo123!",
    icon: Users,
    badgeClassName: "bg-accent/20 text-accent-foreground",
  },
  {
    role: "employee",
    label: "Employee",
    summary: "View & edit own profile only",
    email: "rahul.verma@worksphere.dev",
    password: "RahulNewPass123",
    icon: User,
    badgeClassName: "bg-destructive/10 text-destructive",
  },
];

interface FormValues {
  email: string;
  password: string;
}

export function LoginCard() {
  const [state, dispatch, pending] = useActionState(loginAction, initialState);
  const [filledDemo, setFilledDemo] = useState<DemoRole | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: "", password: "" } });

  if (state.mustChangePassword) {
    return (
      <div className="flex w-full max-w-[400px] flex-col gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Set a new password</h1>
        <div className="bg-muted px-3 py-2 text-xs text-muted-foreground">
          This account is using a temporary password. Choose a new one to continue.
        </div>
        <ChangePasswordFields />
      </div>
    );
  }

  function fillDemo(demo: DemoRole) {
    setValue("email", demo.email);
    setValue("password", demo.password);
    setFilledDemo(demo);
  }

  function onValid(data: FormValues) {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    dispatch(formData);
  }

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Sign in to your workspace</h1>
        <p className="text-xs text-muted-foreground">
          Enter your credentials, or pick a role below to explore the demo.
        </p>
      </div>

      <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-4">
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
              onChange: () => setFilledDemo(null),
            })}
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
            {...register("password", {
              required: "Password is required",
              onChange: () => setFilledDemo(null),
            })}
          />
          {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
        </div>

        {filledDemo ? (
          <p aria-live="polite" className="bg-muted px-3 py-2 text-xs text-muted-foreground">
            Filled in the <span className="font-medium">{filledDemo.label}</span> demo
            credentials — press Sign in to continue.
          </p>
        ) : null}

        {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Sign in as
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-2">
        {DEMO_ROLES.map((demo) => (
          <button
            key={demo.role}
            type="button"
            disabled={pending}
            onClick={() => fillDemo(demo)}
            className="flex cursor-pointer items-center gap-3 border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center ${demo.badgeClassName}`}
            >
              <demo.icon className="size-4" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-semibold">{demo.label}</span>
              <span className="truncate text-xs text-muted-foreground">{demo.summary}</span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Access is provisioned by your administrator. Contact HR if you need an account.
      </p>
    </div>
  );
}
