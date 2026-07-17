import { Router } from "express";

import { createEmployee, getEmployees } from "@/controller/employeeController";
import { validateData } from "@/middleware/validationMiddleware";
import { createEmployeeSchema } from "@/schema/employee";

export const employeeRouter: Router = Router();

employeeRouter
  .route("/")
  .get(getEmployees)
  .post(validateData(createEmployeeSchema), createEmployee);
