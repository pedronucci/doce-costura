import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { testPostgres } from "./test-postgres.mjs";

if (process.env.VERCEL || process.env.NODE_ENV === "production") throw new Error("Servidor de teste somente local.");
const test = await testPostgres();
const require = createRequire(import.meta.url);
try {
  const [category] = await test.sql`insert into category (slug,name,short_name) values ('colecao-testes','Coleção de teste','Testes') returning id`;
  const [product] = await test.sql`insert into product (slug,name,summary,status) values ('peca-de-teste','Peça de teste — cozinha','Produto sintético para verificar o pedido, sem venda real.','active') returning id`;
  await test.sql`insert into product_category (product_id,category_id) values (${product.id},${category.id})`;
  await test.sql`insert into product_variant (product_id,sku,name,price_cents,stock,weight_grams,height_cm,width_cm,length_cm) values (${product.id},'TEST-LOCAL-1','Modelo de teste',1990,3,120,3,20,25)`;
  await test.sql`insert into product_image (product_id,url,alt,width,height) values (${product.id},'/images/produtos/cha-azul.jpg','Fotografia usada em produto sintético de teste',800,1000)`;
  console.log("Loja de testes em http://127.0.0.1:3100 — dados sintéticos, banco local, sem e-mail ou cobrança.");
  const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "--port", "3100", "--hostname", "127.0.0.1"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: test.url, BETTER_AUTH_URL: "http://127.0.0.1:3100", NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100", BETTER_AUTH_SECRET: randomUUID() + randomUUID(), ADMIN_SETUP_TOKEN: "", RESEND_API_KEY: "", EMAIL_FROM: "", STORAGE_DRIVER: "local", SUPABASE_SECRET_KEY: "", STOREFRONT_PREVIEW: "", LOCAL_TEST_STORE: "1" },
  });
  for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => child.kill(signal));
  process.exitCode = await new Promise((done, reject) => { child.once("error", reject); child.once("exit", (code) => done(code ?? 0)); });
} finally { await test.stop(); }
