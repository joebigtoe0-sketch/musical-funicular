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

## Railway-deploy

Katso alla olevat ohjeet tai [Railway docs](https://docs.railway.app/).
