export const AUTH_COOKIE_NAME = "token";

export const AUTH_COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
} as const;

export const BCRYPT_SALT_ROUNDS = 10;

export const MIN_PASSWORD_LENGTH = 8;

export const DEFAULT_PORT = 3000;

export const CORS_METHODS: string[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

export const departments = [
  "Engineering",
  "Design",
  "Product",
  "Sales",
  "Marketing",
  "HR",
  "Finance",
] as const;

export const employeeStatuses = ["active", "on_leave", "terminated"] as const;

export type EmployeeStatus = (typeof employeeStatuses)[number];

export const employeeRoles = ["super_admin", "hr_manager", "employee"] as const;

export const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

export const MONGO_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const EMPLOYEE_ID_PREFIX = "EMP-";

export const EMPLOYEE_ID_PAD_LENGTH = 4;

export function formatEmployeeId(sequence: number): string {
  return `${EMPLOYEE_ID_PREFIX}${String(sequence).padStart(EMPLOYEE_ID_PAD_LENGTH, "0")}`;
}

export function parseEmployeeIdSequence(employeeId: string): number {
  return parseInt(employeeId.slice(EMPLOYEE_ID_PREFIX.length), 10);
}

// Dashboard "Active Employees" counts on_leave as active — only terminated counts as inactive.
export const DASHBOARD_INACTIVE_STATUSES: readonly EmployeeStatus[] = ["terminated"];

export function isActiveForDashboard(status: EmployeeStatus): boolean {
  return !DASHBOARD_INACTIVE_STATUSES.includes(status);
}
