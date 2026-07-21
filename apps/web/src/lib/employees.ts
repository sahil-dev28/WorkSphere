import { serverFetch } from "@/lib/api";
import type { Employee } from "@/lib/types";

export async function getEmployeeById(
  id: string,
): Promise<{ employee: Employee | null; status: number }> {
  const res = await serverFetch(`/api/employees/${id}`);

  if (!res.ok) {
    return { employee: null, status: res.status };
  }

  const body = (await res.json()) as { data: Employee };
  return { employee: body.data, status: res.status };
}

export async function getEmployeeName(id: string): Promise<string | null> {
  const { employee } = await getEmployeeById(id);
  return employee?.name ?? null;
}

export async function getEmployeeRoster(): Promise<Employee[]> {
  const res = await serverFetch("/api/employees");

  if (!res.ok) {
    return [];
  }

  const body = (await res.json()) as { data: Employee[] };
  return body.data;
}
