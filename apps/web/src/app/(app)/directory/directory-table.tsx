"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Button } from "@WorkSphere/ui/components/button";
import { Card } from "@WorkSphere/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@WorkSphere/ui/components/empty";

import { canDeleteEmployee, canEditEmployee } from "@/lib/permissions";
import type { Me } from "@/lib/session";

import { DirectoryResultsBar } from "./directory-results-bar";
import { DirectoryPagination } from "./pagination";
import { EmployeeCards } from "./employee-cards";
import { EmployeeTable } from "./employee-table";
import { employeesTableOptions } from "./queries";
import type { DirectorySearchParams } from "./types";
import { useDirectoryParams } from "./use-directory-params";

const PARAM_KEYS = ["q", "department", "role", "status", "sort", "page", "action", "employeeId"] as const;
const FILTER_KEYS = ["q", "department", "role", "status"] as const;

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

  const updateParams = useDirectoryParams();
  const hasFilters = FILTER_KEYS.some((key) => params[key]);
  const clearFilters = () => updateParams({ q: null, department: null, role: null, status: null });

  const { data, isError, isFetching, isLoading, refetch } = useQuery(
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
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangle />
            </EmptyMedia>
            <EmptyTitle>Couldn&apos;t load employees</EmptyTitle>
            <EmptyDescription>Check your connection and try again.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </EmptyContent>
        </Empty>
      </Card>
    );
  }

  const employees = data?.data ?? [];
  const total = data?.total ?? 0;
  const canDelete = canDeleteEmployee(user);
  const editableIds = new Set(
    employees.filter((employee) => canEditEmployee(user, employee)).map((e) => e._id),
  );
  const resultsBar = (
    <DirectoryResultsBar total={total} loading={isLoading} hasFilters={hasFilters} onClear={clearFilters} />
  );
  const refetchBar =
    isFetching && !isLoading ? (
      <div aria-hidden className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
        <div className="loading-bar h-full w-1/3 bg-primary" />
      </div>
    ) : null;

  if (!isLoading && employees.length === 0) {
    return (
      <>
        {resultsBar}
        <Card className="relative">
          {refetchBar}
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>{hasFilters ? "No employees match these filters" : "No employees yet"}</EmptyTitle>
              <EmptyDescription>
                {hasFilters
                  ? "Try a different search or clear the filters to see everyone."
                  : "Add your first employee or import a CSV to get started."}
              </EmptyDescription>
            </EmptyHeader>
            {hasFilters ? (
              <EmptyContent>
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </EmptyContent>
            ) : null}
          </Empty>
        </Card>
      </>
    );
  }

  return (
    <>
      {resultsBar}
      <Card className="relative hidden min-[860px]:block">
        {refetchBar}
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
