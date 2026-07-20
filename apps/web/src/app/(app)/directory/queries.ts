import { queryOptions } from "@tanstack/react-query";

import { getEmployeesTable, type EmployeesTableParams } from "@/lib/actions/employees";

export function employeesTableOptions(params: EmployeesTableParams) {
  return queryOptions({
    queryKey: ["employees", "table", params] as const,
    queryFn: () => getEmployeesTable(params),
  });
}
