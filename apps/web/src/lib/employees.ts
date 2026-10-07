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

export async function getEmployeeRosterResult(): Promise<{ ok: boolean; data: Employee[] }> {
  try {
    const res = await serverFetch("/api/employees");
    if (!res.ok) {
      return { ok: false, data: [] };
    }
    const body = (await res.json()) as { data: Employee[] };
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, data: [] };
  }
}

export async function getEmployeeRoster(): Promise<Employee[]> {
  return (await getEmployeeRosterResult()).data;
}
