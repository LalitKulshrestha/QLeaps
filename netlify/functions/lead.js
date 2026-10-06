/**
 * Netlify Function: /api/lead
 * POST handler for lead capture form submissions
 *
 * Responsibilities:
 *   1. Parse + sanitise payload
 *   2. Verify Cloudflare Turnstile token
 *   3. Rate-limit by IP (in-memory, resets on cold start; good enough for free tier)
 *   4. Honeypot check
 *   5. Time-trap check
 *   6. Send email notification via Resend
 *   7. Return JSON { ok: true } or { ok: false, error }
 *
 * Environment variables required:
 *   RESEND_API_KEY          — Resend API key
 *   RESEND_FROM             — Verified sender address (e.g. leads@qleaps.in)
 *   OWNER_EMAIL             — Where to send lead notifications
 *   TURNSTILE_SECRET_KEY    — Cloudflare Turnstile secret key
 *
 * Optional:
 *   SITE_URL                — e.g. https://qleaps.in (for email links)
 */

// ---- In-memory rate limiter ----
// Key: IP → { count, windowStart }
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 5;          // requests
const RATE_LIMIT_WINDOW = 60000;   // 1 minute in ms

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (record.count >= RATE_LIMIT_MAX) return true;
  record.count++;
  return false;
}

// ---- Sanitise string ----
function sanitise(val, maxLen = 2000) {
  if (typeof val !== 'string') return '';
  return val
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .substring(0, maxLen);
}

// ---- Email regex (server-side) ----
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ---- Verify Cloudflare Turnstile ----
async function verifyTurnstile(token, remoteip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // If not configured, skip verification in dev
    console.warn('[lead] TURNSTILE_SECRET_KEY not set — skipping verification');
    return true;
  }
  // Allow Turnstile test secret bypass token
  if (token === '1x0000000000000000000000000000000AA') return true;

  const formData = new URLSearchParams();
  formData.append('secret', secret);
  formData.append('response', token);
  if (remoteip) formData.append('remoteip', remoteip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('[lead] Turnstile verification error:', err);
    return false;
  }
}

// ---- Send email via Resend ----
async function sendEmail(name, email, message) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddr = process.env.RESEND_FROM || 'leads@qleaps.in';
  const toAddr = process.env.OWNER_EMAIL || 'contact@qleaps.in';
  const siteUrl = process.env.SITE_URL || 'https://qleaps.in';

  if (!apiKey) {
    console.warn('[lead] RESEND_API_KEY not set — skipping email send');
    return;
  }

  const html = `
  <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#f8f8f8;border-radius:12px;overflow:hidden">
    <div style="background:#4338CA;padding:24px 32px">
      <h1 style="color:white;font-size:18px;margin:0">🎯 New lead from qleaps.in</h1>
    </div>
    <div style="padding:32px;background:white">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;width:120px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Name</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600">${sanitise(name, 200)}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Email</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0"><a href="mailto:${sanitise(email, 200)}" style="color:#4338CA">${sanitise(email, 200)}</a></td></tr>
        <tr><td style="padding:10px 0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;vertical-align:top">Message</td><td style="padding:10px 0;line-height:1.6">${message ? sanitise(message, 2000).replace(/\n/g, '<br>') : '<em style="color:#999">No message provided</em>'}</td></tr>
      </table>
      <div style="margin-top:28px">
        <a href="mailto:${sanitise(email, 200)}" style="background:#4338CA;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Reply to ${sanitise(name, 60)} →</a>
      </div>
    </div>
    <div style="padding:16px 32px;background:#f0eef4;font-size:12px;color:#888;text-align:center">
      <p>Sent from <a href="${siteUrl}" style="color:#4338CA">${siteUrl}</a> lead form</p>
    </div>
  </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddr,
      to: toAddr,
      reply_to: email,
      subject: `New enquiry from ${sanitise(name, 80)} · Quantum Leaps`,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }

  return await res.json();
}

// ---- Also send a confirmation email to the lead ----
async function sendConfirmation(name, email) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddr = process.env.RESEND_FROM || 'hello@qleaps.in';
  const siteUrl = process.env.SITE_URL || 'https://qleaps.in';

  if (!apiKey) return; // skip if not configured

  const html = `
  <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#4338CA;padding:32px;border-radius:12px 12px 0 0">
      <h1 style="color:white;font-size:22px;margin:0">Thanks, ${sanitise(name, 40)}!</h1>
    </div>
    <div style="padding:32px;background:white;border-radius:0 0 12px 12px;border:1px solid #eee;border-top:none">
      <p style="font-size:16px;line-height:1.7;color:#333">We've received your message and will be in touch very soon.</p>
      <p style="font-size:15px;line-height:1.7;color:#555">At Quantum Leaps, every enquiry is read by a real person — not a bot. We'll reach out within 1–2 business days.</p>
      <p style="font-size:15px;line-height:1.7;color:#555">In the meantime, feel free to reply to this email if you have anything to add.</p>
      <div style="margin-top:28px;padding-top:24px;border-top:1px solid #eee;font-size:13px;color:#888">
        <p>Quantum Leaps · Specialist hiring partner, Mumbai</p>
        <p>📞 +91 99308 22894 · ✉ contact@qleaps.in</p>
        <p style="margin-top:8px"><a href="${siteUrl}/privacy.html" style="color:#4338CA">Privacy policy</a> · <a href="mailto:contact@qleaps.in?subject=Unsubscribe" style="color:#4338CA">Unsubscribe</a></p>
      </div>
    </div>
  </div>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddr,
        to: email,
        subject: "We got your message · Quantum Leaps",
        html,
      }),
    });
  } catch (err) {
    // Non-critical — log but don't fail the request
    console.error('[lead] Confirmation email error:', err);
  }
}

// ---- CORS headers ----
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ---- Main handler ----
exports.handler = async (event, context) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed' }),
    };
  }

  // ---- Parse body ----
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return {
      statusCode: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Invalid request body' }),
    };
  }

  // ---- Rate limit by IP ----
  const ip =
    event.headers['x-forwarded-for']?.split(',')[0].trim() ||
    event.headers['x-real-ip'] ||
    context.clientContext?.ip ||
    'unknown';

  if (isRateLimited(ip)) {
    console.warn('[lead] Rate limited:', ip);
    return {
      statusCode: 429,
      headers: { ...CORS, 'Content-Type': 'application/json', 'Retry-After': '60' },
      body: JSON.stringify({ ok: false, error: 'Too many requests. Please wait a minute.' }),
    };
  }

  // ---- Honeypot ----
  const honeypot = sanitise(body.honeypot || body.company || '', 500);
  if (honeypot !== '') {
    console.warn('[lead] Honeypot triggered from', ip);
    // Silently succeed to confuse bots
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  }

  // ---- Time trap ----
  const loadTime = parseInt(body.loadTime || '0', 10);
  const now = Date.now();
  if (loadTime > 0 && now - loadTime < 2000) {
    console.warn('[lead] Time trap triggered from', ip, 'elapsed:', now - loadTime, 'ms');
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  }

  // ---- Sanitise inputs ----
  const name    = sanitise(body.name || '', 100);
  const email   = sanitise(body.email || '', 200);
  const message = sanitise(body.message || '', 2000);
  const consent = body.consent;

  // ---- Server-side validation ----
  if (!name) {
    return {
      statusCode: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Name is required.' }),
    };
  }

  if (!email || !EMAIL_RE.test(email)) {
    return {
      statusCode: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'A valid email address is required.' }),
    };
  }

  if (consent !== 'yes') {
    return {
      statusCode: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Please agree to be contacted.' }),
    };
  }

  // ---- Verify Turnstile ----
  const cfToken = body['cf-turnstile-response'] || '';
  const turnstileOk = await verifyTurnstile(cfToken, ip);
  if (!turnstileOk) {
    return {
      statusCode: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Security check failed. Please refresh and try again.' }),
    };
  }

  // ---- Send emails ----
  try {
    await sendEmail(name, email, message);
    await sendConfirmation(name, email);
  } catch (err) {
    console.error('[lead] Email send error:', err);
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Unable to send your message. Please email us directly at contact@qleaps.in' }),
    };
  }

  console.log('[lead] Lead captured:', { name, email, ip, ts: new Date().toISOString() });

  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
