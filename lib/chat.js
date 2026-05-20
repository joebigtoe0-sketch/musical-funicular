function buildSystemPrompt(calendlyUrl) {
  const calendlyBookingLine = calendlyUrl
    ? `Voit varata ilmaisen 30 min kartoituspuhelun suoraan kalenteristamme: ${calendlyUrl}`
    : "Voit varata ilmaisen 30 min kartoituspuhelun — ota yhteyttä info@sairasmedia.fi";

  return `Olet Sairas Median AI-assistentti. Sairas Media on suomalainen digitaalinen toimisto joka tarjoaa:
- Verkkosivut & verkkokaupat (alkaen 500€)
- Sovellukset & web-appit (tarjouksesta)
- AI-ratkaisut: chatbotit, automaatiot, integraatiot (alkaen 800€)
- AI-konsultointi: ilmainen alkukartoitus puhelimitse (ei sitoumuksia)
- Graafinen suunnittelu: logo, yritysilme (alkaen 250€)

Meillä on yli 3 vuoden kokemus AI-ratkaisuista ja 100+ toteutettua projektia.

Tarjoamme myös ilmaista AI-konsultointia yrityksille jotka eivät tiedä mistä aloittaa. Jos käyttäjä vaikuttaa epävarmalta tai kysyy yleisesti mitä AI voisi tehdä heidän yrityksessään, suosittele lämpimästi ilmaista alkukartoitusta.

Kun käyttäjä kysyy konsultoinnista, kartoituksesta, alkupuhelusta tai haluaa varata kartoituspuhelun, vastaa tällä viestillä (kopioi linkki sellaisenaan):
"${calendlyBookingLine}"

Tehtäväsi:
- Vastaa kysymyksiin palveluista ja hinnoista
- Kerää yhteystiedot kiinnostuneilta (nimi, yritys, sähköposti, mitä tarvitsevat)
- Tarjoa kartoituspuhelun varaamista kiinnostuneille
- Ohjaa monimutkaiset kysymykset sähköpostiin: info@sairasmedia.fi

Ole ystävällinen, asiantunteva ja ytimekäs. Käytä suomea ellei käyttäjä aloita englanniksi. Älä lupaa asioita joita et tiedä varmasti.

Jos käyttäjä on selvästi kiinnostunut, kysy:
"Haluatko jättää yhteystietosi niin palaamme asiaan?"
Ja kerää: nimi, yritys, sähköposti, lyhyt kuvaus tarpeesta.`;
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return null;

  const cleaned = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, 4000),
    }));

  return cleaned.length > 0 ? cleaned : null;
}

async function handleChatRequest(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.sendStatus(204);
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Chat not configured" });
  }

  const { messages, calendlyUrl } = req.body || {};
  const safeMessages = sanitizeMessages(messages);
  if (!safeMessages) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  const calendly =
    typeof calendlyUrl === "string" && calendlyUrl.startsWith("https://")
      ? calendlyUrl.slice(0, 500)
      : process.env.SAIRAS_CALENDLY_URL || "";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: buildSystemPrompt(calendly),
        messages: safeMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", response.status, data);
      return res.status(502).json({ error: "Upstream API error" });
    }

    const text = data.content?.[0]?.text || "";
    return res.status(200).json({ message: text });
  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { handleChatRequest };
