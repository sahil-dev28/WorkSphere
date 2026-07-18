"use client";

import { Check } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { Badge } from "@WorkSphere/ui/components/badge";
import { Button } from "@WorkSphere/ui/components/button";
import { Input } from "@WorkSphere/ui/components/input";
import { Label } from "@WorkSphere/ui/components/label";

import { updateEmployeeAction, type EmployeeFormState } from "@/lib/actions/employees";
import type { EditableField } from "@/lib/permissions";
import type { Employee } from "@/lib/types";

const initialState: EmployeeFormState = {};

export function ProfileEditableFields({
  employee,
  editableFields,
}: {
  employee: Employee;
  editableFields: EditableField[];
}) {
  const action = updateEmployeeAction.bind(null, employee._id);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!state.success) return;

    setShowSaved(true);
    const timeout = setTimeout(() => setShowSaved(false), 3000);
    return () => clearTimeout(timeout);
  }, [state]);

  const canEdit = (field: EditableField) => editableFields.includes(field);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Editable Details
        </span>
        <Badge variant="secondary">You can edit these fields</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Full Name</Label>
          <Input
            name="name"
            defaultValue={employee.name}
            required
            minLength={3}
            maxLength={60}
            disabled={!canEdit("name")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Email</Label>
          <Input
            name="email"
            type="email"
            defaultValue={employee.email}
            required
            disabled={!canEdit("email")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Phone</Label>
          <Input name="phone" defaultValue={employee.phone} required disabled={!canEdit("phone")} />
        </div>
      </div>

      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
        {showSaved ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <Check className="size-3.5" /> Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}
