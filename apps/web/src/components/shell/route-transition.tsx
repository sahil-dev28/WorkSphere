"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

// Keyed on pathname so search-param updates and URL-driven dialogs don't cross-fade the page.
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ViewTransition key={pathname} default="none" enter="auto" exit="auto">
      {children}
    </ViewTransition>
  );
}
