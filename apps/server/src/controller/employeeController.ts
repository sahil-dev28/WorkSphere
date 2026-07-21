import { parse } from "csv-parse/sync";
import type { Request, Response } from "express";
import { Types } from "mongoose";

import { Employee } from "@/models/Employee";
import type { EmployeeAttrs } from "@/models/Employee";
import { createEmployeeSchema } from "@/schema/employee";
import type {
  CreateEmployeeInput,
  EmployeeQueryInput,
  UpdateEmployeeInput,
  UpdateManagerInput,
} from "@/schema/employee";
import { NOT_DELETED_FILTER } from "@/utils/constants";
import { formatMongooseError } from "@/utils/formatMongooseError";
import { generateTemporaryPassword } from "@/utils/generateTemporaryPassword";
import { assertValidHierarchy, HierarchyError } from "@/utils/hierarchyRules";

function formatEmployeeError(error: unknown): {
  error: string;
  fieldErrors?: Record<string, string>;
} {
  if (error instanceof HierarchyError) {
    return {
      error: error.message,
      fieldErrors: { [error.field]: error.message },
    };
  }
  return formatMongooseError(error);
}

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
function shapeForRequester<T extends Record<string, unknown>>(
  employee: T,
  requesterRole: string,
) {
  if (requesterRole !== "employee") {
    return employee;
  }

  const { salary: _salary, ...rest } = employee;
  return rest;
}

const EMPLOYEE_SORT_MAP: Record<
  EmployeeQueryInput["sort"],
  Record<string, 1 | -1>
> = {
  name_asc: { name: 1, _id: 1 },
  name_desc: { name: -1, _id: 1 },
  joined_asc: { joiningDate: 1, _id: 1 },
  joined_desc: { joiningDate: -1, _id: 1 },
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isValidObjectIdParam(id: unknown): id is string {
  return typeof id === "string" && Types.ObjectId.isValid(id);
}

export const getEmployees = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { q, department, role, status, sort, page, limit } =
      res.locals.validatedQuery as EmployeeQueryInput;

    const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
    if (department) filter.department = department;
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (q) {
      const pattern = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ name: pattern }, { email: pattern }];
    }

    const paginate = "page" in req.query || "limit" in req.query;

    let query = Employee.find(filter, EMPLOYEE_PROJECTION).sort(
      EMPLOYEE_SORT_MAP[sort],
    );
    if (paginate) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const [data, total] = await Promise.all([
      query.lean(),
      Employee.countDocuments(filter),
    ]);

    const shaped = data.map((employee) =>
      shapeForRequester(employee, req.user?.role ?? ""),
    );

    res.status(200).json({ data: shaped, total });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getEmployeeById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectIdParam(id)) {
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

    res
      .status(200)
      .json({ data: shapeForRequester(employee, req.user?.role ?? "") });
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

    await assertValidHierarchy({
      employeeId: null,
      role,
      department,
      reportingManager: reportingManager ?? null,
    });

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

    res.status(200).json({
      message: "Employee created",
      employeeId: newEmployee.employeeId,
    });
  } catch (error) {
    res.status(400).json(formatEmployeeError(error));
  }
};

interface ImportRow {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  salary?: string;
  joiningDate?: string;
  reportingManagerEmail?: string;
  role?: string;
}

interface ImportError {
  row: number;
  email: string;
  reason: string;
}

interface CreatedImportRow {
  name: string;
  email: string;
  employeeId: string;
  temporaryPassword: string;
}

export const importEmployees = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "CSV file is required" });
      return;
    }

    let rows: ImportRow[];
    try {
      rows = parse(req.file.buffer, {
        columns: true,
        trim: true,
        skip_empty_lines: true,
      }) as ImportRow[];
    } catch {
      res.status(400).json({ error: "Could not parse CSV file" });
      return;
    }

    const requesterRole = req.user?.role;
    const created: CreatedImportRow[] = [];
    const errors: ImportError[] = [];

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2; // header occupies row 1
      const email = row.email ?? "";

      try {
        let reportingManager: string | undefined;

        if (row.reportingManagerEmail) {
          const manager = await Employee.findOne(
            {
              email: row.reportingManagerEmail.toLowerCase(),
              ...NOT_DELETED_FILTER,
            },
            { _id: 1 },
          ).lean();

          if (!manager) {
            errors.push({
              row: rowNumber,
              email,
              reason: `No employee found with email ${row.reportingManagerEmail}`,
            });
            continue;
          }
          reportingManager = manager._id.toString();
        }

        const temporaryPassword = generateTemporaryPassword();

        const parseResult = createEmployeeSchema.safeParse({
          name: row.name,
          email: row.email,
          phone: row.phone,
          department: row.department,
          designation: row.designation,
          salary: row.salary ? Number(row.salary) : undefined,
          joiningDate: row.joiningDate || undefined,
          reportingManager,
          password: temporaryPassword,
          role: row.role || undefined,
        });

        if (!parseResult.success) {
          errors.push({
            row: rowNumber,
            email,
            reason: parseResult.error.issues[0]?.message ?? "Invalid row",
          });
          continue;
        }

        const data = parseResult.data;

        if (requesterRole === "hr_manager" && data.role === "super_admin") {
          errors.push({
            row: rowNumber,
            email: data.email,
            reason: "HR Manager cannot assign Super Admin",
          });
          continue;
        }

        await assertValidHierarchy({
          employeeId: null,
          role: data.role,
          department: data.department,
          reportingManager: data.reportingManager ?? null,
        });

        const newEmployee = new Employee({
          name: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          designation: data.designation,
          salary: data.salary,
          joiningDate: data.joiningDate,
          reportingManager: data.reportingManager,
          password: data.password,
          role: data.role,
        });

        await newEmployee.save();

        created.push({
          name: newEmployee.name,
          email: newEmployee.email,
          employeeId: newEmployee.employeeId!,
          temporaryPassword,
        });
      } catch (rowError) {
        errors.push({
          row: rowNumber,
          email,
          reason: formatEmployeeError(rowError).error,
        });
      }
    }

    res.status(200).json({
      created: created.length,
      failed: errors.length,
      errors,
      createdEmployees: created,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectIdParam(id)) {
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
      if (body.profileImage !== undefined)
        target.profileImage = body.profileImage;
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

    if (
      requesterRole !== "employee" &&
      (body.department !== undefined ||
        body.role !== undefined ||
        body.reportingManager !== undefined)
    ) {
      await assertValidHierarchy({
        employeeId: target._id.toString(),
        role: target.role,
        department: target.department,
        reportingManager: target.reportingManager
          ? target.reportingManager.toString()
          : null,
      });
    }

    await target.save();

    res.status(200).json({ message: "Employee updated" });
  } catch (error) {
    res.status(400).json(formatEmployeeError(error));
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

export const deleteEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectIdParam(id)) {
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

export const getReportees = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectIdParam(id)) {
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

    const shaped = data.map((employee) =>
      shapeForRequester(employee, requesterRole),
    );

    res.status(200).json({ data: shaped });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


async function wouldCreateCycle(
  employeeId: string,
  proposedManagerId: string,
): Promise<boolean> {
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

    const manager: Pick<EmployeeAttrs, "reportingManager"> | null =
      await Employee.findById(current, { reportingManager: 1 }).lean();

    if (!manager || !manager.reportingManager) {
      break;
    }

    current = manager.reportingManager.toString();
  }

  return false;
}

export const updateManager = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectIdParam(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const target = await Employee.findOne({ _id: id, ...NOT_DELETED_FILTER });

    if (!target) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    const { reportingManager } = req.body as UpdateManagerInput;

    if (reportingManager !== null) {
      const proposedManager = await Employee.findOne({
        _id: reportingManager,
        ...NOT_DELETED_FILTER,
      });

      if (!proposedManager) {
        res.status(400).json({ error: "Proposed manager not found" });
        return;
      }

      if (await wouldCreateCycle(id, reportingManager)) {
        res.status(400).json({
          error: "This assignment would create a circular reporting chain",
        });
        return;
      }
    }

    await assertValidHierarchy({
      employeeId: target._id.toString(),
      role: target.role,
      department: target.department,
      reportingManager,
    });

    target.reportingManager = reportingManager
      ? new Types.ObjectId(reportingManager)
      : null;
    await target.save();

    res.status(200).json({ message: "Manager updated" });
  } catch (error) {
    res.status(400).json(formatEmployeeError(error));
  }
};
