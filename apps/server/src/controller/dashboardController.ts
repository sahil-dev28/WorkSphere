import type { Request, Response } from "express";

import { Employee } from "@/models/Employee";
import { DASHBOARD_INACTIVE_STATUSES, departments, NOT_DELETED_FILTER } from "@/utils/constants";
import { formatUnknownError } from "@/utils/formatMongooseError";

interface DashboardAggregationResult {
  total: { count: number }[];
  byActiveStatus: { _id: boolean; count: number }[];
  byDepartment: { _id: string; count: number }[];
}

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [result] = await Employee.aggregate<DashboardAggregationResult>([
      { $match: NOT_DELETED_FILTER },
      {
        $facet: {
          total: [{ $count: "count" }],
          // DASHBOARD_INACTIVE_STATUSES is referenced directly because a
          // function can't run inside a Mongo aggregation pipeline.
          byActiveStatus: [
            {
              $group: {
                _id: { $in: ["$status", DASHBOARD_INACTIVE_STATUSES] },
                count: { $sum: 1 },
              },
            },
          ],
          byDepartment: [{ $group: { _id: "$department", count: { $sum: 1 } } }],
        },
      },
    ]);

    const totalEmployees = result?.total[0]?.count ?? 0;
    const inactiveEmployees = result?.byActiveStatus.find((row) => row._id === true)?.count ?? 0;
    const activeEmployees = totalEmployees - inactiveEmployees;

    const countsByDepartment = new Map(
      (result?.byDepartment ?? []).map((row) => [row._id, row.count]),
    );

    const departmentCounts = departments.map((department) => ({
      department,
      count: countsByDepartment.get(department) ?? 0,
    }));

    res.status(200).json({
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        departmentCounts,
      },
    });
  } catch (error) {
    res.status(400).json(formatUnknownError(error));
  }
};
