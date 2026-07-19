import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@WorkSphere/ui/components/button";
import { Card, CardContent } from "@WorkSphere/ui/components/card";

import { employeeRoles } from "@/lib/enums";
import { serverFetch } from "@/lib/api";
import { joinTimestamp } from "@/lib/format";
import {
  canAssignSuperAdmin,
  canCreateEmployee,
  canDeleteEmployee,
  canEditEmployee,
  canReassignManager,
  editableFieldsFor,
} from "@/lib/permissions";
import { getDescendantIds } from "@/lib/org-hierarchy";
import { getMe } from "@/lib/session";
import type { Employee } from "@/lib/types";

import { buildDialogHref } from "./dialog-href";
import { DirectoryFilters } from "./filters";
import { EmployeeCards } from "./employee-cards";
import { EmployeeDialog, type EmployeeDialogMode } from "./employee-dialog";
import { EmployeeTable } from "./employee-table";
import { DirectoryPagination } from "./pagination";
import { SearchInput } from "./search-input";
import type { DirectoryRow, DirectorySearchParams, SortKey } from "./types";

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

function filterAndSort(employees: Employee[], params: DirectorySearchParams): Employee[] {
  const q = params.q?.trim().toLowerCase() ?? "";
  let result = employees;

  if (q) {
    result = result.filter(
      (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
    );
  }
  if (params.department && params.department !== "all") {
    result = result.filter((e) => e.department === params.department);
  }
  if (params.role && params.role !== "all") {
    result = result.filter((e) => e.role === params.role);
  }
  if (params.status && params.status !== "all") {
    result = result.filter((e) => e.status === params.status);
  }

  const sort: SortKey = (params.sort as SortKey | undefined) ?? "name_asc";
  return [...result].sort((a, b) => {
    switch (sort) {
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "joined_desc":
        return joinTimestamp(b.joiningDate) - joinTimestamp(a.joiningDate);
      case "joined_asc":
        return joinTimestamp(a.joiningDate) - joinTimestamp(b.joiningDate);
      case "name_asc":
      default:
        return a.name.localeCompare(b.name);
    }
  });
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

  // GET /api/employees is admin-only by backend design (employees only ever
  // see their own record via GET /:id) — the frontend shouldn't wait for a
  // 403 to find that out, since this screen isn't reachable for that role.
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
  const canDelete = canDeleteEmployee(user);

  const managerNames = new Map(employees.map((e) => [e._id, e.name]));
  const filtered = filterAndSort(employees, params);

  const page = Math.max(1, Number(params.page) || 1);
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageSlice = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const rows: DirectoryRow[] = pageSlice.map((employee) => ({
    employee,
    managerName: employee.reportingManager
      ? (managerNames.get(employee.reportingManager) ?? "Unknown manager")
      : "No manager",
  }));

  const editableIds = new Set(
    pageSlice.filter((employee) => canEditEmployee(user, employee)).map((e) => e._id),
  );

  const roleOptions = employeeRoles.filter((r) => r !== "super_admin" || canAssignSuperAdmin(user));

  // The dialog is driven entirely by ?action=/&employeeId= — no local open
  // state, so it survives a full page reload and is trivially deep-linkable.
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

  // Self + all descendants (direct and indirect reports) excluded so the
  // reporting-manager select can't even offer a choice that would create a
  // circular chain — not just reject it after the fact.
  const excludedManagerIds =
    dialogMode === "edit" && dialogEmployee
      ? new Set([dialogEmployee._id, ...getDescendantIds(dialogEmployee._id, employees)])
      : new Set<string>();

  // Only hr_manager/super_admin can ever be a valid reportingManager — the
  // dialog further narrows this down to the target's own department's head
  // (or the CEO) as the role/department fields change live, but it can only
  // filter from what it's given here.
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
            <Button
              render={<Link href={buildDialogHref(params, { action: "add" })} />}
              nativeButton={false}
              className="shrink-0"
            >
              <Plus /> Add Employee
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card className="hidden min-[860px]:block">
        <EmployeeTable
          rows={rows}
          params={params}
          canManage={canManage}
          canDelete={canDelete}
          editableIds={editableIds}
        />
        <DirectoryPagination page={page} pageSize={PAGE_SIZE} total={filtered.length} />
      </Card>

      <div className="flex flex-col gap-2 min-[860px]:hidden">
        <EmployeeCards rows={rows} params={params} />
        <DirectoryPagination page={page} pageSize={PAGE_SIZE} total={filtered.length} />
      </div>

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
