import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/constants";

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
