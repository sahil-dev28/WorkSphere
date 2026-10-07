"use server";

import { serverFetch } from "@/lib/api";
import type { Employee } from "@/lib/types";

export interface PersonResult {
  id: string;
  name: string;
  designation: string;
  department: string;
}

export async function searchPeopleAction(query: string): Promise<PersonResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  try {
    const res = await serverFetch(`/api/employees?${new URLSearchParams({ q, limit: "6", page: "1" })}`);
    if (!res.ok) return [];
    const body = (await res.json()) as { data: Employee[] };
    return body.data.map((employee) => ({
      id: employee._id,
      name: employee.name,
      designation: employee.designation,
      department: employee.department,
    }));
  } catch {
    return [];
  }
}
