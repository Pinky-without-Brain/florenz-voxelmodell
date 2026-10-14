# 🏛️ Minecraft Kathedrale von Florenz: Santa Maria del Fiore
## *Das ultimative Meisterbauer-Handbuch*

Willkommen beim Bauprojekt **Santa Maria del Fiore (Il Duomo di Firenze)** in Minecraft!
Dieses Projekt vereint die Faszination eines der berühmtesten Bauwerke der Renaissance mit dem spielerischen, strukturierten und kindgerechten Aufbau einer detaillierten **Schritt-für-Schritt Bauanleitung**.

---

## 🌟 Projekt-Highlights
- **🌐 Interaktive 3D-Webapp:** Erlebe die Bauanleitung im Browser unter [`webapp/index.html`](webapp/index.html) mit 3D-Voxelansicht, isometrischer Kamera und Tastaturbedienung.
- **🧱 Maßstab 1:2:** Geplant für Minecraft 1.18+. 1 Block = 0,5 m in allen Achsen, Fußboden bei Y 64, Kreuz auf der Laterne bei Y 293, Westfassade bei X −216 und Ostapsis bei X +96. Alle Maße stehen in [`tools/spec/dimensions.js`](tools/spec/dimensions.js) und [`REFERENZMASSE.md`](00_Projektplan_und_Konzept/REFERENZMASSE.md).
- **⚙️ Modell aus Code:** Die Module entstehen aus Programmen unter `tools/` (`node tools/build.js`). Prüfregeln stellen sicher, dass nichts schwebt, nichts kollidiert und jede Zahl in der Doku stimmt. Details: [`tools/ARCHITEKTUR.md`](tools/ARCHITEKTUR.md).
- **📘 Generierte Bauanleitungen:** Jeder Bauschritt hat eine vollständige Teileliste ohne „ca.“. Die Dateien `BAUANLEITUNG_MODUL_N.md` und die Blockpalette werden bei jedem Build neu erzeugt.
- **🧩 Zehn Module:** Von der Krypta bis zum Kreuz, dazu Campanile und Baptisterium. Die aktuelle Statistik steht unten.
- **📜 Florenz- & Geschichtswissen:** Zu jedem Bauabschnitt gibt es Geschichten über Brunelleschi, Giotto, die Medici und Renaissance-Geheimnisse.

---

<!-- STATISTIK:START -->
**Statistik (generiert):** 908.560 Blöcke in 584 Bauschritten, 10 Module. Maßstab 1:2, 1 Block = 0,5 m.
Ausdehnung des Modells: X -347 bis 96, Y 56 bis 293, Z -96 bis 96.

| Modul | Titel | Blöcke | Schritte | Bauanleitung |
| ---: | :--- | ---: | ---: | :--- |
| 0 | Fundament & Böden | 46.807 | 28 | [BAUANLEITUNG_MODUL_0.md](02_Modul_0_Fundament_und_Gelaende/BAUANLEITUNG_MODUL_0.md) |
| 1 | Langhaus & Seitenschiffe | 176.049 | 110 | [BAUANLEITUNG_MODUL_1.md](03_Modul_1_Langhaus_und_Seitenschiffe/BAUANLEITUNG_MODUL_1.md) |
| 2 | Die Westfassade | 22.961 | 14 | [BAUANLEITUNG_MODUL_2.md](04_Modul_2_Westfassade/BAUANLEITUNG_MODUL_2.md) |
| 3 | Vierung & Tribunen | 348.730 | 224 | [BAUANLEITUNG_MODUL_3.md](05_Modul_3_Vierung_und_Tribunen/BAUANLEITUNG_MODUL_3.md) |
| 4 | Der Tambour | 55.400 | 36 | [BAUANLEITUNG_MODUL_4.md](06_Modul_4_Tambour/BAUANLEITUNG_MODUL_4.md) |
| 5 | Brunelleschis Doppelkuppel | 112.856 | 77 | [BAUANLEITUNG_MODUL_5.md](07_Modul_5_Brunelleschis_Kuppel/BAUANLEITUNG_MODUL_5.md) |
| 6 | Die Laterne | 7.429 | 5 | [BAUANLEITUNG_MODUL_6.md](08_Modul_6_Laterne_und_Kugel/BAUANLEITUNG_MODUL_6.md) |
| 7 | Campanile di Giotto | 69.447 | 43 | [BAUANLEITUNG_MODUL_7.md](09_Modul_7_Campanile_di_Giotto/BAUANLEITUNG_MODUL_7.md) |
| 8 | Baptisterium San Giovanni | 62.413 | 43 | [BAUANLEITUNG_MODUL_8.md](10_Modul_8_Baptisterium_San_Giovanni/BAUANLEITUNG_MODUL_8.md) |
| 9 | Innenraum & Krypta | 6.468 | 4 | [BAUANLEITUNG_MODUL_9.md](11_Modul_9_Innenraum_und_Krypta/BAUANLEITUNG_MODUL_9.md) |
| | **Summe** | **908.560** | **584** | |
<!-- STATISTIK:END -->

---

## 📂 Projektstruktur & Module

| Verzeichnis | Modul / Thema | Beschreibung |
| :--- | :--- | :--- |
| [`00_Projektplan_und_Konzept/`](00_Projektplan_und_Konzept/MASTERPLAN.md) | **Masterplan & Konzept** | Maßstab 1:2, Koordinaten, Referenzmaße, Bauteilkatalog & Neuaufbau-Plan |
| [`01_Materialien_und_Blockpalette/`](01_Materialien_und_Blockpalette/BLOCK_PALETTE.md) | **Block-Palette** | Alle Blocktypen mit Gesamtzahlen, gruppiert nach Rolle (generiert) |
| [`02_Modul_0_Fundament_und_Gelaende/`](02_Modul_0_Fundament_und_Gelaende/README.md) | **Modul 0: Fundament & Böden** | Krypta-Grube, Marmorböden und Grundriss des Domplatzes |
| [`03_Modul_1_Langhaus_und_Seitenschiffe/`](03_Modul_1_Langhaus_und_Seitenschiffe/README.md) | **Modul 1: Langhaus (Nave)** | Hauptschiff, Pfeilerarkaden, gotische Kreuzrippengewölbe & Obergaden |
| [`04_Modul_2_Westfassade/`](04_Modul_2_Westfassade/README.md) | **Modul 2: Die Westfassade** | 3 Portale, Rosenfenster, Mosaikgiebel, Fialen & Statuennischen |
| [`05_Modul_3_Vierung_und_Tribunen/`](05_Modul_3_Vierung_und_Tribunen/README.md) | **Modul 3: Vierung & Tribunen** | Drei monumentale Kleeblatt-Konchen mit je 5 Radialkapellen |
| [`06_Modul_4_Tambour/`](06_Modul_4_Tambour/README.md) | **Modul 4: Der Tambour** | Das monumentale 8-Eck mit den berühmten runden Ochsenaugen-Fenstern |
| [`07_Modul_5_Brunelleschis_Kuppel/`](07_Modul_5_Brunelleschis_Kuppel/README.md) | **Modul 5: Die Doppelkuppel** | Innenkuppel, Fischgrät-Mauerwerk, begehbare Treppen, Außenkuppel & 8 Marmorrippen |
| [`08_Modul_6_Laterne_und_Kugel/`](08_Modul_6_Laterne_und_Kugel/README.md) | **Modul 6: Die Laterne** | Weißer Marmortempel auf der Kuppel, Verrocchios Bronzekugel & Kreuz |
| [`09_Modul_7_Campanile_di_Giotto/`](09_Modul_7_Campanile_di_Giotto/README.md) | **Modul 7: Giottos Glockenturm** | 5 Stockwerke, gotische Zwillingsfenster, Flachdachterrasse & Glocken |
| [`10_Modul_8_Baptisterium_San_Giovanni/`](10_Modul_8_Baptisterium_San_Giovanni/README.md) | **Modul 8: Das Baptisterium** | Freistehendes Oktogon, Ghibertis weltberühmte "Paradiespforte" |
| [`11_Modul_9_Innenraum_und_Krypta/`](11_Modul_9_Innenraum_und_Krypta/README.md) | **Modul 9: Innenraum & Krypta** | Krypta Santa Reparata, Brunelleschis Grab, Chorschranke & Hochaltar |
| [`12_Historischer_Fuehrer_Florenz/`](12_Historischer_Fuehrer_Florenz/README.md) | **Florenz & Renaissance Kompendium** | Ausführliche Geschichten, Steckbriefe der Erbauer & Zeitleiste |
| [`13_Vorlagen_und_Hilfsmittel/`](13_Vorlagen_und_Hilfsmittel/BAUSCHRITT_TEMPLATES.md) | **Vorlagen & Schablonen** | Content-Format der Bauschritte (`content/steps_de`) & Form-Schablonen |

---

## 🚀 Wie du startest
1. Lies den **[Masterplan](00_Projektplan_und_Konzept/MASTERPLAN.md)** für alle technischen Grundlagen.
2. Sieh dir die **[Materialliste](01_Materialien_und_Blockpalette/BLOCK_PALETTE.md)** an, um deine Kisten im Spiel vorzubereiten.
3. Öffne **[Modul 0](02_Modul_0_Fundament_und_Gelaende/README.md)** und lege die ersten Grundriss-Steine!
