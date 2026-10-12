# RelOS PWA - Deployment Guide

Ein vollständiger Guide für die Bereitstellung von RelOS auf verschiedenen Plattformen.

## 🚀 Quick Deployment

### Vercel (Empfohlen - 2 Minuten)

**Vorbereitung:**
1. GitHub-Konto erstellen & Projekt pushen
2. Vercel.com Konto erstellen (kostenlos)

**Deployment:**
```bash
# 1. Vercel CLI installieren
npm i -g vercel

# 2. Ins Projektverzeichnis gehen
cd relos-pwa

# 3. Deployen
vercel

# 4. Im Dashboard Env-Variablen setzen:
# OPENAI_API_KEY=sk-...
```

**Resultat:**
- URL: `https://relos-<yourteam>.vercel.app`
- Auto-Deploy bei jedem Git Push
- Kostenlos mit Custom Domain

---

## 📦 Docker (3 Minuten)

### Lokal mit Docker

```bash
# 1. Docker Desktop installieren

# 2. Bauen
docker build -t relos-pwa .

# 3. Ausführen
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  relos-pwa

# 4. http://localhost:3000 öffnen
```

### Mit Docker Compose (mit PostgreSQL)

```bash
# 1. Environment vorbereiten
echo "OPENAI_API_KEY=sk-..." > .env.local

# 2. Starten
docker-compose up -d

# 3. App lädt unter http://localhost:3000
# 4. PostgreSQL unter localhost:5432
```

### Docker Compose Stoppen
```bash
docker-compose down
```

---

## ☁️ Railway.app (5 Minuten)

**Schnelle Cloud-Lösung mit PostgreSQL**

```bash
# 1. railway.app Account erstellen
# 2. GitHub mit Railway verbinden

# 3. Im Railway-Dashboard:
# - New Project
# - GitHub Repo auswählen
# - Add Environment Variables:
#   OPENAI_API_KEY=sk-...

# 4. Auto-Deploy bei Git Push
```

**Kosten:** $5/Monat (großzügig kostenlos Tier)

---

## 🔧 Netlify (5 Minuten)

```bash
# 1. Netlify Account erstellen
# 2. GitHub mit Netlify verbinden

# 3. Im CLI:
npm install -g netlify-cli
netlify deploy

# oder per GUI im Netlify-Dashboard
# - New Site from Git
# - Select GitHub Repo
# - Build Command: npm run build
# - Publish Directory: .next
# - Add Env: OPENAI_API_KEY
```

---

## 🏠 Self-Hosted (Debian/Ubuntu)

### Auf eigenem Server

**Voraussetzungen:**
- Ubuntu 20.04+
- Node.js 18+
- 1GB RAM (minimum)
- 10GB Disk

**Setup:**

```bash
# 1. SSH in Server einloggen
ssh user@your-server.com

# 2. Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Projekt klonen
git clone https://github.com/youruser/relos-pwa.git
cd relos-pwa

# 4. Dependencies installieren
npm install

# 5. Environment setzen
nano .env.local
# OPENAI_API_KEY=sk-...
# NODE_ENV=production

# 6. Bauen
npm run build

# 7. Starten mit PM2 (Process Manager)
npm install -g pm2
pm2 start "npm start" --name "relos-pwa"
pm2 save

# 8. Nginx als Reverse Proxy

sudo apt-get install -y nginx

# /etc/nginx/sites-available/default:
```

**Nginx Config:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**HTTPS mit Let's Encrypt:**

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**Auto-Updates:**

```bash
# Cron job für Git Pull jeden Tag
crontab -e

# Add:
0 3 * * * cd /home/user/relos-pwa && git pull && npm install && npm run build && pm2 restart relos-pwa
```

---

## 🗄️ Datenbank-Setup

### Supabase (Empfohlen für Production)

```bash
# 1. supabase.com Account erstellen
# 2. Neues Project erstellen
# 3. SQL Editor öffnen

# Tabellen erstellen:
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE couple_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id TEXT REFERENCES couples(couple_id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  partner_id UUID REFERENCES couple_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ... weitere Tabellen aus lib/types.ts SCHEMA_DEFINITIONS
```

**Umgebungsvariablen:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### PostgreSQL (Self-Hosted)

```bash
# Lokal für Entwicklung:
docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# Mit Connection-String:
DATABASE_URL=postgresql://user:password@localhost:5432/relos
```

---

## 📊 Monitoring & Logging

### Application Insights (mit Vercel)

```bash
# Vercel Dashboard:
# - Deployments Tab
# - Logs anschauen
# - Performance Metrics prüfen
```

### Self-Hosted Logging

```bash
# PM2 Logs anschauen
pm2 logs relos-pwa

# Persistent Logging mit loki:
# /etc/pm2/loki.json
{
  "apps": [{
    "name": "relos-pwa",
    "script": "npm start",
    "error_file": "/var/log/relos-error.log",
    "out_file": "/var/log/relos-out.log"
  }]
}
```

---

## 🔒 Security Checklist

- [ ] `.env` Dateien NICHT in Git
- [ ] HTTPS aktiviert (überall)
- [ ] Environment Variables geheim halten
- [ ] OpenAI API Key mit Limits setzen
- [ ] CORS konfiguriert
- [ ] CSP Header setzen
- [ ] Rate Limiting auf API Routes
- [ ] Database Backups konfiguriert

### Security Headers (Nginx)

```nginx
server {
    # Existing config...
    
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
}
```

---

## 🧪 Pre-Deployment Checklist

```bash
# 1. Type-Check
npm run type-check

# 2. Lint
npm run lint

# 3. Build Test
npm run build

# 4. Start lokaler Production Build
npm start
# Teste http://localhost:3000

# 5. Umgebungsvariablen überprüfen
cat .env.local

# 6. Git Status clean
git status

# 7. Alle Tests grün
npm test
```

---

## 📱 iOS/Android App Distribution

### iOS (via Web App)

1. RelOS.app auf Safari öffnen
2. "Share" > "Zum Home-Bildschirm"
3. Installiert wie native App

### Android (via Web App)

1. RelOS.app in Chrome öffnen
2. 3 Punkte Menü > "App installieren"
3. Zum Home-Bildschirm hinzufügen

### Mit Native App Wrappers (Optional)

**Capacitor** für native iOS/Android:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
# Buildet dann mit Xcode/Android Studio
```

---

## 🆘 Troubleshooting

### "Port 3000 already in use"
```bash
lsof -i :3000
kill -9 <PID>
```

### Docker Container startet nicht
```bash
docker logs <container-id>
docker inspect <container-id>
```

### Build fehlgeschlagen
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Datenbank-Fehler
```bash
# Supabase Status checken
# oder PostgreSQL Connection testen:
psql postgresql://user:pass@localhost/relos
```

### API Key nicht funktioniert
- OpenAI Dashboard checken: https://platform.openai.com/account/api-keys
- Quote/Limits überprüfen
- Neue Umgebungsvariablen: `vercel env pull`

---

## 📈 Skalierung

Wenn die App wächst:

1. **Caching hinzufügen**: Redis, Next.js ISR
2. **CDN aktivieren**: Vercel Edge Network, Cloudflare
3. **Database Optimization**: Indexes, Connection Pool
4. **API Rate Limiting**: Mit RateLimit Middleware
5. **Load Balancing**: Nginx, Vercel Auto-Scaling

---

## 🎯 Nächste Schritte

1. **Live gehen**: Wählen Sie Vercel/Railway/Self-Hosted
2. **Domain**: Custom Domain konfigurieren
3. **Monitoring**: Fehler-Tracking (Sentry, LogRocket)
4. **Analytics**: User-Verhalten tracken (Plausible, Mixpanel)
5. **Support**: Fehler-Reporting einbauen

---

**Fragen?** Siehe README.md Support-Sektion
