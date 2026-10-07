import { env } from "@WorkSphere/env/web";

import { DEMO_ROLES, type DemoRole } from "./demo-roles";

function readCredentials(role: DemoRole): { email?: string; password?: string } {
  switch (role) {
    case "super_admin":
      return { email: env.DEMO_ADMIN_EMAIL, password: env.DEMO_ADMIN_PASSWORD };
    case "hr_manager":
      return { email: env.DEMO_HR_EMAIL, password: env.DEMO_HR_PASSWORD };
    case "employee":
      return { email: env.DEMO_EMPLOYEE_EMAIL, password: env.DEMO_EMPLOYEE_PASSWORD };
  }
}

export function demoCredentials(role: DemoRole): { email: string; password: string } | null {
  const { email, password } = readCredentials(role);
  return email && password ? { email, password } : null;
}

export function configuredDemoRoles(): DemoRole[] {
  return DEMO_ROLES.filter((role) => demoCredentials(role) !== null);
}
