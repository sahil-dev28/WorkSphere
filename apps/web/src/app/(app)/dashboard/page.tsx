import { redirect } from "next/navigation";

import { SESSION_EXPIRED_PATH } from "@/lib/constants";
import { getMe } from "@/lib/session";

import { AdminDashboard } from "./admin-dashboard";
import { EmployeeDashboard } from "./employee-dashboard";

export default async function DashboardPage() {
  const user = await getMe();

  if (!user) {
    redirect(SESSION_EXPIRED_PATH);
  }

  if (user.role === "employee") {
    return <EmployeeDashboard user={user} />;
  }

  return <AdminDashboard />;
}
