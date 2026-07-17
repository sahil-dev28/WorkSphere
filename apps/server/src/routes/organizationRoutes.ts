import { Router } from "express";

import { getOrganizationTree } from "@/controller/organizationController";
import {
  authenticate,
  authorize,
  enforcePasswordChange,
} from "@/middleware/authMiddleware";

export const organizationRouter: Router = Router();

organizationRouter.get(
  "/tree",
  authenticate,
  enforcePasswordChange,
  authorize("super_admin", "hr_manager"),
  getOrganizationTree,
);
