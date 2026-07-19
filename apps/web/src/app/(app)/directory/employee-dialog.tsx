"use client";

import { startTransition, useActionState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@WorkSphere/ui/components/avatar";
import { Button } from "@WorkSphere/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@WorkSphere/ui/components/dialog";
import { Input } from "@WorkSphere/ui/components/input";
import { Label } from "@WorkSphere/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@WorkSphere/ui/components/select";

import {
  createEmployeeAction,
  updateEmployeeAction,
  updateManagerAction,
  type EmployeeFormState,
} from "@/lib/actions/employees";
import { departments, employeeStatuses, ROLE_LABELS, STATUS_LABELS } from "@/lib/enums";
import { initials } from "@/lib/format";
import type { EditableField } from "@/lib/permissions";
import type { Employee } from "@/lib/types";

import { useDirectoryParams } from "./use-directory-params";

export type EmployeeDialogMode = "add" | "edit" | "view";

const NO_MANAGER = "none";

interface ManagerOption {
  _id: string;
  name: string;
  designation: string;
  role: Employee["role"];
  department: Employee["department"];
}

interface EmployeeDialogProps {
  mode: EmployeeDialogMode;
  employee?: Employee;
  editableFields: EditableField[];
  canEditRole: boolean;
  roleOptions: Employee["role"][];
  canReassignManager: boolean;
  // Pre-filtered by the caller — in edit mode this excludes the employee
  // themselves and all of their descendants, so the select never offers a
  // choice that would create a circular reporting chain.
  managerRoster: ManagerOption[];
  // Server-resolved (same self-only-RBAC-aware fallback as the profile
  // page) — not derived from managerRoster, which is empty for viewers who
  // can't reassign managers and would otherwise misreport a real manager as
  // "No manager" just because the roster wasn't fetched for them.
  managerName: string | null;
}

const initialState: EmployeeFormState = {};

interface FormValues {
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: string;
  joiningDate: string;
  status: string;
  role: string;
  password: string;
  reportingManager: string;
}

function defaultValuesFor(employee: Employee | undefined): FormValues {
  return {
    name: employee?.name ?? "",
    email: employee?.email ?? "",
    phone: employee?.phone ?? "",
    department: employee?.department ?? "",
    designation: employee?.designation ?? "",
    salary: employee?.salary !== undefined ? String(employee.salary) : "",
    joiningDate: employee?.joiningDate ? employee.joiningDate.slice(0, 10) : "",
    status: employee?.status ?? "active",
    role: employee?.role ?? "employee",
    password: "",
    reportingManager: employee?.reportingManager ?? NO_MANAGER,
  };
}

export function EmployeeDialog({
  mode,
  employee,
  editableFields,
  canEditRole,
  roleOptions,
  canReassignManager,
  managerRoster,
  managerName,
}: EmployeeDialogProps) {
  const updateParams = useDirectoryParams();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaultValuesFor(employee) });

  const isAdd = mode === "add";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const reportingManager = watch("reportingManager");
  const name = watch("name");
  const selectedRole = watch("role");
  const selectedDepartment = watch("department");
  const managerChanged =
    isEdit && reportingManager !== (employee?.reportingManager ?? NO_MANAGER);

  // Mirrors the backend's hierarchy rules (apps/server/src/utils/hierarchyRules.ts):
  // an employee can only report to their own department's hr_manager (or the
  // super_admin, if that department has no head yet); an hr_manager can only
  // report to the super_admin; a super_admin has no manager at all.
  const validManagers = managerRoster.filter((m) => {
    if (selectedRole === "super_admin") return false;
    if (selectedRole === "hr_manager") return m.role === "super_admin";
    return m.role === "super_admin" || (m.role === "hr_manager" && m.department === selectedDepartment);
  });

  function close() {
    updateParams({ action: null, employeeId: null });
  }

  // The general PUT applies reportingManager without the cycle guard — that
  // check only lives in the separate PATCH /:id/manager handler — so a
  // manager change goes through that endpoint first, before the rest of the
  // form's PUT, even though the UI presents Save as a single action.
  async function saveAction(
    prevState: EmployeeFormState,
    formData: FormData,
  ): Promise<EmployeeFormState> {
    if (managerChanged && employee) {
      const newManagerId = reportingManager === NO_MANAGER ? null : reportingManager;
      const result = await updateManagerAction(employee._id, newManagerId);
      if (result.error) {
        return { error: result.error, fieldErrors: { reportingManager: result.error } };
      }
    }

    if (isAdd) {
      return createEmployeeAction(prevState, formData);
    }
    return updateEmployeeAction(employee!._id, prevState, formData);
  }

  const [state, dispatch, pending] = useActionState(saveAction, initialState);

  useEffect(() => {
    if (state.success) close();
    // close() is stable across renders in practice (its identity depends
    // only on useDirectoryParams, which itself is a stable callback) — omit
    // it so this only re-fires when the action's result actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (!state.fieldErrors) return;
    for (const [field, message] of Object.entries(state.fieldErrors)) {
      setError(field as keyof FormValues, { type: "server", message });
    }
  }, [state.fieldErrors, setError]);

  function canEdit(field: EditableField): boolean {
    return !isView && editableFields.includes(field);
  }

  // The main PUT never carries reportingManager — a change goes through the
  // separate cycle-guarded PATCH above instead (see saveAction), so it's
  // deliberately dropped here even though the field is part of FormValues.
  function onValid(data: FormValues) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (key === "reportingManager") {
        if (isAdd && value !== NO_MANAGER) formData.append(key, value);
        continue;
      }
      if (value === "") continue;
      formData.append(key, value);
    }
    startTransition(() => {
      dispatch(formData);
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isAdd ? "Add Employee" : isView ? "Employee Details" : "Edit Employee"}
          </DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Create a new employee record."
              : isView
                ? "Viewing this employee's record."
                : "Update this employee's details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-4">
          <div className="flex justify-center">
            <Avatar className="size-16">
              {employee?.profileImage ? <AvatarImage src={employee.profileImage} alt="" /> : null}
              <AvatarFallback className="text-base">
                {initials(name || employee?.name || "New")}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="grid grid-cols-1 gap-4 min-[500px]:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Full Name</Label>
              <Input
                disabled={!canEdit("name")}
                aria-invalid={!!errors.name}
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 3, message: "Name must be at least 3 characters" },
                  maxLength: { value: 60, message: "Name cannot exceed 60 characters" },
                })}
              />
              {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                disabled={!canEdit("email")}
                aria-invalid={!!errors.email}
                {...register("email", { required: "Email is required" })}
              />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Phone</Label>
              <Input
                disabled={!canEdit("phone")}
                aria-invalid={!!errors.phone}
                {...register("phone", { required: "Phone is required" })}
              />
              {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Department</Label>
              <Controller
                name="department"
                control={control}
                rules={{ required: isAdd ? "Department is required" : false }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    disabled={!canEdit("department")}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger aria-invalid={!!errors.department}>
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department ? (
                <p className="text-xs text-destructive">{errors.department.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Designation</Label>
              <Input
                disabled={!canEdit("designation")}
                aria-invalid={!!errors.designation}
                {...register("designation", {
                  required: "Designation is required",
                  minLength: { value: 2, message: "Designation must be at least 2 characters" },
                  maxLength: { value: 60, message: "Designation cannot exceed 60 characters" },
                })}
              />
              {errors.designation ? (
                <p className="text-xs text-destructive">{errors.designation.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Salary (USD)</Label>
              {!isAdd && employee?.salary === undefined ? (
                <p className="flex h-8 items-center text-xs text-muted-foreground">Hidden</p>
              ) : (
                <>
                  <Input
                    type="number"
                    min={1}
                    step="0.01"
                    disabled={!canEdit("salary")}
                    aria-invalid={!!errors.salary}
                    {...register("salary", { required: isAdd ? "Salary is required" : false })}
                  />
                  {errors.salary ? (
                    <p className="text-xs text-destructive">{errors.salary.message}</p>
                  ) : null}
                </>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Joining Date</Label>
              <Input
                type="date"
                disabled={!canEdit("joiningDate")}
                aria-invalid={!!errors.joiningDate}
                {...register("joiningDate")}
              />
              {errors.joiningDate ? (
                <p className="text-xs text-destructive">{errors.joiningDate.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} disabled={!canEdit("status")} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={!!errors.status}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status ? <p className="text-xs text-destructive">{errors.status.message}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>System Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    disabled={isView || !canEditRole}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger aria-invalid={!!errors.role}>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">Determines what this person can access.</p>
              {errors.role ? <p className="text-xs text-destructive">{errors.role.message}</p> : null}
            </div>
            {isAdd ? (
              <div className="flex flex-col gap-1.5">
                <Label>Temporary Password</Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register("password", {
                    required: "Temporary password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                />
                {errors.password ? (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-col gap-1.5 min-[500px]:col-span-2">
              <Label>Reporting Manager</Label>
              {isAdd ? (
                <Controller
                  name="reportingManager"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!errors.reportingManager}>
                        <SelectValue placeholder="Reporting manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_MANAGER}>— No manager —</SelectItem>
                        {validManagers.map((m) => (
                          <SelectItem key={m._id} value={m._id}>
                            {m.name} — {m.designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              ) : canReassignManager ? (
                <Controller
                  name="reportingManager"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} disabled={isView || pending} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={!!errors.reportingManager}>
                        <SelectValue placeholder="Reporting manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_MANAGER}>— No manager —</SelectItem>
                        {/* Pre-filtered by the caller (self + descendants
                            excluded so a cycle can't even be selected here)
                            and then narrowed to same-department head / CEO
                            above, matching the backend's hierarchy rules. */}
                        {validManagers.map((m) => (
                          <SelectItem key={m._id} value={m._id}>
                            {m.name} — {m.designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              ) : (
                <p className="flex h-8 items-center text-xs text-muted-foreground">
                  {employee?.reportingManager ? (managerName ?? "Assigned (name unavailable)") : "No manager"}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Circular reporting is prevented — this employee&apos;s own reports are excluded.
              </p>
              {errors.reportingManager ? (
                <p className="text-xs text-destructive">{errors.reportingManager.message}</p>
              ) : null}
            </div>
          </div>

          {state.error && !state.fieldErrors ? (
            <p className="text-xs text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              {isView ? "Close" : "Cancel"}
            </DialogClose>
            {isView ? null : (
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : isAdd ? "Add Employee" : "Save Employee"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
