"use client";

import { createContext, use, useState } from "react";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

// Plain component state, not persisted — a fresh page load always starts
// expanded. Lives in the (app) layout so it survives client-side navigation
// between pages without resetting.
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext
      value={{ collapsed, toggle: () => setCollapsed((v) => !v) }}
    >
      {children}
    </SidebarContext>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = use(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}
