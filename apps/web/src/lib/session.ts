import { serverFetch } from "@/lib/api";

export interface Me {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "hr_manager" | "employee";
  mustChangePassword: boolean;
}

// Middleware only checks that a cookie exists (cheap, no network call). This
// is the real check — an expired or invalid token still looks present to
// middleware, but fails here, which is what actually gates protected pages.
export async function getMe(): Promise<Me | null> {
  const res = await serverFetch("/api/auth/me");

  if (!res.ok) {
    return null;
  }

  const body = (await res.json()) as { data: Me };
  return body.data;
}
