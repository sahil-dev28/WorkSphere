import type { Employee } from "@/lib/types";
import type { Me } from "@/lib/session";

// Single source of truth for the field-level access rules already enforced
// server-side in employeeController.updateEmployee — mirrored here so the UI
// never renders a control the backend would 403/silently-drop, rather than
// trusting the backend to strip fields quietly.

export function canEditEmployee(viewer: Me, target: Pick<Employee, "_id" | "role">): boolean {
  if (viewer.role === "super_admin") return true;
  if (viewer.role === "hr_manager") return target.role !== "super_admin";
  return viewer.id === target._id;
}

export function canDeleteEmployee(viewer: Me): boolean {
  return viewer.role === "super_admin";
}

export function canAssignSuperAdmin(viewer: Me): boolean {
  return viewer.role === "super_admin";
}

export function canReassignManager(viewer: Me): boolean {
  return viewer.role === "super_admin" || viewer.role === "hr_manager";
}

export function canCreateEmployee(viewer: Me): boolean {
  return viewer.role === "super_admin" || viewer.role === "hr_manager";
}

export type EditableField =
  | "name"
  | "email"
  | "phone"
  | "department"
  | "designation"
  | "salary"
  | "joiningDate"
  | "status"
  | "role"
  | "profileImage";

const EMPLOYEE_SELF_FIELDS: EditableField[] = ["name", "phone", "profileImage"];
const FULL_FIELDS: EditableField[] = [
  "name",
  "email",
  "phone",
  "department",
  "designation",
  "salary",
  "joiningDate",
  "status",
  "role",
  "profileImage",
];

// Fields the viewer may submit on target's PUT /api/employees/:id body.
// reportingManager is deliberately excluded — that's its own PATCH flow,
// gated by canReassignManager, not part of the general field set.
export function editableFieldsFor(
  viewer: Me,
  target: Pick<Employee, "_id" | "role">,
): EditableField[] {
  if (!canEditEmployee(viewer, target)) return [];
  if (viewer.role === "employee") return EMPLOYEE_SELF_FIELDS;
  return FULL_FIELDS;
}
