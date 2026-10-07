import { cookies } from "next/headers";

import { LandingView } from "@/components/landing/landing-view";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { configuredDemoRoles } from "@/lib/demo-credentials";

export default async function LandingPage() {
  const hasSession = (await cookies()).has(AUTH_COOKIE_NAME);
  return <LandingView hasSession={hasSession} roles={configuredDemoRoles()} />;
}
