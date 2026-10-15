# Referenzmaße – Basilica di Santo Spirito (V3 D3, Wahrzeichen-Welle 3)

Projekt-ID `santo_spirito`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells (`tools/spec/frame.js`). Stand 15.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w24881563** „Basilica di Santa Maria del Santo Spirito“ (`building=church`), **15.873 Zellen** | `data/stadt/gebaeude.json` |
| Sakristei | Relation **r7101376** „Sagrestia di Santo Spirito“, 2.262 Zellen; ihr Umriss hat ein kleines Loch (Lichtschacht, ≈ 8 × 3 Blöcke) im Vorraum, das im Modell geschlossen wird | `gebaeude.json` |
| Campanile | Way **w482302683** (`man_made=tower`, `tower:type=bell_tower`), 335 Zellen; überlappt den Sakristei-Umriss, die Überlappung gehört zum Turm | `gebaeude.json` |
| **Rahmen `SS`** | Ursprung (**−1399,75 \| 1390,75**) auf der Fassadenlinie, **θ = −63,5°**; **u** von der Fassade (Süden, Piazza Santo Spirito) zum Chor, **w** quer, w < 0 Westen (Sakristei) | gefittet an den Langseiten |
| Gelände | `groundTopY` im Footprint 61–63 (61: 1.596, 62: 4.804, **63: 12.094** Zellen) | `tools/city/ground_stadt.js` |
| **`bodenY`** | **64** (Bodenplatte Y 64, Stehhöhe Y 65); `spec/ground.js` trägt das Gelände in den Masken bis Y 63 ab | Entwurf, B |

## 2. Maße (Literatur gegen OSM)

| Maß | OSM / Modell | Literatur | Bewertung |
|---|---|---|---|
| Länge | u −0,3..195,1 = **195 Blöcke = 97,6 m** außen | „L'interno misura **97 metri**“ ([it.wikipedia](https://it.wikipedia.org/wiki/Basilica_di_Santo_Spirito)) | +0,6 %; OSM gewinnt (Außenmaß). B |
| Breite Langhaus | w −31,8..29,9 = **61,7 Blöcke = 30,9 m** | „largo **32**“ (it.wikipedia) | −3,5 %, in Toleranz. B |
| Breite Querhaus | w −64,4..53,7 = **118 Blöcke = 59 m** | „**58** alla crociera“ (it.wikipedia) | +1,7 %. A |
| Modul | **M = 12,84 Blöcke = 6,42 m** | „modulo di **undici braccia fiorentine**“ (it.wikipedia); 1 Braccio = 0,5836 m | A |
| Schiffe | Hauptschiffe 2 M breit, Umgang 1 M rund um Langhaus, Querarme und Chor | „navata centrale doppia rispetto alle laterali“ (it.wikipedia) | A |
| Kapellen | Halbrunde Nischen in der Außenwand hinter jedem Umgangsjoch | „**38** altari laterali … e due absidiole, per un totale di **quaranta**“ (it.wikipedia) | A (Zahl), Lage C |
| Säulen | Pietra serena, korinthische Kapitelle | it.wikipedia | A (Material), Höhe C |
| Kuppel | über der Vierung, Salvi d'Andrea **1479–1481** | it.wikipedia | A (Daten), Maße C |
| Sakristei | achteckig, Giuliano da Sangallo ab **1489**, vollendet von Il Cronaca; Vorraumdecke Andrea Sansovino **1491** | it.wikipedia | A |
| Campanile | Spitze Y 202 = **138 Lagen = 69 m** | „alto **70 metri**“, Baccio d'Agnolo, **1503–1570** (it.wikipedia) | −1,4 %. A |
| Bauzeit | | Brunelleschi, Baubeginn **1444**, Weihe 1481, Vollendung 1487 (it.wikipedia) | A |
| Fassade | glatte Putzfront | im 18. Jahrhundert verputzt, unvollendet (it.wikipedia) | A |

## 3. Entwurfswerte ohne Beleg (Stufe C, Proportion nach Fotos)
- Säulen bis Lage 16, Kapitell Lage 17, Kämpfer Lage 19, Arkadenscheitel ≈ Lage 27.
- Kassettendecke der Hauptschiffe Lage 44 (22 m), Traufe 48, First 56; Pultdach des Umgangs 36 → 31.
- Tambour ab Lage 50, Kuppelschale ab Lage 60, innerer Radius 12,5, äußerer 14,5 Blöcke; Laterne bis Y 146.
- Sakristei: Achteck mit Innenradius 11,5 Blöcken um (u 76,2 \| w −61,9) (OSM-Teil w673223525), Wände bis Lage 26, Kuppel darüber; Vorraum mit Kassettendecke ab Lage 20.
- Campanile: Glockenstube Lage 112..124, Spitze bis Lage 138.
- Hochaltar als massiver Block (Radius 2,3) bis Lage 12.
