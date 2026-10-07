"use client";

import { cn } from "@WorkSphere/ui/lib/utils";
import { PanelLeft, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@WorkSphere/ui/components/button";

import { useCommandPalette } from "@/components/command-palette/command-palette";

import { ModeToggle } from "@/components/mode-toggle";
import type { DemoSession } from "@/lib/demo-credentials";
import { DEMO_ROLE_META } from "@/lib/demo-roles";

import { getPageMeta } from "./page-meta";
import { useSidebar } from "./sidebar-provider";

export function Topbar({ demo }: { demo?: DemoSession | null }) {
  const pathname = usePathname();
  const { toggle } = useSidebar();
  const { title } = getPageMeta(pathname);
  const { openPalette } = useCommandPalette();

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
        <Button
          variant="outline"
          size="sm"
          onClick={openPalette}
          aria-keyshortcuts="Meta+K Control+K"
          className="w-52 justify-between font-normal text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <Search /> Search…
          </span>
          <kbd className="rounded-sm border border-border px-1.5 font-mono text-[10px]">⌘K</kbd>
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
}
