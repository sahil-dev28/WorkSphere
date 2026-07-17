import type { Request, Response } from "express";

import { Employee } from "@/models/Employee";
import { NOT_DELETED_FILTER } from "@/utils/constants";

interface TreeNode {
  employeeId: string | null;
  name: string;
  designation: string;
  department: string;
  role: string;
  children: TreeNode[];
}

// Plain recursive query per level rather than $graphLookup — matches the rest
// of the codebase, which has no aggregation pipelines anywhere, and this is
// well within the size where a recursive walk is simple and fast enough.
async function buildSubtree(managerId: string | null): Promise<TreeNode[]> {
  const children = await Employee.find(
    { reportingManager: managerId, ...NOT_DELETED_FILTER },
    { employeeId: 1, name: 1, designation: 1, department: 1, role: 1 },
  )
    .sort({ name: 1, _id: 1 })
    .lean();

  return Promise.all(
    children.map(async (child) => ({
      employeeId: child.employeeId ?? null,
      name: child.name,
      designation: child.designation,
      department: child.department,
      role: child.role,
      children: await buildSubtree(child._id.toString()),
    })),
  );
}

export const getOrganizationTree = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await buildSubtree(null);

    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
