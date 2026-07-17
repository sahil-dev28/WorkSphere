import { Router } from "express";

import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  getReportees,
  updateEmployee,
  updateManager,
} from "@/controller/employeeController";
import {
  authenticate,
  authorize,
  enforcePasswordChange,
} from "@/middleware/authMiddleware";
import { validateData } from "@/middleware/validationMiddleware";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateManagerSchema,
} from "@/schema/employee";

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

// No authorize() here — all three roles can reach these handlers, scoped by
// resource ownership inside the controller (same pattern as the HR/super_admin
// guard already used in createEmployee).
employeeRouter
  .route("/:id")
  .get(authenticate, enforcePasswordChange, getEmployeeById)
  .put(
    authenticate,
    enforcePasswordChange,
    validateData(updateEmployeeSchema),
    updateEmployee,
  )
  .delete(
    authenticate,
    enforcePasswordChange,
    authorize("super_admin"),
    deleteEmployee,
  );

// Same no-authorize() pattern — employee is allowed through for the
// self-viewing case, blocked from everyone else's inside the controller.
employeeRouter.get(
  "/:id/reportees",
  authenticate,
  enforcePasswordChange,
  getReportees,
);

employeeRouter.patch(
  "/:id/manager",
  authenticate,
  enforcePasswordChange,
  authorize("super_admin", "hr_manager"),
  validateData(updateManagerSchema),
  updateManager,
);
