// POST /api/lead — "workflow check" lead form.
// Validates the lead, checks Turnstile (when configured), and logs it so it
// shows up under Worker > Logs in the Cloudflare dashboard.

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleLead(request, env) {
  let data;
  const contentType = request.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      data = {
        name: formData.get('name'),
        business_type: formData.get('business_type'),
        headache: formData.get('headache'),
        contact_preference: formData.get('contact_preference'),
        contact_details: formData.get('contact_details'),
        token: formData.get('cf-turnstile-response'),
        industry_context: formData.get('industry_context'),
      };
    }
  } catch {
    return json(400, { success: false, error: 'Expected valid JSON or form data.' });
  }

  const name = (data.name || '').toString().trim();
  const businessType = (data.business_type || '').toString().trim();
  const headache = (data.headache || '').toString().trim();
  const contactPref = (data.contact_preference || '').toString().trim();
  const contactDetails = (data.contact_details || '').toString().trim();
  const token = (data.token || '').toString();

  // Basic validation
  if (!name || name.length > 100) {
    return json(400, { success: false, error: 'Name is required (max 100 characters).' });
  }
  if (!headache || headache.length < 5 || headache.length > 4000) {
    return json(400, { success: false, error: 'Please describe your headache (at least 5 characters).' });
  }
  if (!contactDetails || contactDetails.length < 4 || contactDetails.length > 200) {
    return json(400, { success: false, error: 'Please provide valid contact details.' });
  }

  // Cloudflare Turnstile verification if secret key is configured in env
  const sitekeySet = env && env.TURNSTILE_SECRET_KEY;
  if (sitekeySet && token) {
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
        return json(403, { success: false, error: 'Spam verification failed. Please try again.' });
      }
    } catch {
      return json(502, { success: false, error: 'Spam verification service unavailable. Try again shortly.' });
    }
  }

  // Log lead details to Cloudflare dashboard (Logs)
  console.log('Lead submission received:', {
    name,
    businessType,
    contactPref,
    contactDetails,
    headacheLength: headache.length,
    industryContext: data.industry_context || 'not_specified',
    ts: new Date().toISOString(),
  });

  return json(200, {
    success: true,
    message: 'Workflow check request received. Reply coming within [RESPONSE TIME — e.g. 1 business day].',
  });
}
