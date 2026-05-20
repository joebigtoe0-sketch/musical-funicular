const { sendContactNotification } = require("./email");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeString(value, maxLen = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function sanitizeConversation(conversation) {
  if (!Array.isArray(conversation)) return [];
  return conversation
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-30)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
}

async function handleContactRequest(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};

  if (body._gotcha) {
    return res.status(200).json({ ok: true });
  }

  const type = body.type === "chatbot" ? "chatbot" : "quote";
  const name = sanitizeString(body.name, 120);
  const email = sanitizeString(body.email, 200);
  const phone = sanitizeString(body.phone, 40);
  const company = sanitizeString(body.company, 120);
  const message = sanitizeString(body.message, 5000);
  const sourcePage = sanitizeString(body.sourcePage || body.source || "", 300);
  const conversation = sanitizeConversation(body.conversation);

  if (type === "quote") {
    if (!name) return res.status(400).json({ error: "Nimi vaaditaan" });
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: "Kelvollinen sähköposti vaaditaan" });
    if (!phone) return res.status(400).json({ error: "Puhelinnumero vaaditaan" });
  } else {
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: "Kelvollinen sähköposti vaaditaan" });
  }

  try {
    await sendContactNotification({
      type,
      name,
      email,
      phone,
      company,
      message,
      conversation,
      sourcePage,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err.code === "EMAIL_NOT_CONFIGURED") {
      console.error("Contact email not configured — set RESEND_API_KEY or SMTP_*");
      return res.status(503).json({ error: "Sähköposti ei ole konfiguroitu" });
    }
    if (err.code === "SMTP_BLOCKED" || err.code === "SMTP_TIMEOUT" || err.code === "ETIMEDOUT") {
      console.error("Email delivery failed:", err.message);
      return res.status(504).json({
        error:
          "Sähköpostin lähetys epäonnistui. Käytä Resend API -avainta (one.com SMTP ei toimi Railwayltä).",
      });
    }
    console.error("Contact send error:", err.message, err.code, err.responseCode);
    return res.status(500).json({ error: "Lähetys epäonnistui" });
  }
}

module.exports = { handleContactRequest };
