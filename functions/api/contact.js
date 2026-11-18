// Cloudflare Pages Function — POST /api/contact
// Deployed automatically by Cloudflare Pages when this file exists in /functions.
// Stub behaviour: validate, verify Turnstile (when configured), log, return JSON.
// Wire up delivery (email/API) where marked.

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

  // --- Delivery: wire this to your inbox / KV / ticketing ----------------
  // Until wired, submissions are logged to the Cloudflare dashboard
  // (Workers > Real-time logs) so nothing is silently lost.
  console.log('Contact submission:', {
    name,
    email,
    messageLength: message.length,
    ts: new Date().toISOString(),
  });

  return json(200, {
    success: true,
    message: 'Received. Reply coming [RESPONSE TIME — e.g. within 2 working days].',
  });
}

// Block every other method explicitly.
export async function onRequest(context) {
  return new Response(JSON.stringify({ success: false, error: 'Method not allowed.' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', Allow: 'POST' },
  });
}
