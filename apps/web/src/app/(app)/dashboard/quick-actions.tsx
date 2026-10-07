import { Network, Plus, Upload } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@WorkSphere/ui/components/button";

export function AdminQuickActions() {
  return (
    <>
      <Link href="/org-chart" className={buttonVariants({ variant: "ghost" })}>
        <Network /> Org chart
      </Link>
      <Link href="/directory?action=import" className={buttonVariants({ variant: "outline" })}>
        <Upload /> Import CSV
      </Link>
      <Link href="/directory?action=add" className={buttonVariants()}>
        <Plus /> Add employee
      </Link>
    </>
  );
}
