import type { LucideIcon } from "lucide-react";
import { KeyRound, LayoutDashboard, Network, User, Users } from "lucide-react";
import type { Route } from "next";

import type { Me } from "@/lib/session";

export interface NavItem {
  label: string;
  href: Route;
  icon: LucideIcon;
}

const DASHBOARD: NavItem = { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard };
const DIRECTORY: NavItem = { label: "Directory", href: "/directory", icon: Users };
const ORG_CHART: NavItem = { label: "Org Chart", href: "/org-chart", icon: Network };
const MY_PROFILE: NavItem = { label: "My Profile", href: "/profile", icon: User };
const CHANGE_PASSWORD: NavItem = {
  label: "Change Password",
  href: "/change-password",
  icon: KeyRound,
};

// super_admin/hr_manager get the full nav; employee's world is much smaller —
// no Directory or Org Chart, since the backend 403s those routes for that role.
export function getSidebarNavItems(role: Me["role"]): NavItem[] {
  if (role === "employee") {
    return [DASHBOARD, MY_PROFILE, CHANGE_PASSWORD];
  }
  return [DASHBOARD, DIRECTORY, ORG_CHART, MY_PROFILE, CHANGE_PASSWORD];
}

// Layout spec fixes this at exactly 3 tabs. For employee, Directory doesn't
// apply, so Change Password takes its place to keep 3 meaningful tabs.
export function getMobileNavItems(role: Me["role"]): NavItem[] {
  if (role === "employee") {
    return [DASHBOARD, MY_PROFILE, CHANGE_PASSWORD];
  }
  return [DASHBOARD, DIRECTORY, MY_PROFILE];
}
