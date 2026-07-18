"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { TableRow } from "@WorkSphere/ui/components/table";

// The kebab cell stops its own click from bubbling here — see
// EmployeeRowActions — so opening that menu doesn't also navigate the row.
export function DirectoryTableRow({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();

  return (
    <TableRow className="cursor-pointer" onClick={() => router.push(href as Route)}>
      {children}
    </TableRow>
  );
}
