import { Download, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@WorkSphere/ui/components/button";
import { Card, CardContent } from "@WorkSphere/ui/components/card";

import type { EmployeesTableParams } from "@/lib/actions/employees";
import { employeeRoles } from "@/lib/enums";
import { serverFetch } from "@/lib/api";
import {
  canAssignSuperAdmin,
  canCreateEmployee,
  canEditEmployee,
  canReassignManager,
  editableFieldsFor,
} from "@/lib/permissions";
import { getDescendantIds } from "@/lib/org-hierarchy";
import { getQueryClient } from "@/lib/query-client";
import { getMe } from "@/lib/session";
import type { Employee } from "@/lib/types";

import { buildDialogHref } from "./dialog-href";
import { DirectoryFilters } from "./filters";
import { DirectoryTable } from "./directory-table";
import { EmployeeDialog, type EmployeeDialogMode } from "./employee-dialog";
import { employeesTableOptions } from "./queries";
import { ImportCsvDialog } from "./import-csv-dialog";
import { SearchInput } from "./search-input";
import type { DirectorySearchParams } from "./types";

const PAGE_SIZE = 10;

async function getEmployees(): Promise<{ data: Employee[] | null; forbidden: boolean }> {
  const res = await serverFetch("/api/employees");

  if (res.status === 403) {
    return { data: null, forbidden: true };
  }
  if (!res.ok) {
    return { data: null, forbidden: false };
  }

  const body = (await res.json()) as { data: Employee[] };
  return { data: body.data, forbidden: false };
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<DirectorySearchParams>;
}) {
  const [user, params] = await Promise.all([getMe(), searchParams]);

  if (!user) {
    redirect("/login");
  }

  if (user.role === "employee") {
    redirect("/dashboard");
  }

  const { data: employees, forbidden } = await getEmployees();

  if (forbidden || !employees) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Card>
          <CardContent className="py-6 text-xs text-muted-foreground">
            {forbidden
              ? "You don't have access to the employee directory."
              : "Could not load the directory. Try again shortly."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const canManage = canCreateEmployee(user);

  const managerNames = new Map(employees.map((e) => [e._id, e.name]));

  const queryClient = getQueryClient();
  const tableParams: EmployeesTableParams = {
    q: params.q,
    department: params.department,
    role: params.role,
    status: params.status,
    sort: params.sort,
    page: params.page,
    limit: PAGE_SIZE,
  };
  await queryClient.prefetchQuery(employeesTableOptions(tableParams));

  const roleOptions = employeeRoles.filter((r) => r !== "super_admin" || canAssignSuperAdmin(user));

  const showImportDialog = params.action === "import" && canManage;

  let dialogMode: EmployeeDialogMode | null = null;
  let dialogEmployee: Employee | undefined;

  if (params.action === "add" && canManage) {
    dialogMode = "add";
  } else if ((params.action === "edit" || params.action === "view") && params.employeeId) {
    dialogEmployee = employees.find((e) => e._id === params.employeeId);
    if (dialogEmployee) {
      const canEditThis = canEditEmployee(user, dialogEmployee);
      dialogMode = params.action === "edit" && canEditThis ? "edit" : "view";
    }
  }

  const excludedManagerIds =
    dialogMode === "edit" && dialogEmployee
      ? new Set([dialogEmployee._id, ...getDescendantIds(dialogEmployee._id, employees)])
      : new Set<string>();

  const managerRoster = employees
    .filter((e) => e.role !== "employee" && !excludedManagerIds.has(e._id))
    .map((e) => ({ _id: e._id, name: e.name, designation: e.designation, role: e.role, department: e.department }));

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardContent className="flex flex-col gap-3 py-3 min-[700px]:flex-row min-[700px]:items-center">
          <SearchInput defaultValue={params.q ?? ""} />
          <DirectoryFilters
            department={params.department ?? "all"}
            role={params.role ?? "all"}
            status={params.status ?? "all"}
            sort={params.sort ?? "name_asc"}
          />
          {canManage ? (
            <div className="flex shrink-0 items-center gap-3">
              <a
                href="/employee-import-template.csv"
                download
                className="text-xs whitespace-nowrap text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                <Download className="mr-1 inline size-3" />
                Template
              </a>
              <Button
                render={<Link href={buildDialogHref(params, { action: "import" })} />}
                nativeButton={false}
                variant="outline"
              >
                <Upload /> Import CSV
              </Button>
              <Button
                render={<Link href={buildDialogHref(params, { action: "add" })} />}
                nativeButton={false}
              >
                <Plus /> Add Employee
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <DirectoryTable user={user} canManage={canManage} pageSize={PAGE_SIZE} />
      </HydrationBoundary>

      {showImportDialog ? <ImportCsvDialog /> : null}

      {dialogMode ? (
        <EmployeeDialog
          mode={dialogMode}
          employee={dialogEmployee}
          editableFields={
            dialogMode === "add"
              ? [
                  "name",
                  "email",
                  "phone",
                  "department",
                  "designation",
                  "salary",
                  "joiningDate",
                  "status",
                  "role",
                  "profileImage",
                ]
              : editableFieldsFor(user, dialogEmployee!)
          }
          canEditRole={dialogMode !== "view"}
          roleOptions={roleOptions}
          canReassignManager={canReassignManager(user)}
          managerRoster={managerRoster}
          managerName={
            dialogEmployee?.reportingManager
              ? (managerNames.get(dialogEmployee.reportingManager) ?? null)
              : null
          }
        />
      ) : null}
    </div>
  );
}
