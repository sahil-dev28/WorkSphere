import { Badge } from "@WorkSphere/ui/components/badge";

import { ROLE_LABELS } from "@/lib/enums";
import type { Employee } from "@/lib/types";

// Exact mapping from theme.md's Employees Table section.
const ROLE_STYLES: Record<Employee["role"], string> = {
  super_admin: "bg-secondary/10 text-secondary",
  hr_manager: "bg-accent/20 text-accent-foreground",
  employee: "bg-muted text-muted-foreground",
};

export function RolePill({ role }: { role: Employee["role"] }) {
  return <Badge className={ROLE_STYLES[role]}>{ROLE_LABELS[role]}</Badge>;
}
