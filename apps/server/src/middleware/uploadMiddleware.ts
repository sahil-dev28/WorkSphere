import type { NextFunction, Request, Response } from "express";
import multer, { type FileFilterCallback } from "multer";

import { CSV_IMPORT_MAX_FILE_SIZE_BYTES } from "@/utils/constants";

function csvFileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (!file.originalname.toLowerCase().endsWith(".csv")) {
    cb(new Error("Only .csv files are accepted"));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: csvFileFilter,
  limits: { fileSize: CSV_IMPORT_MAX_FILE_SIZE_BYTES },
});

// Wraps multer's single-file upload so a rejected/oversized file replies with
// the project's standard { error } shape instead of falling through to
// Express's default HTML error handler.
export function uploadCsv(req: Request, res: Response, next: NextFunction): void {
  upload.single("file")(req, res, (error: unknown) => {
    if (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Could not process uploaded file",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "CSV file is required" });
      return;
    }

    next();
  });
}
