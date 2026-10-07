"use client";

import { useEffect, useState } from "react";

export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

// Rendered after mount so the greeting follows the visitor's clock, not the server's.
function useClientNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  return now;
}

export function Greeting({ name }: { name: string }) {
  const now = useClientNow();
  const firstName = name.trim().split(/\s+/)[0] ?? name;
  return <>{now ? `${greetingFor(now.getHours())}, ${firstName}` : `Welcome, ${firstName}`}</>;
}

export function TodayLabel() {
  const now = useClientNow();
  return (
    <span suppressHydrationWarning>
      {now ? now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : " "}
    </span>
  );
}
