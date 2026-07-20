"use server";

import { revalidatePath } from "next/cache";

import { serverFetch } from "@/lib/api";

export async function deleteEmployeeAction(id: string): Promise<{ error?: string }> {
  const res = await serverFetch(`/api/employees/${id}`, { method: "DELETE" });

  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    return { error: body.error ?? "Could not delete employee" };
  }

  revalidatePath("/directory");
  revalidatePath("/org-chart");
  return {};
}

export interface EmployeeFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

function buildEmployeePayload(formData: FormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of [
    "name",
    "email",
    "phone",
    "department",
    "designation",
    "joiningDate",
    "status",
    "role",
    "reportingManager",
    "password",
  ] as const) {
    const value = formData.get(field);
    if (typeof value === "string" && value !== "") {
      payload[field] = value;
    }
  }

  const salary = formData.get("salary");
  if (typeof salary === "string" && salary !== "") {
    payload.salary = Number(salary);
  }

  return payload;
}

export async function createEmployeeAction(
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const res = await serverFetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildEmployeePayload(formData)),
  });

  const body = (await res.json()) as { error?: string; fieldErrors?: Record<string, string> };

  if (!res.ok) {
    return { error: body.error ?? "Could not create employee", fieldErrors: body.fieldErrors };
  }

  revalidatePath("/directory");
  revalidatePath("/org-chart");
  return { success: true };
}

export async function updateEmployeeAction(
  id: string,
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const res = await serverFetch(`/api/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildEmployeePayload(formData)),
  });

  const body = (await res.json()) as { error?: string; fieldErrors?: Record<string, string> };

  if (!res.ok) {
    return { error: body.error ?? "Could not update employee", fieldErrors: body.fieldErrors };
  }

  revalidatePath("/directory");
  revalidatePath("/org-chart");
  return { success: true };
}

export async function updateManagerAction(
  id: string,
  reportingManager: string | null,
): Promise<{ error?: string }> {
  const res = await serverFetch(`/api/employees/${id}/manager`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportingManager }),
  });

  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    return { error: body.error ?? "Could not update reporting manager" };
  }

  revalidatePath("/directory");
  revalidatePath("/org-chart");
  return {};
}
