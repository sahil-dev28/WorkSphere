import { LogoMark } from "@/components/shell/logo-mark";
import { departments, employeeRoles } from "@/lib/enums";

export function BrandPanel() {
  return (
    <div className="flex h-full min-h-[220px] flex-col justify-between relative overflow-hidden border-b border-border bg-card bg-glow p-8 text-card-foreground min-[900px]:border-r min-[900px]:border-b-0 min-[900px]:min-h-svh min-[900px]:p-12">
      <div className="flex items-center gap-2">
        <LogoMark className="size-7" />
        <span className="text-sm font-semibold tracking-tight">WorkSphere</span>
      </div>

      <div className="flex max-w-[460px] flex-col gap-4 py-8">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance min-[900px]:text-4xl">
          Everyone in your company, organized.
        </h1>
        <p className="text-sm text-muted-foreground">
          One workspace for employee records, reporting lines, and access — kept in sync.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-semibold tabular-nums">50+</span>
            <span className="text-xs text-muted-foreground">Employees</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-semibold tabular-nums">{departments.length}</span>
            <span className="text-xs text-muted-foreground">Departments</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-semibold tabular-nums">{employeeRoles.length}</span>
            <span className="text-xs text-muted-foreground">Access levels</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        © 2026 WorkSphere — Employee Management System
      </p>
    </div>
  );
}
