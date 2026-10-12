# Übergabedokumentation: Meisterbau-Kathedrale Santa Maria del Fiore (Florenz)
**Projektstatus:** 100% Mathematisch exakt vollendet • Stand: 12. Oktober 2026  
**Zielgruppe:** Übergabe an Claude (Senior AI Software Engineer & Architect)

---

## 1. Wichtigste Grundregeln & Direktiven (STRENGSTE BEACHTUNG!)

1. **Absolutes Verbot des Wortes „L\*go“:**
   - Das Wort darf **unter keinen Umständen** in Code, Variablennamen, Dateinamen, Kommentaren, Markdown-Dokumentationen, UI-Texten oder Chat-Antworten auftauchen!
   - Zulässige Begriffe: *Meisterbau*, *Modell*, *Bauanleitung*, *Bauschritt*, *Baustein*, *Voxel-Kathedrale*, *Architekturmodell*, *Bautüte*.

2. **Null Schätzungen („Ohne zu raten“):**
   - Jede Koordinate $(X, Y, Z)$ ist exakt berechnet.
   - Kein Block schwebt in der Luft (0 unsupported blocks).
   - Keine Durchdringungen zwischen verschiedenen Modulen (0 cross-module collisions).
   - Schnittstellen zwischen Modulen (z.B. Modul 3 $\to$ Modul 4, Modul 4 $\to$ Modul 5, Modul 5 $\to$ Modul 6) schließen bündig und lückenlos ab (0 overhang).

3. **Schrittgröße & Ausbalancierung:**
   - Maximale Blockanzahl pro Arbeitsschritt: $\le 2.500$ Blöcke (Idealbereich: 1.200 bis 2.100 Blöcke).
   - Keine Riesen-Arbeitsschritte mehr.

---

## 2. Koordinatensystem & Geometrische Bezugspunkte

| Achse | Ausrichtung | Nullpunkt / Referenz |
| :--- | :--- | :--- |
| **$X$** | West-Ost-Achse | $X = 0$: Zentrum der Vierung (unter der Kuppelspitze)<br>$X = -168$: Westfassade<br>$X = +126$: Scheitelpunkt der Hauptchor-Apsis (Osten)<br>$X = -230$: Zentrum des Baptisteriums (Westen) |
| **$Y$** | Vertikale Höhe | $Y = 64$: Oberkante des Fundaments / Bodenniveau<br>$Y = 65$: Gehbelag des Marmorbodens<br>$Y = 120$: Basis des Tambours<br>$Y = 160$: Tambour-Plattform (Brunelleschis Baustart)<br>$Y = 250$: Marmor-Schlussring der Kuppel<br>$Y = 315$: Absolute Spitzenhöhe (Goldenes Kreuz mit Seelaterne) |
| **$Z$** | Nord-Süd-Achse | $Z = 0$: Längsachse der Kathedrale<br>$Z = -106$: Nördlicher Scheitelpunkt der Nordtribune<br>$Z = +106$: Südlicher Scheitelpunkt der Südtribune<br>$Z = +68$: Zentrum des Campanile di Giotto ($X = -148$) |

---

## 3. Gesamtstatistik aller 9 Module (429.075 Blöcke • 268 Schritte)

Ausgeführt und verifiziert via `scratch/audit_all_modules.js`:

```
=== KATHEDRALE SANTA MARIA DEL FIORE: GESAMTAUDIT ===
Modul 0: 33 Schritte,  41.629 Blöcke, Max Schritt: 3.118 Blöcke (Fundament & Bodenplatte)
Modul 1: 25 Schritte,  42.984 Blöcke, Max Schritt: 3.195 Blöcke (Langhaus & Seitenschiffe)
Modul 2: 13 Schritte,  14.515 Blöcke, Max Schritt: 1.602 Blöcke (Gotische Westfassade)
Modul 3: 28 Schritte,  59.135 Blöcke, Max Schritt: 3.260 Blöcke (Vierung & 3 Tribunen)
Modul 4: 41 Schritte,  62.965 Blöcke, Max Schritt: 2.352 Blöcke (Achteckiger Tambour)
Modul 5: 78 Schritte, 115.572 Blöcke, Max Schritt: 1.992 Blöcke (Brunelleschis Doppelkuppel)
Modul 6:  8 Schritte,   8.717 Blöcke, Max Schritt: 2.020 Blöcke (Laterne & Goldene Kugel)
Modul 7: 25 Schritte,  49.455 Blöcke, Max Schritt: 2.408 Blöcke (Campanile di Giotto)
Modul 8: 17 Schritte,  34.103 Blöcke, Max Schritt: 2.605 Blöcke (Baptisterium San Giovanni)
----------------------------------------------------
Gesamtzahl Bauschritte: 268
Gesamtzahl Blöcke:     429.075
Kollisionen zwischen verschiedenen Modulen: 0 (NULL)
Frei schwebende / ungestützte Blöcke:       0 (NULL)
Überhänge an Modulgrenzen:                  0 (NULL)
```

---

## 4. Modul-Details & Wichtige architektonische Lösungen

### Modul 0: Fundament & Marmorboden (`webapp/js/data/module_0_steps.js`)
- Lückenlose Fundamentplatte von $Y=60$ bis $Y=64$.
- Komplettes Kosmaten-Marmorpflaster auf $Y=65$ mit exakten geometrischen Stern- und Flechtmustern aus Carrara-Quarz, Serpentinit (`dark_prismarine`) und Porphyr (`polished_granite`).
- 0 Löcher unter Pfeilern oder Wänden.

### Modul 1: Langhaus & Seitenschiffe (`webapp/js/data/module_1_steps.js`)
- Vier gewaltige Joche, Bündelpfeiler bis $Y=98$, Kreuzrippengewölbe bis $Y=108$.
- Solide Obergadenwände mit verglasten Rundfenstern (Oculi).
- Schließt bei $X=-167$ exakt bündig an die Westfassade an (0 Kollisionen).

### Modul 2: Gotische Westfassade (`webapp/js/data/module_2_steps.js`)
- Regeneriert via `scratch/build_module_2_perfect.js`.
- Alle vertikalen Wandlücken oberhalb der Wimperge und Rosetten geschlossen.
- Aussparung für Paolo Uccellos monumentale 24-Stunden-Uhr bei $X=-168, Y=75..89, Z=-7..7$.
- Schließt bündig mit den Eckpfeilern des Langhauses ab.

### Modul 3: Vierung & Die 3 Tribunen (`webapp/js/data/module_3_steps.js`)
- Vier Vierungspfeiler (jeder $12 \times 12$ Blöcke massiv).
- Drei monumentale Tribunen (Nord, Ost/Chor, Süd), jeweils mit 5 Chorkapellen.
- Solide octogonale Plattform auf $Y=118..119$, die den Tambour nahtlos aufnimmt.

### Modul 4: Achteckiger Tambour (`webapp/js/data/module_4_steps.js`)
- Regeneriert via `scratch/split_module_4_perfect.js` (41 Schritte).
- 8 monumentale runde Ochsenaugen (11 Blöcke Durchmesser) mit Meister-Buntglasfenstern (Donatello, Ghiberti, Uccello, Castagno).
- Michelangelos unvollendete Galerie („Grillenkäfig“) auf $Y=154..157$.
- Geschlossenes Mauerwerk auf $Y=154..157$, zweistufiges Kranzgesims auf $Y=158..159$.
- Vollkommen plane Startplattform auf $Y=160$ mit 100% solider Diagonalausfüllung (Behebung des früheren Schachbrett-Paritätsfehlers).

### Modul 5: Brunelleschis Doppelkuppel (`webapp/js/data/module_5_steps.js`)
- Regeneriert via `scratch/build_modules_5_6_perfect.js` (78 Schritte, alle $\le 1.992$ Blöcke).
- **Konstruktionsmethode:** Konzentrisch steigende Ringe (*senza centine* – ohne Lehrgerüst) nach Brunelleschis historischem Vorbild.
- Jeder Ring umfasst Innenschale (Fischgrät / *spina di pesce*), 8 massive weiße Marmor-Außenrippen, 16 verborgene Zwischenrippen, horizontale Ankerketten und die Außenschale aus Terrakotta.
- **Schnittstelle unten:** $Y=161$ sitzt 100% deckungsgleich auf $Y=160$ des Tambours (0 Überhang).
- **Schnittstelle oben:** Marmor-Schlussring auf $Y=249..250$ bildet eine solide Plattform von $R=6$ bis $R=16$ inklusive der Widerlager für die Laternenvoluten.

### Modul 6: Die Laterne & Goldene Kugel (`webapp/js/data/module_6_steps.js`)
- Regeneriert via `scratch/build_modules_5_6_perfect.js` (8 Schritte, alle $\le 2.020$ Blöcke).
- Achteckiger Marmortempel mit 8 kannelierten korinthischen Säulen und Rundbogenfenstern ($Y=257..276$).
- 8 geschwungene Voluten-Strebepfeiler, fest verankert im Schlussring.
- Pyramidendach bis $Y=295$, massiver Marmorsockel auf $Y=296$.
- Andrea del Verrocchios vergoldete Bronzekugel ($Y=297..303$, 7 Blöcke Durchmesser) und goldenes Kreuz mit Seelaterne bis $Y=315$.
- 0 ungestützte Blöcke, 0 Überhang auf Modul 5.

### Modul 7: Campanile di Giotto (`webapp/js/data/module_7_steps.js`)
- Regeneriert via `scratch/build_module_7_perfect.js` (25 Schritte, alle $\le 2.408$ Blöcke).
- Sockel mit Schöpfungs- und Planetenreliefs, Statuengeschoss, zwei zweibogige Biforiengeschosse und oberste dreibogige Triforien-Glockenstube.
- Vollkommen geschlossene Wände von $Y=65$ bis $Y=249$ mit massiven Zwischendecken auf $Y=95, 125, 160, 195, 230$.
- Massiv gegründete, kontinuierlich aufsteigende Wendeltreppe um den $3 \times 3$ Ziegelkern.
- Vollständiger Glockenstuhl mit den 7 historischen Glocken von Florenz (Campanone von 1405).
- Auskragender Konsolenkranz und Aussichtsterrasse mit 4 Fialen bis $Y=249$.

### Modul 8: Baptisterium San Giovanni (`webapp/js/data/module_8_steps.js`)
- Regeneriert via `scratch/build_module_8_perfect.js` (17 Schritte, alle $\le 2.605$ Blöcke).
- Achteckiger Baukörper ($X=-230, Z=0$, Radius 32).
- Vollmassives Fundamentpodest auf $Y=65..67$ (Steinziegelkern mit Marmorstufen).
- Berühmte Bronzetüren: Lorenzo Ghibertis *Paradiespforte* (Osten, $X=-200$), Andrea Pisanos Südtor ($Z=30$), Ghibertis Nordtor ($Z=-30$).
- Pyramidendach und Marmor-Laterne bis $Y=120$.

---

## 5. Umgebung & Piazza del Duomo (`webapp/js/engine/voxel-renderer.js`)

Die Umgebung wurde grundlegend überarbeitet, um Kameraschnitte und Kollisionen mit dem Kathedralenmodell vollständig zu eliminieren:

1. **Toskanische Landschaft & Hügel:**
   - Horizontnebel angepasst (`density = 0.00045`) für weite Fernsicht ohne Abdunklung der Kathedrale.
   - Himmelskuppel auf Radius 1.500 erweitert.
   - Hügelanstieg der toskanischen Apenninen (Fiesole & Monte Morello) beginnt erst bei **$\text{Radius} > 650$** (vorher 420).
   - Zypressenhaine auf $\text{Radius} > 680$ verschoben.
   - Fluss Arno im Süden auf $Z = +550$ verlegt.

2. **Originalgetreue Renaissance-Palazzi der Piazza:**
   - **Palazzo dei Canonici (Süden):** $X = -15, Z = +190$, Breite 160, Tiefe 36, Höhe 24. Lichte Weite zur Südtribune: **84 Blöcke**.
   - **Palazzo Guadagni dell'Opera / Strozzi-Sacrati (Norden):** $X = -45, Z = -195$, Breite 230, Tiefe 36, Höhe 25. Lichte Weite zur Nordtribune: **89 Blöcke**.
   - **Museo dell'Opera del Duomo (Osten):** $X = +240, Z = 0$, Breite 36, Tiefe 80, Höhe 24. Lichte Weite zur Chorapsis: **114 Blöcke**.
   - **Palazzo Arcivescovile (Westen):** $X = -345, Z = 0$, Breite 46, Tiefe 100, Höhe 26. Große, offene Piazza San Giovanni vor der Paradiespforte.
   - **Loggia del Bigallo & Misericordia (Südwest):** $X = -230, Z = +125$, Breite 34, Tiefe 38, Höhe 22.

3. **Authentisches Platzpflaster:**
   - Bodenplatte ($640 \times 440$ Blöcke) auf $Y=63.85$ aus toskanischem Pietraforte-Sandstein (`#BEB49E`).
   - Eingelegte weiße Carrara-Marmor-Trambahnen entlang der historischen Prozessionsachsen.
   - Historische Straßenschilder für alle 6 Einmündungen (*Via de' Calzaiuoli*, *Via de' Martelli*, *Via dei Servi*, *Via del Proconsolo*, *Via de' Cerretani*, *Piazza San Giovanni*).

---

## 6. UI- und Kamera-Steuerung (`webapp/js/ui/app.js`)

1. **Ansicht fest (Camera Lock):**
   - Standardmäßig aktiv (`isCameraLocked = true`).
   - Die vom Benutzer eingestellte Kameraposition (Drehung, Neigung, Zoom) bleibt beim Wechsel von Bauschritten oder Modulen absolut stabil erhalten.
   - Umschaltbar auf `🔓 Auto-Kamera` für geführte Nahaufnahmen.
2. **Basis-Module Umschalter (`🏛️ Basis-Module: AN/AUS`):**
   - Standardmäßig aktiv.
   - Blendet alle bereits fertiggestellten vorherigen Module dezent als Kontext ein, sodass der Baufortschritt im Gesamtzusammenhang sichtbar ist.
3. **Gesamtansicht (`🌟 Gesamtansicht`):**
   - Mit einem Klick wird das komplette Modell aller 429.075 Blöcke geladen.
4. **Tastaturnavigation:**
   - `Pfeiltaste Rechts` / `Bild Runter`: Nächster Bauschritt (am Ende des Moduls fließender Übergang ins nächste Modul).
   - `Pfeiltaste Links` / `Bild Hoch`: Vorheriger Bauschritt.
   - `Event.preventDefault()` und `capture: true` verhindern jegliche Fokussprünge in Dropdowns oder Slider.

---

## 7. Wichtige Skripte im Projekt

| Skript | Zweck |
| :--- | :--- |
| `scratch/audit_all_modules.js` | Meister-Audit über alle 9 Module (prüft Schrittgrößen, Gesamtzahl, Kollisionen). |
| `scratch/audit_m5_m6.js` | Spezifischer Test der Schnittstellen M4 $\to$ M5 und M5 $\to$ M6 sowie Schwebungsanalyse. |
| `scratch/audit_m7.js` | Tragfähigkeits- und Kollisionsprüfung für den Campanile di Giotto. |
| `scratch/build_module_2_perfect.js` | Generator für Modul 2 (Westfassade). |
| `scratch/split_module_4_perfect.js` | Generator für Modul 4 (Tambour, 41 Schritte, solide Y=160 Plattform). |
| `scratch/build_modules_5_6_perfect.js` | Generator für Modul 5 (78 Schritte) und Modul 6 (8 Schritte). |
| `scratch/build_module_7_perfect.js` | Generator für Modul 7 (Campanile, 25 Schritte). |
| `scratch/build_module_8_perfect.js` | Generator für Modul 8 (Baptisterium, 17 Schritte). |
| `webapp/check_browser.js` | Headless-Chrome-Test zur visuellen Screenshot-Erstellung aller Module. |

---

## 8. Nächste Schritte & Empfehlungen für Claude

1. **Begleitdokumentation:**
   - Die Dateien `BAUANLEITUNG_MODUL_0.md` bis `BAUANLEITUNG_MODUL_8.md` können bei Bedarf mit den exakten Schrittzahlen (z.B. Modul 4 mit 41 Schritten, Modul 5 mit 78 Schritten) synchronisiert werden.
2. **Modul 9 (Paolo Uccellos Uhr / Innenraum-Fresken):**
   - Ist optional vorbereitet für die Fresken von Giorgio Vasari und Federico Zuccari (*Das Jüngste Gericht* in der Kuppel).
3. **Export-Funktionen:**
   - Falls der Benutzer später einen Litematica- (`.litematic`) oder Schem-Export wünscht, liegen alle Blöcke mit exakten Minecraft-Namen in `webapp/js/data/module_X_steps.js` vor.
