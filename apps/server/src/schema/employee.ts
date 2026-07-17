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

// Same fields as create, all optional. employeeId, password, and mustChangePassword
// are never editable through this route, so they're absent here entirely.
export const updateEmployeeSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(60, "Name cannot exceed 60 characters")
    .optional(),
  email: z.email("Invalid email address").optional(),
  phone: z
    .string()
    .regex(PHONE_REGEX, "Phone must be 10-15 digits, optionally prefixed with +")
    .optional(),
  department: z.enum(departments, {
    error: `Department must be one of ${departments.join(", ")}`,
  }).optional(),
  designation: z
    .string()
    .min(2, "Designation must be at least 2 characters")
    .max(60, "Designation cannot exceed 60 characters")
    .optional(),
  salary: z.number().positive("Salary must be greater than 0").optional(),
  joiningDate: z.coerce.date().optional(),
  status: z.enum(employeeStatuses, {
    error: `Status must be one of ${employeeStatuses.join(", ")}`,
  }).optional(),
  reportingManager: z
    .string()
    .regex(MONGO_OBJECT_ID_REGEX, "Invalid reportingManager id")
    .optional(),
  profileImage: z.url("Invalid profile image URL").optional(),
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
