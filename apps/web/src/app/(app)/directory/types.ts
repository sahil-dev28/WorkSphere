export type SortKey = "name_asc" | "name_desc" | "joined_desc" | "joined_asc";

export interface DirectorySearchParams {
  q?: string;
  department?: string;
  role?: string;
  status?: string;
  sort?: string;
  page?: string;
  action?: string;
  employeeId?: string;
}
