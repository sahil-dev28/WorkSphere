import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "@WorkSphere/env/server";
import { Employee } from "@/models/Employee";
import { AUTH_COOKIE_NAME } from "@/utils/constants";

interface AuthTokenPayload {
  id: string;
  role: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;

    if (!token) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    const employee = await Employee.findById(payload.id);

    if (!employee || employee.status !== "active") {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    req.user = employee;
    next();
  } catch {
    res.status(401).json({ error: "Not authenticated" });
  }
};

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  };
}

export const enforcePasswordChange = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.mustChangePassword) {
    res.status(403).json({ error: "Password change required" });
    return;
  }

  next();
};
