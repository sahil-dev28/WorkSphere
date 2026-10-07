"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const PAGE_PRESERVING_KEYS = new Set(["page", "action", "employeeId"]);

export function useDirectoryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      if (Object.keys(patch).some((key) => !PAGE_PRESERVING_KEYS.has(key))) {
        params.delete("page");
      }

      for (const [key, value] of Object.entries(patch)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      const query = params.toString();
      router.replace((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
    },
    [pathname, router, searchParams],
  );
}
