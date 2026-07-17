import { Router } from "express";

import { createEmployee, getEmployees } from "@/controller/employeeController";
import {
  authenticate,
  authorize,
  enforcePasswordChange,
} from "@/middleware/authMiddleware";
import { validateData } from "@/middleware/validationMiddleware";
import { createEmployeeSchema } from "@/schema/employee";

export const employeeRouter: Router = Router();

employeeRouter
  .route("/")
  .get(
    authenticate,
    enforcePasswordChange,
    authorize("super_admin", "hr_manager"),
    getEmployees,
  )
  .post(
    authenticate,
    enforcePasswordChange,
    authorize("super_admin", "hr_manager"),
    validateData(createEmployeeSchema),
    createEmployee,
  );
