const nodemailer = require("nodemailer");
const { Resend } = require("resend");

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

function buildEmailContent(data) {
  const to = process.env.CONTACT_EMAIL || "info@sairasmedia.fi";
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

  return { to, subject, textBody, htmlBody, replyTo: email || undefined };
}

function getSmtpTransport() {
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
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

function getFromAddress() {
  return (
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM ||
    `"Sairas Media" <${process.env.SMTP_USER || "noreply@sairasmedia.fi"}>`
  );
}

async function sendViaResend(mail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const resend = new Resend(apiKey);
  const from = getFromAddress();

  const { error } = await resend.emails.send({
    from,
    to: [mail.to],
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.textBody,
    html: mail.htmlBody,
  });

  if (error) {
    console.error("Resend error:", error);
    const err = new Error(error.message || "Resend send failed");
    err.code = "RESEND_ERROR";
    throw err;
  }

  return true;
}

async function sendViaSmtp(mail) {
  const transport = getSmtpTransport();
  if (!transport) return false;

  const from = getFromAddress();

  await Promise.race([
    transport.sendMail({
      from,
      to: mail.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.textBody,
      html: mail.htmlBody,
    }),
    new Promise((_, reject) => {
      setTimeout(() => {
        const err = new Error("SMTP connection timed out");
        err.code = "SMTP_TIMEOUT";
        reject(err);
      }, 20000);
    }),
  ]);

  return true;
}

function getEmailProvider() {
  if (process.env.RESEND_API_KEY) return "resend";
  if (getSmtpTransport()) return "smtp";
  return null;
}

async function sendContactNotification(data) {
  const mail = buildEmailContent(data);
  const provider = getEmailProvider();

  if (!provider) {
    const err = new Error("Email not configured");
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }

  if (provider === "resend") {
    await sendViaResend(mail);
    return;
  }

  try {
    await sendViaSmtp(mail);
  } catch (err) {
    console.error("SMTP send failed:", err.code || err.message);
    if (err.code === "ETIMEDOUT" || err.code === "SMTP_TIMEOUT") {
      const hint = new Error(
        "SMTP ei toimi Railway-palvelimelta (one.com estää yhteyden). Lisää RESEND_API_KEY Railway Variables -kohtaan."
      );
      hint.code = "SMTP_BLOCKED";
      throw hint;
    }
    throw err;
  }
}

module.exports = { sendContactNotification, getEmailProvider, getSmtpTransport };
