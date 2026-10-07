import type { Metadata } from "next";

import { LoginScreen } from "@/app/login/login-screen";
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

export const dynamic = "force-dynamic";

export default function RootPage() {
  return <LoginScreen />;
}
