"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { serverFetch, type ApiError } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

async function setSessionCookie(res: Response): Promise<void> {
  const setCookieHeader = res.headers.get("set-cookie");
  const token = setCookieHeader?.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))?.[1];

  if (!token) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export interface LoginState {
  error?: string;
  mustChangePassword?: boolean;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  const res = await serverFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = (await res.json()) as { data?: { mustChangePassword: boolean } } & ApiError;

  if (!res.ok) {
    return { error: body.error ?? "Login failed" };
  }

  await setSessionCookie(res);

  if (body.data?.mustChangePassword) {
    return { mustChangePassword: true };
  }

  redirect("/dashboard");
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
