import { departments, employeeRoles } from "@/lib/enums";

// "Employees" is illustrative marketing copy, not a live count — no public,
// unauthenticated endpoint exists for that (every real count lives behind
// auth). Departments/Access levels ARE real: both come straight from the
// same enums the rest of the app validates against, no fetch needed.
export function BrandPanel() {
  return (
    <div className="flex h-full min-h-[220px] flex-col justify-between bg-secondary p-8 text-secondary-foreground min-[900px]:min-h-svh min-[900px]:p-12">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
          W
        </div>
        <span className="text-sm font-semibold tracking-tight">WorkSphere</span>
      </div>

      <div className="flex max-w-[460px] flex-col gap-4 py-8">
        <h1 className="font-serif text-3xl leading-tight font-semibold min-[900px]:text-4xl">
          Everyone in your company, organized.
        </h1>
        <p className="text-sm text-secondary-foreground/70">
          One workspace for employee records, reporting lines, and access — kept in sync.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-semibold tabular-nums">50+</span>
            <span className="text-xs text-secondary-foreground/70">Employees</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-semibold tabular-nums">{departments.length}</span>
            <span className="text-xs text-secondary-foreground/70">Departments</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-semibold tabular-nums">{employeeRoles.length}</span>
            <span className="text-xs text-secondary-foreground/70">Access levels</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-secondary-foreground/60">
        © 2026 WorkSphere — Employee Management System
      </p>
    </div>
  );
}
