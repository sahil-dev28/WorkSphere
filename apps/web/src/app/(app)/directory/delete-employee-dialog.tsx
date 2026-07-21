"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";

import { Button } from "@WorkSphere/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@WorkSphere/ui/components/dialog";

import { deleteEmployeeAction } from "@/lib/actions/employees";

export function DeleteEmployeeDialog({
  employeeId,
  employeeName,
  trigger,
}: {
  employeeId: string;
  employeeName: string;
  trigger: React.ReactElement;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => deleteEmployeeAction(employeeId),
    onSuccess: (result) => {
      if (result.error) return;
      queryClient.invalidateQueries({ queryKey: ["employees", "table"] });
      setOpen(false);
    },
    onError: (error) => {
      console.error("Failed to delete employee:", error);
    },
  });

  const error =
    mutation.data?.error ?? (mutation.isError ? "Something went wrong. Please try again." : null);
  const pending = mutation.isPending;

  function handleDelete() {
    mutation.mutate();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) mutation.reset();
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="flex size-10 items-center justify-center bg-destructive/10 text-destructive">
            <TriangleAlert className="size-5" />
          </div>
          <DialogTitle>Delete {employeeName}?</DialogTitle>
          <DialogDescription>
            This soft-deletes the employee record. This cannot be undone from the UI.
          </DialogDescription>
        </DialogHeader>

        {error ? <p className="text-center text-xs text-destructive">{error}</p> : null}

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />} disabled={pending}>
            Cancel
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
