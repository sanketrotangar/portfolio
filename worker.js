// Cloudflare Worker entry point for the portfolio.
//
// Static files (index.html, css/, js/, projects/, resume/, assets/ …) are served
// straight from the repo root by Workers static assets; only /api/* reaches this
// script (see "assets.run_worker_first" in wrangler.jsonc).
import { handleContact } from './api/contact.js';
import { handleLead } from './api/lead.js';

const routes = {
  '/api/contact': handleContact,
  '/api/lead': handleLead,
};

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const handler = routes[pathname.replace(/\/+$/, '')];

    // Anything that is not one of our endpoints is a static file.
    if (!handler) {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method not allowed.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', Allow: 'POST' },
      });
    }

    return handler(request, env);
  },
};
