import type { Route } from "next";

export const AUTH_COOKIE_NAME = "token";

// Route handler paths aren't part of typedRoutes, which only covers pages.
export const SESSION_EXPIRED_PATH = "/session-expired" as Route;
