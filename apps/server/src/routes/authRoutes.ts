import { Router } from "express";

import { changePassword, getMe, login, logout } from "@/controller/authController";
import { authenticate } from "@/middleware/authMiddleware";
import { validateData } from "@/middleware/validationMiddleware";
import { changePasswordSchema, loginSchema } from "@/schema/auth";

export const authRouter: Router = Router();

authRouter.post("/login", validateData(loginSchema), login);
authRouter.get("/me", authenticate, getMe);
authRouter.post("/logout", authenticate, logout);
authRouter.post(
  "/change-password",
  authenticate,
  validateData(changePasswordSchema),
  changePassword,
);
