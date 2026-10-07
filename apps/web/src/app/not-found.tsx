import Link from "next/link";

import { buttonVariants } from "@WorkSphere/ui/components/button";

import { LogoMark } from "@/components/shell/logo-mark";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-glow p-6 text-center">
      <LogoMark className="size-9 text-base" />
      <div className="flex flex-col gap-2">
        <p className="font-mono text-sm text-primary">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="max-w-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
      </div>
      <div className="flex gap-2">
        <Link href="/" className={buttonVariants()}>
          Go home
        </Link>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Open dashboard
        </Link>
      </div>
    </main>
  );
}
