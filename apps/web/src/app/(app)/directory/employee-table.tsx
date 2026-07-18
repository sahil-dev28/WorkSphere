import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@WorkSphere/ui/components/avatar";
import { Button } from "@WorkSphere/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@WorkSphere/ui/components/table";

import { RolePill } from "@/components/employee/role-pill";
import { STATUS_LABELS } from "@/lib/enums";
import { formatDate, initials } from "@/lib/format";

import { DeleteEmployeeDialog } from "./delete-employee-dialog";
import { buildDialogHref } from "./dialog-href";
import type { DirectoryRow, DirectorySearchParams } from "./types";

// Same token mapping as StatusPill, just a solid dot instead of a tinted pill.
const STATUS_DOT: Record<string, string> = {
  active: "bg-primary",
  on_leave: "bg-accent-foreground",
  terminated: "bg-destructive",
};

export function EmployeeTable({
  rows,
  params,
  canManage,
  canDelete,
  editableIds,
}: {
  rows: DirectoryRow[];
  params: DirectorySearchParams;
  canManage: boolean;
  canDelete: boolean;
  editableIds: Set<string>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Salary</TableHead>
          <TableHead className="w-28 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
              No employees match these filters.
            </TableCell>
          </TableRow>
        ) : (
          rows.map(({ employee }) => (
            <TableRow key={employee._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    {employee.profileImage ? (
                      <AvatarImage src={employee.profileImage} alt="" />
                    ) : null}
                    <AvatarFallback>{initials(employee.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{employee.name}</span>
                    <span className="truncate text-muted-foreground">
                      {employee.employeeId} · {employee.designation}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                  {employee.department}
                </div>
              </TableCell>
              <TableCell>
                <RolePill role={employee.role} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[employee.status]}`} />
                  {STATUS_LABELS[employee.status]}
                </div>
              </TableCell>
              <TableCell>{formatDate(employee.joiningDate)}</TableCell>
              <TableCell>
                {employee.salary !== undefined ? `$${employee.salary.toLocaleString()}` : "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    render={<Link href={buildDialogHref(params, { action: "view", employeeId: employee._id })} />}
                    nativeButton={false}
                    aria-label={`View ${employee.name}`}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                  {canManage && editableIds.has(employee._id) ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={
                        <Link href={buildDialogHref(params, { action: "edit", employeeId: employee._id })} />
                      }
                      nativeButton={false}
                      aria-label={`Edit ${employee.name}`}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  ) : null}
                  {canDelete ? (
                    <DeleteEmployeeDialog
                      employeeId={employee._id}
                      employeeName={employee.name}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${employee.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
