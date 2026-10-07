import { X } from "lucide-react";

import { Button } from "@WorkSphere/ui/components/button";

export function DirectoryResultsBar({
  total,
  loading,
  hasFilters,
  onClear,
}: {
  total: number;
  loading: boolean;
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-3 px-1 text-[13px] text-muted-foreground">
      <span aria-live="polite">
        {loading ? "Loading employees…" : `${total} ${total === 1 ? "employee" : "employees"}`}
      </span>
      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X /> Clear filters
        </Button>
      ) : null}
    </div>
  );
}
