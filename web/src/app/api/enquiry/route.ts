import nodemailer from 'nodemailer';
import { LIMITS, topicById, validate, type Enquiry } from '@/lib/enquiry';
import { CONTACT } from '@/lib/contact';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * Partner enquiries: validated here, then sent by SMTP to the AVVVS inbox with Reply-To set to the
 * enquirer, so the team answers with one click. Optionally a short acknowledgement goes back.
 * Configure in web/.env.local (see .env.example). Without SMTP settings, development logs the mail
 * to the terminal and production answers 503 so the form can offer email instead.
 */

const env = (k: string) => process.env[k]?.trim() || undefined;

// A small per-address limit against floods; resets when the server restarts.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: 'bad-request' }, { status: 400 }); }

  // bots: a hidden field people never see, and a form filled faster than a person can
  const startedAt = Number(body.startedAt);
  if (body.website || (Number.isFinite(startedAt) && Date.now() - startedAt < 2500)) return Response.json({ ok: true });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (limited(ip)) return Response.json({ ok: false, error: 'rate-limited' }, { status: 429 });

  const str = (k: keyof Enquiry) => (typeof body[k] === 'string' ? (body[k] as string).trim().slice(0, LIMITS[k as keyof typeof LIMITS] ?? 200) : '');
  const e: Enquiry = {
    topic: str('topic') as Enquiry['topic'], name: oneLine(str('name')), company: oneLine(str('company')),
    email: oneLine(str('email')), phone: oneLine(str('phone')), country: oneLine(str('country')), message: str('message'),
  };
  const errors = validate(e);
  if (Object.keys(errors).length) return Response.json({ ok: false, error: 'invalid', fields: errors }, { status: 422 });

  const topic = topicById(e.topic)!.label;
  const to = env('MAIL_TO') ?? CONTACT.email;
  const from = env('MAIL_FROM') ?? env('SMTP_USER');
  const subject = `Partner enquiry: ${topic} · ${e.company}`;
  const rows: [string, string][] = [['Topic', topic], ['Name', e.name], ['Company', e.company], ['Email', e.email], ['Phone', e.phone || '—'], ['Country', e.country || '—']];
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${e.message}\n\n— Sent from the AVVVS website enquiry form`;
  const html = mailHtml('New partner enquiry', rows, e.message, 'Reply to this email to answer the enquirer directly.');

  const host = env('SMTP_HOST');
  if (!host || !from) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[enquiry] SMTP is not configured; this is what would be sent to ${to}:\n${subject}\n${text}`);
      return Response.json({ ok: true, dev: true });
    }
    return Response.json({ ok: false, error: 'not-configured' }, { status: 503 });
  }

  const port = Number(env('SMTP_PORT') ?? 587);
  const transport = nodemailer.createTransport({
    host, port, secure: env('SMTP_SECURE') ? env('SMTP_SECURE') === 'true' : port === 465,
    auth: env('SMTP_USER') ? { user: env('SMTP_USER')!, pass: env('SMTP_PASS') ?? '' } : undefined,
  });

  try {
    await transport.sendMail({ from: { name: 'AVVVS website', address: from }, to, replyTo: { name: e.name, address: e.email }, subject, text, html });
    if (env('SEND_ACK') === 'true') {
      const first = e.name.split(/\s+/)[0];
      await transport.sendMail({
        from: { name: 'Arya Vaidya Vilasini Vaidya Sala', address: from }, to: { name: e.name, address: e.email }, replyTo: to,
        subject: 'We have your enquiry · AVVVS',
        text: `Dear ${first},\n\nThank you for writing to Arya Vaidya Vilasini Vaidya Sala about ${topic.toLowerCase()}. Your enquiry has reached our team, and the right person will reply to you at this address.\n\nWith regards,\nAVVVS, Kozhikode · since 1921\n${CONTACT.email} · ${CONTACT.phones.join(' · ')}`,
        html: mailHtml(`Thank you, ${first}`, [['Topic', topic]], `Your enquiry has reached our team, and the right person will reply to you at this address.`, `${CONTACT.email} · ${CONTACT.phones.join(' · ')}`),
      });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[enquiry] send failed', err);
    return Response.json({ ok: false, error: 'send-failed' }, { status: 502 });
  }
}

// Table-based, inline-styled: what email clients render reliably. Ivory ground, gold thread, ink type.
function mailHtml(title: string, rows: [string, string][], message: string, foot: string) {
  const r = rows.map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#6B5A48;font-size:13px;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#1E140E;font-size:15px">${esc(v)}</td></tr>`).join('');
  return `<!doctype html><html><body style="margin:0;background:#F4EFE5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE5"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FBF8F2;border:1px solid #E8D9B9">
<tr><td style="height:3px;background:#C3A46A;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:28px 32px 8px;font-family:Georgia,'Times New Roman',serif;color:#1E140E;font-size:24px">${esc(title)}</td></tr>
<tr><td style="padding:0 32px 4px;font-family:Arial,Helvetica,sans-serif;color:#06619B;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Arya Vaidya Vilasini Vaidya Sala · since 1921</td></tr>
<tr><td style="padding:20px 32px 8px;font-family:Arial,Helvetica,sans-serif"><table role="presentation" cellpadding="0" cellspacing="0">${r}</table></td></tr>
<tr><td style="padding:12px 32px 24px;font-family:Arial,Helvetica,sans-serif;color:#1E140E;font-size:15px;line-height:1.6;white-space:pre-wrap;border-top:1px solid #E8D9B9">${esc(message)}</td></tr>
<tr><td style="padding:16px 32px 28px;font-family:Arial,Helvetica,sans-serif;color:#6B5A48;font-size:12px">${esc(foot)}</td></tr>
</table></td></tr></table></body></html>`;
}
