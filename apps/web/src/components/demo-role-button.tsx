"use client";

import { cn } from "@WorkSphere/ui/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";
import { createContext, use, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@WorkSphere/ui/components/button";

import { demoLoginAction } from "@/lib/actions/auth";
import { DEMO_ROLE_META, type DemoRole } from "@/lib/demo-roles";

interface DemoLoginContextValue {
  pendingRole: DemoRole | null;
  enter: (role: DemoRole) => void;
}

const DemoLoginContext = createContext<DemoLoginContextValue | null>(null);

export function DemoLoginProvider({ children }: { children: React.ReactNode }) {
  const [pendingRole, setPendingRole] = useState<DemoRole | null>(null);
  const [, startTransition] = useTransition();

  function enter(role: DemoRole) {
    setPendingRole(role);
    startTransition(async () => {
      const result = await demoLoginAction(role);
      if (result?.error) {
        toast.error(result.error);
        setPendingRole(null);
      }
    });
  }

  return <DemoLoginContext value={{ pendingRole, enter }}>{children}</DemoLoginContext>;
}

export function DemoRoleButton({
  role,
  variant = "card",
  className,
}: {
  role: DemoRole;
  variant?: "card" | "button";
  className?: string;
}) {
  const ctx = use(DemoLoginContext);
  if (!ctx) {
    throw new Error("DemoRoleButton must be used within a DemoLoginProvider");
  }

  const meta = DEMO_ROLE_META[role];
  const pending = ctx.pendingRole === role;
  const disabled = ctx.pendingRole !== null;

  if (variant === "button") {
    return (
      <Button
        variant={role === "super_admin" ? "default" : "outline"}
        disabled={disabled}
        onClick={() => ctx.enter(role)}
        className={className}
      >
        {pending ? <Loader2 className="animate-spin" /> : null}
        Enter as {meta.shortLabel}
        <ArrowRight />
      </Button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => ctx.enter(role)}
      aria-label={`Explore the demo as ${meta.label}`}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-px hover:border-primary/30 hover:shadow-glow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-md", meta.tone)}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <meta.icon className="size-4" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[13px] font-semibold">{meta.label}</span>
        <span className="truncate text-xs text-muted-foreground">{meta.summary}</span>
      </span>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </button>
  );
}
