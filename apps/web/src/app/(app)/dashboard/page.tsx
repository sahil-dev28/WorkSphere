import { redirect } from "next/navigation";

import { getMe } from "@/lib/session";

import { AdminDashboard } from "./admin-dashboard";
import { EmployeeDashboard } from "./employee-dashboard";

export default async function DashboardPage() {
  const user = await getMe();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "employee") {
    return <EmployeeDashboard user={user} />;
  }

  return <AdminDashboard />;
}
