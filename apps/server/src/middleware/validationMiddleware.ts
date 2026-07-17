import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

export function validateData<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: result.error.issues[0]?.message ?? "Invalid request body",
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
