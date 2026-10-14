# Referenzmaße – Basilica di Santa Croce (V3 D3, Wahrzeichen-Welle 3)

Projekt-ID `santa_croce`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells (`tools/spec/frame.js`). Stand 14.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w777563049** „Basilica di Santa Croce“ (`building=basilica`), **20.762 Zellen = 5.190 m²**, 26 `building:part` | `data/stadt/gebaeude.json` |
| Campanile | Way **w662908308** (`man_made=tower`, `tower:type=bell_tower`, **`height=78`**), 141 Zellen (12 × 12 Blöcke) | `gebaeude.json` |
| Cappella de' Pazzi | Way w307539790, 1.625 Zellen – **nicht Teil dieses Projekts** (bleibt vorerst im Quartier Tintori) | `gebaeude.json` |
| **Rahmen `SC`** | Ursprung (**873,25 \| 975**) = Mitte der Fassadenlinie (Außenkante des alten Backsteinfronts), **θ = 28,4°**; **u** entlang der Kirchenachse nach Ostsüdost (Chor), **w** quer, **w < 0 Norden** (Piazza-Seite links beim Eintreten), w > 0 Süden (Kreuzgänge) | gefittet an den Langseiten (892,5 \| 939,5) → (1051 \| 1025): 28,3°; (854 \| 1010,5) → (1012,5 \| 1096,5): 28,5° |
| Gelände | `groundTopY` im Footprint 60–65 (60: 954, 61: 1.484, 62: 4.953, **63: 6.793**, 64: 6.237, 65: 341); Piazza vor der Fassade 64 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **64** (Bodenplatte Y 64, Stehhöhe Y 65, bündig mit der Piazza vor der Fassade); 341 Zellen mit Gelände 65 werden abgetragen (eigener `spec/ground.js`) | Entwurf, B |

### Polygon im Rahmen `SC` (gemessen, u \| w in Blöcken)
- **Langhaus** u 0..180,1 × w −40,6..40,4 (**90 × 40,5 m**); Langseiten gerade (Abweichung ≤ 0,4).
- **Marmorfassade** u −5,5..0 (vorgesetzt, 2,75 m), w −41,3..42,6, mit Vor- und Rücksprüngen der Pfeiler bei w ±17, ±22, ±36.
- **Querhaus** u 180,1..222,9: Nordarm bis w −60,5 (u 180..200) bzw. −76,8 (u 200..222), Südarm bis w 61,5.
- **Ostkapellen** u 208,7..222,9 (OSM-Teile w777563041 Süd w 20,7..61,5, w777563044 Nord w −55,1..−6,8).
- **Hauptchor (Cappella maggiore)** u 208,7..237,1 × w −6,8..20,9, Polygonschluss (halbes Achteck, Punkte bei u 222,8..237,1).
- **Campanile** u 221,8..233,9 × w 44,9..56,8 (südöstlich, am Südarm des Querhauses).

## 2. Maße (Literatur gegen OSM)

| Maß | OSM / Modell | Literatur | Bewertung |
|---|---|---|---|
| Gesamtlänge | Fassade bis Chorschluss u −5,5..237,1 = **242,6 Blöcke = 121,3 m** außen; Innenmaß ≈ 115 m | **115,43 m** × **38,23 m** ([it.wikipedia](https://it.wikipedia.org/wiki/Basilica_di_Santa_Croce_(Firenze))); „115 m“ ([en.wikipedia](https://en.wikipedia.org/wiki/Santa_Croce,_Florence)) | Innenmaß passt (Mauerstärken 3 Blöcke + Fassade). Stufe A. |
| Breite Langhaus | außen 81 Blöcke = 40,5 m, innen 75 Blöcke = **37,5 m** | **38,23 m** | −1,9 %, in Toleranz. Stufe A. |
| Querhaus | w −76,8..61,5 = 138,3 Blöcke = **69,2 m** außen ohne Kapellenvorsprünge | **73,74 m** (it.wikipedia) | −6 %: OSM gewinnt (Polygon), die Literaturzahl schließt vermutlich die Endkapellen ein. Stufe B. |
| **Mittelschiff** | Breite innen w −20..20 = **40 Blöcke = 20 m**; OSM-Teil w777563038 außen −22,4..23,4 (23 m) | „**alta 34 metri, larga 20 metri**“ ([Opera di Santa Croce](https://www.santacroceopera.it/luoghi/basilica/)) | Breite exakt bestätigt. **Höhe 34 m = 68 Lagen** bis unter den First (offener Dachstuhl). OSM `height=30` ist zu niedrig. Stufe A. |
| Joche | **7** Langhausjoche zu **25,7 Blöcken = 12,9 m** (Grenzen u 0 / 25,5 / 52,0 / 78,4 / 103,5 / 129,9 / 154,9 / 180,1, aus den 14 Querdach-Teilen der Seitenschiffe) | „il transetto è preceduto da sette campate“ (Suchzusammenfassung, mehrere Reiseseiten) | Stufe A (OSM-Teile und Text übereinstimmend). |
| Pfeiler | achteckig, auf den Jochgrenzen in den Linien w ±21,5 | „due file di pilastri ottagonali“, „archi a sesto acuto“ (it.wikipedia, Opera) | Stufe A. Querschnitt 5 × 5 Blöcke (2,5 m, C). |
| Ballatoio | Laufgang auf Konsolen über den Arkaden, beidseitig | „un ballatoio su beccatelli scorre lungo le navate“ (Suchzusammenfassung) | Stufe A (Existenz), Höhe C. |
| Dach | offener Dachstuhl über Mittelschiff, bemalte Balkendecke | „wooden trusses rather than vaulting“, Querhaus 1314 mit bemalten Balken ([Opera, en](https://www.santacroceopera.it/en/places/basilica/)) | Stufe A. |
| Seitenschiffdächer | 14 Querdächer (je Joch ein Giebel nach außen), `roof:orientation=across` | OSM `height=14`, `roof:height=3`; „sequence of pointed pediments … along the sides“ (Opera, en) | Form A. Höhen C (siehe §3). |
| Fassade | Mittelteil w −16,5..18,7 `height=38`, `roof:height=11`; Seitenteile `height=21,7`; Fialen 22,4 / 30,5 / 35; Mittelfiale **42,5** | neugotisch, Niccolò Matas **1853–1863**, Marmor weiß (Carrara), grün (Prato), rosa (Siena) (it.wikipedia, famous-historic-buildings) | Stufe B (OSM-Höhen). |
| Campanile | 12 × 12 Blöcke, **78 m = 156 Lagen** (OSM) | **78,45 m** (it.wikipedia), Gaetano Baccani **1842–1845/47** | Stufe A. |
| Kapellen | 11 an der Ostwand (5 + Hauptchor + 5) und Endkapellen der Querarme | „ne allinea ben undici“ (it.wikipedia); fünf je Seite des Chors (Opera) | Stufe A. |
| Altäre | 6 je Seitenschiff | „12 altari in pietra serena (6 lungo ogni navata laterale)“ (Suchzusammenfassung) | Stufe B. |
| Kanzel | an einem Pfeiler des südlichen Seitenschiffs (dritter Pfeiler) | Benedetto da Maiano 1481–87 (famous-historic-buildings) | Stufe B. |

## 3. Entwurfswerte ohne Beleg (Stufe C, Proportion nach Fotos)
- Arkaden: Kämpfer Lage 24 (12 m), Bogenscheitel Lage 39 (19,5 m), lichte Weite zwischen den Pfeilern ≈ 20 Blöcke.
- Ballatoio: Lage 41 (20,5 m), 1 Block Auskragung ins Mittelschiff.
- Obergaden: Lanzettfenster je Joch und Seite Lage 46..60; Traufe Mittelschiff Lage 62 (31 m), Dachfläche bis First Lage 70 (35 m), Innenraum bis Lage 68 (34 m, belegt).
- Seitenschiffe: Außenwand-Traufe Lage 30 (15 m), Querdachgiebel bis Lage 42 (21 m); OSM nennt 14 m (Pauschalwert, mit 34 m Mittelschiff und hohen Arkaden unvereinbar). **Offene Frage 1.**
- Querhaus: Traufe Lage 56, First Lage 66; Ostkapellen Traufe Lage 30; Hauptchor Traufe Lage 56.
- Mauerstärken: Außenwände 3 Blöcke (1,5 m), Obergaden 3 Blöcke, Kapellentrennwände 2 Blöcke.
- Fassade: Mittelgiebel von Lage 64 bis 76 und Pfeilerfialen bis Lage 64/72 statt OSM 27 m/30,5 m/35 m, damit Giebel und Fialen das 34 m hohe Mittelschiffdach verdecken (mit OSM-Höhen ragte das Dach seitlich über den Giebel). Gesamthöhe des Giebels (38 m) und der Mittelfiale (42,5 m) wie OSM. **Offene Frage 2.**
