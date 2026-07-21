interface MongoDuplicateKeyError {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

interface MongooseValidationError {
  name: "ValidationError";
  message: string;
  errors: Record<string, { message: string }>;
}

function isMongooseValidationError(error: unknown): error is MongooseValidationError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "ValidationError" &&
    typeof (error as { errors?: unknown }).errors === "object"
  );
}

export function formatUnknownError(error: unknown): { error: string } {
  return { error: error instanceof Error ? error.message : "Unknown error" };
}

// Mongoose validation errors and duplicate-key errors already carry
// per-field detail (error.errors / error.keyPattern) — this just surfaces
// that instead of collapsing it into the single concatenated message that
// error.message would otherwise give the client.
export function formatMongooseError(error: unknown): {
  error: string;
  fieldErrors?: Record<string, string>;
} {
  if (isMongooseValidationError(error)) {
    const fieldErrors: Record<string, string> = {};
    for (const [path, fieldError] of Object.entries(error.errors)) {
      fieldErrors[path] = fieldError.message;
    }
    return { error: error.message, fieldErrors };
  }

  const duplicateKeyError = error as MongoDuplicateKeyError;
  if (duplicateKeyError?.code === 11000 && duplicateKeyError.keyPattern) {
    const field = Object.keys(duplicateKeyError.keyPattern)[0];
    if (field) {
      return {
        error: `This ${field} is already in use`,
        fieldErrors: { [field]: "Already in use" },
      };
    }
  }

  return formatUnknownError(error);
}
