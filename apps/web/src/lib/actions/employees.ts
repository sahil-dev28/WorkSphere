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
  return {};
}

export interface EmployeeFormState {
  error?: string;
  success?: boolean;
}

// Only fields the form actually rendered an input for end up in formData, so
// this naturally respects the viewer's editableFieldsFor() set without extra
// filtering here — the backend enforces the same rules independently anyway.
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

  const body = (await res.json()) as { error?: string };

  if (!res.ok) {
    return { error: body.error ?? "Could not create employee" };
  }

  revalidatePath("/directory");
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

  const body = (await res.json()) as { error?: string };

  if (!res.ok) {
    return { error: body.error ?? "Could not update employee" };
  }

  revalidatePath("/directory");
  return { success: true };
}

// Separate from updateEmployeeAction on purpose — PATCH /:id/manager is its
// own endpoint with its own cycle-guard, distinct from the general PUT.
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
  return {};
}
