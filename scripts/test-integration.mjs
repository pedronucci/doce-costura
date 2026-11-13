import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { testPostgres } from "./test-postgres.mjs";

const require = createRequire(import.meta.url);
const test = await testPostgres();
try {
  const code = await new Promise((done, reject) => {
    const child = spawn(process.execPath, [resolve(dirname(require.resolve("vitest/package.json")), "vitest.mjs"), "run", "--config", "vitest.integration.config.ts"], {
      stdio: "inherit", env: { ...process.env, TEST_DATABASE_URL: test.url },
    });
    child.once("error", reject);
    child.once("exit", (code) => done(code ?? 1));
  });
  process.exitCode = code;
} finally { await test.stop(); }
