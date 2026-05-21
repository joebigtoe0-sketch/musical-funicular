require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const { handleChatRequest } = require("./lib/chat");
const { handleContactRequest } = require("./lib/contact");
const { getEmailProvider } = require("./lib/email");
const { getSeoInjection, getFaviconTags, buildSitemap, buildRobots, PAGE_META } = require("./lib/seo");
const { getMeasurementId } = require("./lib/analytics");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const SITE_URL = (process.env.SITE_URL || "").replace(/\/$/, "");

const BLOCKED_STATIC = /^\/(lib\/|node_modules\/|server\.js|package\.json|package-lock\.json|railway\.toml)/;

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

// HTTP → HTTPS (Railway / Cloudflare)
app.use((req, res, next) => {
  if (req.get("x-forwarded-proto") === "http") {
    return res.redirect(301, `https://${req.get("host")}${req.originalUrl}`);
  }
  next();
});

// Canonical host (www ↔ apex) — SITE_URL = https://sairasmedia.fi
if (SITE_URL) {
  let canonicalHost;
  try {
    canonicalHost = new URL(SITE_URL).host;
  } catch {
    canonicalHost = "";
  }
  if (canonicalHost) {
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      const host = req.get("host") || "";
      if (host && host !== canonicalHost) {
        return res.redirect(301, `${SITE_URL}${req.originalUrl}`);
      }
      next();
    });
  }
}

function serveHtml(filename, res) {
  const fullPath = path.join(ROOT, filename);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).send("Not found");
  }
  let html = fs.readFileSync(fullPath, "utf8");
  const seo = SITE_URL ? getSeoInjection(filename, SITE_URL) : getFaviconTags();
  html = html.includes("<!--SAIRAS_SEO-->")
    ? html.replace("<!--SAIRAS_SEO-->", seo)
    : html.replace("</head>", `${seo}\n</head>`);
  return res.type("html").send(html);
}

// API
app.post("/api/chat", (req, res) => handleChatRequest(req, res));
app.options("/api/chat", (req, res) => handleChatRequest(req, res));
app.post("/api/contact", (req, res) => handleContactRequest(req, res));

// SEO / discovery
app.get("/sitemap.xml", (_req, res) => {
  if (!SITE_URL) return res.status(404).send("SITE_URL not configured");
  res.type("application/xml").send(buildSitemap(SITE_URL));
});

app.get("/.well-known/llms.txt", (_req, res) => {
  res.redirect(301, "/llms.txt");
});

app.get("/robots.txt", (_req, res) => {
  if (!SITE_URL) {
    return res.type("text/plain").send("User-agent: *\nAllow: /\n");
  }
  res.type("text/plain").send(buildRobots(SITE_URL));
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// Homepage — Google & users must get 200 on /
const sendHome = (req, res) => serveHtml("index.html", res);
app.get("/", sendHome);
app.head("/", sendHome);

// Clean URL: /index.html → /
app.get("/index.html", (req, res) => {
  if (SITE_URL) return res.redirect(301, `${SITE_URL}/`);
  return serveHtml("index.html", res);
});

// Other HTML pages (with SEO injection)
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();

  const file = req.path.replace(/^\//, "");
  if (!file.endsWith(".html") || !PAGE_META[file] || file === "index.html") return next();

  return serveHtml(file, res);
});

app.use((req, res, next) => {
  if (BLOCKED_STATIC.test(req.path)) return res.sendStatus(404);
  next();
});

// Static assets (CSS, JS, images) — not index.html at /
app.use(
  express.static(ROOT, {
    index: false,
    dotfiles: "deny",
  })
);

// Fallback if nothing matched
app.use((req, res) => {
  if ((req.method === "GET" || req.method === "HEAD") && req.path === "/") {
    return sendHome(req, res);
  }
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  const emailProvider = getEmailProvider();
  console.log(`Sairas Media running on port ${PORT}`);
  console.log(`Email provider: ${emailProvider || "NOT CONFIGURED"}`);
  console.log(`SITE_URL: ${SITE_URL || "NOT SET (SEO canonicals disabled)"}`);
  console.log(`Google Analytics: ${getMeasurementId() || "NOT SET"}`);
});
