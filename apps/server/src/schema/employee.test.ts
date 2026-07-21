import { describe, expect, it } from "vitest";

import { updateEmployeeSchema } from "@/schema/employee";

describe("updateEmployeeSchema", () => {
  it("accepts an empty object — every field is optional", () => {
    const result = updateEmployeeSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("does not require department, and does not say 'Department is required' when it's absent", () => {
    const result = updateEmployeeSchema.safeParse({ name: "Someone Valid" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid department with the 'must be one of' message, not 'Department is required'", () => {
    const result = updateEmployeeSchema.safeParse({ department: "NotReal" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Department must be one of");
      expect(result.error.issues[0]?.message).not.toContain("required");
    }
  });

  it("rejects a non-numeric salary with Zod's default type-mismatch message, not 'Salary is required'", () => {
    const result = updateEmployeeSchema.safeParse({ salary: "not-a-number" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).not.toBe("Salary is required");
    }
  });

  it("rejects a non-positive salary with 'Salary must be greater than 0'", () => {
    const result = updateEmployeeSchema.safeParse({ salary: -5 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Salary must be greater than 0");
    }
  });

  it("rejects an invalid status with 'Status must be one of'", () => {
    const result = updateEmployeeSchema.safeParse({ status: "not-a-status" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Status must be one of");
    }
  });

  it("does not have a password field", () => {
    const result = updateEmployeeSchema.safeParse({ password: "irrelevant" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("password" in result.data).toBe(false);
    }
  });

  it("rejects a name that's too short with the same message as create", () => {
    const result = updateEmployeeSchema.safeParse({ name: "ab" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Name must be at least 3 characters");
    }
  });
});
