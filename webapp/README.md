# 🧱 Minecraft Meisterbauer-Bauanleitungs-Webapp
## *Interaktive 3D-Bauanleitungs-Engine für Minecraft-Monumente*

Diese Webapplikation verwandelt komplexe Minecraft-Bauprojekte in hochpräzise, kinderfreundliche und interaktive Bauanleitungen im Stil professioneller Architektur-Bauhefte.

---

## 🚀 Wie du die Webapp startest

### Option 1: Direkt im Browser (Keine Installation nötig!)
Mache einfach einen **Doppelklick** auf die Datei:
👉 [`webapp/index.html`](index.html)  
Die Webapp öffnet sich sofort in Google Chrome, Microsoft Edge, Firefox oder Safari.  
Dank prozeduraler Textur-Generierung funktioniert die App **vollständig offline** und ohne lokale Server-Einschränkungen!

### Option 2: Über einen lokalen Webserver (z. B. mit Node.js / Python)
Falls du die App über `http://localhost` betreiben möchtest:
```bash
# Mit Node.js npx serve:
npx serve webapp

# Oder mit Python:
python -m http.server 8000 --directory webapp
```
Öffne anschließend `http://localhost:8000` im Browser.

---

## 🌟 Features im Überblick

1. **📦 Exakte Teilebox:**
   - Zeigt oben links für jeden Schritt exakt an, welche Blöcke benötigt werden.
   - Mit Block-Icon, Multiplikator (`1x`, `12x`, `204x`) und deutschem Minecraft-Namen.
   - **100 % mathematisch exakt berechnet:** Keine Schätzungen, keine "ca."-Werte!

2. **🎮 Interaktive 3D-WebGL-Ansicht (Three.js):**
   - **Schritt-Hervorhebung:** Die Blöcke des *aktuellen* Bauschritts leuchten mit einer markanten Kontur hervor. Bereits gesetzte Blöcke werden harmonisch im Hintergrund gerendert.
   - **Kamerasteuerung:**
     - Linksklick + Ziehen: Modell frei drehen (Orbit)
     - Rechtsklick + Ziehen: Modell verschieben (Pan)
     - Mausrad: Stufenloses Zoomen
     - 📐 **Isometrisch-Modus:** Schaltet zwischen normaler Perspektive und echter Isometrie um!
     - 🎲 **Iso 45° / Draufsicht / Reset:** Schnelle Kamera-Winkel per Knopfdruck.

3. **📜 Schritt-für-Schritt-Navigation:**
   - Große Vor- und Zurück-Knöpfe (`◀ Zurück` / `Weiter ▶`).
   - **Tastatur-Hotkeys:** Mit den Pfeiltasten `⬅️` und `➡️` kannst du wie in einem digitalen Bauheft blättern!
   - Zeitleisten-Schieberegler mit Live-Statistik der bisher verbauten Blöcke.

4. **🏛️ Florenz-Wissen & Baumeister-Tipps:**
   - Zu jedem Schritt gibt es:
     - 💡 **Filippos Meister-Tipp** (clevere Baukniffe, Gerüste, Orientierung)
     - ⚠️ **Meisterbauer-Achtung** (Vermeidung von Baufehlern)
     - 🎨 **Wusstest du schon?** (Spannende historische Fakten über Brunelleschi, Giotto, Medici und die toskanischen Marmorbrüche)

5. **📋 Vollständige Stückliste (Bill of Materials):**
   - Per Klick auf **"Stückliste (BOM)"** öffnet sich eine exakte Tabelle aller Blöcke für das gewählte Modul.

---

## 📐 Maße des Modells (V2)

- **Maßstab:** 1 : 2 (1 Block = 0,5 m)
- **Höhe:** Y 64 bis Y 293 (Kreuz)
- **Länge:** Fassade X −216 bis Ostapsis X +96
- **Breite:** Z −96 bis +96
- Umgebung (Gebäude, Piazza, Straßenschilder) stammt aus `js/data/v2/site.js` (OpenStreetMap).

---

## 🧩 Aufbau und Datenfluss

Die Bauschritte werden nicht von Hand geschrieben, sondern von der Pipeline erzeugt:

```bash
node tools/build.js     # schreibt webapp/js/data/v2/module_N.js und site.js
```

```text
webapp/
├── index.html                 # UI-Gerüst, lädt nur V2-Daten
├── css/builder-style.css      # Designsystem
└── js/
    ├── data/
    │   ├── block-types.js     # Block-Registrierung (Farben, Namen)
    │   ├── v2/module_N.js     # GENERIERT: Schritte als Base64-Läufe je Modul
    │   ├── v2/site.js         # GENERIERT: Umgebungsgebäude, Piazza, Straßenschilder
    │   ├── v2-loader.js       # dekodiert die Läufe zu Blöcken, liefert Modul-Metadaten
    │   └── project-florence.js # Projekt-Definition (Titel/Icons aus den Metadaten)
    ├── engine/
    │   ├── texture-generator.js # Offline-Texturgenerator
    │   ├── step-analyzer.js   # Zähl- & Analyse-Engine
    │   └── voxel-renderer.js  # 3D WebGL / Three.js Voxel-Engine
    └── ui/app.js              # UI-Logik & Interaktions-Controller
```

Module, deren Daten noch fehlen (z. B. `module_6.js`), erscheinen im Modulmenü als „in Arbeit“ und sind deaktiviert.

### Darstellung und Leistung
- Verdeckte Blöcke (alle 6 Nachbarn belegt, keiner davon Glas) werden nicht gezeichnet. Die Blöcke des aktuellen Schritts werden immer vollständig gezeigt.
- Buntglas (`*_stained_glass`) wird halbtransparent dargestellt.
- Die Kamera-Voreinstellungen (Isometrisch, Iso 45°, Draufsicht, Reset) passen sich der Bounding Box aller geladenen Blöcke an.
- Beim Öffnen der Gesamtansicht schreibt die Konsole die Zeit und die Zahl gerenderter gegenüber allen Blöcken.
