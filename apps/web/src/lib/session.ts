import { cache } from "react";

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
//
// Wrapped in React's cache() so calling getMe() from both the (app) layout
// and a page in the same request reuses one result — serverFetch sets
// `cache: "no-store"`, which turns out to disable Next's automatic fetch
// request-memoization too, not just the persistent cache, so without this
// wrapper every getMe() call was a real, independent network round trip.
export const getMe = cache(async (): Promise<Me | null> => {
  const res = await serverFetch("/api/auth/me");

  if (!res.ok) {
    return null;
  }

  const body = (await res.json()) as { data: Me };
  return body.data;
});
