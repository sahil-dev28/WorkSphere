"use client";

import { Button } from "@WorkSphere/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@WorkSphere/ui/components/dialog";

import { ChangePasswordFields } from "./change-password-fields";

export function ChangePasswordDialog({
  trigger,
  nativeButton = true,
}: {
  trigger: React.ReactElement;
  nativeButton?: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} nativeButton={nativeButton} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Update the password for your account.</DialogDescription>
        </DialogHeader>
        <ChangePasswordFields
          cancelSlot={
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
          }
        />
      </DialogContent>
    </Dialog>
  );
}
