import { Badge } from "@WorkSphere/ui/components/badge";

import { STATUS_LABELS } from "@/lib/enums";
import type { Employee } from "@/lib/types";

const STATUS_STYLES: Record<Employee["status"], string> = {
  active: "bg-primary/10 text-primary",
  on_leave: "bg-accent/20 text-accent-foreground",
  terminated: "bg-destructive/10 text-destructive",
};

export function StatusPill({ status }: { status: Employee["status"] }) {
  return <Badge className={STATUS_STYLES[status]}>{STATUS_LABELS[status]}</Badge>;
}
