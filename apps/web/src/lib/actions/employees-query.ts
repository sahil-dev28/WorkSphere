import type { Employee } from "@/lib/types";

export interface EmployeesTableParams {
  q?: string;
  department?: string;
  role?: string;
  status?: string;
  sort?: string;
  page?: string;
  limit: number;
}

export interface EmployeesTableResult {
  data: Employee[];
  total: number;
}

// Kept out of employees.ts: that file has a file-level "use server" directive
// (required so its Server Actions can be imported by Client Components, e.g.
// import-csv-dialog.tsx), and Next.js requires every export of a "use server"
// file to be an async function. This is a plain sync helper, so it lives here
// and gets re-exported from employees.ts for the test in
// employees.buildQuery.test.ts (which imports it from "./employees").
export function buildEmployeesQuery(params: EmployeesTableParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.department) search.set("department", params.department);
  if (params.role) search.set("role", params.role);
  if (params.status) search.set("status", params.status);
  if (params.sort) search.set("sort", params.sort);
  if (params.page) search.set("page", params.page);
  search.set("limit", String(params.limit));
  return search.toString();
}
