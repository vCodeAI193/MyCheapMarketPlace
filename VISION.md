# MyCheapMarketPlace — Produktvision

> "Günstig. Schnell. Alles da."

---

## Was ist MyCheapMarketPlace?

MyCheapMarketPlace ist eine vollständige, deutschsprachige E-Commerce-Plattform, die Käufern und Administratoren ein modernes Online-Einkaufserlebnis bietet. Die Plattform richtet sich an preisbewusste Kunden, die ein breites Sortiment an Produkten verschiedenster Kategorien einfach und sicher kaufen möchten.

---

## Vision

**Kurzfristig:** Ein zuverlässiger, vollständig funktionsfähiger Online-Shop mit professioneller Nutzererfahrung, der ohne technisches Wissen verwaltet werden kann.

**Mittelfristig:** Die führende günstige Marktplatz-Plattform im deutschsprachigen Raum — mit personalisierten Empfehlungen, mehreren Verkäufern und mobiler App.

**Langfristig:** Ein skalierbares Multi-Vendor-Marketplace-Ökosystem, das kleinen Händlern ermöglicht, ihre Produkte digital zu verkaufen.

---

## Aktuelle Fähigkeiten (Ist-Zustand)

### Kundenseite

| Feature | Beschreibung |
|---|---|
| **Produktbrowsing** | Produktliste mit Filtern (Kategorie, Preis, Angebote), Sortierung, Pagination |
| **Suche** | Autocomplete-Suchleiste mit 300ms Debounce und Echtzeit-Vorschlägen |
| **Produktdetail** | Bilder-Galerie, Preis, Beschreibung, Lagerbestand, Bewertungen |
| **Flash Sales** | Rabattpreise mit Countdown-Timer und prozentualer Ersparnis-Badge |
| **Warenkorb** | Persistenter Warenkorb (localStorage + Zustand), Mengenanpassung |
| **Kasse** | Lieferadresse, Gutscheincode, Stripe-Zahlung |
| **Benutzerkonten** | Registrierung, Login, Passwort-Reset per E-Mail |
| **Bestellverfolgung** | Visuelle Timeline: Bestellt → Bezahlt → Versendet → Geliefert |
| **Wunschliste** | Produkte merken, direkt in den Warenkorb verschieben |
| **Bewertungen** | Sternbewertung (1–5) mit Kommentar, Durchschnittsanzeige |
| **Lagerbestand-Alarm** | E-Mail-Benachrichtigung wenn ausverkauftes Produkt wieder verfügbar |
| **Zuletzt angesehen** | Automatisches Tracking der zuletzt angesehenen Produkte |
| **Cookie-Banner** | DSGVO-konformes Einwilligungs-Banner |

### Admin-Seite

| Feature | Beschreibung |
|---|---|
| **Dashboard** | Kennzahlen: Produkte, Bestellungen, Kunden, Umsatz + Balkendiagramm (30 Tage) |
| **Produktverwaltung** | Erstellen, Bearbeiten, Deaktivieren mit Bild-Upload (bis 5 Bilder, max. 5 MB) |
| **Kategorienverwaltung** | Hierarchische Kategorien mit Eltern-Kind-Beziehung |
| **Bestellverwaltung** | Alle Bestellungen einsehen, Status ändern, CSV-Export (Excel-kompatibel) |
| **Nutzerverwaltung** | Rollen vergeben (USER/ADMIN), Konten sperren/entsperren |
| **Gutscheinverwaltung** | Prozent- und Festbetragsrabatte, Ablaufdaten, Nutzungslimits |

---

## Technische Architektur

```
┌──────────────────────────────────────────────────────────┐
│                        FRONTEND                          │
│              Next.js 14 (App Router, SSR/ISR)            │
│          Tailwind CSS · Zustand · TypeScript             │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API (JSON)
┌────────────────────────▼─────────────────────────────────┐
│                        BACKEND                           │
│              Node.js + Express (TypeScript)              │
│         JWT Auth · Zod Validation · Multer Uploads       │
│              Nodemailer · Stripe Webhooks                │
└────────────────────────┬─────────────────────────────────┘
                         │ Prisma ORM
┌────────────────────────▼─────────────────────────────────┐
│                      DATENBANK                           │
│                   PostgreSQL 16                          │
│  User · Product · Order · Cart · Review · Coupon · …    │
└──────────────────────────────────────────────────────────┘
                         │ Stripe API
┌────────────────────────▼─────────────────────────────────┐
│                    ZAHLUNGEN                             │
│                Stripe PaymentIntents                     │
│            Webhook-Signaturverifizierung                 │
└──────────────────────────────────────────────────────────┘
```

### Technologie-Stack

| Schicht | Technologie |
|---|---|
| Frontend-Framework | Next.js 14 (App Router) |
| UI-Styling | Tailwind CSS |
| State Management | Zustand (mit localStorage Persistenz) |
| Backend-Framework | Express.js |
| Datenbank | PostgreSQL 16 |
| ORM | Prisma |
| Authentifizierung | JWT (Access 15min + Refresh 7 Tage) |
| Zahlung | Stripe |
| E-Mail | Nodemailer (SMTP / Console-Fallback) |
| Validierung | Zod |
| Datei-Upload | Multer |
| Containerisierung | Docker Compose |

### Datenbankmodelle

```
User ──────────── Order ──────────── OrderItem ── Product
  │                  │                               │
  │               Coupon                         Category
  │                                               │
  ├── RefreshToken                           StockAlert
  ├── PasswordReset                          WishlistItem
  ├── Review ─────────────────────────────── (Product)
  ├── Cart ──── CartItem ─────────────────── (Product)
  └── WishlistItem ─────────────────────── (Product)
```

### Code-Qualität (Clean Code)

Die Codebasis folgt diesen Prinzipien:

- **Single Responsibility:** Geschäftslogik in dedizierte Utilities ausgelagert (`couponUtils.ts`, `constants.ts`)
- **DRY:** `AccountTabs`-Komponente, `ORDER_STATUS`-Map, `calculateCouponDiscount()` — keine Duplikate
- **Fehlerbehandlung:** `ApiError`-Klasse + globaler Express Error-Handler
- **Atomarität:** Bestellerstellung + Lagerdekremente in einer Prisma-Transaktion
- **Typsicherheit:** Durchgängig TypeScript, Zod-Validierung an API-Grenzen
- **Konstanten:** Magic Numbers in `lib/constants.ts` zentralisiert

---

## API-Übersicht

```
/api/auth          → Register, Login, Refresh, Logout, Reset-Password
/api/products      → CRUD + Autocomplete + Stock-Alerts
/api/categories    → Hierarchische Kategorien
/api/cart          → Warenkorb (Gäste + eingeloggt)
/api/orders        → Bestellungen + CSV-Export
/api/reviews       → Produktbewertungen
/api/wishlist      → Wunschliste
/api/coupons       → Gutscheincodes
/api/payments      → Stripe Webhook
/api/admin         → Stats, Users, Revenue-Chart
```

---

## Seiten-Struktur (Frontend)

```
/                          → Startseite (Hero, Kategorien, Featured Products)
/products                  → Produktliste mit Filtern
/products/[slug]           → Produktdetail + Bewertungen + Zuletzt angesehen
/checkout                  → Kasse mit Gutscheinfeld
/auth/login                → Anmeldung
/auth/register             → Registrierung
/auth/forgot-password      → Passwort vergessen
/auth/reset-password       → Passwort zurücksetzen
/account                   → Profil
/account/orders            → Bestellhistorie
/account/orders/[id]       → Bestelldetail + Timeline
/account/wishlist          → Wunschliste
/admin                     → Dashboard (Stats + Umsatz-Chart)
/admin/products            → Produktverwaltung
/admin/products/new        → Neues Produkt
/admin/categories          → Kategorieverwaltung
/admin/orders              → Bestellverwaltung
/admin/users               → Nutzerverwaltung
/admin/coupons             → Gutscheinverwaltung
```

---

## Nächste Ausbaustufen (Roadmap)

### Stufe 1 — Stabilität & Performance
- [ ] Unit- und Integrationstests (Jest, Playwright)
- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] Produktions-Deployment (Vercel + Railway / Render)
- [ ] Umgebungsvariablen-Dokumentation (`.env.example`)
- [ ] Logging (Pino / Winston) statt `console.log`
- [ ] Rate Limiting auf Auth-Endpunkten

### Stufe 2 — Nutzererfahrung
- [ ] Produktbilder-Zoom / Vollbild-Galerie
- [ ] Mehrsprachigkeit (i18n — Deutsch + Englisch)
- [ ] Progressive Web App (PWA) — offline-fähig
- [ ] E-Mail-Templates (HTML-Design, nicht nur Plain HTML)
- [ ] Bestellbestätigung als PDF-Anhang
- [ ] Push-Benachrichtigungen (Versandstatus)

### Stufe 3 — Personalisierung & KI
- [ ] Produktempfehlungen ("Das könnte dir gefallen")
- [ ] KI-gestützte Suchverbesserung (Synonyme, Tippfehler)
- [ ] Personalisierte Startseite (basierend auf Browserverlauf)
- [ ] A/B-Testing für Produktpräsentation

### Stufe 4 — Multi-Vendor-Plattform
- [ ] Verkäufer-Registrierung und Onboarding
- [ ] Verkäufer-Dashboard (eigene Produkte, Bestellungen, Einnahmen)
- [ ] Provision-Modell (Plattform % pro Verkauf)
- [ ] Produktbewertung von Verkäufern
- [ ] Auszahlungssystem (Stripe Connect)

### Stufe 5 — Skalierung
- [ ] Redis-Cache für Produktlisten
- [ ] Elasticsearch für erweiterte Suche
- [ ] CDN für Bilder (Cloudinary / AWS S3)
- [ ] Microservices-Architektur (Notifications, Payments separat)
- [ ] API-Versionierung (`/api/v1/`)

---

## Zielgruppen

| Gruppe | Bedürfnis | Wie die Plattform hilft |
|---|---|---|
| **Privatkäufer** | Günstige Produkte schnell finden | Filtersuche, Flash Sales, Autocomplete |
| **Stammkunden** | Wiederkauf ohne Reibung | Gespeicherte Adressen, Bestellhistorie, Wunschliste |
| **Schnäppchenjäger** | Beste Deals nicht verpassen | Flash Sales mit Timer, Lagerbestand-Alarm |
| **Shop-Betreiber** | Verkäufe und Kunden verwalten | Admin-Dashboard mit CSV-Export, Nutzerverwaltung |

---

## Stärken der aktuellen Plattform

1. **Vollständig** — Von Registrierung bis Bestellverfolgung ist jeder Schritt implementiert
2. **Sicher** — JWT-Rotation, bcrypt-Hashing, Stripe-Webhook-Signatur, DSGVO-Banner
3. **Erweiterbar** — Saubere Schichtenarchitektur, TypeScript durchgehend, Prisma-Migrationen
4. **Performant** — Server-Side Rendering mit ISR, Autocomplete mit Debounce
5. **Admin-ready** — Vollständiges Back-Office ohne externes CMS

---

*Erstellt aus der Codebasis am 21.06.2026*
