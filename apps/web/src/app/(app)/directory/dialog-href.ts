import type { Route } from "next";

import type { DirectorySearchParams } from "./types";

// Plain function, not a hook — safe to call from both the server-rendered
// table/cards and any client component, unlike useDirectoryParams. Always
// targets /directory itself (just different query strings), so the Route
// cast is safe — typedRoutes just can't prove that for a built string.
export function buildDialogHref(
  params: DirectorySearchParams,
  patch: { action?: string; employeeId?: string },
): Route {
  const merged: Record<string, string | undefined> = { ...params, ...patch };
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(merged)) {
    if (value) search.set(key, value);
  }

  const qs = search.toString();
  return (qs ? `/directory?${qs}` : "/directory") as Route;
}
