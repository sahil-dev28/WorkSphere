export const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your organization" },
  "/directory": { title: "Employees", subtitle: "Search, filter and manage everyone in your organization" },
  "/org-chart": { title: "Organization", subtitle: "Reporting lines across every team" },
  "/profile": { title: "My Profile", subtitle: "Your details and what you can edit" },
  "/change-password": { title: "Change Password", subtitle: "Update your credentials" },
};

export function getPageMeta(pathname: string): { title: string; subtitle: string } {
  return PAGE_META[pathname] ?? { title: "WorkSphere", subtitle: "" };
}
