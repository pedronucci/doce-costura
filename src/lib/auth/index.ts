import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { account, rateLimit, session, user, verification } from "@/db/schema";
import { escapeHtml, sendEmail } from "@/lib/email";

export const ROLES = ["customer", "staff", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const MIN_PASSWORD_LENGTH = 10;

export const auth = betterAuth({
  appName: "Doce Costura",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification, rateLimit },
  }),
  telemetry: { enabled: false },
  user: {
    additionalFields: {
      // input: false — o papel nunca pode ser definido pelo próprio usuário
      role: { type: "string", defaultValue: "customer", input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    // Cadastro público de clientes será liberado na Etapa 3.
    disableSignUp: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user: u, url }) => {
      const name = escapeHtml(u.name);
      await sendEmail({
        to: u.email,
        subject: "Redefinição de senha — Doce Costura",
        text: `Olá, ${u.name}.\n\nPara criar uma nova senha, acesse: ${url}\n\nO link vale por 1 hora. Se você não pediu a redefinição, ignore este e-mail.`,
        html: `<p>Olá, ${name}.</p><p>Para criar uma nova senha, <a href="${url}">clique aqui</a>.</p><p>O link vale por 1 hora. Se você não pediu a redefinição, ignore este e-mail.</p>`,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 300, max: 3 },
      "/reset-password": { window: 300, max: 5 },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  plugins: [nextCookies()], // deve ser o último plugin
});

export type Session = typeof auth.$Infer.Session;
