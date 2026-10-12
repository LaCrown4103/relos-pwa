# 🚀 RelOS Quick Start Guide

**Ziel**: RelOS in 5 Minuten lokal laufen lassen

## Option 1: Mit npm (Empfohlen für Anfänger)

### 1. Projekt vorbereiten (1 min)

```bash
# Terminal öffnen im Projekt-Verzeichnis
cd relos-pwa

# Dependencies installieren
npm install
```

### 2. Environment setzen (1 min)

```bash
# .env.local Datei erstellen
cp .env.example .env.local

# Falls Sie OpenAI API haben (optional):
# .env.local öffnen und setzen:
# OPENAI_API_KEY=sk-your-key-here
# NEXT_PUBLIC_DEMO_MODE=false

# Ohne API Key funktioniert noch alles mit Demo-Daten!
```

### 3. Starten (1 min)

```bash
npm run dev
```

### 4. Browser öffnen (1 min)

```
http://localhost:3000
```

🎉 **Fertig!** RelOS läuft auf Ihrem Computer.

---

## Option 2: Mit Docker (Für Profis)

```bash
# Docker Desktop installieren von docker.com

# Bauen
docker build -t relos .

# Starten
docker run -p 3000:3000 relos

# http://localhost:3000 öffnen
```

---

## Option 3: Docker Compose (Mit Datenbank)

```bash
# Start
docker-compose up

# http://localhost:3000 öffnen
```

---

## 🧪 App testen

### Alle 4 Screens durchgehen:

**1️⃣ Dashboard**
- Energie-Schieber nach oben/unten ziehen
- Task hinzufügen
- Task abhaken

**2️⃣ Kalender**
- "Aktivität hinzufügen" klicken
- Verschiedene Event-Typen ausprobieren (Paar-Zeit, Me-Time, Verpflichtung)
- Miniatur-Kalender erkunden

**3️⃣ Rephrase (Vent & Translate)**
- Ungefilterte Frustration schreiben
- "In konstruktive Ich-Botschaft umwandeln" klicken
- AI-generierte Nachricht kopieren
- (Nur mit API Key)

**4️⃣ Verbindung**
- Date Night Generator (mit Filtern)
- Bucket List Traum hinzufügen
- Tägliche Gesprächsfrage lesen

---

## 🔧 Probleme beheben

### "Port 3000 ist bereits verwendet"

```bash
# Entweder Verzeichnis wechseln oder anderen Port nutzen:
npm run dev -- -p 3001
# Dann http://localhost:3001 öffnen
```

### "npm install schlägt fehl"

```bash
# Cache leeren
npm cache clean --force

# Neu installieren
rm -rf node_modules package-lock.json
npm install
```

### "http://localhost:3000 antwortet nicht"

```bash
# Server läuft noch nicht? Konsole checken für Fehler
# Terminal neu starten und `npm run dev` eingeben
```

---

## 📱 PWA testen

### iOS (Safari)

1. http://localhost:3000 in Safari öffnen
2. Share-Button > Zum Home-Bildschirm
3. Auf Home-Bildschirm tippen = wie native App!

### Android (Chrome)

1. http://localhost:3000 in Chrome öffnen
2. ⋮ Menü > App installieren
3. Wird auf Home-Bildschirm installiert

### Desktop

1. http://localhost:3000 öffnen
2. Adressleiste "Install" Button
3. App öffnet sich als separates Fenster

---

## 🤖 Mit echten AI Features testen

### OpenAI API Key holen

1. https://platform.openai.com/account/api-keys besuchen
2. Neuen Secret Key erstellen
3. In `.env.local` einfügen:

```bash
OPENAI_API_KEY=sk-proj-xxxx
NEXT_PUBLIC_DEMO_MODE=false
```

4. Server neustarten: `npm run dev`

### AI Features testen

**Rephrase Screen:**
- Schreiben: "Das macht mich so wütend, du höchst mir ja gar nicht zu!"
- Button klicken
- AI konvertiert zu gewaltfreier Kommunikation

**Date Night Generator:**
- Filtern: Budget + Ort + Energie
- 3 konkrete Date-Ideen erhalten
- Steps zum Umsetzen

---

## 📦 Vorbereitung für Production

Wenn Sie RelOS online nehmen wollen:

### 1. Build erstellen

```bash
npm run build
npm run start
```

Test unter http://localhost:3000

### 2. Auf Vercel deployen (kostenlos)

```bash
# Vercel CLI installieren
npm i -g vercel

# Deployen
vercel

# Env-Variablen im Vercel Dashboard setzen
# OPENAI_API_KEY=sk-...
```

**Live unter**: `https://relos-xxxx.vercel.app`

### 3. Oder auf Railway.app

Siehe DEPLOYMENT.md für vollständige Anleitung.

---

## 📚 Weitere Ressourcen

- **README.md**: Vollständige Dokumentation
- **DEPLOYMENT.md**: Deployment auf verschiedenen Plattformen
- **src/lib/types.ts**: Alle Datentypen
- **src/components/**: React-Komponenten

---

## 💡 Tipps

**Local Storage Daten leeren:**
```javascript
// In Browser Console eingeben:
localStorage.clear();
location.reload();
```

**TypeScript Fehler checken:**
```bash
npm run type-check
```

**Code formatieren:**
```bash
npm install -g prettier
prettier --write .
```

---

## 🎯 Nächste Schritte

✅ App lokal laufen  
↓  
✅ Alle Screens explorieren  
↓  
✅ Mit OpenAI API testen (optional)  
↓  
✅ Auf Vercel/Railway/Ihrem Server deployen  
↓  
✅ Mit Partner testen  
↓  
✅ Feedback sammeln & iterieren  

---

**Fragen?** Starten Sie den Server und erkunden Sie die App:

```bash
npm run dev
```

Viel Spass! 🚀❤️
