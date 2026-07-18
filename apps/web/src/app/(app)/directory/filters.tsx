"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@WorkSphere/ui/components/select";

import {
  departments,
  employeeRoles,
  employeeStatuses,
  ROLE_LABELS,
  STATUS_LABELS,
} from "@/lib/enums";

import { useDirectoryParams } from "./use-directory-params";

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "name_desc", label: "Name (Z–A)" },
  { value: "joined_desc", label: "Newest joined" },
  { value: "joined_asc", label: "Oldest joined" },
] as const;

interface DirectoryFiltersProps {
  department: string;
  role: string;
  status: string;
  sort: string;
}

export function DirectoryFilters({ department, role, status, sort }: DirectoryFiltersProps) {
  const updateParams = useDirectoryParams();

  return (
    <div className="grid grid-cols-2 gap-2 min-[700px]:flex min-[700px]:shrink-0 min-[700px]:flex-wrap">
      <Select
        value={department}
        onValueChange={(v) => updateParams({ department: v === "all" ? null : v })}
      >
        <SelectTrigger className="min-[700px]:w-36">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All departments</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={role} onValueChange={(v) => updateParams({ role: v === "all" ? null : v })}>
        <SelectTrigger className="min-[700px]:w-32">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          {employeeRoles.map((r) => (
            <SelectItem key={r} value={r}>
              {ROLE_LABELS[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status}
        onValueChange={(v) => updateParams({ status: v === "all" ? null : v })}
      >
        <SelectTrigger className="min-[700px]:w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {employeeStatuses.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={(v) => updateParams({ sort: v === "name_asc" ? null : v })}
      >
        <SelectTrigger className="min-[700px]:w-36">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
