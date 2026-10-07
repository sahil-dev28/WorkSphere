import type { LucideIcon } from "lucide-react";
import { ShieldCheck, User, Users } from "lucide-react";

export const DEMO_ROLES = ["super_admin", "hr_manager", "employee"] as const;

export type DemoRole = (typeof DEMO_ROLES)[number];

export function isDemoRole(value: unknown): value is DemoRole {
  return typeof value === "string" && (DEMO_ROLES as readonly string[]).includes(value);
}

export const DEMO_ROLE_META: Record<
  DemoRole,
  {
    label: string;
    shortLabel: string;
    summary: string;
    icon: LucideIcon;
    tone: string;
  }
> = {
  super_admin: {
    label: "Super Admin",
    shortLabel: "Admin",
    summary: "Full control",
    icon: ShieldCheck,
    tone: "bg-primary/12 text-primary",
  },
  hr_manager: {
    label: "HR Manager",
    shortLabel: "HR",
    summary: "Manage people",
    icon: Users,
    tone: "bg-chart-3/12 text-chart-3",
  },
  employee: {
    label: "Employee",
    shortLabel: "Employee",
    summary: "Self-service",
    icon: User,
    tone: "bg-muted text-muted-foreground",
  },
};
