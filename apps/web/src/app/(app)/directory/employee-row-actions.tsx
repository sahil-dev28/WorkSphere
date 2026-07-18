"use client";

import { EllipsisVertical } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@WorkSphere/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@WorkSphere/ui/components/dropdown-menu";

import { deleteEmployeeAction } from "@/lib/actions/employees";

export function EmployeeRowActions({
  employeeId,
  employeeName,
  canDelete,
}: {
  employeeId: string;
  employeeName: string;
  canDelete: boolean;
}) {
  const [isDeleting, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete ${employeeName}? This can't be undone from here.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteEmployeeAction(employeeId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${employeeName} deleted`);
      }
    });
  }

  return (
    // Stops the click before it reaches the row's own onClick navigation.
    <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${employeeName}`} />}
        >
          <EllipsisVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/employees/${employeeId}/edit` as Route} />}>
            Edit
          </DropdownMenuItem>
          {canDelete ? (
            <DropdownMenuItem variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
