import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@WorkSphere/ui/components/button";

export function FallbackCta({ hasSession }: { hasSession: boolean }) {
  return (
    <Link href={hasSession ? "/dashboard" : "/login"} className={buttonVariants({ size: "lg" })}>
      {hasSession ? "Open dashboard" : "Sign in"} <ArrowRight />
    </Link>
  );
}
