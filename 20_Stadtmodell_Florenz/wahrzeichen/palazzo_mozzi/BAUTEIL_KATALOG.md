# Bauteilkatalog – Palazzo dei Mozzi (Welle 8a)

Maße und Quellen: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen MZ (θ 19,33°), Lagen yr = Y − 66. Bauplan `tools/wahrzeichen/palazzo.js` (mit `entlangGlatt`), Einstellungen `projects/palazzo_mozzi/model/_mz.js`, Raumplan und Ausstattung `model/_raeume.js`. Stufen: A belegt, B Literatur oder begründet, C Entwurf.

## 1. Module und Bauteile

| Modul | Titel | Bauteile |
|---|---|---|
| 0 | Fundament, Boden und Treppe | `fundament`, `boden`, `hof`, `treppe` |
| 1 | Fassaden | `aussenwand`, `fenster`, `kranzgesims` |
| 2 | Hofwände und Trennwände | `hofwaende`, `hoffenster`, `trennwaende` |
| 3 | Böden und Decke | `geschossboeden`, `decke`, `trennwaende_og` |
| 4 | Dach und Turm | `dach`, `turm` |
| 5 | Licht | `licht` |
| 6 | Ausgestaltete Räume, Hof und Wappen | `vestibolo`, `cortile`, `sala_grande`, `wappen`, `licht_ausstattung` |

## 2. Zonen und Wände
- **Geschosse** (Lagen): EG 0..12, 1. OG 12..21, 2. OG 21..30 (Traufe Y 96); Walmdach bis Lage 35 (Y 101), Turm bis Lage 46 (höchster Block Y 112). Gesimse aus Pietra serena auf der obersten Lage.
- **Außenwände** zwei Blöcke dick: EG Rustika aus Pietra forte (kleine Quader), Obergeschosse Bruchstein, jede vierte Lage glatte Pietra forte; innen Putz.
- **Fornici**: sieben Rundbogenportale (7 breit, 7 hoch, Abstand 10) in der Fassade zur Piazza dei Mozzi, bis zum Boden offen; Fenster nur in den Obergeschossen (Rundbogen, Raster 10, Breite 3, Sohle 2, Höhe 5).
- **Hof** (Loch 0, 21 × 20): geschlossene Hofwand (zwei Blöcke) mit Fenstern in den Obergeschossen und vier Türen im Erdgeschoss, eine je Seite.
- **Turm**: Hülle 12 × 12 (u 29,5..41,5, w 0..12) über der Fassadenmitte, Wände 2 dick, bis Lage 46; Schaft deklariert unzugänglich, Deckplatte aus Pietra serena. Zinnen nicht gebaut.
- **Hang**: Das Gelände in der Maske ist auf Y 65 abgetragen (an der Rückseite bis 26 Blöcke); tiefer liegende Zellen füllt das Fundament aus Bruchstein bis Y 65. Die Rückwände stehen als Stützmauer gegen den Hang.

## 3. Begehbarkeit
- **Zugang**: sieben Fornici an der Piazza (Gelände 65..67, Stehfläche innen Y 67: höchstens ein Block Höhenunterschied; keine Stufen nötig). R13 beginnt auf den Zellen vor der Fassade.
- **Raumteilung** (sieben Trennwandlinien, Türen 3 × 5, alle drei Geschosse): drei Vorderräume (Wände bei u 20,5 und 50,5), Mittelband (Wand bei w 19,5) mit Westteil, Saalbau und Ostteil (Wände bei u 22,5 und 48,5), Geviert um den Hof, Rückblock (Wand bei w 76,5) und Ausläufer (Wand bei w 91,5).
- **Treppen**: Wendeltreppe aus Pietra serena (Kern 3 × 3) im Ostraum der Fassade durch alle Geschosse; keine weiteren (die Quelle nennt keine Treppen).
- **Unzugänglich** (deklariert): Dachraum über der obersten Decke, Turmschaft.
- **Licht**: Seelaternen im Boden jedes Raums im Raster 12 (Teil `licht`, bei Ausstattung `licht_ausstattung`).

## 4. Ausgestaltete Innenräume (Modul 6)
Alles vereinfacht in vollen Blöcken; Lage der Räume Stufe C.

| Bauteil | Raum | Lage im Grundriss | Stufe | Inhalt und Quelle |
|---|---|---|---|---|
| `vestibolo` | Eingangshalle | EG, Mittelraum der Fassade (u 21,6..49,4, w 0,5..18,4) | Lage C | Schachboden Pflaster/Marmor, Wandfelder zwischen Pilastern aus Pietra forte. Quelle: it.wikipedia, Palazzo dei Mozzi (Fornici) |
| `cortile` | Hof | Hof (Loch 0) | Umriss B, Pflaster C | Pflaster mit Wegekreuz aus Pietra serena. Quelle: OSM-Umriss |
| `sala_grande` | Großer Saal | 1. OG (u 23,6..47,4, w 20,6..51) | Existenz A, Lage C | Cottoboden, Wandfelder in Rot/Gelb/Blau/Grün mit Goldrahmen, Sockel Braun, Fries Hellblau (Wandmalereien von 1778 nur als Farbflächen), Deckenfeld Weiß/Gold, Tafel. Quelle: it.wikipedia |
| `wappen` | Wappen der Mozzi | Fassade über dem mittleren Fornice (u 33..38) | Existenz A, Form C | Schild 5 × 4 aus dunklen Blöcken mit hellem Kreuz (Tolosakreuz vereinfacht). Quelle: it.wikipedia |
| `licht_ausstattung` | Licht in den Räumen | alle ausgestalteten Räume | – | Regel §1.5 |

## 5. Abweichungen und Nichtgebautes
- **Bodenhöhe:** `bodenY` 66 liegt an der Piazza; das Gelände steigt hinter dem Palast bis 92. Der Hang wird innerhalb der Maske abgetragen, der Garten Bardini liegt außerhalb der Maske und bleibt Gelände.
- **Turm:** Existenz und zentrale Lage belegt, Grundriss, Höhe und Wanddicke Entwurf; Zinnen im 19. Jahrhundert entfernt, daher nicht gebaut; der Schaft ist hohl und unzugänglich (wie die Torre Volognana des Bargello).
- **Fornici:** Ob die Bögen offen oder blind sind, nennt die Quelle nicht; das Modell macht sie zu Portalen. Vordächer fehlen.
- **Obergeschossfenster:** nicht belegt; Rundbogen im Raster der Fornici als Entwurf.
- **Hof und Rückblock:** Aus OSM; die Quelle beschreibt keine Räume dort. Die Raumteilung dient der Begehbarkeit.
- **Treppen:** nur die Wendeltreppe; die Quelle nennt keine Treppe, das Modell ergänzt eine für R13.
- **Option `entlangGlatt`** in `tools/wahrzeichen/palazzo.js`: bei θ = 19° ergibt die erste Außennachbarzelle an den Stufen der Kante die falsche Wandachse (zerrissene Fenster, Kerben in den Bogenschultern); die Option mittelt die Außenzellen im Umkreis 3. Sie ist auch bei Guadagni und Lenzi (θ ≈ ±47°) gesetzt.
