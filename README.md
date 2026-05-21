# Sairas Media — verkkosivut

Staattinen sivusto + chatbot. Tuotannossa Node/Express palvelee HTML-tiedostot ja `/api/chat`-rajapinnan.

## Paikallinen kehitys

```bash
npm install
cp .env.example .env.local
# Lisää ANTHROPIC_API_KEY .env.local-tiedostoon

# Windows PowerShell:
$env:ANTHROPIC_API_KEY="sk-ant-..."
npm run dev

# Avaa http://localhost:3000
```

`chatbot-config.js`: julkinen Calendly-linkki sivuston napeille.

## Tarjouspyyntö → sähköposti

Lomake ja chatbot lähettävät viestit `CONTACT_EMAIL`-osoitteeseen.

**Railway:** käytä **Resend**-API:a. one.com SMTP (`send.one.com`) ei toimi Railway-palvelimelta (yhteys timeout).

Railway Variables:

- `RESEND_API_KEY` — [resend.com](https://resend.com) → API Keys
- `CONTACT_EMAIL` — `info@sairasmedia.fi`
- `EMAIL_FROM` — `Sairas Media <noreply@sairasmedia.fi>` (domain vahvistettu Resendissä)

Vastaanotto pysyy one.comissa; lähetys menee Resendin kautta.

## SEO ja AI-löydettävyys

Aseta Railwayssä:

```
SITE_URL=https://sairasmedia.fi
```

Tämä aktivoi canonical-linkit, Open Graph, JSON-LD, `sitemap.xml` ja `robots.txt`.

- **`/llms.txt`** — indeksi AI-crawlereille ([llmstxt.org](https://llmstxt.org/))
- **`/llms/*.md`** — markdown-peilit sivuista (helpompi AI:lle kuin HTML)
- **`/llms-full.md`** ja **`/llms-full.txt`** — laaja referenssi
- **`/.well-known/llms.txt`** — ohjaa → `/llms.txt`
- Favicon: käyttää suoraan `/logo.png`

Hakukoneet: lähetä sitemap Google Search Consolessa (`https://sairasmedia.fi/sitemap.xml`).

### Google Search Console -vahvistus

1. Avaa [Google Search Console](https://search.google.com/search-console)
2. **Lisää resurssi** → URL-etuliite → `https://sairasmedia.fi`
3. Vahvistus: valitse **HTML-tunniste**
4. Google näyttää tagin, esim.  
   `<meta name="google-site-verification" content="VAIN_TAMA_KOODI" />`
5. Kopioi **vain** `content`-kentän arvo (ei koko tagia)
6. Railway → Variables → `GOOGLE_SITE_VERIFICATION=VAIN_TAMA_KOODI`
7. Redeploy → avaa etusivu → View Source → varmista että meta-tagi näkyy
8. Search Consolessa paina **Vahvista**

Puhelin: päivitä `lib/site.js` jos numero muuttuu.

## Railway-deploy

Katso alla olevat ohjeet tai [Railway docs](https://docs.railway.app/).
