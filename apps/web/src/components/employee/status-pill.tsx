import { Badge } from "@WorkSphere/ui/components/badge";

import { STATUS_LABELS } from "@/lib/enums";
import type { Employee } from "@/lib/types";

const STATUS_VARIANT: Record<Employee["status"], "success" | "warning" | "destructive"> = {
  active: "success",
  on_leave: "warning",
  terminated: "destructive",
};

export function StatusPill({ status }: { status: Employee["status"] }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}
