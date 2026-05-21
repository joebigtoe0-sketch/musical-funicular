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

/** Consent Mode v2 stub — GA loads only after user accepts (cookie-consent.js) */
function getAnalyticsConsentStub() {
  const id = getMeasurementId();
  if (!id) return "";

  const safeId = escapeAttr(id);

  return `
  <script>
    window.SAIRAS_GA_ID = "${safeId}";
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500
    });
  </script>`;
}

module.exports = { getMeasurementId, getAnalyticsConsentStub };
