import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DEMO_ADMIN_EMAIL: z.email().optional(),
    DEMO_ADMIN_PASSWORD: z.string().optional(),
    DEMO_HR_EMAIL: z.email().optional(),
    DEMO_HR_PASSWORD: z.string().optional(),
    DEMO_EMPLOYEE_EMAIL: z.email().optional(),
    DEMO_EMPLOYEE_PASSWORD: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SERVER_URL: z.url(),
    NEXT_PUBLIC_SITE_URL: z.url().optional(),
  },
  runtimeEnv: {
    DEMO_ADMIN_EMAIL: process.env.DEMO_ADMIN_EMAIL,
    DEMO_ADMIN_PASSWORD: process.env.DEMO_ADMIN_PASSWORD,
    DEMO_HR_EMAIL: process.env.DEMO_HR_EMAIL,
    DEMO_HR_PASSWORD: process.env.DEMO_HR_PASSWORD,
    DEMO_EMPLOYEE_EMAIL: process.env.DEMO_EMPLOYEE_EMAIL,
    DEMO_EMPLOYEE_PASSWORD: process.env.DEMO_EMPLOYEE_PASSWORD,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
