const { SITE_PHONE_E164 } = require("./site");
const { getAnalyticsSnippet } = require("./analytics");

const PAGE_META = {
  "index.html": {
    path: "/",
    title: "Sairas Media – AI-ratkaisut, verkkosivut ja sovellukset | Suomi",
    description:
      "Sairas Media on suomalainen digitoimisto: tekoälyratkaisut, AI-konsultointi, chatbotit, verkkosivut ja sovellukset. Yli 3 vuoden AI-kokemus ja 100+ toteutettua projektia.",
    ogType: "website",
    keywords:
      "Sairas Media, tekoäly, AI, AI-konsultointi, chatbot, automaatio, verkkosivut, sovellukset, digitoimisto Suomi",
    jsonLd: "home",
  },
  "ai-ratkaisut.html": {
    path: "/ai-ratkaisut.html",
    title: "AI-ratkaisut ja konsultointi | Sairas Media",
    description:
      "Räätälöidyt AI-ratkaisut Suomessa: chatbotit, prosessiautomaatio, integraatiot ja ilmainen AI-kartoitus. 100+ projektia, 3+ vuoden kokemus.",
    ogType: "website",
    keywords: "AI-ratkaisut, tekoäly yritykselle, AI-chatbot, automaatio, AI-konsultointi, Sairas Media",
    jsonLd: "ai",
  },
  "verkkosivut.html": {
    path: "/verkkosivut.html",
    title: "Verkkosivut ja verkkokaupat | Sairas Media",
    description:
      "Modernit verkkosivut ja verkkokaupat yrityksille: WordPress, React, Next.js ja räätälöity toteutus. Selkeä prosessi ja hinnoittelu.",
    ogType: "website",
    keywords: "verkkosivut, verkkokauppa, yrityksen kotisivu, WordPress, React, Sairas Media",
    jsonLd: "service",
    serviceName: "Verkkosivut ja verkkokaupat",
  },
  "sovellukset.html": {
    path: "/sovellukset.html",
    title: "Sovellukset ja automaatiot | Sairas Media",
    description:
      "Räätälöidyt web-sovellukset, hallintapaneelit ja tekoälypohjainen automaatio. API-integraatiot jotka säästävät aikaa.",
    ogType: "website",
    keywords: "sovelluskehitys, web-sovellus, automaatio, API-integraatio, tekoäly, Sairas Media",
    jsonLd: "service",
    serviceName: "Sovellukset ja automaatiot",
  },
  "graafinen-suunnittelu.html": {
    path: "/graafinen-suunnittelu.html",
    title: "Graafinen suunnittelu | Sairas Media",
    description:
      "Yritysilme, logot ja markkinointimateriaali. Ammattimainen graafinen suunnittelu digitaalisiin ja painotuotteisiin.",
    ogType: "website",
    keywords: "graafinen suunnittelu, logo, yritysilme, brändi, Sairas Media",
    jsonLd: "service",
    serviceName: "Graafinen suunnittelu",
  },
  "muut-palvelut.html": {
    path: "/muut-palvelut.html",
    title: "Muut palvelut – laser, 3D, printti | Sairas Media",
    description: "Laserkaiverrus, 3D-tulostus ja suurkuvatulostus Sairas Medialta.",
    ogType: "website",
    keywords: "laserkaiverrus, 3D-tulostus, suurkuvatulostus, Sairas Media",
    jsonLd: "page",
  },
  "laserkaiverrus.html": {
    path: "/laserkaiverrus.html",
    title: "Laserkaiverrus | Sairas Media",
    description: "Tarkka laserkaiverrus puulle, metalliin, akryyliin ja muille materiaaleille.",
    ogType: "website",
    keywords: "laserkaiverrus, personointi, kyltit, Sairas Media",
    jsonLd: "page",
  },
  "3d-tulostus.html": {
    path: "/3d-tulostus.html",
    title: "3D-tulostus | Sairas Media",
    description: "3D-tulostus prototyyppeihin, osiin ja räätälöityihin tuotteisiin.",
    ogType: "website",
    keywords: "3D-tulostus, prototyyppi, 3D-malli, Sairas Media",
    jsonLd: "page",
  },
  "suurkuvatulostus-printtituotteet.html": {
    path: "/suurkuvatulostus-printtituotteet.html",
    title: "Suurkuvatulostus ja printti | Sairas Media",
    description: "Suurkuvatulosteet, tarrat, julisteet, bannerit ja teippaukset.",
    ogType: "website",
    keywords: "suurkuvatulostus, printti, banneri, tarra, Sairas Media",
    jsonLd: "page",
  },
};

const PUBLIC_PAGES = Object.keys(PAGE_META);

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function buildJsonLd(meta, siteUrl) {
  const pageUrl = `${siteUrl}${meta.path === "/" ? "/" : meta.path}`;
  const blocks = [];

  blocks.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Sairas Media",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    email: "info@sairasmedia.fi",
    telephone: SITE_PHONE_E164,
    areaServed: { "@type": "Country", name: "Finland" },
    knowsAbout: [
      "Artificial Intelligence",
      "AI consulting",
      "Chatbots",
      "Business process automation",
      "Web development",
      "Web applications",
      "Graphic design",
    ],
    description:
      "Suomalainen digitoimisto joka rakentaa tekoälyratkaisuja, verkkosivuja ja sovelluksia yrityksille.",
  });

  if (meta.jsonLd === "home") {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Sairas Media",
      description: meta.description,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "fi-FI",
    });
    blocks.push({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#business`,
      name: "Sairas Media",
      url: siteUrl,
      image: `${siteUrl}/logo.png`,
      description: meta.description,
      email: "info@sairasmedia.fi",
      telephone: SITE_PHONE_E164,
      areaServed: "FI",
      priceRange: "€€",
      serviceType: [
        "AI consulting",
        "AI chatbot development",
        "Web design",
        "Web application development",
        "Graphic design",
      ],
    });
  }

  if (meta.jsonLd === "ai") {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: "AI-ratkaisut ja konsultointi",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: "FI",
      description: meta.description,
      url: pageUrl,
    });
  }

  if (meta.jsonLd === "service" && meta.serviceName) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: meta.serviceName,
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: "FI",
      url: pageUrl,
    });
  }

  blocks.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: meta.title,
    description: meta.description,
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": `${siteUrl}/#organization` },
    inLanguage: "fi-FI",
  });

  return { "@context": "https://schema.org", "@graph": blocks };
}

function getGoogleVerificationTag() {
  const code = process.env.GOOGLE_SITE_VERIFICATION;
  if (!code) return "";
  // Avoid duplicate if already in index.html
  return `\n  <meta name="google-site-verification" content="${escapeAttr(code)}" data-env="1" />`;
}

function getFaviconTags() {
  return `${getGoogleVerificationTag()}${getAnalyticsSnippet()}
  <link rel="icon" href="/logo.png" type="image/png" />
  <link rel="shortcut icon" href="/logo.png" type="image/png" />
  <link rel="apple-touch-icon" href="/logo.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#0179a6" />`;
}

function getSeoInjection(filename, siteUrl) {
  const meta = PAGE_META[filename];
  if (!meta || !siteUrl) return getFaviconTags();

  const canonical = meta.path === "/" ? `${siteUrl}/` : `${siteUrl}${meta.path}`;
  const ogImage = `${siteUrl}/logo.png`;
  const jsonLd = buildJsonLd(meta, siteUrl);

  return `${getFaviconTags()}
  <link rel="canonical" href="${escapeAttr(canonical)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="author" content="Sairas Media" />
  <meta name="keywords" content="${escapeAttr(meta.keywords || "")}" />
  <link rel="alternate" type="text/plain" href="${siteUrl}/llms.txt" title="LLM site summary" />
  <link rel="alternate" type="text/markdown" href="${siteUrl}/llms-full.md" title="LLM full reference" />
  <meta property="og:locale" content="fi_FI" />
  <meta property="og:site_name" content="Sairas Media" />
  <meta property="og:type" content="${meta.ogType}" />
  <meta property="og:title" content="${escapeAttr(meta.title)}" />
  <meta property="og:description" content="${escapeAttr(meta.description)}" />
  <meta property="og:url" content="${escapeAttr(canonical)}" />
  <meta property="og:image" content="${escapeAttr(ogImage)}" />
  <meta property="og:image:alt" content="Sairas Media" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeAttr(meta.title)}" />
  <meta name="twitter:description" content="${escapeAttr(meta.description)}" />
  <meta name="twitter:image" content="${escapeAttr(ogImage)}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

function buildSitemap(siteUrl) {
  const urls = PUBLIC_PAGES.map((file) => {
    const meta = PAGE_META[file];
    const loc = meta.path === "/" ? `${siteUrl}/` : `${siteUrl}${meta.path}`;
    const priority = file === "index.html" ? "1.0" : file === "ai-ratkaisut.html" ? "0.9" : "0.7";
    const changefreq = file === "index.html" || file === "ai-ratkaisut.html" ? "weekly" : "monthly";
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

function buildRobots(siteUrl) {
  return `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: ${siteUrl}/sitemap.xml

# AI / LLM discovery
# https://llmstxt.org/
LLMs-Txt: ${siteUrl}/llms.txt
`;
}

module.exports = {
  PAGE_META,
  PUBLIC_PAGES,
  getSeoInjection,
  buildSitemap,
  buildRobots,
  getFaviconTags,
};
