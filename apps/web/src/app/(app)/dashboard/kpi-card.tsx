import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Card, CardContent } from "@WorkSphere/ui/components/card";

import { CountUp } from "@/components/count-up";

import { Sparkline } from "./sparkline";

export function KpiCard({
  href,
  label,
  value,
  icon: Icon,
  tone,
  hint,
  trend,
  index,
}: {
  href: Route;
  label: string;
  value: number;
  icon: LucideIcon;
  tone: { badge: string; text: string };
  hint?: React.ReactNode;
  trend?: number[];
  index: number;
}) {
  return (
    <Link href={href} className="group rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <Card variant="interactive" className="animate-in-up h-full" style={{ "--i": index } as CSSProperties}>
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">{label}</span>
            <div className={`flex size-8 items-center justify-center rounded-md ${tone.badge}`}>
              <Icon className={`size-4 ${tone.text}`} />
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <CountUp value={value} className="text-3xl font-semibold tracking-tight" />
            {trend ? <Sparkline values={trend} className={`h-8 w-24 ${tone.text}`} /> : null}
          </div>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </CardContent>
      </Card>
    </Link>
  );
}
