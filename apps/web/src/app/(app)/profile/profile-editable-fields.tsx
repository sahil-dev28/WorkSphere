"use client";

import { Check } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@WorkSphere/ui/components/badge";
import { Button } from "@WorkSphere/ui/components/button";
import { Input } from "@WorkSphere/ui/components/input";
import { Label } from "@WorkSphere/ui/components/label";

import { updateEmployeeAction, type EmployeeFormState } from "@/lib/actions/employees";
import type { EditableField } from "@/lib/permissions";
import type { Employee } from "@/lib/types";

const initialState: EmployeeFormState = {};

interface FormValues {
  name: string;
  email: string;
  phone: string;
}

export function ProfileEditableFields({
  employee,
  editableFields,
}: {
  employee: Employee;
  editableFields: EditableField[];
}) {
  const action = updateEmployeeAction.bind(null, employee._id);
  const [state, dispatch, pending] = useActionState(action, initialState);
  const [showSaved, setShowSaved] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: employee.name, email: employee.email, phone: employee.phone },
  });

  useEffect(() => {
    if (!state.success) return;

    setShowSaved(true);
    const timeout = setTimeout(() => setShowSaved(false), 3000);
    return () => clearTimeout(timeout);
  }, [state]);

  useEffect(() => {
    if (!state.fieldErrors) return;
    for (const [field, message] of Object.entries(state.fieldErrors)) {
      setError(field as keyof FormValues, { type: "server", message });
    }
  }, [state.fieldErrors, setError]);

  const canEdit = (field: EditableField) => editableFields.includes(field);

  function onValid(data: FormValues) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value === "") continue;
      formData.append(key, value);
    }
    dispatch(formData);
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-4">
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
      </div>

      {state.error && !state.fieldErrors ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}

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
