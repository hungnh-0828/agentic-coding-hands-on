import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    globals: true,
    // Only run the app's own TS tests. Keeps vitest away from the .claude/ harness
    // hook tests (.cjs, authored for a different runner) and node_modules.
    include: ["{lib,components,app}/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules/**", ".claude/**", ".next/**"],
  },
});
