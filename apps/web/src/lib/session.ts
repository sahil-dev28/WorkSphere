import { cache } from "react";

import { serverFetch } from "@/lib/api";
import type { employeeRoles } from "@/lib/enums";

export interface Me {
  id: string;
  name: string;
  email: string;
  role: (typeof employeeRoles)[number];
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
