import { cn } from "@WorkSphere/ui/lib/utils";

import { buttonVariants } from "@WorkSphere/ui/components/button";

import { DemoRoleButton } from "@/components/demo-role-button";
import type { DemoRole } from "@/lib/demo-roles";
import { SITE } from "@/lib/site";

import { FallbackCta } from "./fallback-cta";
import { GithubIcon } from "./github-icon";
import { stagger } from "./stagger";

export function Hero({ hasSession, roles }: { hasSession: boolean; roles: DemoRole[] }) {
  const showRoles = !hasSession && roles.length > 0;

  return (
    <section className="relative flex flex-1 items-center overflow-hidden bg-glow">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center">
        {showRoles ? (
          <span className="animate-in-up inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--glow-strong)]" />
            Live demo · no sign-up
          </span>
        ) : null}

        <h1
          className="animate-in-up mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-balance min-[640px]:text-6xl"
          style={stagger(1)}
        >
          Everyone in your company, organized.
        </h1>
        <p className="animate-in-up mt-4 max-w-xl text-base text-balance text-muted-foreground" style={stagger(2)}>
          {SITE.tagline}
        </p>

        <div className="animate-in-up mt-8 flex w-full max-w-2xl flex-col items-center" style={stagger(3)}>
          {showRoles ? (
            <>
              <p className="mb-3 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Explore as — one click
              </p>
              <div className="grid w-full grid-cols-1 gap-2 min-[640px]:grid-cols-3">
                {roles.map((role) => (
                  <DemoRoleButton key={role} role={role} />
                ))}
              </div>
            </>
          ) : (
            <FallbackCta hasSession={hasSession} />
          )}
        </div>

        <a
          href={SITE.links.repo}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline" }), "animate-in-up mt-4")}
          style={stagger(4)}
        >
          <GithubIcon /> View source on GitHub
        </a>
      </div>
    </section>
  );
}
