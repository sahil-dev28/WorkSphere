import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    env: {
      TZ: "UTC",
      NEXT_PUBLIC_SERVER_URL: "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@WorkSphere/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
});
