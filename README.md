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

Lomake (`index.html`) ja chatbot-liidit lähetetään `CONTACT_EMAIL`-osoitteeseen SMTP:n kautta.

Railway Variables (pakolliset sähköpostille):

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `CONTACT_EMAIL` — vastaanottaja
- `EMAIL_FROM` — lähettäjä (esim. `"Sairas Media <info@sairasmedia.fi>"`)

**Gmail:** Google Account → Security → 2FA → App passwords → käytä sitä `SMTP_PASS`:ina.

## Railway-deploy

Katso alla olevat ohjeet tai [Railway docs](https://docs.railway.app/).
