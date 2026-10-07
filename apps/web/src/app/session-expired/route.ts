import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/constants";

// The proxy treats any cookie as a session, so a stale one must be cleared or /login and /dashboard redirect forever.
export function GET(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
