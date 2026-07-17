import { Router } from "express";

import { getDashboardStats } from "@/controller/dashboardController";
import {
  authenticate,
  authorize,
  enforcePasswordChange,
} from "@/middleware/authMiddleware";

export const dashboardRouter: Router = Router();

dashboardRouter.get(
  "/stats",
  authenticate,
  enforcePasswordChange,
  authorize("super_admin", "hr_manager"),
  getDashboardStats,
);
