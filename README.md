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

## Railway-deploy

Katso alla olevat ohjeet tai [Railway docs](https://docs.railway.app/).
