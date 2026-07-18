import { Plus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@WorkSphere/ui/components/avatar";
import { Badge } from "@WorkSphere/ui/components/badge";
import { Button } from "@WorkSphere/ui/components/button";
import { Card, CardContent } from "@WorkSphere/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@WorkSphere/ui/components/table";
import { cn } from "@WorkSphere/ui/lib/utils";

import { serverFetch } from "@/lib/api";
import { departments, employeeRoles, employeeStatuses, ROLE_LABELS, STATUS_LABELS } from "@/lib/enums";
import { initials, joinTimestamp } from "@/lib/format";
import type { Me } from "@/lib/session";
import { getMe } from "@/lib/session";

import { DirectoryTableRow } from "./directory-table-row";
import { EmployeeRowActions } from "./employee-row-actions";
import { SearchInput } from "./search-input";
import { UrlSelect } from "./url-select";

interface EmployeeListItem {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  joiningDate: string;
  status: "active" | "on_leave" | "terminated";
  role: "super_admin" | "hr_manager" | "employee";
  reportingManager: string | null;
  profileImage: string | null;
}

const SORT_OPTIONS = [
  { value: "name", label: "Name (A–Z)" },
  { value: "joiningDate", label: "Joining Date (Newest)" },
];

// GET /api/employees is authorize("super_admin", "hr_manager")-gated on the
// backend — an employee account gets a real 403 here, not an empty list.
// Distinguished from other failures so the page can say so instead of
// looking broken.
async function getEmployees(): Promise<{ data: EmployeeListItem[] | null; forbidden: boolean }> {
  const res = await serverFetch("/api/employees");

  if (res.status === 403) {
    return { data: null, forbidden: true };
  }
  if (!res.ok) {
    return { data: null, forbidden: false };
  }

  const body = (await res.json()) as { data: EmployeeListItem[] };
  return { data: body.data, forbidden: false };
}

function statusPillClass(status: EmployeeListItem["status"]): string {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "on_leave":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "terminated":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
  }
}

function StatusPill({ status }: { status: EmployeeListItem["status"] }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", statusPillClass(status))}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

function canManageEmployees(role: Me["role"]): boolean {
  return role === "super_admin" || role === "hr_manager";
}

interface DirectoryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const user = await getMe();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const departmentFilter = typeof params.department === "string" ? params.department : "all";
  const roleFilter = typeof params.role === "string" ? params.role : "all";
  const statusFilter = typeof params.status === "string" ? params.status : "all";
  const sort = params.sort === "joiningDate" ? "joiningDate" : "name";

  const canManage = canManageEmployees(user.role);
  const canDelete = user.role === "super_admin";

  const { data: employees, forbidden } = await getEmployees();

  if (!employees) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-xl font-semibold tracking-tight">Directory</h1>
        <Card>
          <CardContent className="py-10 text-center text-xs text-muted-foreground">
            {forbidden
              ? "You don't have access to the employee directory."
              : "Could not load the directory. Try again shortly."}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Same full list every viewer with access gets — build the id→name lookup
  // from it instead of an extra request per row, and do it before filtering
  // so a manager who's filtered out of the visible set still resolves by name.
  const managerNameById = new Map(employees.map((e) => [e._id, e.name]));

  const filtered = employees.filter((e) => {
    if (departmentFilter !== "all" && e.department !== departmentFilter) return false;
    if (roleFilter !== "all" && e.role !== roleFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (q && !e.name.toLowerCase().includes(q) && !e.email.toLowerCase().includes(q)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) =>
    sort === "joiningDate"
      ? joinTimestamp(b.joiningDate) - joinTimestamp(a.joiningDate)
      : a.name.localeCompare(b.name),
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold tracking-tight">Directory</h1>
          <span className="text-xs text-muted-foreground">{sorted.length} employees</span>
        </div>
        {canManage ? (
          <Button render={<Link href={"/employees/new" as Route} />} nativeButton={false} size="sm">
            <Plus className="size-3.5" />
            Add Employee
          </Button>
        ) : null}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-3 min-[860px]:flex-row min-[860px]:items-center">
          <SearchInput
            paramName="q"
            placeholder="Search by name or email..."
            className="min-[860px]:flex-1"
          />
          <div className="flex flex-wrap gap-2">
            <UrlSelect
              paramName="department"
              allLabel="All Departments"
              options={departments.map((d) => ({ value: d, label: d }))}
            />
            <UrlSelect
              paramName="role"
              allLabel="All Roles"
              options={employeeRoles.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
            />
            <UrlSelect
              paramName="status"
              allLabel="All Statuses"
              options={employeeStatuses.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
            />
            <UrlSelect paramName="sort" options={SORT_OPTIONS} />
          </div>
        </CardContent>
      </Card>

      {/* Desktop table */}
      <Card className="hidden min-[860px]:block" size="sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reporting Manager</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No employees match these filters.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((employee) => (
                <DirectoryTableRow key={employee._id} href={`/employees/${employee._id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        {employee.profileImage ? (
                          <AvatarImage src={employee.profileImage} alt="" />
                        ) : null}
                        <AvatarFallback>{initials(employee.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-xs font-medium">{employee.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {employee.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>
                    <StatusPill status={employee.status} />
                  </TableCell>
                  <TableCell>
                    {employee.reportingManager
                      ? (managerNameById.get(employee.reportingManager) ?? "Unknown")
                      : "No manager"}
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <EmployeeRowActions
                        employeeId={employee._id}
                        employeeName={employee.name}
                        canDelete={canDelete}
                      />
                    ) : null}
                  </TableCell>
                </DirectoryTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile card stack */}
      <div className="flex flex-col gap-2 min-[860px]:hidden">
        {sorted.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-xs text-muted-foreground">
              No employees match these filters.
            </CardContent>
          </Card>
        ) : (
          sorted.map((employee) => (
            <Link key={employee._id} href={`/employees/${employee._id}` as Route}>
              <Card>
                <CardContent className="flex items-center gap-3 py-3">
                  <Avatar className="size-9 shrink-0">
                    {employee.profileImage ? (
                      <AvatarImage src={employee.profileImage} alt="" />
                    ) : null}
                    <AvatarFallback>{initials(employee.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-medium">{employee.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {employee.designation} · {employee.department}
                    </span>
                  </div>
                  <StatusPill status={employee.status} />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* No paginated endpoint yet — the full (already role-filtered,
          soft-delete-excluded) list renders unpaginated. */}
    </div>
  );
}
