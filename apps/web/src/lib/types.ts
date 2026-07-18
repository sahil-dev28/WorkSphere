import type { departments, employeeRoles, employeeStatuses } from "@/lib/enums";

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: (typeof departments)[number];
  designation: string;
  salary?: number;
  joiningDate: string;
  status: (typeof employeeStatuses)[number];
  role: (typeof employeeRoles)[number];
  reportingManager: string | null;
  profileImage: string | null;
}
