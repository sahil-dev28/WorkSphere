import { Router } from "express";

import { changePassword, login, logout } from "@/controller/authController";
import { authenticate } from "@/middleware/authMiddleware";
import { validateData } from "@/middleware/validationMiddleware";
import { changePasswordSchema, loginSchema } from "@/schema/auth";

export const authRouter: Router = Router();

authRouter.post("/login", validateData(loginSchema), login);
authRouter.post("/logout", authenticate, logout);
authRouter.post(
  "/change-password",
  authenticate,
  validateData(changePasswordSchema),
  changePassword,
);
