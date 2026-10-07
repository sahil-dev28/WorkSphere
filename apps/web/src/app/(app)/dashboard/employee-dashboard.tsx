import { KeyRound, User } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Button, buttonVariants } from "@WorkSphere/ui/components/button";
import { Card, CardContent } from "@WorkSphere/ui/components/card";

import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { Greeting, TodayLabel } from "@/components/greeting";
import { PageHeader } from "@/components/page-header";
import { getEmployeeById, getEmployeeName } from "@/lib/employees";
import { formatTenure } from "@/lib/format";
import type { Me } from "@/lib/session";

function InfoCard({ label, value, index }: { label: string; value: string; index: number }) {
  return (
    <Card className="animate-in-up" style={{ "--i": index } as CSSProperties}>
      <CardContent className="flex flex-col gap-1">
        <span className="text-[13px] text-muted-foreground">{label}</span>
        <span className="text-base font-medium tracking-tight">{value}</span>
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
      <PageHeader
        title={<Greeting name={user.name} />}
        description={<TodayLabel />}
        actions={
          <>
            <ChangePasswordDialog
              trigger={
                <Button variant="outline">
                  <KeyRound /> Change password
                </Button>
              }
            />
            <Link href="/profile" className={buttonVariants()}>
              <User /> View my profile
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 min-[860px]:grid-cols-3">
        <InfoCard index={0} label="Department" value={record?.department ?? "—"} />
        <InfoCard
          index={1}
          label="Time at company"
          value={record ? formatTenure(record.joiningDate) : "—"}
        />
        <InfoCard index={2} label="Reporting manager" value={managerLabel} />
      </div>
    </div>
  );
}
