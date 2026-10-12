# RelOS - Relationship Operating System

Ein modernes Progressive Web App für Paare. Eine vollständige Lösung für Kommunikation, Planung, mentale Belastung und emotionale Verbindung.

## 🚀 Features

### 1. **Dashboard** (Mentale Belastung & Stimmung)
- **Tagesenergie-Tracker**: Interaktive Schieber (1-10) für beide Partner
- **Faire Aufgabenverteilung**: Kategorisierte Checklisten (Haushalt, Admin/Finanzen, Planung)
- **Mental-Load-Tracking**: Tags für Planung, Entscheidungsfindung, Ausführung

### 2. **Kalender** (Beziehung & Autonomie)
- **Event-Kategorisierung**:
  - 🎀 **Paar-Zeit**: Date Nights, gemeinsame Aktivitäten
  - 🌟 **Me-Time**: Persönliche Hobbys, Solo-Zeit mit Freunden
  - 📋 **Verpflichtungen**: Haushalt, Familie, Arbeit
- **Autonomie-Alert**: Warnung wenn ein Partner 7 Tage keine Me-Time hat
- **Miniaturkalender**: Monatsübersicht mit Event-Punkten

### 3. **Rephrase** (Vent & Translate)
- **Private Scratch-Pad**: Sicherer Raum für ungefilterte Frustration
- **GFK-Konvertierung**: KI-gestützte Umwandlung zu konstruktiven Ich-Botschaften
- **Kopieren/Teilen**: One-Click Kopieren oder direkt versenden

### 4. **Verbindungs-Hub** (Connection & Inspiration)
- **AI Date Night Generator**: 3 konkrete Ideen basierend auf:
  - Budget (Gratis, Budget, Luxus)
  - Ort (Zu Hause, Unterwegs)
  - Energie (Couch-Modus, Abenteuer)
- **Tägliche Gesprächsfragen**: Rotiert tiefe, verbindungsfördernde Fragen
- **Gemeinsame Bucket List**: Ferientraum, Ziele, Meilensteine mit Checkboxes

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Icons**: lucide-react
- **AI/API**: OpenAI `gpt-4o-mini` API
- **Database**: Supabase (PostgreSQL) oder localStorage für Demo
- **PWA**: Manifest.json, installierbar auf iOS/Android
- **Type-Safety**: TypeScript

## 📦 Installation & Setup

### Voraussetzungen
- Node.js 18+
- npm oder yarn
- OpenAI API Key (optional für Demo-Modus)

### Quick Start

```bash
# 1. Projekt klonen/erstellen
git clone <repo-url>
cd relos-pwa

# 2. Dependencies installieren
npm install

# 3. Environment konfigurieren
cp .env.example .env.local

# 4. Env-Variablen setzen
# .env.local
OPENAI_API_KEY=sk-... # Optional, für echte AI-Features
NEXT_PUBLIC_DEMO_MODE=true         # true = lokale Demo-Daten

# 5. Development-Server starten
npm run dev

# 6. Browser öffnen
# http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

### Docker (optional)

```bash
docker build -t relos-pwa .
docker run -p 3000:3000 relos-pwa
```

## 🔐 Couple Data Isolation

Jedes Paar wird über einen eindeutigen `couple_id` identifiziert:

```typescript
// Users können nur Daten mit ihrer couple_id sehen/ändern
SELECT * FROM shared_tasks WHERE couple_id = ?
```

### Row Level Security (Supabase)

```sql
-- Beispiel RLS Policy
CREATE POLICY "Users can only see their couple's data"
ON shared_tasks
FOR SELECT
USING (couple_id = (SELECT couple_id FROM couple_users WHERE id = auth.uid()))
```

## 🤖 AI Integration

### Vent & Translate Route
`POST /api/ai/translate`

Nutzt Gewaltfreie Kommunikation (GFK) Prinzipien:
1. **Beobachtung**: Fakten ohne Vorwürfe
2. **Gefühl**: Echte emotionale Reaktion
3. **Grund**: Warum es wichtig ist
4. **Bitte**: Konkrete, umsetzbare Bitte

```bash
curl -X POST http://localhost:3000/api/ai/translate \
  -H "Content-Type: application/json" \
  -d '{"originalMessage": "Du machst nie den Haushalt!", "coupleId": "..."}'
```

### Date Ideas Route
`POST /api/ai/date-ideas`

Generiert 3 konkrete Date-Itinerare basierend auf Budget, Ort & Energie.

```bash
curl -X POST http://localhost:3000/api/ai/date-ideas \
  -H "Content-Type: application/json" \
  -d '{"budget": "budget", "setting": "zuhause", "energyLevel": "couch-modus"}'
```

## 💾 Datenspeicherung

### Local Storage (Demo)
```typescript
// localStorage speichert alles lokal
// Ideal für sofort Tests ohne Datenbank-Setup
loadData() // lädt aus localStorage
saveData() // speichert lokal
```

### Supabase Integration

Für Production mit echten Benutzern:

```typescript
// 1. Supabase Client initialisieren
import { createClient } from '@supabase/supabase-js'

// 2. RLS Policies setzen
// 3. Couples & Users tabellen erstellen
// 4. dataManager.ts auf Supabase upgraden
```

## 📱 PWA-Features

### Installierbar auf iOS/Android
1. Browser öffnet App
2. "Zum Home-Bildschirm hinzufügen"
3. Arbeitet offline (mit Service Worker)
4. Native App-ähnliches Erlebnis

### Konfiguration
- `manifest.json`: App-Metadaten
- `viewport` Meta-Tags: Mobile optimiert
- `globals.css`: PWA-spezifische Styles (safe-area, Navigation)

## 🎨 Design Language

**Swiss High German (Hochdeutsch)**:
- Alle UI-Texte: Schweizer Hochdeutsch
- Rechtschreibung: "ss" statt "ß"
- Vokabular: Schweizer Begriffe

**Farbschema**:
- Primary: `#e94b7d` (Couple Pink)
- Secondary: `#6366f1` (Indigo)
- Accent: `#f59e0b` (Amber)

## 📂 Projektstruktur

```
relos-pwa/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout + PWA config
│   │   ├── page.tsx           # Main page mit Tab-Navigation
│   │   ├── globals.css        # Global styles + PWA-Styles
│   │   └── api/
│   │       └── ai/
│   │           ├── translate/  # GFK Conversion
│   │           └── date-ideas/ # Date Generator
│   ├── components/
│   │   ├── BottomNav.tsx      # Mobile Navigation
│   │   ├── Dashboard.tsx      # Energy & Tasks
│   │   ├── Calendar.tsx       # Events & Autonomy
│   │   ├── Rephrase.tsx        # NVC Translator
│   │   └── Connection.tsx     # Date Ideas & Bucket List
│   └── lib/
│       ├── types.ts           # Type definitions
│       ├── dataManager.ts     # Data access layer
│       └── CoupleContext.tsx  # React Context
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icon-*.png             # App icons
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── .env.example
└── README.md
```

## 🧪 Testing

### Manuelles Testing
1. `npm run dev`
2. Öffne http://localhost:3000
3. Alle Screens durchklicken
4. Test mit OpenAI API (wenn OPENAI_API_KEY gesetzt)

### API Testing
```bash
# Translate endpoint
curl -X POST http://localhost:3000/api/ai/translate \
  -H "Content-Type: application/json" \
  -d '{"originalMessage": "Das macht mich wütend!", "coupleId": "test"}'

# Date ideas endpoint
curl -X POST http://localhost:3000/api/ai/date-ideas \
  -H "Content-Type: application/json" \
  -d '{"budget": "budget", "setting": "zuhause", "energyLevel": "couch-modus"}'
```

## 🚀 Deployment

### Vercel (empfohlen)
```bash
# 1. Push zu GitHub
git push

# 2. Vercel verknüpfen
vercel link

# 3. Env-Variablen setzen in Vercel Dashboard
OPENAI_API_KEY=...

# 4. Deploy
vercel deploy
```

### Andere Optionen
- **Netlify**: `netlify deploy`
- **Docker/Railway**: Siehe oben
- **Self-Hosted**: `npm run build && npm run start`

## 📋 Roadmap

- [ ] Real-time Partner Sync (WebSocket)
- [ ] Supabase Integration mit Auth
- [ ] Service Worker für Offline-Funktionalität
- [ ] Photo/Link Support für Bucket List
- [ ] Chat-Historie zwischen Partners
- [ ] Shared Notes & Journals
- [ ] Analytics Dashboard

## 🤝 Beitragen

Feedback & Improvements willkommen! Bitte:
1. Fork das Projekt
2. Feature Branch erstellen (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push zu Branch (`git push origin feature/amazing`)
5. Pull Request öffnen

## 📞 Support

- **Issues**: GitHub Issues
- **Email**: support@relos-app.ch
- **Feedback**: Feedback-Form in der App

## 📄 Lizenz

MIT License - Siehe LICENSE.md

## 🙏 Danksagungen

- Gewaltfreie Kommunikation (GFK) Prinzipien nach Marshall Rosenberg
- Inspired von Best-Practices in Couples' Apps
- Built with ❤️ für Paare

---

**RelOS** - *Ein Betriebssystem für Paare, die wirklich verbunden sein möchten.*
