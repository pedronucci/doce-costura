import "server-only";

/**
 * Envio de e-mails transacionais via Resend (API HTTP, sem SDK).
 * Sem configuração, falha explicitamente em qualquer ambiente.
 * Nunca registra destinatários, conteúdo ou tokens de recuperação em logs.
 */
type Email = { to: string; subject: string; html: string; text: string };

export async function sendEmail({ to, subject, html, text }: Email) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    throw new Error("Envio de e-mail não configurado (RESEND_API_KEY / EMAIL_FROM).");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html, text }),
  });
  if (!res.ok) {
    throw new Error(`Falha ao enviar e-mail (${res.status}).`);
  }
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
