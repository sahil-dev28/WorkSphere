import { Card, CardContent } from "@WorkSphere/ui/components/card";

import { ChangePasswordFields } from "@/components/auth/change-password-fields";

export default function ChangePasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[440px]">
        <CardContent className="flex flex-col gap-4 py-2">
          <h1 className="text-xl font-semibold tracking-tight">Change password</h1>
          <ChangePasswordFields />
        </CardContent>
      </Card>
    </div>
  );
}
