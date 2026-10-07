import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Network, User, Users } from "lucide-react";
import type { Route } from "next";

import type { Me } from "@/lib/session";

export interface NavItem {
  label: string;
  href: Route;
  icon: LucideIcon;
  group: "workspace" | "account";
}

const DASHBOARD: NavItem = { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "workspace" };
const EMPLOYEES: NavItem = { label: "Employees", href: "/directory", icon: Users, group: "workspace" };
const ORGANIZATION: NavItem = { label: "Organization", href: "/org-chart", icon: Network, group: "workspace" };
const MY_PROFILE: NavItem = { label: "My Profile", href: "/profile", icon: User, group: "account" };

export function getSidebarNavItems(role: Me["role"]): NavItem[] {
  if (role === "employee") {
    return [MY_PROFILE];
  }
  return [DASHBOARD, EMPLOYEES, ORGANIZATION, MY_PROFILE];
}

export function getMobileNavItems(role: Me["role"]): NavItem[] {
  if (role === "employee") {
    return [DASHBOARD, MY_PROFILE];
  }
  return [DASHBOARD, EMPLOYEES, ORGANIZATION, MY_PROFILE];
}
