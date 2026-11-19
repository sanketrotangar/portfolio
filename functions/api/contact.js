// Cloudflare Pages Function — POST /api/contact
// Deployed automatically by Cloudflare Pages when this file exists in /functions.
// Validates the form, verifies Turnstile (when configured), then delivers the
// submission to the inbox through Resend.
//
// Required environment variables (Pages > Settings > Variables and Secrets):
//   RESEND_API_KEY    re_...  API key from resend.com
//   CONTACT_TO_EMAIL  inbox that receives the message
// Optional:
//   RESEND_FROM_EMAIL verified sender, e.g. "Portfolio <hello@yourdomain.com>"
//                     Defaults to Resend's test sender, which can only deliver
//                     to the account owner's own address.
//   TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY  enable the spam check

const DEFAULT_TO = 'sanketrotangar04@gmail.com';
const DEFAULT_FROM = 'Portfolio Contact <onboarding@resend.dev>';

const INQUIRY_LABELS = {
  role: 'Role',
  freelance: 'Freelance project',
  other: 'Other',
};

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const json = (status, body) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  let data;
  try {
    data = await request.formData();
  } catch {
    return json(400, { success: false, error: 'Expected form-encoded submission.' });
  }

  const name = (data.get('name') || '').toString().trim();
  const email = (data.get('email') || '').toString().trim();
  const message = (data.get('message') || '').toString().trim();
  const inquiryRaw = (data.get('inquiry_type') || '').toString().trim();
  const token = (data.get('cf-turnstile-response') || '').toString();

  // --- Field validation (server-side mirror of the client checks) ---
  if (!name || name.length > 100) {
    return json(400, { success: false, error: 'Invalid name.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return json(400, { success: false, error: 'Invalid email.' });
  }
  if (message.length < 20 || message.length > 4000) {
    return json(400, { success: false, error: 'Message must be 20–4000 characters.' });
  }

  // --- Turnstile verification ---
  // Skipped only while [TURNSTILE_SITEKEY] is still a placeholder.
  const sitekeySet = env && env.TURNSTILE_SITE_KEY;
  if (sitekeySet) {
    if (!token) {
      return json(400, { success: false, error: 'Missing spam-check token.' });
    }
    try {
      const verifyBody = new FormData();
      verifyBody.append('secret', env.TURNSTILE_SECRET_KEY);
      verifyBody.append('response', token);
      verifyBody.append('remoteip', request.headers.get('CF-Connecting-IP') || '');

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: verifyBody,
      });
      const verify = await verifyRes.json();

      if (!verify.success) {
        return json(403, { success: false, error: 'Spam check failed. Please try again.' });
      }
    } catch {
      return json(502, { success: false, error: 'Could not verify spam check. Try again shortly.' });
    }
  }

  const inquiry = INQUIRY_LABELS[inquiryRaw] || 'General';
  const apiKey = env && env.RESEND_API_KEY;
  const to = (env && env.CONTACT_TO_EMAIL) || DEFAULT_TO;
  const from = (env && env.RESEND_FROM_EMAIL) || DEFAULT_FROM;

  // --- Delivery: Resend -------------------------------------------------
  // Without a key the submission is logged to the Cloudflare dashboard
  // (Workers > Real-time logs) instead of being silently lost.
  if (!apiKey) {
    console.log('Contact submission (RESEND_API_KEY not set, not emailed):', {
      name,
      email,
      inquiry,
      messageLength: message.length,
      ts: new Date().toISOString(),
    });
    return json(200, { success: true, message: 'Received.' });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeInquiry = escapeHtml(inquiry);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br />');

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Edge runtimes must send a User-Agent or Resend answers 403.
        'User-Agent': 'sanket-portfolio-contact/1.0',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: [email],
        subject: `Portfolio inquiry (${inquiry}): ${name}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Type: ${inquiry}`,
          '',
          message,
        ].join('\n'),
        html: [
          `<p><strong>Name:</strong> ${safeName}</p>`,
          `<p><strong>Email:</strong> ${safeEmail}</p>`,
          `<p><strong>Type:</strong> ${safeInquiry}</p>`,
          `<p><strong>Message:</strong></p>`,
          `<p>${safeMessage}</p>`,
        ].join('\n'),
      }),
    });

    const result = await resendRes.json().catch(() => ({}));

    if (!resendRes.ok) {
      console.error('Resend delivery failed:', resendRes.status, result);
      return json(502, {
        success: false,
        error: 'Could not send your message. Please email sanketrotangar04@gmail.com directly.',
      });
    }

    return json(200, { success: true, message: 'Message sent. I read every one.' });
  } catch (error) {
    console.error('Resend request error:', error);
    return json(502, {
      success: false,
      error: 'Could not send your message. Please email sanketrotangar04@gmail.com directly.',
    });
  }
}

// Block every other method explicitly.
export async function onRequest(context) {
  return new Response(JSON.stringify({ success: false, error: 'Method not allowed.' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', Allow: 'POST' },
  });
}
