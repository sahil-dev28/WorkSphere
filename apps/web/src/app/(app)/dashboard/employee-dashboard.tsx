import Link from "next/link";

import { Button } from "@WorkSphere/ui/components/button";
import { Card, CardContent } from "@WorkSphere/ui/components/card";

import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { getEmployeeById, getEmployeeName } from "@/lib/employees";
import { formatTenure } from "@/lib/format";
import type { Me } from "@/lib/session";

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
  const { employee: record } = await getEmployeeById(user.id);

  let managerLabel = "No manager assigned";
  if (record?.reportingManager) {
    const managerName = await getEmployeeName(record.reportingManager);
    managerLabel = managerName ?? "Assigned (name unavailable)";
  }

  return (
    <div className="flex flex-col gap-6 p-6">
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
          <Button
            render={<Link href="/profile" />}
            nativeButton={false}
            className="flex-1"
          >
            View My Profile
          </Button>
          <ChangePasswordDialog
            trigger={
              <Button variant="outline" className="flex-1">
                Change Password
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
