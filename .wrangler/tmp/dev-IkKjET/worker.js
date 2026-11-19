var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/contact.js
var DEFAULT_TO = "sanketrotangar04@gmail.com";
var DEFAULT_FROM = "Portfolio Contact <onboarding@resend.dev>";
var INQUIRY_LABELS = {
  role: "Role",
  freelance: "Freelance project",
  other: "Other"
};
function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json, "json");
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(escapeHtml, "escapeHtml");
async function handleContact(request, env) {
  let data;
  try {
    data = await request.formData();
  } catch {
    return json(400, { success: false, error: "Expected form-encoded submission." });
  }
  const name = (data.get("name") || "").toString().trim();
  const email = (data.get("email") || "").toString().trim();
  const message = (data.get("message") || "").toString().trim();
  const inquiryRaw = (data.get("inquiry_type") || "").toString().trim();
  const token = (data.get("cf-turnstile-response") || "").toString();
  if (!name || name.length > 100) {
    return json(400, { success: false, error: "Invalid name." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return json(400, { success: false, error: "Invalid email." });
  }
  if (message.length < 20 || message.length > 4e3) {
    return json(400, { success: false, error: "Message must be 20\u20134000 characters." });
  }
  const sitekeySet = env && env.TURNSTILE_SITE_KEY;
  if (sitekeySet) {
    if (!token) {
      return json(400, { success: false, error: "Missing spam-check token." });
    }
    try {
      const verifyBody = new FormData();
      verifyBody.append("secret", env.TURNSTILE_SECRET_KEY);
      verifyBody.append("response", token);
      verifyBody.append("remoteip", request.headers.get("CF-Connecting-IP") || "");
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: verifyBody
      });
      const verify = await verifyRes.json();
      if (!verify.success) {
        return json(403, { success: false, error: "Spam check failed. Please try again." });
      }
    } catch {
      return json(502, { success: false, error: "Could not verify spam check. Try again shortly." });
    }
  }
  const inquiry = INQUIRY_LABELS[inquiryRaw] || "General";
  const apiKey = env && env.RESEND_API_KEY;
  const to = env && env.CONTACT_TO_EMAIL || DEFAULT_TO;
  const from = env && env.RESEND_FROM_EMAIL || DEFAULT_FROM;
  if (!apiKey) {
    console.log("Contact submission (RESEND_API_KEY not set, not emailed):", {
      name,
      email,
      inquiry,
      messageLength: message.length,
      ts: (/* @__PURE__ */ new Date()).toISOString()
    });
    return json(200, { success: true, message: "Received." });
  }
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeInquiry = escapeHtml(inquiry);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");
  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Edge runtimes must send a User-Agent or Resend answers 403.
        "User-Agent": "sanket-portfolio-contact/1.0"
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
          "",
          message
        ].join("\n"),
        html: [
          `<p><strong>Name:</strong> ${safeName}</p>`,
          `<p><strong>Email:</strong> ${safeEmail}</p>`,
          `<p><strong>Type:</strong> ${safeInquiry}</p>`,
          `<p><strong>Message:</strong></p>`,
          `<p>${safeMessage}</p>`
        ].join("\n")
      })
    });
    const result = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      console.error("Resend delivery failed:", resendRes.status, result);
      return json(502, {
        success: false,
        error: "Could not send your message. Please email sanketrotangar04@gmail.com directly."
      });
    }
    return json(200, { success: true, message: "Message sent. I read every one." });
  } catch (error) {
    console.error("Resend request error:", error);
    return json(502, {
      success: false,
      error: "Could not send your message. Please email sanketrotangar04@gmail.com directly."
    });
  }
}
__name(handleContact, "handleContact");

// api/lead.js
function json2(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json2, "json");
async function handleLead(request, env) {
  let data;
  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      data = {
        name: formData.get("name"),
        business_type: formData.get("business_type"),
        headache: formData.get("headache"),
        contact_preference: formData.get("contact_preference"),
        contact_details: formData.get("contact_details"),
        token: formData.get("cf-turnstile-response"),
        industry_context: formData.get("industry_context")
      };
    }
  } catch {
    return json2(400, { success: false, error: "Expected valid JSON or form data." });
  }
  const name = (data.name || "").toString().trim();
  const businessType = (data.business_type || "").toString().trim();
  const headache = (data.headache || "").toString().trim();
  const contactPref = (data.contact_preference || "").toString().trim();
  const contactDetails = (data.contact_details || "").toString().trim();
  const token = (data.token || "").toString();
  if (!name || name.length > 100) {
    return json2(400, { success: false, error: "Name is required (max 100 characters)." });
  }
  if (!headache || headache.length < 5 || headache.length > 4e3) {
    return json2(400, { success: false, error: "Please describe your headache (at least 5 characters)." });
  }
  if (!contactDetails || contactDetails.length < 4 || contactDetails.length > 200) {
    return json2(400, { success: false, error: "Please provide valid contact details." });
  }
  const sitekeySet = env && env.TURNSTILE_SECRET_KEY;
  if (sitekeySet && token) {
    try {
      const verifyBody = new FormData();
      verifyBody.append("secret", env.TURNSTILE_SECRET_KEY);
      verifyBody.append("response", token);
      verifyBody.append("remoteip", request.headers.get("CF-Connecting-IP") || "");
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: verifyBody
      });
      const verify = await verifyRes.json();
      if (!verify.success) {
        return json2(403, { success: false, error: "Spam verification failed. Please try again." });
      }
    } catch {
      return json2(502, { success: false, error: "Spam verification service unavailable. Try again shortly." });
    }
  }
  console.log("Lead submission received:", {
    name,
    businessType,
    contactPref,
    contactDetails,
    headacheLength: headache.length,
    industryContext: data.industry_context || "not_specified",
    ts: (/* @__PURE__ */ new Date()).toISOString()
  });
  return json2(200, {
    success: true,
    message: "Workflow check request received. Reply coming within [RESPONSE TIME \u2014 e.g. 1 business day]."
  });
}
__name(handleLead, "handleLead");

// worker.js
var routes = {
  "/api/contact": handleContact,
  "/api/lead": handleLead
};
var worker_default = {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const handler = routes[pathname.replace(/\/+$/, "")];
    if (!handler) {
      return env.ASSETS.fetch(request);
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed." }), {
        status: 405,
        headers: { "Content-Type": "application/json", Allow: "POST" }
      });
    }
    return handler(request, env);
  }
};

// ../../../.npm/_npx/31e38d648b9cac8c/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../.npm/_npx/31e38d648b9cac8c/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-gLvI3X/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../.npm/_npx/31e38d648b9cac8c/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-gLvI3X/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
