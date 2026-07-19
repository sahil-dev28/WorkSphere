import { Employee } from "@/models/Employee";
import type { departments, employeeRoles } from "@/utils/constants";

type Department = (typeof departments)[number];
type EmployeeRole = (typeof employeeRoles)[number];

export class HierarchyError extends Error {
  field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
  }
}

interface HierarchyCheckInput {
  // null when the record doesn't exist yet (create)
  employeeId: string | null;
  role: EmployeeRole;
  department: Department;
  reportingManager: string | null;
}

// Real-company reporting rules, checked against the FINAL proposed state of a
// record (not just whichever fields a given request happened to touch) —
// callers run this right before save so a role or department change alone
// (with reportingManager left untouched) still gets caught.
//
//   - super_admin: root of the org, never has a manager.
//   - hr_manager: exactly one per department, and always reports to the
//     super_admin (department heads report to the CEO).
//   - employee: must report to their own department's hr_manager, or to the
//     super_admin if that department has no head yet — never to another
//     "employee".
export async function assertValidHierarchy({
  employeeId,
  role,
  department,
  reportingManager,
}: HierarchyCheckInput): Promise<void> {
  if (role === "super_admin") {
    if (reportingManager) {
      throw new HierarchyError("reportingManager", "A Super Admin cannot have a reporting manager");
    }
    return;
  }

  if (role === "hr_manager") {
    const existingHead = await Employee.findOne({
      role: "hr_manager",
      department,
      isDeleted: { $ne: true },
      ...(employeeId ? { _id: { $ne: employeeId } } : {}),
    }).lean();

    if (existingHead) {
      throw new HierarchyError("role", `${department} already has a manager (${existingHead.name})`);
    }

    if (!reportingManager) {
      throw new HierarchyError(
        "reportingManager",
        "A department manager must report to the Super Admin",
      );
    }

    const manager = await Employee.findOne({
      _id: reportingManager,
      isDeleted: { $ne: true },
    }).lean();

    if (!manager || manager.role !== "super_admin") {
      throw new HierarchyError(
        "reportingManager",
        "A department manager must report to the Super Admin",
      );
    }
    return;
  }

  // role === "employee"
  if (!reportingManager) {
    throw new HierarchyError("reportingManager", "Employees must have a reporting manager");
  }

  const manager = await Employee.findOne({
    _id: reportingManager,
    isDeleted: { $ne: true },
  }).lean();

  if (!manager || manager.role === "employee") {
    throw new HierarchyError("reportingManager", "An employee cannot report to another employee");
  }

  if (manager.role === "super_admin") {
    const deptHead = await Employee.findOne({
      role: "hr_manager",
      department,
      isDeleted: { $ne: true },
    }).lean();

    if (deptHead) {
      throw new HierarchyError(
        "reportingManager",
        `${department} employees must report to ${deptHead.name}, their department's manager`,
      );
    }
    return;
  }

  if (manager.department !== department) {
    throw new HierarchyError(
      "reportingManager",
      "Employees can only report to their own department's manager",
    );
  }
}
