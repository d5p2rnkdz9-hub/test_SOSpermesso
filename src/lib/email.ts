/**
 * Transactional email via Resend's REST API — same call the site's
 * Netlify functions use (Sito_Nuovo/netlify/functions/notion-webhook.mjs),
 * so one RESEND_API_KEY and one verified domain serve both projects.
 *
 * Without RESEND_API_KEY outside production the message is printed to the
 * server log instead, so the login flow can be tested locally.
 */

interface Email {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const FROM = process.env.RESEND_FROM || 'SOS Permesso <accesso@sospermesso.it>';

export async function sendEmail({ to, subject, text, html }: Email): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is not set');
    }
    console.info(`[email:dev] to=${to} subject="${subject}"\n${text}`);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, text, html }),
  });
  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
  }
}
