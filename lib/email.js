const nodemailer = require("nodemailer");

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatConversation(conversation) {
  if (!Array.isArray(conversation) || !conversation.length) return "";

  return conversation
    .map((m) => {
      const role = m.role === "user" ? "Asiakas" : "Assistentti";
      return `${role}:\n${m.content || ""}`;
    })
    .join("\n\n---\n\n");
}

async function sendContactNotification(data) {
  const transport = getTransport();
  if (!transport) {
    const err = new Error("Email not configured");
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }

  const to = process.env.CONTACT_EMAIL || "info@sairasmedia.fi";
  const from =
    process.env.EMAIL_FROM || `"Sairas Media" <${process.env.SMTP_USER}>`;

  const { type, name, email, phone, company, message, conversation, sourcePage } = data;

  const isChatbot = type === "chatbot";
  const subject = isChatbot
    ? `Chatbot-yhteystieto: ${name || email || "tuntematon"}`
    : `Uusi tarjouspyyntö: ${name}`;

  const conversationText = formatConversation(conversation);

  const lines = [
    isChatbot ? "Uusi yhteystieto chatbot-keskustelusta" : "Uusi tarjouspyyntö verkkosivulta",
    "",
    `Nimi: ${name || "—"}`,
    `Sähköposti: ${email || "—"}`,
    `Puhelin: ${phone || "—"}`,
    `Yritys: ${company || "—"}`,
    sourcePage ? `Sivu: ${sourcePage}` : "",
    "",
    "Viesti:",
    message || "—",
  ].filter(Boolean);

  if (conversationText) {
    lines.push("", "Keskustelu:", conversationText);
  }

  const textBody = lines.join("\n");
  const htmlBody = `
    <h2>${escapeHtml(isChatbot ? "Chatbot-yhteystieto" : "Uusi tarjouspyyntö")}</h2>
    <table cellpadding="6" style="font-family:sans-serif;font-size:14px;">
      <tr><td><strong>Nimi</strong></td><td>${escapeHtml(name || "—")}</td></tr>
      <tr><td><strong>Sähköposti</strong></td><td>${escapeHtml(email || "—")}</td></tr>
      <tr><td><strong>Puhelin</strong></td><td>${escapeHtml(phone || "—")}</td></tr>
      <tr><td><strong>Yritys</strong></td><td>${escapeHtml(company || "—")}</td></tr>
      ${sourcePage ? `<tr><td><strong>Sivu</strong></td><td>${escapeHtml(sourcePage)}</td></tr>` : ""}
    </table>
    <h3>Viesti</h3>
    <p style="white-space:pre-wrap">${escapeHtml(message || "—")}</p>
    ${
      conversationText
        ? `<h3>Keskustelu</h3><pre style="background:#f4f4f5;padding:12px;border-radius:8px;white-space:pre-wrap;font-size:13px;">${escapeHtml(conversationText)}</pre>`
        : ""
    }
  `;

  await transport.sendMail({
    from,
    to,
    replyTo: email || undefined,
    subject,
    text: textBody,
    html: htmlBody,
  });
}

module.exports = { sendContactNotification, getTransport };
