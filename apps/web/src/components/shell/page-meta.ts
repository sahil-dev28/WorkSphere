// Static route -> title/subtitle lookup for the desktop Topbar. The route set
// is small and fixed (Employee Add/Edit/View now live in dialogs, not their
// own pages), so this is simpler than threading page-level context/portals.
export const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your organization" },
  "/directory": { title: "Employees", subtitle: "Manage your team" },
  "/org-chart": { title: "Organization", subtitle: "Reporting structure" },
  "/profile": { title: "My Profile", subtitle: "Your account details" },
  "/change-password": { title: "Change Password", subtitle: "Update your credentials" },
};

export function getPageMeta(pathname: string): { title: string; subtitle: string } {
  return PAGE_META[pathname] ?? { title: "WorkSphere", subtitle: "" };
}
