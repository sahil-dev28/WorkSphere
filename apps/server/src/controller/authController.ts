import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "@WorkSphere/env/server";
import { Employee } from "@/models/Employee";
import type { ChangePasswordInput, LoginInput } from "@/schema/auth";
import { AUTH_COOKIE_BASE_OPTIONS, AUTH_COOKIE_NAME } from "@/utils/constants";
import { formatUnknownError } from "@/utils/formatMongooseError";

const signToken = (id: string, role: string): string =>
  jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;

  try {
    const employee = await Employee.findOne({ email }).select("+password");

    if (!employee) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (employee.status !== "active") {
      res.status(401).json({ error: "Account is not active" });
      return;
    }

    const token = signToken(employee.id, employee.role);

    res.cookie(AUTH_COOKIE_NAME, token, {
      ...AUTH_COOKIE_BASE_OPTIONS,
      secure: env.NODE_ENV === "production",
      maxAge: env.JWT_EXPIRES_IN * 1000,
    });

    res.status(200).json({
      data: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        mustChangePassword: employee.mustChangePassword,
      },
    });
  } catch (error) {
    res.status(400).json(formatUnknownError(error));
  }
};

export const getMe = (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.status(200).json({
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      mustChangePassword: req.user.mustChangePassword,
    },
  });
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.status(200).json({ message: "Logged out" });
};

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { currentPassword, newPassword } = req.body as ChangePasswordInput;

  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const employee = await Employee.findById(req.user.id).select("+password");

    if (!employee) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, employee.password);

    if (!isMatch) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }

    employee.password = newPassword;
    employee.mustChangePassword = false;
    await employee.save();

    res.status(200).json({ message: "Password changed" });
  } catch (error) {
    res.status(400).json(formatUnknownError(error));
  }
};
