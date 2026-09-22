// Email Worker — sends magic link emails via Cloudflare Email Routing.
// Called by the Pages Function at /api/auth/sign-in/magic-link.

interface SendEmailBinding {
  send(msg: EmailMessage): Promise<void>;
}

interface EmailMessage {
  readonly sender: string;
  readonly recipient: string;
  readonly rawMime: string;
}

interface Env {
  SEND_EMAIL: SendEmailBinding;
  EMAIL_WORKER_KEY?: string;
}

/** Build a minimal RFC 2822 MIME message with HTML content. */
function buildMimeEmail(from: string, fromName: string, to: string, subject: string, htmlBody: string): string {
  return [
    `From: ${fromName} <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    htmlBody,
  ].join('\r\n');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only accept POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Verify shared secret if set
    if (env.EMAIL_WORKER_KEY) {
      const key = request.headers.get('X-Email-Worker-Key');
      if (key !== env.EMAIL_WORKER_KEY) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    let body: { to?: string; subject?: string; html?: string };
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    const to = body.to?.trim().toLowerCase();
    if (!to || !/^[^@]+@[^@]+\.[^@]+$/.test(to)) {
      return new Response('Valid "to" email required', { status: 400 });
    }
    if (!body.subject || !body.html) {
      return new Response('"subject" and "html" are required', { status: 400 });
    }

    const fromEmail = 'noreply@europeanscrapmarket.com';
    const mime = buildMimeEmail(fromEmail, 'European Scrap Market', to, body.subject, body.html);

    try {
      const { EmailMessage } = await import('cloudflare:email');
      const message = new EmailMessage(fromEmail, to, mime);
      await env.SEND_EMAIL.send(message);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Email send failed:', err);
      return new Response(JSON.stringify({ ok: false, error: String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
