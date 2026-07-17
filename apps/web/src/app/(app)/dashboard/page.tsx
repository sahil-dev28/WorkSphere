import { redirect } from "next/navigation";

import { getMe } from "@/lib/session";

import { AdminDashboard } from "./admin-dashboard";
import { EmployeeDashboard } from "./employee-dashboard";

// getMe() is called again here (also called in the (app) layout) rather than
// threaded down as a prop — getMe() itself is wrapped in React's cache(), so
// this reuses the same result within one request instead of refetching.
export default async function DashboardPage() {
  const user = await getMe();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "employee") {
    return <EmployeeDashboard user={user} />;
  }

  return <AdminDashboard user={user} />;
}
