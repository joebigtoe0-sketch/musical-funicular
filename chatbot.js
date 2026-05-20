class SairasChatbot {
  constructor() {
    this.messages = [];
    this.isOpen = false;
    this.isLoading = false;
    this.greetingShown = false;
    this.calendlyUrl = window.SAIRAS_CALENDLY_URL || "";
    this.apiUrl = "/api/chat";
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
    setTimeout(() => this.showGreeting(), 3000);
  }

  escapeHtml(text) {
    const el = document.createElement("div");
    el.textContent = text;
    return el.innerHTML;
  }

  async sendMessage(userMessage) {
    this.messages.push({ role: "user", content: userMessage });
    this.renderMessages();
    this.isLoading = true;
    this.renderLoading();

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: this.messages,
          calendlyUrl: this.calendlyUrl || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error("not_configured");
        }
        throw new Error(data.error || `API ${response.status}`);
      }

      const assistantMessage = data.message || "En saanut vastausta. Yritä uudelleen.";
      this.messages.push({ role: "assistant", content: assistantMessage });
      this.checkForLeadInfo(assistantMessage, userMessage);
    } catch (error) {
      const content =
        error.message === "not_configured"
          ? "Chat ei ole vielä käytettävissä. Ota yhteyttä: info@sairasmedia.fi"
          : "Pahoittelut, yhteysvirhe. Voit ottaa yhteyttä suoraan: info@sairasmedia.fi";
      this.messages.push({ role: "assistant", content });
    }

    this.isLoading = false;
    this.removeLoading();
    this.renderMessages();
  }

  checkForLeadInfo(assistantMsg, userMsg) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = userMsg.match(emailRegex);
    if (emailMatch) {
      this.saveLead({ email: emailMatch[0], conversation: this.messages });
    }
  }

  saveLead(leadData) {
    try {
      const existing = JSON.parse(localStorage.getItem("sairas_leads") || "[]");
      existing.push({ ...leadData, savedAt: new Date().toISOString() });
      localStorage.setItem("sairas_leads", JSON.stringify(existing));
      console.log("Lead saved:", leadData);
    } catch (e) {
      console.log("Lead save failed", e);
    }
  }

  render() {
    if (document.getElementById("sairas-chatbot")) return;

    const widget = document.createElement("div");
    widget.id = "sairas-chatbot";
    widget.innerHTML = [
      '<button class="chat-toggle" id="chat-toggle" type="button" aria-label="Avaa chat">',
      '<span class="chat-pulse"></span>',
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">',
      '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
      "</svg>",
      '<span class="chat-toggle-label">Kysy meiltä</span>',
      "</button>",
      '<div class="chat-window" id="chat-window" hidden>',
      '<div class="chat-header">',
      '<div class="chat-header-info">',
      '<div class="chat-avatar">SM</div>',
      "<div>",
      '<div class="chat-name">Sairas Media Assistentti</div>',
      '<div class="chat-status"><span class="status-dot"></span> Online</div>',
      "</div>",
      "</div>",
      '<button class="chat-close" id="chat-close" type="button" aria-label="Sulje chat">✕</button>',
      "</div>",
      '<div class="chat-messages" id="chat-messages"></div>',
      '<div class="chat-input-area">',
      '<input type="text" id="chat-input" placeholder="Kirjoita viesti..." autocomplete="off" />',
      '<button id="chat-send" type="button" aria-label="Lähetä">',
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">',
      '<line x1="22" y1="2" x2="11" y2="13"/>',
      '<polygon points="22 2 15 22 11 13 2 9 22 2"/>',
      "</svg>",
      "</button>",
      "</div>",
      "</div>",
    ].join("");
    document.body.appendChild(widget);
  }

  attachEvents() {
    document.getElementById("chat-toggle")?.addEventListener("click", () => this.toggle());
    document.getElementById("chat-close")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    });
    document.getElementById("chat-send")?.addEventListener("click", () => this.handleSend());
    document.getElementById("chat-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });
    document.querySelectorAll("[data-open-chat]").forEach((btn) => {
      btn.addEventListener("click", () => this.open());
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) this.close();
    });
  }

  handleSend() {
    const input = document.getElementById("chat-input");
    if (!input) return;
    const text = input.value.trim();
    if (!text || this.isLoading) return;
    input.value = "";
    this.sendMessage(text);
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    const win = document.getElementById("chat-window");
    const toggle = document.getElementById("chat-toggle");
    if (win) {
      win.hidden = false;
      win.removeAttribute("hidden");
    }
    toggle?.classList.add("active");
    toggle?.setAttribute("aria-expanded", "true");
    toggle?.removeAttribute("data-notification");
    if (this.messages.length === 0) this.sendGreeting();
    setTimeout(() => document.getElementById("chat-input")?.focus(), 100);
  }

  close() {
    this.isOpen = false;
    const win = document.getElementById("chat-window");
    const toggle = document.getElementById("chat-toggle");
    if (win) {
      win.hidden = true;
      win.setAttribute("hidden", "");
    }
    toggle?.classList.remove("active");
    toggle?.setAttribute("aria-expanded", "false");
  }

  sendGreeting() {
    if (this.greetingShown) return;
    this.greetingShown = true;
    this.messages.push({
      role: "assistant",
      content:
        "Hei! 👋 Olen Sairas Median AI-assistentti. Voin kertoa palveluistamme ja hinnoista, tai auttaa kartoittamaan mitä tarvitset. Mistä haluaisit tietää enemmän?",
    });
    this.renderMessages();
  }

  showGreeting() {
    const toggle = document.getElementById("chat-toggle");
    if (!toggle || this.isOpen) return;
    toggle.setAttribute("data-notification", "Hei! Voin auttaa 👋");
  }

  renderMessages() {
    const container = document.getElementById("chat-messages");
    if (!container) return;

    container.innerHTML = this.messages
      .map(
        (msg) =>
          `<div class="chat-message ${msg.role}"><div class="chat-bubble">${this.escapeHtml(msg.content).replace(/\n/g, "<br>")}</div></div>`
      )
      .join("");

    container.scrollTop = container.scrollHeight;
  }

  renderLoading() {
    const container = document.getElementById("chat-messages");
    if (!container) return;
    this.removeLoading();
    const loadingEl = document.createElement("div");
    loadingEl.className = "chat-message assistant chat-loading-row";
    loadingEl.innerHTML =
      '<div class="chat-bubble chat-loading"><span></span><span></span><span></span></div>';
    container.appendChild(loadingEl);
    container.scrollTop = container.scrollHeight;
  }

  removeLoading() {
    document.querySelector(".chat-loading-row")?.remove();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.sairasChatbot = new SairasChatbot();
});

