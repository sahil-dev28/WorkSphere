import { z } from "zod";

import { departments, employeeRoles, MIN_PASSWORD_LENGTH } from "@/utils/constants";

export const createEmployeeSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(60, "Name cannot exceed 60 characters"),
  email: z.email("Invalid email address"),
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
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
  role: z.enum(employeeRoles).default("employee"),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
