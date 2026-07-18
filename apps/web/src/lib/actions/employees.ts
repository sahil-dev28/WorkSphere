"use server";

import { serverFetch } from "@/lib/api";

export async function deleteEmployeeAction(id: string): Promise<{ error?: string }> {
  const res = await serverFetch(`/api/employees/${id}`, { method: "DELETE" });

  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    return { error: body.error ?? "Could not delete employee" };
  }

  return {};
}
