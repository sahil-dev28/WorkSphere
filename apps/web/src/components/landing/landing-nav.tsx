import Link from "next/link";

import { buttonVariants } from "@WorkSphere/ui/components/button";

import { ModeToggle } from "@/components/mode-toggle";
import { LogoMark } from "@/components/shell/logo-mark";
import { SITE } from "@/lib/site";

import { GithubIcon } from "./github-icon";

export function LandingNav({ hasSession }: { hasSession: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="text-sm font-semibold tracking-tight">{SITE.name}</span>
        </Link>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <a
            href={SITE.links.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WorkSphere on GitHub"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <GithubIcon />
          </a>
          <Link
            href={hasSession ? "/dashboard" : "/login"}
            className={buttonVariants({ size: "sm", variant: hasSession ? "default" : "outline" })}
          >
            {hasSession ? "Open dashboard" : "Sign in"}
          </Link>
        </div>
      </div>
    </header>
  );
}
