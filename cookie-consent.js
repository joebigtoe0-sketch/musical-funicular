(function () {
  const STORAGE_KEY = "sairas_cookie_consent";

  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  function loadGoogleAnalytics() {
    const id = window.SAIRAS_GA_ID;
    if (!id || window.__sairasGaLoaded) return;
    window.__sairasGaLoaded = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(arguments);
      };
    window.gtag("js", new Date());
    window.gtag("consent", "update", {
      analytics_storage: "granted",
    });
    window.gtag("config", id);
  }

  function applyConsent(value) {
    setConsent(value);
    if (value === "all") {
      loadGoogleAnalytics();
    }
    hideBanner();
  }

  function hideBanner() {
    document.getElementById("cookie-consent")?.remove();
    document.body.classList.remove("cookie-banner-open", "cookie-consent--settings-open");
  }

  function syncAnalyticsToggle() {
    const checkbox = document.getElementById("cookie-analytics");
    if (!checkbox) return;
    const stored = getConsent();
    checkbox.checked = stored === "all";
  }

  function setSettingsOpen(open) {
    const root = document.getElementById("cookie-consent");
    const details = document.getElementById("cookie-details");
    if (!root || !details) return;
    root.classList.toggle("cookie-consent--settings", open);
    document.body.classList.toggle("cookie-consent--settings-open", open);
    details.hidden = !open;
  }

  function bindBannerEvents(openSettings) {
    document.getElementById("cookie-accept")?.addEventListener("click", () => applyConsent("all"));
    document.getElementById("cookie-reject")?.addEventListener("click", () => applyConsent("essential"));
    document.getElementById("cookie-settings-toggle")?.addEventListener("click", () => {
      setSettingsOpen(!document.getElementById("cookie-consent")?.classList.contains("cookie-consent--settings"));
      syncAnalyticsToggle();
    });
    document.getElementById("cookie-save")?.addEventListener("click", () => {
      const analytics = document.getElementById("cookie-analytics");
      applyConsent(analytics?.checked ? "all" : "essential");
    });
    if (openSettings) {
      setSettingsOpen(true);
      syncAnalyticsToggle();
    }
  }

  function renderBanner(options = {}) {
    if (document.getElementById("cookie-consent")) return;

    const el = document.createElement("div");
    el.id = "cookie-consent";
    el.className = "cookie-consent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Evästeet");
    el.setAttribute("aria-modal", "false");
    el.innerHTML = [
      '<div class="cookie-consent-card">',
      '<div class="cookie-consent-text">',
      '<h2 class="cookie-consent-title">Sopiiko evästeiden käyttö?</h2>',
      "<p>Käytämme evästeitä ja vastaavia tekniikoita sivuston toimintaan sekä, suostumuksellasi, kävijätilastointiin (Google Analytics). Voit hyväksyä kaikki tai vain välttämättömät.</p>",
      '<p class="cookie-consent-more"><a href="tietosuoja.html#evasteet">Lue lisää</a></p>',
      "</div>",
      '<div class="cookie-consent-actions">',
      '<button type="button" class="cookie-btn cookie-btn-primary" id="cookie-accept">Hyväksy evästeet</button>',
      '<button type="button" class="cookie-btn cookie-btn-outline" id="cookie-reject">Vain pakolliset evästeet</button>',
      '<button type="button" class="cookie-btn cookie-btn-outline" id="cookie-settings-toggle">Evästeasetukset</button>',
      "</div>",
      "</div>",
      '<div class="cookie-consent-details" id="cookie-details" hidden>',
      '<div class="cookie-consent-details-inner">',
      '<div class="cookie-setting-row">',
      "<div>",
      "<strong>Välttämättömät</strong>",
      "<p>Sivuston toiminta ja evästevalintojen muistaminen.</p>",
      "</div>",
      '<span class="cookie-setting-badge">Aina käytössä</span>',
      "</div>",
      '<div class="cookie-setting-row">',
      "<div>",
      "<strong>Tilastointi</strong>",
      "<p>Google Analytics — anonymisoitu kävijätilasto.</p>",
      "</div>",
      '<label class="cookie-toggle" aria-label="Google Analytics">',
      '<input type="checkbox" id="cookie-analytics" />',
      '<span class="cookie-toggle-ui" aria-hidden="true"></span>',
      "</label>",
      "</div>",
      '<button type="button" class="cookie-btn cookie-btn-primary cookie-btn-save" id="cookie-save">Tallenna valinnat</button>',
      "</div>",
      "</div>",
    ].join("");

    document.body.appendChild(el);
    document.body.classList.add("cookie-banner-open");
    bindBannerEvents(options.openSettings);
  }

  function init() {
    const existing = getConsent();
    if (existing === "all") {
      loadGoogleAnalytics();
      return;
    }
    if (existing === "essential") {
      return;
    }
    renderBanner();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest("[data-cookie-settings]") : null;
    if (!btn) return;
    e.preventDefault();
    hideBanner();
    renderBanner({ openSettings: true });
    syncAnalyticsToggle();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.sairasCookieConsent = {
    openSettings() {
      hideBanner();
      renderBanner({ openSettings: true });
      syncAnalyticsToggle();
    },
    applyConsent,
  };
})();
