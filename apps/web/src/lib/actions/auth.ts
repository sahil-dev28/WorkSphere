"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { serverFetch, type ApiError } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { demoCredentials } from "@/lib/demo-credentials";
import { isDemoRole } from "@/lib/demo-roles";

async function setSessionCookie(res: Response): Promise<boolean> {
  const setCookieHeader = res.headers.get("set-cookie");
  const token = setCookieHeader?.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))?.[1];

  if (!token) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export interface LoginState {
  error?: string;
  mustChangePassword?: boolean;
}

type SignInResult = { ok: true; mustChangePassword: boolean } | { ok: false; error: string };

async function signIn(email: unknown, password: unknown): Promise<SignInResult> {
  let res: Response;
  try {
    res = await serverFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { ok: false, error: "Couldn't reach the server. Try again shortly." };
  }

  const body = (await res.json().catch(() => ({}))) as {
    data?: { mustChangePassword: boolean };
  } & ApiError;

  if (!res.ok) {
    return { ok: false, error: body.error ?? "Login failed" };
  }

  if (!(await setSessionCookie(res))) {
    return { ok: false, error: "Sign-in failed. Try again." };
  }
  return { ok: true, mustChangePassword: Boolean(body.data?.mustChangePassword) };
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const result = await signIn(formData.get("email"), formData.get("password"));

  if (!result.ok) {
    return { error: result.error };
  }

  if (result.mustChangePassword) {
    return { mustChangePassword: true };
  }

  redirect("/dashboard");
}

const DEMO_UNAVAILABLE = "This demo account isn't available right now.";

export async function demoLoginAction(role: string): Promise<{ error: string } | undefined> {
  if (!isDemoRole(role)) {
    return { error: "Unknown demo role" };
  }

  const credentials = demoCredentials(role);
  if (!credentials) {
    return { error: DEMO_UNAVAILABLE };
  }

  const result = await signIn(credentials.email, credentials.password);
  if (!result.ok) {
    return { error: DEMO_UNAVAILABLE };
  }

  redirect(result.mustChangePassword ? "/change-password" : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await serverFetch("/api/auth/logout", { method: "POST" });

  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);

  redirect("/login");
}

export interface ChangePasswordState {
  error?: string;
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");

  const res = await serverFetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const body = (await res.json()) as ApiError;

  if (!res.ok) {
    return { error: body.error ?? "Could not change password" };
  }

  redirect("/dashboard");
}
