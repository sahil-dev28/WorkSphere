import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Network, User, Users } from "lucide-react";
import type { Route } from "next";

import type { Me } from "@/lib/session";

export interface NavItem {
  label: string;
  href: Route;
  icon: LucideIcon;
}

const DASHBOARD: NavItem = { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard };
const EMPLOYEES: NavItem = { label: "Employees", href: "/directory", icon: Users };
const ORGANIZATION: NavItem = { label: "Organization", href: "/org-chart", icon: Network };
const MY_PROFILE: NavItem = { label: "My Profile", href: "/profile", icon: User };

// Change Password is no longer a nav link at all — it opens as a dialog now
// (see ChangePasswordDialog), triggered from the sidebar/mobile top bar
// directly rather than routed to.

// Per the layout spec's role visibility matrix: employee's nav is "My
// Profile" only — Dashboard/Employees/Organization are admin/HR-only.
export function getSidebarNavItems(role: Me["role"]): NavItem[] {
  if (role === "employee") {
    return [MY_PROFILE];
  }
  return [DASHBOARD, EMPLOYEES, ORGANIZATION, MY_PROFILE];
}

// Mobile isn't covered by the layout spec — Dashboard stays reachable here
// for employee even though it's dropped from the desktop sidebar, since it's
// still the real post-login landing route and a single-tab bar is a poor
// outcome not worth chasing literal parity with desktop for.
export function getMobileNavItems(role: Me["role"]): NavItem[] {
  if (role === "employee") {
    return [DASHBOARD, MY_PROFILE];
  }
  return [DASHBOARD, EMPLOYEES, ORGANIZATION, MY_PROFILE];
}
