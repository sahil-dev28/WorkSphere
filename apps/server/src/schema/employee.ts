import { z } from "zod";

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
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
