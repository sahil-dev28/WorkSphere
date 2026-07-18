"use client";

import { useActionState, useEffect, useState } from "react";

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
  const [name, setName] = useState(employee?.name ?? "");
  const [managerId, setManagerId] = useState<string | null>(employee?.reportingManager ?? null);

  const isAdd = mode === "add";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const managerChanged = isEdit && managerId !== (employee?.reportingManager ?? null);

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
      const result = await updateManagerAction(employee._id, managerId);
      if (result.error) {
        return { error: result.error };
      }
    }

    if (isAdd) {
      return createEmployeeAction(prevState, formData);
    }
    return updateEmployeeAction(employee!._id, prevState, formData);
  }

  const [state, formAction, pending] = useActionState(saveAction, initialState);

  useEffect(() => {
    if (state.success) close();
    // close() is stable across renders in practice (its identity depends
    // only on useDirectoryParams, which itself is a stable callback) — omit
    // it so this only re-fires when the action's result actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function canEdit(field: EditableField): boolean {
    return !isView && editableFields.includes(field);
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

        <form action={formAction} className="flex flex-col gap-4">
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
                name="name"
                defaultValue={employee?.name}
                required
                minLength={3}
                maxLength={60}
                disabled={!canEdit("name")}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                defaultValue={employee?.email}
                required
                disabled={!canEdit("email")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Phone</Label>
              <Input name="phone" defaultValue={employee?.phone} required disabled={!canEdit("phone")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Department</Label>
              <Select
                name="department"
                defaultValue={employee?.department}
                required={isAdd}
                disabled={!canEdit("department")}
              >
                <SelectTrigger>
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
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Designation</Label>
              <Input
                name="designation"
                defaultValue={employee?.designation}
                required
                minLength={2}
                maxLength={60}
                disabled={!canEdit("designation")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Salary (USD)</Label>
              {!isAdd && employee?.salary === undefined ? (
                <p className="flex h-8 items-center text-xs text-muted-foreground">Hidden</p>
              ) : (
                <Input
                  name="salary"
                  type="number"
                  min={1}
                  step="0.01"
                  defaultValue={employee?.salary}
                  required={isAdd}
                  disabled={!canEdit("salary")}
                />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Joining Date</Label>
              <Input
                name="joiningDate"
                type="date"
                defaultValue={employee?.joiningDate ? employee.joiningDate.slice(0, 10) : undefined}
                disabled={!canEdit("joiningDate")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select name="status" defaultValue={employee?.status ?? "active"} disabled={!canEdit("status")}>
                <SelectTrigger>
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
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>System Role</Label>
              <Select
                name="role"
                defaultValue={employee?.role ?? "employee"}
                disabled={isView || !canEditRole}
              >
                <SelectTrigger>
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
              <p className="text-xs text-muted-foreground">Determines what this person can access.</p>
            </div>
            {isAdd ? (
              <div className="flex flex-col gap-1.5">
                <Label>Temporary Password</Label>
                <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
              </div>
            ) : null}
            <div className="flex flex-col gap-1.5 min-[500px]:col-span-2">
              <Label>Reporting Manager</Label>
              {isAdd ? (
                <Select name="reportingManager" defaultValue={NO_MANAGER}>
                  <SelectTrigger>
                    <SelectValue placeholder="Reporting manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_MANAGER}>— No manager —</SelectItem>
                    {managerRoster.map((m) => (
                      <SelectItem key={m._id} value={m._id}>
                        {m.name} — {m.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : canReassignManager ? (
                <Select
                  value={managerId ?? NO_MANAGER}
                  disabled={isView || pending}
                  onValueChange={(v) => setManagerId(v === NO_MANAGER ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Reporting manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_MANAGER}>— No manager —</SelectItem>
                    {/* Pre-filtered by the caller: self and all descendants
                        (direct + indirect reports) are excluded so a cycle
                        can't even be selected here, not just rejected on
                        submit. */}
                    {managerRoster.map((m) => (
                      <SelectItem key={m._id} value={m._id}>
                        {m.name} — {m.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="flex h-8 items-center text-xs text-muted-foreground">
                  {employee?.reportingManager ? (managerName ?? "Assigned (name unavailable)") : "No manager"}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Circular reporting is prevented — this employee&apos;s own reports are excluded.
              </p>
            </div>
          </div>

          {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}

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
