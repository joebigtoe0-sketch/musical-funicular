require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const { handleChatRequest } = require("./lib/chat");
const { handleContactRequest } = require("./lib/contact");
const { getEmailProvider } = require("./lib/email");
const { getSeoInjection, getFaviconTags, buildSitemap, buildRobots, PAGE_META } = require("./lib/seo");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const SITE_URL = (process.env.SITE_URL || "").replace(/\/$/, "");

const BLOCKED_STATIC = /^\/(lib\/|node_modules\/|server\.js|package\.json|package-lock\.json|railway\.toml)/;

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

app.post("/api/chat", (req, res) => handleChatRequest(req, res));
app.options("/api/chat", (req, res) => handleChatRequest(req, res));

app.post("/api/contact", (req, res) => handleContactRequest(req, res));

app.get("/sitemap.xml", (_req, res) => {
  if (!SITE_URL) return res.status(404).send("SITE_URL not configured");
  res.type("application/xml").send(buildSitemap(SITE_URL));
});

app.get("/robots.txt", (_req, res) => {
  if (!SITE_URL) {
    return res.type("text/plain").send("User-agent: *\nAllow: /\n");
  }
  res.type("text/plain").send(buildRobots(SITE_URL));
});

app.use((req, res, next) => {
  if (req.method !== "GET") return next();

  let file = req.path === "/" ? "index.html" : req.path.replace(/^\//, "");
  if (!file.endsWith(".html") || !PAGE_META[file]) return next();

  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) return next();

  let html = fs.readFileSync(fullPath, "utf8");
  const seo = SITE_URL ? getSeoInjection(file, SITE_URL) : getFaviconTags();
  html = html.includes("<!--SAIRAS_SEO-->")
    ? html.replace("<!--SAIRAS_SEO-->", seo)
    : html.replace("</head>", `${seo}\n</head>`);

  res.type("html").send(html);
});

app.use((req, res, next) => {
  if (BLOCKED_STATIC.test(req.path)) return res.sendStatus(404);
  next();
});

app.use(
  express.static(ROOT, {
    index: SITE_URL ? false : "index.html",
    dotfiles: "deny",
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
  const emailProvider = getEmailProvider();
  console.log(`Sairas Media running on port ${PORT}`);
  console.log(`Email provider: ${emailProvider || "NOT CONFIGURED"}`);
  console.log(`SITE_URL: ${SITE_URL || "NOT SET (SEO canonicals disabled)"}`);
});
