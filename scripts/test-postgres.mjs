import EmbeddedPostgres from "embedded-postgres";
import postgres from "postgres";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";

/** PostgreSQL exclusivo dos testes: nunca lê DATABASE_URL nem .env.local. */
export async function testPostgres() {
  const root = resolve(".data");
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(resolve(root, "integration-"));
  const port = await new Promise((done, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => { const port = server.address().port; server.close(() => done(port)); });
  });
  const password = randomBytes(24).toString("hex");
  const pg = new EmbeddedPostgres({ databaseDir: directory, port, user: "postgres", password, persistent: true, createPostgresUser: false, autoRehydrateSymlinks: true, postgresFlags: ["-h", "127.0.0.1"], onLog: () => {}, onError: () => {} });
  let sql;
  async function stop() {
    await sql?.end();
    await pg.stop();
    // Só remove o diretório exclusivo criado acima, após verificar o caminho absoluto.
    if (!directory.startsWith(root + sep) || !directory.slice(root.length + 1).startsWith("integration-")) throw new Error("Diretório de teste fora da área permitida.");
    await rm(directory, { recursive: true, force: true });
  }
  try {
    await pg.initialise();
    await pg.start();
    await pg.createDatabase("doce_costura_test");
    const url = `postgres://postgres:${password}@127.0.0.1:${port}/doce_costura_test`;
    sql = postgres(url, { prepare: false, max: 6 });
    for (const file of ["drizzle/0000_inicial.sql", "drizzle/0001_conta_cliente_reservas.sql"]) {
      for (const statement of (await readFile(file, "utf8")).split("--> statement-breakpoint")) {
        if (statement.trim()) await sql.unsafe(statement);
      }
    }
    return { url, sql, stop };
  } catch (error) {
    await stop().catch(() => {});
    throw error;
  }
}
