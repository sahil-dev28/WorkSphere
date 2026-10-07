import { Badge } from "@WorkSphere/ui/components/badge";

import { ROLE_LABELS } from "@/lib/enums";
import type { Employee } from "@/lib/types";

const ROLE_BADGE: Record<
  Employee["role"],
  { variant: "default" | "secondary"; className?: string }
> = {
  super_admin: { variant: "default" },
  hr_manager: { variant: "secondary", className: "bg-chart-3/12 text-chart-3" },
  employee: { variant: "secondary" },
};

export function RolePill({ role }: { role: Employee["role"] }) {
  const { variant, className } = ROLE_BADGE[role];
  return (
    <Badge variant={variant} className={className}>
      {ROLE_LABELS[role]}
    </Badge>
  );
}
