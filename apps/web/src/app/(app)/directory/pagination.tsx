"use client";

import { Button } from "@WorkSphere/ui/components/button";

import { useDirectoryParams } from "./use-directory-params";

// No paginated backend endpoint exists — GET /api/employees always returns
// the full roster, so this paginates the already-filtered/sorted array
// client-navigates-server-re-renders, same URL-param-driven pattern as
// search/filter/sort.
export function DirectoryPagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const updateParams = useDirectoryParams();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 min-[600px]:flex-row">
      <p className="text-xs text-muted-foreground">
        {total === 0 ? "No employees" : `Showing ${start}–${end} of ${total} employees`}
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => updateParams({ page: page - 1 <= 1 ? null : String(page - 1) })}
        >
          Prev
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => updateParams({ page: String(page + 1) })}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
