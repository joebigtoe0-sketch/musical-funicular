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
    document.body.classList.remove("cookie-banner-open");
  }

  function renderBanner() {
    if (document.getElementById("cookie-consent")) return;

    const el = document.createElement("div");
    el.id = "cookie-consent";
    el.className = "cookie-consent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Evästeet");
    el.innerHTML = [
      '<div class="cookie-consent-inner">',
      '<p class="cookie-consent-title">Evästeet</p>',
      "<p>Käytämme välttämättömiä evästeitä sivuston toimintaan. Tilastointiin (Google Analytics) tarvitsemme suostumuksesi.</p>",
      '<p class="cookie-consent-links"><a href="tietosuoja.html">Tietosuojaseloste</a></p>',
      '<div class="cookie-consent-actions">',
      '<button type="button" class="btn btn-secondary cookie-btn-reject" id="cookie-reject">Vain välttämättömät</button>',
      '<button type="button" class="btn btn-primary cookie-btn-accept" id="cookie-accept">Hyväksy kaikki</button>',
      "</div>",
      "</div>",
    ].join("");

    document.body.appendChild(el);
    document.body.classList.add("cookie-banner-open");

    document.getElementById("cookie-accept")?.addEventListener("click", () => applyConsent("all"));
    document.getElementById("cookie-reject")?.addEventListener("click", () => applyConsent("essential"));
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
    renderBanner();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.sairasCookieConsent = { openSettings: renderBanner, applyConsent };
})();
