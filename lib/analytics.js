function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function getMeasurementId() {
  const id = (process.env.GA_MEASUREMENT_ID || "").trim();
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return "";
  return id;
}

/** Google Analytics 4 (gtag.js) — inject via <!--SAIRAS_SEO--> on all HTML pages */
function getAnalyticsSnippet() {
  const id = getMeasurementId();
  if (!id) return "";

  const safeId = escapeAttr(id);

  return `
  <script async src="https://www.googletagmanager.com/gtag/js?id=${safeId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("js", new Date());
    gtag("config", "${safeId}");
  </script>`;
}

module.exports = { getAnalyticsSnippet, getMeasurementId };
