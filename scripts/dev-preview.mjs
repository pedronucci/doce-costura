import { spawn } from "node:child_process";
import { createRequire } from "node:module";

if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  throw new Error("A prévia sem banco só pode ser usada no desenvolvimento local.");
}

const require = createRequire(import.meta.url);
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, STOREFRONT_PREVIEW: "1" },
});
child.on("error", () => {
  console.error("Não foi possível iniciar a prévia. Confira a instalação das dependências.");
  process.exitCode = 1;
});
child.on("exit", (code) => { process.exitCode = code ?? 1; });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
