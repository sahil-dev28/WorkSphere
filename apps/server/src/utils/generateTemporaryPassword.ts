import { randomBytes } from "node:crypto";

const TEMP_PASSWORD_LENGTH = 12;

export function generateTemporaryPassword(): string {
  return randomBytes(TEMP_PASSWORD_LENGTH).toString("base64url").slice(0, TEMP_PASSWORD_LENGTH);
}
