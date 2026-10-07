import type { LucideIcon } from "lucide-react";
import { KeyRound, LogOut, Plus, Repeat, SunMoon, Upload } from "lucide-react";
import type { Route } from "next";

import { getMobileNavItems, getSidebarNavItems } from "@/components/shell/nav-items";
import type { DemoSession } from "@/lib/demo-credentials";
import { DEMO_ROLE_META, type DemoRole } from "@/lib/demo-roles";
import type { Me } from "@/lib/session";

export type CommandRun =
  | { type: "navigate"; href: Route }
  | { type: "theme" }
  | { type: "logout" }
  | { type: "demo"; role: DemoRole };

export interface CommandItem {
  id: string;
  group: "Pages" | "Actions" | "Demo";
  label: string;
  keywords?: string;
  icon: LucideIcon;
  run: CommandRun;
}

export function buildCommandItems({ role, demo }: { role: Me["role"]; demo?: DemoSession | null }): CommandItem[] {
  const pages = [...getMobileNavItems(role), ...getSidebarNavItems(role)].filter(
    (item, i, all) => all.findIndex((other) => other.href === item.href) === i,
  );

  const items: CommandItem[] = pages.map((page) => ({
    id: `page:${page.href}`,
    group: "Pages",
    label: page.label,
    icon: page.icon,
    run: { type: "navigate", href: page.href },
  }));

  if (role !== "employee") {
    items.push(
      {
        id: "action:add",
        group: "Actions",
        label: "Add employee",
        keywords: "new hire create person",
        icon: Plus,
        run: { type: "navigate", href: "/directory?action=add" as Route },
      },
      {
        id: "action:import",
        group: "Actions",
        label: "Import CSV",
        keywords: "bulk upload spreadsheet",
        icon: Upload,
        run: { type: "navigate", href: "/directory?action=import" as Route },
      },
    );
  }

  items.push(
    { id: "action:theme", group: "Actions", label: "Toggle theme", keywords: "dark light mode", icon: SunMoon, run: { type: "theme" } },
    {
      id: "action:password",
      group: "Actions",
      label: "Change password",
      keywords: "security credentials",
      icon: KeyRound,
      run: { type: "navigate", href: "/change-password" },
    },
    { id: "action:logout", group: "Actions", label: "Log out", keywords: "sign out exit", icon: LogOut, run: { type: "logout" } },
  );

  for (const other of demo?.available.filter((r) => r !== demo.current) ?? []) {
    items.push({
      id: `demo:${other}`,
      group: "Demo",
      label: `Switch to ${DEMO_ROLE_META[other].label}`,
      keywords: "demo role",
      icon: Repeat,
      run: { type: "demo", role: other },
    });
  }

  return items;
}

export function filterCommandItems(items: CommandItem[], query: string): CommandItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  return items.filter((item) => `${item.label} ${item.keywords ?? ""}`.toLowerCase().includes(needle));
}
