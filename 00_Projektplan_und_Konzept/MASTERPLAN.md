# 📜 Masterplan & Projektkonzeption
## Santa Maria del Fiore in Minecraft – Die ultimative Meisterbauer-Bauanleitung

---

## 1. 🎯 Projektvision & Leitbild

Die Kathedrale **Santa Maria del Fiore** in Florenz ist eines der größten architektonischen Wunder der Menschheit. Ihr Bau dauerte über 140 Jahre, und ihre riesige freitragende Kuppel galt damals als schlichtweg unmöglich zu bauen.

**Unser Ziel:**  
Wir erstellen die vollständigste, detaillierteste und am besten verständliche Minecraft-Bauanleitung für diesen Renaissance-Koloss. Die Anleitung wird im didaktischen Stil einer **Schritt-für-Schritt Meisterbauer-Bauanleitung** verfasst:
1. **Kindgerecht & didaktisch klar:** Jeder Bauschritt ist kleinteilig, visuell nachvollziehbar und motivierend aufgebaut.
2. **Volle Minecraft-Bauhöhe:** Wir nutzen den gesamten vertikalen Raum der modernen Minecraft-Welt (1.18+ bis 320 Blöcke) maximal aus.
3. **100 % Modulares Bausystem:** Das Bauwerk wird in logische, handhabbare Teilbereiche zerlegt, die wie nummerierte Bautüten nacheinander zusammengesetzt werden.
4. **Lebendiges Florenz- & Geschichtswissen:** Zu jedem Bauschritt erfahren die Baumeister spannende, echte Geschichten über die Erfinder, Streitigkeiten, Baumaschinen und das Leben im Florenz der Renaissance.

---

> **V2 (Oktober 2026):** Das Modell wurde komplett neu aufgebaut. Es entsteht jetzt aus Code (`tools/`) statt aus handgeschriebenen Blocklisten, im Maßstab 1:2 (1 Block = 0,5 m). Maßgeblich sind [`NEUAUFBAU_PLAN.md`](NEUAUFBAU_PLAN.md) (Vorgehen), [`REFERENZMASSE.md`](REFERENZMASSE.md) (Maße und Quellen), [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md) (Bauteile je Modul), [`MASSZEICHNUNG.svg`](MASSZEICHNUNG.svg) (Maßzeichnung) und [`tools/ARCHITEKTUR.md`](../tools/ARCHITEKTUR.md) (Pipeline und Prüfregeln). Die Bauanleitungen der Module, die Stücklisten und die Blockpalette werden bei jedem Build aus dem Modell erzeugt; Zahlen in diesen Dateien sind deshalb immer aktuell.

---

## 2. 📐 Maßstab & Technische Minecraft-Spezifikationen

### 2.1. Der gewählte Maßstab (1 : 2)
In Minecraft entspricht 1 Block nominell 1 Meter. Ein 1:1-Nachbau der Kathedrale (Höhe 114,5 m) wäre nur rund 115 Blöcke hoch, und filigrane gotische Ornamente, die Doppelschale der Kuppel und die schmalen Treppengänge gingen verloren.

Wir bauen deshalb im **Maßstab 1:2**: **1 Block = 0,5 m**, in allen drei Achsen. Höhen rechnest du mit Y = 64 + 2·h[m] um, Grundrissmaße mit Blöcke = 2·m. Der Fußboden liegt bei Y 64, das Kreuz auf der Laterne endet bei Y 293 und bleibt damit unter dem Baulimit von Y 319. Alle Maße stehen in [`tools/spec/dimensions.js`](../tools/spec/dimensions.js), ihre Herkunft in [`REFERENZMASSE.md`](REFERENZMASSE.md).

| Bauteil | Reale Maße (Florenz) | Minecraft-Maße (Blöcke) | Erläuterung & Besonderheit |
| :--- | :--- | :--- | :--- |
| **Gesamthöhe (Boden bis Kreuz)** | **114,5 Meter** | **229 Blöcke** (Y 64 bis Y 293) | Das Kreuz liegt 26 Blöcke unter der Bauhöhengrenze (Y 319) |
| **Gesamtlänge** | ca. 156 Meter | 313 Blöcke (X −216 bis +96) | Von der Außenfläche der Westfassade bis zum Scheitel der Ostapsis |
| **Breite über die Tribunen** | ca. 96 Meter | 193 Blöcke (Z −96 bis +96) | Von der Nordtribune bis zur Südtribune |
| **Breite des Langhauses (außen)** | ca. 44,5 Meter | 89 Blöcke (Z −44 bis +44) | Drei Schiffe, innen 38 m breit |
| **Außenmaß Tambour** | ca. 54 Meter | Halbmaß 54 über die Flächen | Monumentales Achteck; bietet Platz für zwei getrennte Kuppelschalen |
| **Innenmaß der Vierung und Kuppel** | 45 Meter | Halbmaß 45 über die Flächen | Freitragender Innenraum für das Kuppelfresko |
| **Höhe Giottos Campanile** | 84,7 Meter | Oberkante Y 233 | Grundfläche Halbmaß 14 (29 × 29 Blöcke) bei (−200, 65) |
| **Baptisterium San Giovanni** | ca. 33 Meter Außenmaß, 37 Meter Höhe | Halbmaß 33 über die Flächen, Oberkante Y 138 | Freistehendes Oktogon bei (−307, 0) vor der Fassade |

### 2.2. Welteinstellungen & Koordinatensystem
- **Empfohlener Spielmodus:** Kreativmodus (Creative) zum Vorbauen; im Überlebensmodus (Survival) als Mega-Gemeinschaftsprojekt mit Gerüsten.
- **Welt-Typ:** 
  - *Flachwelt (Superflat):* Grundebene kann auf Y=64 gelegt werden, sodass Y=64 bis Y=319 = 256 Blöcke freier Luftraum nach oben bleiben.
  - *Normale Welt:* Ein flaches Areal (z. B. Ebene/Plains) auf Meereshöhe Y=63/64 eingeebnet.
- **Nullpunkt & Orientierung (Kompass):**
  - **Westen (-X):** Westfassade (Haupteingang) & Campanile & Baptisterium
  - **Osten (+X):** Chortribune & Hauptaltar (traditionelle christliche Ostung)
  - **Norden (-Z):** Nordtribune (Tribuna di San Zanobi)
  - **Süden (+Z):** Südtribune & Campanile (rechts neben der Fassade)
  - **Zentrum (0, Y=64, 0):** Mittelpunkt der Vierung direkt unter dem Scheitel der Kuppel.

---

## 3. 🧩 Das modulare Bausystem (Die 10 Bauphasen)

Das Projekt ist in **10 abgeschlossene Baumodule** gegliedert. Jedes Modul funktioniert wie eine in sich geschlossene Bauphase:

```
                      [ MODUL 6: Laterne & Goldene Kugel ]
                                      |
                      [ MODUL 5: Brunelleschis Doppelkuppel ]
                                      |
                      [ MODUL 4: Achteckiger Tambour ]
                                      |
      [ MODUL 1: Langhaus ] --- [ MODUL 3: Vierung & Tribunen ]
              |                               |
    [ MODUL 2: Westfassade ]                  |
              |                               |
  ====================== [ MODUL 0: Fundament & Raster ] ======================
              |                                                |
    [ MODUL 7: Campanile ]                          [ MODUL 8: Baptisterium ]
```

### Modul-Übersicht:
1. **Modul 0: Fundament, Vermessung & Bodenplatte**
   - Bauplatzplanung, Abstecken der Achsen, Grundrissmuster im toskanischen Marmorstil.
2. **Modul 1: Das Langhaus & Seitenschiffe**
   - Pfeiler-Arkaden (je 4 gewaltige gotische Pfeilerpaare), Seitenschiffgewölbe, Obergaden, Satteldach.
3. **Modul 2: Die prächtige Westfassade**
   - Die weltberühmte dreifarbige Marmorfassade im neugotischen Stil von Emilio De Fabris mit Rosette und Portal-Giebeln.
4. **Modul 3: Vierung & Die drei monumentalen Tribunen**
   - Das Kleeblatt-Zentrum (Ost-, Nord- und Südtribune) mit insgesamt 15 Radialkapellen und Halbkuppeln.
5. **Modul 4: Der achteckige Tambour**
   - Die 24 Blöcke hohe achteckige Trommel (Y 149 bis 172) mit den charakteristischen kreisrunden Ochsenaugen-Fenstern (*Oculi*).
6. **Modul 5: Brunelleschis Doppelkuppel (Das Meisterwerk)**
   - Die innere Schale, das fischgrätartige Ziegelmauerwerk (*spina di pesce*), die hohlen Treppengänge und die äußere Schale mit 8 Hauptrippen aus weißem Marmor.
7. **Modul 6: Die Marmorlaterne & Verrocchios Bronzekugel**
   - Der weiße Marmortempel auf der Kuppelspitze, die begehbare Aussichtsgalerie, die vergoldete Kupferkugel und das Kreuz.
8. **Modul 7: Campanile di Giotto (Der freistehende Glockenturm)**
   - Gotischer Glockenturm bis Y 233 in 5 Geschossen mit maßgefertigten Biforien-Fenstern und Zinnenplattform.
9. **Modul 8: Baptisterium San Giovanni (Die Taufkirche)**
   - Das achteckige Bauwerk auf dem Domplatz mit Lorenzos Ghibertis berühmter goldener "Paradiespforte".
10. **Modul 9: Innenraum, Fresko & Krypta**
    - Das monumentale Kuppelfresko *Das Jüngste Gericht* von Vasari & Zuccari, der Hauptaltar, die Marmorböden und die unterirdische Krypta der Vorgängerkirche *Santa Reparata*.

---

## 4. 📖 Anatomie einer Bauanleitung (V2)

Die Bauanleitungen entstehen bei jedem Build aus dem Modell (`node tools/build.js`). Texte schreiben wir nur einmal je Bauteil in `content/steps_de/modul_N.json`; das Format steht in [`13_Vorlagen_und_Hilfsmittel/BAUSCHRITT_TEMPLATES.md`](../13_Vorlagen_und_Hilfsmittel/BAUSCHRITT_TEMPLATES.md). Jeder Schritt in `BAUANLEITUNG_MODUL_N.md` hat denselben Aufbau:

```markdown
### Schritt 1.7 – Titel des Schritts
- **Y-Bereich:** 68 bis 74
- **Blöcke:** 1.834
- **Bauteile:** `pfeiler`

**Teileliste**
| Block | Typ | Anzahl |
| :--- | :--- | ---: |
| Glatter Stein | `smooth_stone` | 1.200 |

**Beschreibung** … **Tipp** … **Achtung** … **Fakt** …
```

Die Teileliste ist vollständig und stimmt mit dem Modell überein (Prüfregel R9). Kein Schritt hat mehr als 2.500 Blöcke. Die interaktive 3D-Ansicht zeigt dieselben Schritte in der Webapp.

---

## 5. 🎨 Farb- & Materialkonzept (Toskana in Minecraft)

Florenz ist berühmt für seinen Dreiklang aus Natursteinen:
- **Weiß:** *Bianco di Carrara* (reinweißer Marmor aus Carrara)  
  ➡️ In Minecraft: **Glatter Quarz**, **Quarzblöcke**, **Calcit** und **Weißer Beton**.
- **Grün:** *Verde di Prato* (dunkelgrüner Serpentinit-Schiefer aus Prato)  
  ➡️ In Minecraft: **Dunkler Prismarin**, **Prismarin-Ziegel** und **Polierter Tiefenschiefer** für Kontraste.
- **Rot/Rosa:** *Rosso di Maremma* (rosaroter Kalkstein aus Monsummano)  
  ➡️ In Minecraft: **Roter Sandstein**, **Polierter Granit**, **Ziegelsteine** und **Mangrovenholz**.
- **Terrakotta-Rot:** Die Dachziegel der Kuppel  
  ➡️ In Minecraft: **Terrakotta**, **Orange Terrakotta** und **Ziegel**.

---

## 6. 📅 Umsetzungsstand

Alle zehn Module des V2-Modells sind gebaut und gegen die Regeln R1 bis R10 geprüft (siehe [`tools/ARCHITEKTUR.md`](../tools/ARCHITEKTUR.md)). Die Dokumentation wird seit Phase 6 generiert. Die Phasen und Arbeitspakete des Neuaufbaus stehen in [`NEUAUFBAU_PLAN.md`](NEUAUFBAU_PLAN.md); dort findest du auch den Stand der Webapp-Umstellung und der Abschlussprüfung.
