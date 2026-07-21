import { Router } from "express";

import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  getReportees,
  importEmployees,
  updateEmployee,
  updateManager,
} from "@/controller/employeeController";
import {
  authenticate,
  authorize,
  enforcePasswordChange,
} from "@/middleware/authMiddleware";
import { uploadCsv } from "@/middleware/uploadMiddleware";
import { validateData } from "@/middleware/validationMiddleware";
import {
  createEmployeeSchema,
  employeeQuerySchema,
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
    validateData(employeeQuerySchema, "query"),
    getEmployees,
  )
  .post(
    authenticate,
    enforcePasswordChange,
    authorize("super_admin", "hr_manager"),
    validateData(createEmployeeSchema),
    createEmployee,
  );

employeeRouter.post(
  "/import",
  authenticate,
  enforcePasswordChange,
  authorize("super_admin", "hr_manager"),
  uploadCsv,
  importEmployees,
);

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
