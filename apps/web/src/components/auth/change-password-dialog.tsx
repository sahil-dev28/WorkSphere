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

// A voluntary change — unlike the forced-change gate page, this one is
// cancellable, hence the Dialog wrapper instead of a full page.
export function ChangePasswordDialog({ trigger }: { trigger: React.ReactElement }) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
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
