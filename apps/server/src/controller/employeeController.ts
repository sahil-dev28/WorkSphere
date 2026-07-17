import type { Request, Response } from "express";
import { Types } from "mongoose";

import { Employee } from "@/models/Employee";
import type { EmployeeAttrs } from "@/models/Employee";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  UpdateManagerInput,
} from "@/schema/employee";
import { NOT_DELETED_FILTER } from "@/utils/constants";

const EMPLOYEE_PROJECTION = {
  employeeId: 1,
  name: 1,
  email: 1,
  phone: 1,
  department: 1,
  designation: 1,
  salary: 1,
  joiningDate: 1,
  status: 1,
  role: 1,
  reportingManager: 1,
  profileImage: 1,
} as const;

// super_admin and hr_manager see salary; an employee viewing their own record does not.
function shapeForRequester<T extends Record<string, unknown>>(employee: T, requesterRole: string) {
  if (requesterRole !== "employee") {
    return employee;
  }

  const { salary: _salary, ...rest } = employee;
  return rest;
}

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await Employee.find(NOT_DELETED_FILTER, EMPLOYEE_PROJECTION)
      .sort({ name: 1, _id: 1 })
      .lean();

    const shaped = data.map((employee) => shapeForRequester(employee, req.user?.role ?? ""));

    res.status(200).json({ data: shaped });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    if (req.user?.role === "employee" && id !== req.user.id) {
      res.status(403).json({ error: "You can only view your own profile" });
      return;
    }

    const employee = await Employee.findOne(
      { _id: id, ...NOT_DELETED_FILTER },
      EMPLOYEE_PROJECTION,
    ).lean();

    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    res.status(200).json({ data: shapeForRequester(employee, req.user?.role ?? "") });
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
  const {
    name,
    email,
    phone,
    department,
    designation,
    salary,
    joiningDate,
    reportingManager,
    profileImage,
    password,
    role,
  } = req.body as CreateEmployeeInput;
  try {
    if (req.user?.role === "hr_manager" && role === "super_admin") {
      res.status(403).json({ error: "HR Manager cannot assign Super Admin" });
      return;
    }

    const newEmployee = new Employee({
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joiningDate,
      reportingManager,
      profileImage,
      password,
      role,
    });

    await newEmployee.save();

    res.status(200).json({ message: "Employee created", employeeId: newEmployee.employeeId });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const target = await Employee.findOne({ _id: id, ...NOT_DELETED_FILTER });

    if (!target) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const body = req.body as UpdateEmployeeInput;
    const requesterRole = req.user?.role;

    if (requesterRole === "employee") {
      if (id !== req.user?.id) {
        res.status(403).json({ error: "You can only update your own profile" });
        return;
      }

      // Anything outside this subset is silently dropped, not rejected —
      // consistent with validateData already stripping unknown fields.
      if (body.name !== undefined) target.name = body.name;
      if (body.phone !== undefined) target.phone = body.phone;
      if (body.profileImage !== undefined) target.profileImage = body.profileImage;
    } else if (requesterRole === "hr_manager") {
      if (target.role === "super_admin") {
        res.status(403).json({ error: "HR Manager cannot edit a Super Admin" });
        return;
      }

      if (body.role === "super_admin") {
        res.status(403).json({ error: "HR Manager cannot assign Super Admin" });
        return;
      }

      applyUpdatableFields(target, body);
    } else {
      applyUpdatableFields(target, body);
    }

    await target.save();

    res.status(200).json({ message: "Employee updated" });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

function applyUpdatableFields(
  target: Awaited<ReturnType<typeof Employee.findOne>>,
  body: UpdateEmployeeInput,
) {
  if (!target) {
    return;
  }

  if (body.name !== undefined) target.name = body.name;
  if (body.email !== undefined) target.email = body.email;
  if (body.phone !== undefined) target.phone = body.phone;
  if (body.department !== undefined) target.department = body.department;
  if (body.designation !== undefined) target.designation = body.designation;
  if (body.salary !== undefined) target.salary = body.salary;
  if (body.joiningDate !== undefined) target.joiningDate = body.joiningDate;
  if (body.status !== undefined) target.status = body.status;
  if (body.role !== undefined) target.role = body.role;
  if (body.reportingManager !== undefined) {
    target.reportingManager = new Types.ObjectId(body.reportingManager);
  }
  if (body.profileImage !== undefined) target.profileImage = body.profileImage;
}

export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const target = await Employee.findOne({ _id: id, ...NOT_DELETED_FILTER });

    if (!target) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    target.isDeleted = true;
    target.deletedAt = new Date();
    await target.save();

    res.status(200).json({ message: "Employee deleted" });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getReportees = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const requesterRole = req.user?.role ?? "";
    const isSelf = id === req.user?.id;

    if (requesterRole === "employee" && !isSelf) {
      res.status(403).json({ error: "You can only view your own reportees" });
      return;
    }

    const data = await Employee.find(
      { reportingManager: id, ...NOT_DELETED_FILTER },
      EMPLOYEE_PROJECTION,
    )
      .sort({ name: 1, _id: 1 })
      .lean();

    const shaped = data.map((employee) => shapeForRequester(employee, requesterRole));

    res.status(200).json({ data: shaped });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Walks up the chain from the proposed manager (manager's manager, and so
// on). Returns true if `employeeId` appears anywhere in that chain — which
// covers a direct self-reference too, since that's just a chain of length one.
async function wouldCreateCycle(employeeId: string, proposedManagerId: string): Promise<boolean> {
  let current: string | null = proposedManagerId;
  const visited = new Set<string>();

  while (current) {
    if (current === employeeId) {
      return true;
    }

    if (visited.has(current)) {
      break;
    }
    visited.add(current);

    const manager: Pick<EmployeeAttrs, "reportingManager"> | null = await Employee.findById(
      current,
      { reportingManager: 1 },
    ).lean();

    if (!manager || !manager.reportingManager) {
      break;
    }

    current = manager.reportingManager.toString();
  }

  return false;
}

export const updateManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const target = await Employee.findOne({ _id: id, ...NOT_DELETED_FILTER });

    if (!target) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const { reportingManager } = req.body as UpdateManagerInput;

    if (reportingManager === null) {
      target.reportingManager = null;
      await target.save();
      res.status(200).json({ message: "Manager updated" });
      return;
    }

    const proposedManager = await Employee.findOne({
      _id: reportingManager,
      ...NOT_DELETED_FILTER,
    });

    if (!proposedManager) {
      res.status(400).json({ error: "Proposed manager not found" });
      return;
    }

    if (await wouldCreateCycle(id, reportingManager)) {
      res.status(400).json({ error: "This assignment would create a circular reporting chain" });
      return;
    }

    target.reportingManager = new Types.ObjectId(reportingManager);
    await target.save();

    res.status(200).json({ message: "Manager updated" });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
