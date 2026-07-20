"use client";

import type { ChangeEvent } from "react";
import { startTransition, useActionState, useState } from "react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@WorkSphere/ui/components/table";

import { importEmployeesAction, type ImportEmployeesResult } from "@/lib/actions/employees";

import { useDirectoryParams } from "./use-directory-params";

export function ImportCsvDialog() {
  const updateParams = useDirectoryParams();
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [result, dispatch, pending] = useActionState<ImportEmployeesResult | null, FormData>(
    importEmployeesAction,
    null,
  );

  function close() {
    updateParams({ action: null, employeeId: null });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    if (selected && !selected.name.toLowerCase().endsWith(".csv")) {
      setClientError("Please select a .csv file.");
      setFile(null);
      event.target.value = "";
      return;
    }

    setClientError(null);
    setFile(selected);
  }

  function handleImport() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    startTransition(() => {
      dispatch(formData);
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Employees from CSV</DialogTitle>
          <DialogDescription>
            {result
              ? "Import finished. Review the results below."
              : "Upload a .csv file to bulk create employees."}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 text-sm">
              <span className="font-medium text-primary">{result.created} created</span>
              <span className="font-medium text-destructive">{result.failed} failed</span>
            </div>

            {result.error ? <p className="text-xs text-destructive">{result.error}</p> : null}

            {result.createdEmployees.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                  Copy these temporary passwords down and share them securely with each employee —
                  they won&apos;t be shown again.
                </p>
                <div className="max-h-56 overflow-y-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Temporary Password</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.createdEmployees.map((employee) => (
                        <TableRow key={employee.email}>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{employee.employeeId}</TableCell>
                          <TableCell className="font-mono">{employee.temporaryPassword}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}

            {result.errors.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">Rows that could not be imported:</p>
                <div className="max-h-56 overflow-y-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.errors.map((rowError) => (
                        <TableRow key={rowError.row}>
                          <TableCell>{rowError.row}</TableCell>
                          <TableCell>{rowError.email || "—"}</TableCell>
                          <TableCell className="text-destructive">{rowError.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="csv-file">CSV file</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                disabled={pending}
                onChange={handleFileChange}
              />
              {clientError ? <p className="text-xs text-destructive">{clientError}</p> : null}
              {file && !clientError ? (
                <p className="text-xs text-muted-foreground">Selected: {file.name}</p>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Expected columns: name, email, phone, department, designation, salary, joiningDate
              (optional), reportingManagerEmail (optional), role (optional, defaults to employee).
            </p>
          </div>
        )}

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            {result ? "Close" : "Cancel"}
          </DialogClose>
          {result ? null : (
            <Button type="button" disabled={!file || pending} onClick={handleImport}>
              {pending ? "Importing..." : "Import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
