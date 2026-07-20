import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Without this, a stale `dist/` build (tsdown output, gitignored but
    // present after any local `pnpm build`) gets matched alongside `src/`,
    // double-running every test against both live and stale compiled code.
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
