import { DemoLoginProvider } from "@/components/demo-role-button";
import type { DemoRole } from "@/lib/demo-roles";

import { Hero } from "./hero";
import { LandingNav } from "./landing-nav";

export function LandingView({ hasSession, roles }: { hasSession: boolean; roles: DemoRole[] }) {
  return (
    <DemoLoginProvider>
      <div className="flex min-h-svh flex-col">
        <LandingNav hasSession={hasSession} />
        <main className="flex flex-1 flex-col">
          <Hero hasSession={hasSession} roles={roles} />
        </main>
      </div>
    </DemoLoginProvider>
  );
}
