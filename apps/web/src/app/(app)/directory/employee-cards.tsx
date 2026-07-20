import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@WorkSphere/ui/components/avatar";

import { StatusPill } from "@/components/employee/status-pill";
import { initials } from "@/lib/format";
import type { Employee } from "@/lib/types";

import { buildDialogHref } from "./dialog-href";
import type { DirectorySearchParams } from "./types";

export function EmployeeCards({
  employees,
  params,
}: {
  employees: Employee[];
  params: DirectorySearchParams;
}) {
  if (employees.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        No employees match these filters.
      </p>
    );
  }

  return (
    <>
      {employees.map((employee) => (
        <Link
          key={employee._id}
          href={buildDialogHref(params, { action: "view", employeeId: employee._id })}
          className="flex items-center gap-3 border border-border bg-card px-3 py-2.5"
        >
          <Avatar className="size-9">
            {employee.profileImage ? <AvatarImage src={employee.profileImage} alt="" /> : null}
            <AvatarFallback>{initials(employee.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium">{employee.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {employee.designation} · {employee.department}
            </span>
          </div>
          <StatusPill status={employee.status} />
        </Link>
      ))}
    </>
  );
}
