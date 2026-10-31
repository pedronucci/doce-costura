/** Executa um arquivo .sql no banco de DATABASE_URL (uso: npm run db:seed). */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import postgres from "postgres";

config({ path: ".env.local" });
const file = process.argv[2];
if (!file) throw new Error("Informe o arquivo .sql");
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não configurada");

const sql = postgres(url, { prepare: false, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require" });
await sql.unsafe(readFileSync(file, "utf8"));
await sql.end();
console.log(`✓ ${file} executado`);
