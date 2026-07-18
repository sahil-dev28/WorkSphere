"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

// Merges a patch into the current URL's search params (a null value deletes
// the key, keeping defaults out of the URL) and re-navigates — the RSC page
// re-renders against the new params, no client-side data store involved.
export function useDirectoryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(patch)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      const query = params.toString();
      // pathname is always this page's own route at runtime; typedRoutes just
      // can't prove that for a value coming from usePathname().
      router.replace((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
    },
    [pathname, router, searchParams],
  );
}
