import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@WorkSphere/ui/components/button";

export function FallbackCta({ hasSession, size = "lg" }: { hasSession: boolean; size?: "default" | "lg" }) {
  return (
    <Link href={hasSession ? "/dashboard" : "/login"} className={buttonVariants({ size })}>
      {hasSession ? "Open dashboard" : "Sign in"} <ArrowRight />
    </Link>
  );
}
