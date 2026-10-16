# Referenzmaße – Santi Apostoli (W6a, Wahrzeichen-Welle 6)

Projekt-ID `santi_apostoli`. Maßstab 1:2 (**Blöcke = 2 · m**), Weltkoordinaten des Stadtmodells. Stand 16.10.2026.
Stufen: **A** mehrere Quellen übereinstimmend oder amtliche Quelle, **B** eine Quelle oder aus OSM/DGM gemessen, **C** Schätzung (Proportion). Entwurf: [`BAUTEIL_KATALOG.md`](BAUTEIL_KATALOG.md).

## 1. Rahmen und OSM

| Größe | Wert | Quelle |
|---|---|---|
| OSM-Objekt | Way **w451785463** „Chiesa dei Santi Apostoli“ (`building=church`, `wikidata=Q2223430`, `wikipedia=it:Chiesa dei Santi Apostoli (Firenze)`), Fläche 1.121 Blöcke, **1.127 Zellen**, keine `building:part`, bisher im Quartier Lungarni | `data/stadt/gebaeude.json` |
| **Rahmen `SA`** | θ = **20°**, Ursprung (−774 \| 866): u von der Fassade (u = 0, Westnordwest, Piazza del Limbo) nach Ostsüdost zur Apsis (u ≈ 59), w quer, w > 0 **rechts** beim Eintreten (Süden). Die langen Kanten laufen unter 18 bis 20°, die Fassadenkante (−781,5 \| 884) bis (−774 \| 866) steht senkrecht dazu | gemessen an den Polygonkanten |
| Umriss im Rahmen | Langhaus u 0..35, w 0..21; Ausbuchtung nach Süden u 25..35, w bis 26; Chor u 35..59, w 7..24 mit halbrunder Apsis; der Chor liegt gegen das Langhaus um etwa 5 Blöcke nach Süden versetzt | gemessen, B |
| Gelände | `groundTopY` 58 bis 61 (58: 66, 59: 358, 60: 544, 61: 159 Zellen); Piazza vor der Fassade 58 bis 59, Chorseite 60 bis 61 | `tools/city/ground_stadt.js` |
| **`bodenY`** | **59** (Fußboden Y 59, Stehhöhe Y 60; eine Stufe über der Piazza, im Chor liegt das Gelände höher und wird bis Y 58 abgetragen) | Entwurf, B |

## 2. Maße und Befunde (Literatur gegen OSM)

| Befund | Quelle | Stufe |
|---|---|---|
| Romanische Basilika, Bau ab dem 11. Jh., Umbauten im 15. und 16. Jh.; ein Schiff mit zwei Seitenschiffen und halbrunder Apsis, frühchristlich beeinflusst; Platte an der Fassade behauptet Gründung 800, die Forschung datiert auf das späte 11. Jh. | it.wikipedia „Chiesa dei Santi Apostoli (Firenze)“; en.wikipedia | A |
| **Säulen aus grünem Prato-Marmor** mit uneinheitlichen, wiederverwendeten römischen Kapitellen (die ersten beiden korinthisch, wohl aus nahen Thermen des 1. Jh. v. Chr.); Rundbögen springen aus den Säulen | it.wikipedia; en.wikipedia | A |
| **Holzdecke von 1333** mit reich verzierten Gespärren | it.wikipedia | A |
| Boden mit einfachem Mosaik und Grabplatten Florentiner Familien (Acciaiuoli, Altoviti, Del Bene) | it.wikipedia | A |
| Apsis mit schlichter romanischer Struktur, grob behauene Steine sichtbar; Seitenkapellen des 16. Jh., klein | it.wikipedia | A |
| Fassade romanisch, schlicht, unvollendet; Portal des 16. Jh., Benedetto da Rovezzano zugeschrieben; Lünette mit Taube des Heiligen Geistes; kleiner Glockenturm von Baccio d’Agnolo (16. Jh.) | it.wikipedia; en.wikipedia | A |
| Piazza del Limbo: benannt nach einem mittelalterlichen Friedhof für ungetaufte Kinder; Palazzo Borgherini-Rosselli del Turco angrenzend | en.wikipedia | A |
| Rechtes Seitenschiff: 1. Kapelle Almosen des Martin (Gamberucci zugeschrieben), 2. Del Bene (Roncalli), 3. Del Bene (Grabmal Piero Del Bene 1530; gegenüber Stuckrelief des Paulus), 4. Altoviti (1533; Vasari, Immacolata 1541); vorletzte Kapelle Altoviti (1392; Jacopo di Cione, Madonna della Neve); über der Sakristeitür Grabmal des Bindo Altoviti (Ammannati 1570) | it.wikipedia; en.wikipedia | A |
| Apsis: Polyptychon von Jacopo di Cione und Niccolò Gerini (1383) hinter dem modernen Altar; Kenotaph des Antonio Altoviti (Dosio 1573 bis 1583) mit Büsten von Caccini | it.wikipedia | A |
| Linkes Seitenschiff: Tabernakel aus glasierter Terrakotta von Andrea Della Robbia (Zahlung 28. April 1512) links der Apsis; Grabmal Antonio und Oddone Altoviti (Rovezzano 1507 bis 1508) am Anfang; 4. Kapelle Maso da San Friano (um 1565), 3. Alessandro Fei (um 1575), 2. Gabbiani (1685 bis 1686) bzw. Bonechi, 1. Kopie nach Paolo Schiavo (Sinopia über dem Portal); Weihwasserbecken von Rovezzano | it.wikipedia; en.wikipedia | A / B |
| Nische mit den drei Feuersteinen der Pazzi (Pazzino de’ Pazzi 1101) im ersten Teil des linken Schiffs, Zündfeuer für den Scoppio del Carro | it.wikipedia; en.wikipedia | A |
| Keine Maße (Längen, Breiten, Höhen), keine Jochzahl und kein Querhaus in it.wikipedia oder en.wikipedia | it.wikipedia, en.wikipedia | – |

## 3. Entwurfswerte ohne Beleg (Stufe C)
Alle Höhen (Traufe der Holzdecke Lage 14, First Lage 20, Dach bis 22, Fassade bis 24, Seitenschiffdecken 11, Kapelle 10, Chor 15, Säulen 8 hoch), sechs Arkadenjoche, Breite der Schiffe (Mittelschiff 6, Seitenschiffe 4), Säulenstärke (knapp 2), Lage und Größe der Kapelle im Süden, Trennung von Langhaus und Chor durch die Triumphwand, Portalmaße, Fenster, Bodenmuster, Altarmaße, Farben und Motive der Bilder, Bänke.
