"use client";

import { useSidebar } from "./sidebar-provider";

export function SidebarCollapseProbe() {
  const { toggle } = useSidebar();
  return (
    <button type="button" onClick={toggle}>
      collapse
    </button>
  );
}
