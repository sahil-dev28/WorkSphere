import type { HydratedDocument } from "mongoose";

import type { EmployeeAttrs } from "@/models/Employee";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<EmployeeAttrs>;
    }
  }
}

export {};
