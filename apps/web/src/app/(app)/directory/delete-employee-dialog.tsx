"use client";

import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEmployeeAction(employeeId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setError(null);
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
