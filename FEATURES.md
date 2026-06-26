# Feature-Backlog — MyCheapMarketPlace

Eine Sammlung von ~100 geplanten Features, geordnet nach Kategorie.  
Status: `- [ ]` = offen · `- [x]` = implementiert

---

## 1. Kundenerlebnis & UX

- [ ] Produktbilder-Galerie mit Zoom / Lightbox
- [ ] 360°-Produktansicht (mehrere Bilder zum Drehen)
- [ ] Produktvergleich (bis zu 4 Artikel nebeneinander)
- [ ] Größentabelle / Maßhilfe-Modal
- [ ] AR-Vorschau ("In meinem Raum ansehen" via WebXR)
- [x] Dark Mode (System-Präferenz + manuell umschaltbar)
- [ ] Barrierefreiheits-Audit & Verbesserungen (WCAG 2.1 AA)
- [ ] Skeleton-Loading-Screens statt Spinner
- [ ] Infinite Scroll / Virtualisierte Produktlisten (react-virtual)
- [ ] Animierter Add-to-Cart (Fly-to-Cart-Animation)

---

## 2. Suche & Entdeckung

- [ ] Elasticsearch-Integration (Volltext + Fuzzy-Suche)
- [ ] Autovervollständigung mit Produktvorschau-Bildern
- [ ] Erweiterte Filter (Preis-Range, Marke, Bewertung, Farbe, Größe)
- [ ] Faceted Search (mehrere Filter kombinierbar)
- [x] "Ähnliche Produkte"-Empfehlungen (gleiche Kategorie)
- [ ] "Kunden kauften auch"-Sektion auf der Produktdetailseite
- [ ] Barcode-/QR-Scanner für mobile Produktsuche
- [ ] Bildsuche (Foto hochladen → ähnliche Produkte finden)
- [ ] Gespeicherter Suchverlauf pro Nutzer
- [x] Trending & Bestseller-Sektion auf der Startseite

---

## 3. Nutzer-Account

- [ ] Adressbuch (mehrere Liefer- und Rechnungsadressen verwalten)
- [x] Bestellhistorie mit Re-Order-Button
- [ ] Rückgabe-/Reklamationsantrag online stellen
- [ ] Treuepunkte-System (Punkte sammeln & einlösen)
- [ ] Referral-Programm (Freunde einladen, beide bekommen Rabatt)
- [ ] Nutzerprofil mit Avatar-Upload (S3 / Cloudinary)
- [ ] E-Mail-Präferenzen (Newsletter, Bewertungs-Reminder, etc.)
- [ ] Zwei-Faktor-Authentifizierung (TOTP via Authenticator-App)
- [ ] Social Login (Google OAuth, GitHub, Apple Sign-In)
- [ ] Account-Löschung mit vollständiger Datenlöschung (DSGVO Art. 17)

---

## 4. Warenkorb & Checkout

- [ ] Saved-for-Later (Artikel aus Warenkorb "für später" merken)
- [ ] Mehrstufiger Checkout mit Fortschrittsanzeige (Adresse → Versand → Zahlung)
- [ ] One-Click-Checkout für wiederkehrende Kunden (gespeicherte Zahlungsmethode)
- [ ] Lieferdatum-Auswahl per Kalender
- [ ] Click & Collect (Abholung im Laden wählen)
- [ ] Zusätzliche Zahlungsmethoden: PayPal, Klarna Ratenkauf, SEPA-Lastschrift
- [ ] Guthaben-/Wallet-System (Guthaben aufladen und beim Kauf verwenden)
- [ ] Geschenkverpackung-Option mit persönlicher Nachricht
- [ ] MwSt.-Aufschlüsselung im Checkout (Nettobetrag + MwSt. + Bruttobetrag)
- [x] Fortschrittsanzeige "Noch X € bis zum kostenlosen Versand"

---

## 5. Produkte & Inventar

- [ ] Produktvarianten-System (Farbe + Größe als Kombination mit eigenem Lagerbestand)
- [ ] Digitale Produkte (Download-Link per E-Mail nach Kauf)
- [ ] Abonnement-Produkte (monatliche / wöchentliche Lieferung)
- [ ] Produktbündelung (Pakete aus mehreren Produkten mit Rabatt)
- [x] Flash Sale / Zeitlich begrenzte Angebote mit Countdown-Timer
- [ ] Pre-Order (Vorbestellung für noch nicht verfügbare Produkte)
- [ ] Niedrig-Bestand-Badge ("Nur noch 3 verfügbar!")
- [ ] SKU- und Barcode-Verwaltung im Admin-Panel
- [ ] Massenimport / -export von Produkten via CSV
- [ ] Produktvideos (Upload oder YouTube/Vimeo-Embed)

---

## 6. Marketing & Wachstum

- [ ] E-Mail-Newsletter-Integration (Mailchimp oder Brevo/Sendinblue)
- [ ] Abandoned-Cart-E-Mails (automatisch nach 1 h, 24 h und 72 h)
- [ ] Web-Push-Notifications (Browser Push API für Angebote & Versandstatus)
- [ ] Coupon-Codes: Limit pro Nutzer, Mindestbestellwert, Ablaufdatum (Erweiterung)
- [ ] Sticky-Promo-Banner mit Countdown-Timer (Flash-Deals)
- [ ] Affiliate-Programm mit Tracking-Links und Provisionsabrechnung
- [ ] Google Shopping Feed (XML-Export für Google Merchant Center)
- [ ] Strukturierte Daten (JSON-LD Product Schema für bessere SEO)
- [ ] Automatische Sitemap-Generierung für alle Produkte und Kategorien
- [ ] A/B-Testing-Framework für Produktseiten und Call-to-Actions

---

## 7. Bewertungen & Community

- [ ] Bewertungsbilder (Foto-Upload beim Schreiben einer Bewertung)
- [ ] "Hilfreich"-Voting für Bewertungen (upvote / downvote)
- [ ] Verifizierter-Kauf-Badge auf Bewertungen
- [ ] Fragen & Antworten-Sektion pro Produkt (Kunden fragen, andere antworten)
- [ ] Moderations-Queue für neue Bewertungen im Admin-Panel
- [ ] Antwort des Verkäufers / Admins auf Kundenbewertungen
- [ ] Bewertungs-Reminder-E-Mail 7 Tage nach Lieferung
- [x] Bewertungsverteilung als Histogramm-Balken (1★ bis 5★)
- [ ] Missbrauchs-Meldung für unangemessene Bewertungen
- [ ] Bewertungen als CSV exportieren (für Analysen und Backups)

---

## 8. Admin & Operations

- [ ] Erweitertes Analytics-Dashboard: Conversion Rate, AOV, Warenkorbabbrüche
- [ ] Revenue-Chart mit Vergleichszeitraum (dieser Monat vs. letzter Monat)
- [x] Inventar-Alarm-Dashboard (Admin-Widget mit Produkten unter Lager-Schwellwert)
- [ ] Bestellexport als CSV und generierte PDF-Rechnung
- [ ] Retouren-Management-Workflow mit Statustracking (Angefragt → Genehmigt → Erstattet)
- [ ] Lieferanten-/Hersteller-Verwaltung im Admin
- [ ] Staffelpreise / Mengenrabatte (z. B. ab 10 Stück → 10 % Rabatt)
- [ ] DSGVO-Dashboard: Nutzerdaten-Export auf Anfrage (Art. 20)
- [ ] Audit-Log (wer hat welche Änderung wann vorgenommen)
- [ ] Feingranulare Rollen: ADMIN, EDITOR (nur Produkte), SUPPORT (nur Bestellungen lesen)

---

## 9. Technisch & Infrastruktur

- [ ] Redis-Cache für Produktlisten, Kategorien und Session-Daten
- [ ] Bildoptimierung via CDN (Cloudinary oder imgproxy + S3)
- [x] Rate-Limiting auf alle API-Endpunkte (express-rate-limit)
- [ ] Webhook-System (ausgehende Webhooks für externe Integrationen)
- [ ] GraphQL-Endpunkt als Alternative zur REST-API
- [ ] API-Versionierung (/api/v2) für abwärtskompatible Änderungen
- [ ] Error-Tracking & Monitoring (Sentry für Frontend und Backend)
- [ ] Background-Job-Queue (BullMQ + Redis) für E-Mails, Reports und Bildverarbeitung
- [ ] Produktionsreifes Docker-Compose-Setup mit Nginx als Reverse Proxy
- [ ] End-to-End-Tests mit Playwright (kritische Kaufpfade: Suche → Kauf → Bestätigung)

---

## 10. Internationalisierung & Skalierung

- [ ] i18n: Mehrsprachigkeit DE / EN / FR mit next-intl
- [x] Währungsanzeige mit Wechselkurs (EUR / USD / GBP Toggle in Navbar)
- [ ] Multi-Währungs-Checkout mit Stripe
- [ ] Länder-spezifische Versandkosten-Konfiguration im Admin
- [ ] Multi-Vendor-Marktplatz (externe Verkäufer können eigene Produkte anbieten)
- [ ] Vendor-Dashboard (Verkäufer sieht eigene Produkte, Bestellungen, Umsatz)
- [ ] Provisionsabrechnung für Vendors (konfigurierbarer % pro Verkauf)
- [ ] White-Label-Modus (eigene Domain und Logo für B2B-Kunden)
- [ ] EU-Steuerregelwerk (VAT OSS für B2C-Verkäufe ins EU-Ausland)
- [ ] Mehrsprachige Produktbeschreibungen (pro Sprache separater Text im Admin)
