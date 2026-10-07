import type { Metadata } from "next";
import { cookies } from "next/headers";

import { LandingView } from "@/components/landing/landing-view";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { configuredDemoRoles } from "@/lib/demo-credentials";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    type: "website",
    images: [{ url: "/landing/og.png", width: 1200, height: 630, alt: SITE.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/landing/og.png"],
  },
};

export default async function LandingPage() {
  const hasSession = (await cookies()).has(AUTH_COOKIE_NAME);
  return <LandingView hasSession={hasSession} roles={configuredDemoRoles()} />;
}
