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

export const employeeRoles = ["super_admin", "hr_manager", "employee"] as const;
