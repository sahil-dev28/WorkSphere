"use client";

import { cn } from "@WorkSphere/ui/lib/utils";
import { PanelLeft, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@WorkSphere/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@WorkSphere/ui/components/tooltip";

import { ModeToggle } from "@/components/mode-toggle";
import type { DemoSession } from "@/lib/demo-credentials";
import { DEMO_ROLE_META } from "@/lib/demo-roles";

import { getPageMeta } from "./page-meta";
import { useSidebar } from "./sidebar-provider";

export function Topbar({ demo }: { demo?: DemoSession | null }) {
  const pathname = usePathname();
  const { toggle } = useSidebar();
  const { title } = getPageMeta(pathname);

  return (
    <header className="sticky top-0 z-10 hidden h-14 items-center justify-between gap-4 border-b border-border bg-background/70 px-6 backdrop-blur-md min-[860px]:flex">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label="Toggle sidebar">
          <PanelLeft />
        </Button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[13px]">
          <span className="text-muted-foreground">WorkSphere</span>
          <span aria-hidden className="text-border">/</span>
          <span className="truncate font-medium text-foreground">{title}</span>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {demo ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap",
              DEMO_ROLE_META[demo.current].tone,
            )}
          >
            Demo · {DEMO_ROLE_META[demo.current].label}
          </span>
        ) : null}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                aria-disabled
                className="w-52 cursor-default justify-between font-normal text-muted-foreground hover:border-border"
              />
            }
          >
            <span className="flex items-center gap-2">
              <Search /> Search…
            </span>
            <kbd className="rounded-sm border border-border px-1.5 font-mono text-[10px]">⌘K</kbd>
          </TooltipTrigger>
          <TooltipContent>Coming soon</TooltipContent>
        </Tooltip>
        <ModeToggle />
      </div>
    </header>
  );
}
