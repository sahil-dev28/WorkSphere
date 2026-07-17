"use client";

import { useActionState } from "react";

import { Button } from "@WorkSphere/ui/components/button";
import { Card, CardContent } from "@WorkSphere/ui/components/card";
import { Input } from "@WorkSphere/ui/components/input";
import { Label } from "@WorkSphere/ui/components/label";

import { ChangePasswordFields } from "@/components/auth/change-password-fields";
import { loginAction, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = {};

export function LoginCard() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  if (state.mustChangePassword) {
    return (
      <Card className="w-full max-w-[420px]">
        <CardContent className="flex flex-col gap-4 py-2">
          <h1 className="text-xl font-semibold tracking-tight">Set a new password</h1>
          <div className="bg-muted px-3 py-2 text-xs text-muted-foreground">
            This account is using a temporary password. Choose a new one to continue.
          </div>
          <ChangePasswordFields />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[420px]">
      <CardContent className="flex flex-col gap-6 py-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
            W
          </div>
          <span className="text-sm font-semibold tracking-tight">WorkSphere</span>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-xs text-muted-foreground">
            Enter your credentials to access your workspace.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Access is provisioned by your administrator. Contact HR if you need an account.
        </p>
      </CardContent>
    </Card>
  );
}
