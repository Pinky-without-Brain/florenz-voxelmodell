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

## 🧩 Wiederverwendbares System für zukünftige Bauprojekte

Die gesamte Code-Basis wurde streng modular nach dem MVC-Muster aufgebaut und kann für beliebige zukünftige Minecraft-Bauprojekte (z. B. Kolosseum, Notre-Dame, Taj Mahal) wiederverwendet werden:

```text
webapp/
├── index.html                 # Universelles UI-Gerüst
├── css/
│   └── builder-style.css      # Wiederverwendbares Designsystem
└── js/
    ├── data/
    │   ├── block-types.js     # Universelle Minecraft-Block-Registrierung
    │   ├── project-florence.js # Projekt-Definition (Module, Titel, Metadaten)
    │   ├── module_0_steps.js  # Blockkoordinaten & Schritt-Beschreibungen Modul 0
    │   └── module_1_steps.js  # Blockkoordinaten & Schritt-Beschreibungen Modul 1
    ├── engine/
    │   ├── texture-generator.js # Offline-Texturgenerator für Minecraft-Blöcke
    │   ├── step-analyzer.js   # Mathematische Zähl- & Analyse-Engine
    │   └── voxel-renderer.js  # 3D WebGL / Three.js Voxel-Engine
    └── ui/
        └── app.js             # UI-Logik & Interaktions-Controller
```

### So fügst du ein neues Modul oder Projekt hinzu:
1. Erstelle eine neue Datei `js/data/module_X_steps.js`.
2. Definiere die Schritte mit Blockkoordinaten:
   ```javascript
   steps.push({
     stepNumber: 1,
     title: "Mein neuer Bauschritt",
     blocks: [
       { x: 0, y: 64, z: 0, type: "stone_bricks" },
       { x: 1, y: 64, z: 0, type: "smooth_quartz" }
     ],
     tip: "...",
     fact: "..."
   });
   ```
3. Registriere das Modul in `project-florence.js`.
4. Der `StepAnalyzer` berechnet automatisch und fehlerfrei alle Stücklisten, Bounding-Boxen und Multiplikatoren!
