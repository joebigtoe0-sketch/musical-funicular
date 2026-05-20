require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const express = require("express");
const { handleChatRequest } = require("./lib/chat");
const { handleContactRequest } = require("./lib/contact");
const { getEmailProvider } = require("./lib/email");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const BLOCKED_STATIC = /^\/(lib\/|node_modules\/|server\.js|package\.json|package-lock\.json|railway\.toml)/;

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

app.post("/api/chat", (req, res) => handleChatRequest(req, res));
app.options("/api/chat", (req, res) => handleChatRequest(req, res));

app.post("/api/contact", (req, res) => handleContactRequest(req, res));

app.use((req, res, next) => {
  if (BLOCKED_STATIC.test(req.path)) return res.sendStatus(404);
  next();
});

app.use(
  express.static(ROOT, {
    index: "index.html",
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
});
