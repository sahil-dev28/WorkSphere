import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/constants";

// Cheap gate: presence only, no verification. The real check — is the token
// actually valid, has the user been deactivated — happens server-side via
// getMe() in the (app) layout, which every protected route goes through.
export function proxy(request: NextRequest): NextResponse {
  const hasSession = request.cookies.has(AUTH_COOKIE_NAME);
  const isLoginPath = request.nextUrl.pathname === "/login";

  if (isLoginPath) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
