import { BarChart3, Network, ShieldCheck, Users } from "lucide-react";

import { stagger } from "@/components/landing/stagger";
import { departments, employeeRoles } from "@/lib/enums";

const FEATURES = [
  { icon: Users, title: "Employee directory", text: "Search, filter and export every record." },
  { icon: Network, title: "Interactive org chart", text: "See reporting lines at a glance." },
  { icon: BarChart3, title: "People analytics", text: "Headcount, hiring and team trends." },
  { icon: ShieldCheck, title: "Role-based access", text: "Admin, HR and employee views." },
];

export function BrandPanel() {
  return (
    <div className="flex flex-col gap-6 text-center min-[900px]:text-left">
      <span
        className="animate-in-up inline-flex items-center gap-2 self-center rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground min-[900px]:self-start"
      >
        <span className="size-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_8px_var(--glow-strong)]" />
        Employee management, organized
      </span>

      <h1
        className="animate-in-up text-4xl leading-tight font-semibold tracking-tight text-balance min-[900px]:text-5xl"
        style={stagger(1)}
      >
        Everyone in your company,{" "}
        <span className="bg-linear-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">organized.</span>
      </h1>
      <p className="animate-in-up text-sm text-balance text-muted-foreground min-[900px]:text-base" style={stagger(2)}>
        One workspace for employee records, reporting lines, and access — kept in sync.
      </p>

      <ul className="animate-in-up hidden grid-cols-2 gap-3 min-[900px]:grid" style={stagger(3)}>
        {FEATURES.map((feature) => (
          <li
            key={feature.title}
            className="flex gap-3 rounded-lg border border-border bg-card/60 p-3 backdrop-blur-sm transition-colors hover:border-primary/30"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
              <feature.icon className="size-4" />
            </span>
            <span className="flex flex-col">
              <span className="text-[13px] font-semibold">{feature.title}</span>
              <span className="text-xs text-muted-foreground">{feature.text}</span>
            </span>
          </li>
        ))}
      </ul>

      <dl className="animate-in-up hidden grid-cols-3 gap-4 min-[900px]:grid" style={stagger(4)}>
        <div className="flex flex-col gap-0.5">
          <dt className="order-2 text-xs text-muted-foreground">Employees</dt>
          <dd className="text-2xl font-semibold tabular-nums">50+</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="order-2 text-xs text-muted-foreground">Departments</dt>
          <dd className="text-2xl font-semibold tabular-nums">{departments.length}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="order-2 text-xs text-muted-foreground">Access levels</dt>
          <dd className="text-2xl font-semibold tabular-nums">{employeeRoles.length}</dd>
        </div>
      </dl>
    </div>
  );
}
