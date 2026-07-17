import type { Request, Response } from "express";

import { Employee } from "@/models/Employee";
import type { CreateEmployeeInput } from "@/schema/employee";

export const getEmployees = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = await Employee.find(
      {},
      { name: 1, email: 1, department: 1, designation: 1, status: 1 },
    )
      .sort({ name: 1, _id: 1 })
      .lean();

    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, email, department, designation, salary, password, role } =
    req.body as CreateEmployeeInput;
  try {
    if (req.user?.role === "hr_manager" && role === "super_admin") {
      res.status(403).json({ error: "HR Manager cannot assign Super Admin" });
      return;
    }

    const newEmployee = new Employee({
      name,
      email,
      department,
      designation,
      salary,
      password,
      role,
    });

    await newEmployee.save();

    res.status(200).json({ message: "Employee created" });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
