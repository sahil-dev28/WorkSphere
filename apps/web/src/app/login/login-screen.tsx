import { LandingNav } from "@/components/landing/landing-nav";
import { demoAccounts } from "@/lib/demo-credentials";

import { BrandPanel } from "./brand-panel";
import { LoginCard } from "./login-card";

export function LoginScreen() {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingNav hasSession={false} />
      <main className="relative flex flex-1 overflow-hidden bg-glow">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[48px_48px] opacity-40 mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-10 min-[900px]:grid-cols-[1fr_440px] min-[900px]:gap-16 min-[900px]:py-16">
          <BrandPanel />
          <LoginCard demoAccounts={demoAccounts()} />
        </div>
      </main>
    </div>
  );
}
