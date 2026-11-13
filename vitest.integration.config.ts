import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { include: ["tests/integration/**/*.test.ts"], environment: "node", fileParallelism: false, maxWorkers: 1, testTimeout: 30000, hookTimeout: 30000 },
});
