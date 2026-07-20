"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { Card } from "@WorkSphere/ui/components/card";

import { canDeleteEmployee, canEditEmployee } from "@/lib/permissions";
import type { Me } from "@/lib/session";

import { DirectoryPagination } from "./pagination";
import { EmployeeCards } from "./employee-cards";
import { EmployeeTable } from "./employee-table";
import { employeesTableOptions } from "./queries";
import type { DirectorySearchParams } from "./types";

const PARAM_KEYS = ["q", "department", "role", "status", "sort", "page", "action", "employeeId"] as const;

export function toDirectoryParams(searchParams: URLSearchParams): DirectorySearchParams {
  const obj: DirectorySearchParams = {};
  for (const key of PARAM_KEYS) {
    const value = searchParams.get(key);
    if (value) obj[key] = value;
  }
  return obj;
}

export function DirectoryTable({
  user,
  canManage,
  pageSize,
}: {
  user: Me;
  canManage: boolean;
  pageSize: number;
}) {
  const searchParams = useSearchParams();
  const params = toDirectoryParams(searchParams);
  const page = Math.max(1, Number(params.page) || 1);

  const { data, isError } = useQuery(
    employeesTableOptions({
      q: params.q,
      department: params.department,
      role: params.role,
      status: params.status,
      sort: params.sort,
      page: params.page,
      limit: pageSize,
    }),
  );

  if (isError) {
    return (
      <Card>
        <p className="py-6 text-center text-xs text-muted-foreground">
          Could not load employees. Try again shortly.
        </p>
      </Card>
    );
  }

  const employees = data?.data ?? [];
  const total = data?.total ?? 0;
  const canDelete = canDeleteEmployee(user);
  const editableIds = new Set(
    employees.filter((employee) => canEditEmployee(user, employee)).map((e) => e._id),
  );

  return (
    <>
      <Card className="hidden min-[860px]:block">
        <EmployeeTable
          employees={employees}
          params={params}
          canManage={canManage}
          canDelete={canDelete}
          editableIds={editableIds}
        />
        <DirectoryPagination page={page} pageSize={pageSize} total={total} />
      </Card>

      <div className="flex flex-col gap-2 min-[860px]:hidden">
        <EmployeeCards employees={employees} params={params} />
        <DirectoryPagination page={page} pageSize={pageSize} total={total} />
      </div>
    </>
  );
}
