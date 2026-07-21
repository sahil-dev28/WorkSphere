import { z } from "zod";

import {
  departments,
  employeeRoles,
  employeeStatuses,
  MIN_PASSWORD_LENGTH,
  MONGO_OBJECT_ID_REGEX,
  PHONE_REGEX,
} from "@/utils/constants";

export const createEmployeeSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(60, "Name cannot exceed 60 characters"),
  email: z.email("Invalid email address"),
  phone: z.string().regex(PHONE_REGEX, "Phone must be 10-15 digits, optionally prefixed with +"),
  department: z.enum(departments, {
    error: (issue) =>
      issue.input === undefined
        ? "Department is required"
        : `Department must be one of ${departments.join(", ")}`,
  }),
  designation: z
    .string()
    .min(2, "Designation must be at least 2 characters")
    .max(60, "Designation cannot exceed 60 characters"),
  salary: z
    .number({ error: "Salary is required" })
    .positive("Salary must be greater than 0"),
  joiningDate: z.coerce.date().optional(),
  reportingManager: z
    .string()
    .regex(MONGO_OBJECT_ID_REGEX, "Invalid reportingManager id")
    .optional(),
  profileImage: z.url("Invalid profile image URL").optional(),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
  role: z.enum(employeeRoles).default("employee"),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

// Derived from create: every field optional, password dropped (never
// editable through this route), status added (create doesn't have it —
// new employees always start "active"). salary and role are re-specified
// explicitly rather than inherited via .partial() — create's versions
// carry a custom "required" message that must not leak into update's
// wrong-type-but-present case, where it would be misleading.
export const updateEmployeeSchema = createEmployeeSchema
  .omit({ password: true })
  .partial()
  .extend({
    salary: z.number().positive("Salary must be greater than 0").optional(),
    status: z.enum(employeeStatuses, {
      error: `Status must be one of ${employeeStatuses.join(", ")}`,
    }).optional(),
    role: z.enum(employeeRoles).optional(),
  });

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const updateManagerSchema = z.object({
  reportingManager: z
    .string()
    .regex(MONGO_OBJECT_ID_REGEX, "Invalid reportingManager id")
    .nullable(),
});

export type UpdateManagerInput = z.infer<typeof updateManagerSchema>;

export const employeeQuerySchema = z.object({
  q: z.string().trim().optional(),
  department: z.enum(departments).optional(),
  role: z.enum(employeeRoles).optional(),
  status: z.enum(employeeStatuses).optional(),
  sort: z.enum(["name_asc", "name_desc", "joined_asc", "joined_desc"]).catch("name_asc"),
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(100).catch(10),
});

export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;
