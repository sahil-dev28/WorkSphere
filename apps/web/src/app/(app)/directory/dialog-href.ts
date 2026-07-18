import type { Route } from "next";

import type { DirectorySearchParams } from "./types";

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
