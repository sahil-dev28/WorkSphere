import { cache } from "react";

import { serverFetch } from "@/lib/api";

export interface Me {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "hr_manager" | "employee";
  mustChangePassword: boolean;
}

export const getMe = cache(async (): Promise<Me | null> => {
  const res = await serverFetch("/api/auth/me");

  if (!res.ok) {
    return null;
  }

  const body = (await res.json()) as { data: Me };
  return body.data;
});
