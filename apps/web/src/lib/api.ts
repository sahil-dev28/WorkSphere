import { cookies } from "next/headers";

import { env } from "@WorkSphere/env/web";

import { AUTH_COOKIE_NAME } from "@/lib/constants";

export interface ApiError {
  error?: string;
}

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
