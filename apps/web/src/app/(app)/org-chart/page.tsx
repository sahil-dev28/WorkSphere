import { redirect } from "next/navigation";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import { Badge } from "@WorkSphere/ui/components/badge";
import { Card, CardContent } from "@WorkSphere/ui/components/card";

import { serverFetch } from "@/lib/api";
import { initials } from "@/lib/format";
import { getMe } from "@/lib/session";

interface OrgTreeNode {
  employeeId: string | null;
  name: string;
  designation: string;
  department: string;
  role: string;
  children: OrgTreeNode[];
}

interface DashboardStats {
  totalEmployees: number;
  departmentCounts: { department: string; count: number }[];
}

async function getOrgTree(): Promise<OrgTreeNode[]> {
  const res = await serverFetch("/api/organization/tree");

  if (!res.ok) {
    return [];
  }

  const body = (await res.json()) as { data: OrgTreeNode[] };
  return body.data;
}

async function getStats(): Promise<DashboardStats | null> {
  const res = await serverFetch("/api/dashboard/stats");

  if (!res.ok) {
    return null;
  }

  const body = (await res.json()) as { data: DashboardStats };
  return body.data;
}

interface ManagerGroup {
  manager: OrgTreeNode;
  reports: OrgTreeNode[];
}

// GET /api/organization/tree returns however many reportingManager:null
// roots actually exist, not one — the new layout's banner assumes a single
// "CEO" figure, so this just picks a representative (super_admin if one is
// among the roots, else the first) rather than rendering N banners. Anyone
// who is both a root AND has no reports of their own (a rootless individual
// contributor) won't appear anywhere on this page — that's an inherent gap
// in this flattened design applied to real, non-strictly-hierarchical data,
// not something worked around here.
function flattenManagerGroups(nodes: OrgTreeNode[]): ManagerGroup[] {
  const groups: ManagerGroup[] = [];

  function walk(list: OrgTreeNode[]) {
    for (const node of list) {
      if (node.children.length > 0) {
        groups.push({ manager: node, reports: node.children });
        walk(node.children);
      }
    }
  }

  walk(nodes);
  return groups;
}

export default async function OrgChartPage() {
  const user = await getMe();

  if (!user) {
    redirect("/login");
  }

  // Same pre-emptive bounce as Directory — GET /api/organization/tree is
  // super_admin/hr_manager only, not reachable by employee at all.
  if (user.role === "employee") {
    redirect("/dashboard");
  }

  const [roots, stats] = await Promise.all([getOrgTree(), getStats()]);
  const top = roots.find((r) => r.role === "super_admin") ?? roots[0];
  const managerGroups = flattenManagerGroups(roots);
  const departmentCount = stats?.departmentCounts.filter((d) => d.count > 0).length ?? 0;

  // Lets a report chip jump straight to that person's own group card when
  // they also manage people — the group list has no nested indent, so this
  // is the way to move from "their direct reports" to "their own reports."
  const groupAnchors = new Set(
    managerGroups.map((g) => g.manager.employeeId).filter((id): id is string => id !== null),
  );

  if (!top) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Card>
          <CardContent className="py-6 text-center text-xs text-muted-foreground">
            No employees in the organization yet.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-between gap-4 py-4 min-[600px]:flex-row">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="text-sm">{initials(top.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{top.name}</span>
              <span className="text-xs text-muted-foreground">{top.designation}</span>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold tabular-nums">
                {stats?.totalEmployees ?? "—"}
              </span>
              <span className="text-xs text-muted-foreground">Employees</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold tabular-nums">{departmentCount}</span>
              <span className="text-xs text-muted-foreground">Departments</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {managerGroups.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-xs text-muted-foreground">
            No one has direct reports yet.
          </CardContent>
        </Card>
      ) : (
        managerGroups.map((group, i) => (
          <Card
            key={group.manager.employeeId ?? i}
            id={group.manager.employeeId ? `manager-${group.manager.employeeId}` : undefined}
          >
            <CardContent className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback>{initials(group.manager.name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{group.manager.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {group.manager.designation} · {group.manager.department}
                  </span>
                </div>
                <Badge variant="secondary">
                  {group.reports.length} direct report{group.reports.length === 1 ? "" : "s"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 min-[640px]:grid-cols-3 min-[960px]:grid-cols-4">
                {group.reports.map((report, j) => {
                  const leadsOwnGroup = report.employeeId ? groupAnchors.has(report.employeeId) : false;
                  const Chip = leadsOwnGroup ? "a" : "div";

                  return (
                    <Chip
                      key={report.employeeId ?? j}
                      {...(leadsOwnGroup ? { href: `#manager-${report.employeeId}` } : {})}
                      className={`flex items-center gap-2 border border-border px-2.5 py-2 ${leadsOwnGroup ? "transition-colors hover:bg-muted/50" : ""}`}
                    >
                      <Avatar className="size-7 shrink-0">
                        <AvatarFallback className="text-[10px]">{initials(report.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-xs font-medium">{report.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {report.designation}
                        </span>
                      </div>
                    </Chip>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
