import { cookies } from "next/headers";

import { env } from "@WorkSphere/env/web";

import { AUTH_COOKIE_NAME } from "@/lib/constants";

// Server-side fetch helper. The browser never talks to Express directly in
// this app — Next is a BFF, so the cookie the browser holds is issued by
// Next itself and has to be forwarded manually on every server-to-server call.
export async function serverFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  return fetch(`${env.NEXT_PUBLIC_SERVER_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      ...(token ? { Cookie: `${AUTH_COOKIE_NAME}=${token}` } : {}),
    },
    cache: "no-store",
  });
}
