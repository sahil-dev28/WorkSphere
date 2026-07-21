"use server";

import { revalidatePath } from "next/cache";

import { serverFetch, type ApiError } from "@/lib/api";

import {
  buildEmployeesQuery,
  type EmployeesTableParams,
  type EmployeesTableResult,
} from "./employees-query";

export { buildEmployeesQuery, type EmployeesTableParams, type EmployeesTableResult };

// Unlike the mutation actions below (which return { error } for form display),
// this throws on failure — that's the convention useQuery/prefetchQuery expect
// for populating isError/error. Deliberate, not an inconsistency to fix.
export async function getEmployeesTable(
  params: EmployeesTableParams,
): Promise<EmployeesTableResult> {
  const res = await serverFetch(`/api/employees?${buildEmployeesQuery(params)}`);

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(body.error ?? "Could not load employees");
  }

  return (await res.json()) as EmployeesTableResult;
}

export async function deleteEmployeeAction(id: string): Promise<{ error?: string }> {
  const res = await serverFetch(`/api/employees/${id}`, { method: "DELETE" });

  if (!res.ok) {
    const body = (await res.json()) as ApiError;
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

  const body = (await res.json()) as ApiError & { fieldErrors?: Record<string, string> };

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

  const body = (await res.json()) as ApiError & { fieldErrors?: Record<string, string> };

  if (!res.ok) {
    return { error: body.error ?? "Could not update employee", fieldErrors: body.fieldErrors };
  }

  revalidatePath("/directory");
  revalidatePath("/org-chart");
  return { success: true };
}

export interface ImportRowError {
  row: number;
  email: string;
  reason: string;
}

export interface ImportedEmployee {
  name: string;
  email: string;
  employeeId: string;
  temporaryPassword: string;
}

export interface ImportEmployeesResult {
  created: number;
  failed: number;
  errors: ImportRowError[];
  createdEmployees: ImportedEmployee[];
  error?: string;
}

const EMPTY_IMPORT_RESULT: Omit<ImportEmployeesResult, "error"> = {
  created: 0,
  failed: 0,
  errors: [],
  createdEmployees: [],
};

export async function importEmployeesAction(
  _prevState: ImportEmployeesResult | null,
  formData: FormData,
): Promise<ImportEmployeesResult> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { ...EMPTY_IMPORT_RESULT, error: "CSV file is required" };
  }

  const body = new FormData();
  body.set("file", file);

  const res = await serverFetch("/api/employees/import", { method: "POST", body });
  const responseBody = (await res.json()) as Partial<ImportEmployeesResult>;

  if (!res.ok) {
    return { ...EMPTY_IMPORT_RESULT, error: responseBody.error ?? "Import failed" };
  }

  const result: ImportEmployeesResult = {
    created: responseBody.created ?? 0,
    failed: responseBody.failed ?? 0,
    errors: responseBody.errors ?? [],
    createdEmployees: responseBody.createdEmployees ?? [],
  };

  if (result.created > 0) {
    revalidatePath("/directory");
    revalidatePath("/org-chart");
  }

  return result;
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
    const body = (await res.json()) as ApiError;
    return { error: body.error ?? "Could not update reporting manager" };
  }

  revalidatePath("/directory");
  revalidatePath("/org-chart");
  return {};
}
