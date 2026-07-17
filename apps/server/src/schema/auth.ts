import { z } from "zod";

import { MIN_PASSWORD_LENGTH } from "@/utils/constants";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `New password must be at least ${MIN_PASSWORD_LENGTH} characters`),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
