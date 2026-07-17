import Link from "next/link";

import { Button } from "@WorkSphere/ui/components/button";
import { Card, CardContent } from "@WorkSphere/ui/components/card";

import { serverFetch } from "@/lib/api";
import { formatTenure } from "@/lib/format";
import type { Me } from "@/lib/session";

interface EmployeeRecord {
  department: string;
  joiningDate: string;
  reportingManager: string | null;
}

async function getOwnRecord(id: string): Promise<EmployeeRecord | null> {
  const res = await serverFetch(`/api/employees/${id}`);

  if (!res.ok) {
    return null;
  }

  const body = (await res.json()) as { data: EmployeeRecord };
  return body.data;
}

// GET /api/employees/:id blocks an employee from viewing anyone's record but
// their own — no exception for "my own manager" — so this 403s for every
// employee with a real manager. Not a bug here; it's a real gap between the
// self-only RBAC rule (built earlier) and this screen's need to show a name.
// Flagged, not silently worked around.
async function getManagerName(managerId: string): Promise<string | null> {
  const res = await serverFetch(`/api/employees/${managerId}`);

  if (!res.ok) {
    return null;
  }

  const body = (await res.json()) as { data: { name: string } };
  return body.data.name;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </CardContent>
    </Card>
  );
}

export async function EmployeeDashboard({ user }: { user: Me }) {
  const record = await getOwnRecord(user.id);

  // Distinguish "genuinely no manager" from "has one, couldn't resolve the
  // name" — these are not the same fact and shouldn't show the same text.
  let managerLabel = "No manager assigned";
  if (record?.reportingManager) {
    const managerName = await getManagerName(record.reportingManager);
    managerLabel = managerName ?? "Assigned (name unavailable)";
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold tracking-tight">Welcome back, {user.name}</h1>

      <div className="grid grid-cols-1 gap-4 min-[860px]:grid-cols-3">
        <InfoCard label="Department" value={record?.department ?? "—"} />
        <InfoCard
          label="Time at Company"
          value={record ? formatTenure(record.joiningDate) : "—"}
        />
        <InfoCard label="Reporting Manager" value={managerLabel} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-2 min-[860px]:flex-row">
          <Button render={<Link href="/profile" />} nativeButton={false} className="flex-1">
            View My Profile
          </Button>
          <Button
            render={<Link href="/change-password" />}
            nativeButton={false}
            variant="outline"
            className="flex-1"
          >
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
