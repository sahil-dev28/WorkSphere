import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

export function validateData<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? "");
        if (field && !(field in fieldErrors)) {
          fieldErrors[field] = issue.message;
        }
      }

      res.status(400).json({
        error: result.error.issues[0]?.message ?? "Invalid request body",
        fieldErrors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
