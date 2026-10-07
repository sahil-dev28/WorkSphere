"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@WorkSphere/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@WorkSphere/ui/components/empty";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle />
          </EmptyMedia>
          <EmptyTitle role="heading" aria-level={2}>
            Something went wrong on this page
          </EmptyTitle>
          <EmptyDescription>
            The rest of WorkSphere still works. Try again, or head back to the dashboard.
            {error.digest ? <span className="mt-2 block font-mono text-xs">Ref: {error.digest}</span> : null}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button onClick={reset}>Try again</Button>
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            Back to dashboard
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
}
