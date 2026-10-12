# Hausakte – Schema und florentinische Bautypen (V3, Phase C)

Jedes der rund 6.400 Gebäude bekommt **eine eigene Akte** (`projects/<quartier>/hausakten/<gebaeude-id>.json`). Aus der Akte und dem OSM-Grundriss (`data/stadt/gebaeude.json`) erzeugt der Fassaden-Generator das Haus. Kein Haus entsteht ohne Akte, und keine zwei benachbarten Akten dürfen gleich sein.

## 1. Maße im Blockraster (1 Block = 0,5 m)
| Element | Richtwert | Blöcke |
|---|---|---|
| Außenwand zur Straße | 0,8–1,2 m | **2** |
| Brandwand zum Nachbarn | geteilt | **1**, gehört dem Haus mit der kleineren ID |
| Erdgeschoss (piano terreno) | 4,5–6 m | 9–12 |
| Piano nobile (Renaissance-Palazzo) | 5–6 m | 10–12 |
| Obergeschoss (normal) | 3,5–4 m | 7–8 |
| Fensterachse (Abstand) | 3–4 m | 6–8 |
| Fenster | 1,0–1,2 × 2,0–2,4 m | 2 × 4–5 |
| Ladenbogen (arco di bottega) | 2,5–3,5 m breit | 5–7 |
| Dachüberstand (gronda/sporto) | 0,5–1,5 m | 1–3 |

Die Gesamthöhe kommt aus `hoeheBl` in `gebaeude.json`. Die Geschosshöhen werden so verteilt, dass die Traufe auf diese Höhe fällt.

## 2. Bautypen
| `typ` | Erkennungsmerkmale | Typische Werte |
|---|---|---|
| `casa_a_schiera` | schmales Reihenhaus, Läden im EG | 2–4 Achsen, 3–5 Geschosse, Putz, Holz-Sporto |
| `casa_torre` | mittelalterlicher Wohnturm | 1–3 Achsen, schmal und hoch, Bruchstein aus Pietra forte, kleine Rundbogenfenster, Rüstlöcher |
| `palazzo_rinascimento` | Quattrocento-Palazzo (Medici, Strozzi, Rucellai) | 5–11 Achsen, abgestufte Rustika, Biforien, Steingesims (cornicione) |
| `palazzo_cinquecento` | Manierismus, Barock | Putz mit Steinrahmen, „finestre inginocchiate“ im EG, Tabernakelfenster |
| `palazzo_ottocento` | 19. Jh., z. B. Piazza della Repubblica | regelmäßige Putzfassade, Stuckrahmen, Balkone, Flachdach bzw. Attika |
| `chiesa_minore` | kleine Kirche, Oratorium | Giebelfassade, Portal, Oculus, Glockenaufsatz |
| `loggia` | offene Bogenhalle | Säulen aus Pietra serena, Rundbögen |
| `zweckbau` | Hinterhaus, Nebengebäude, modern | schlichte Putzfassade, wenige Öffnungen |

## 3. Aktenformat
```json
{
  "id": "w123456789",
  "typ": "palazzo_rinascimento",
  "epoche": "15. Jh.",
  "geschosse": [ { "art": "eg", "hoeheBl": 11 }, { "art": "nobile", "hoeheBl": 11 }, { "art": "og", "hoeheBl": 9 } ],
  "fassade": {
    "kanten": "strasse",
    "achsen": 7,
    "material": "bugnato_abgestuft",
    "putzfarbe": null,
    "erdgeschoss": { "art": "portal_mittig", "portalBreiteBl": 5, "fenster": "rechteck_vergittert" },
    "fenster": { "typ": "bifora", "rahmen": "pietra_forte", "laeden": null },
    "gesims": { "art": "cornicione_stein", "tiefeBl": 3 },
    "extras": ["wappen_ecke", "fackelhalter", "steinbank"]
  },
  "dach": { "form": "walm", "material": "coppi", "altana": false },
  "quelle": "typologie",
  "sicherheit": 0.4,
  "notiz": "Kurzbegründung der Wahl"
}
```
- **`fassade.kanten`:**
  - `"strasse"`: alle Kanten, die an Straße, Platz oder Wasser grenzen (aus `flaechen.json`).
  - Liste von Kantenindizes für Sonderfälle.
  - Hofkanten bekommen eine schlichte Fassade.
- **`putzfarbe`:** einer der Werte `ocker`, `gelb`, `rosa`, `sand`, `weiss`, `grau`, `terrakotta`. Zuordnung zu Blöcken über die Palette (Phase A3).
- **`quelle`:** `typologie` | `foto:mapillary:<id>` | `foto:commons:<datei>` | `recherche:<url>`.
- **`sicherheit`:** wie belastbar die Akte ist (0 = geschätzt, 1 = belegt). Wird in Doku und Webapp angezeigt.

## 4. Regeln für die Agenten, die Akten füllen (je Isolato)
1. **Typ aus Daten:** Name, `historic`/`heritage`, Lage an Platz oder Hauptstraße, Grundfläche, Höhe und Proportion. Beispiel: schmal und hoch heißt Wohnturm; breit, benannt „Palazzo …“ heißt Palazzo.
2. **Variation mit Regel:** Nachbarn unterscheiden sich in mindestens zwei Merkmalen (Putzfarbe, Achsen, Fenstertyp, Gesims, EG-Art). Gleiche Merkmale höchstens bei echten Ensembles, etwa der Ottocento-Platzfront.
3. **Benannte Gebäude:** kurze Recherche über Wikipedia, Wikidata oder Commons, mit Quelle in der Akte. Unsicherheit wird zugegeben.
4. **Keine Erfindungen in Texten:** Wappen und Inschriften nur generisch. Historische Fakten im Content nur mit Beleg.
5. **Prüfung** durch den Validator `R11 Hausakten`: Schema-Konformität, Höhe passt zu `hoeheBl` (±2), Vielfalt-Kennzahl je Straßenzug, Nachbarschaftsregel aus Punkt 2.

## 5. Generator (Phase C) – Bauregeln
- **Kubatur:** Grundriss-Polygon wird zu Wänden; die Höhe reicht bis zur Traufe.
- **Innen:** keine Decken, außer bei Wahrzeichen. Nur das Erdgeschoss bekommt einen Boden auf `bodenY` (Verbindung zum Gelände für R3).
- **Fassaden** entstehen an Straßenkanten über `arches.elevation` entlang beliebig schräger Kanten (Kante → lokales u/v; die Zellen werden über die Kantennormale bestimmt).
- **Dach:**
  - Walm- bzw. Satteldach über dem Grundriss-Polygon mit einer Neigung von etwa 20–25°.
  - Überstand nur zur Straße hin, und nur so weit, dass er nicht über die Hausgrenze ins Nachbarhaus ragt.
- **Brandwände:** gehören dem Haus mit der kleineren ID (siehe §1). Das andere Haus lässt diese Zellen aus. Geprüft wird das über das Parzellenraster.
- **Bauschritte:** Ein Bauteil ist ein Haus. Ein Modul ist ein Isolato. Ein Projekt ist ein Quartier.

## 6. C1-Festlegungen (vom Generator ergänzt, im Schema offen gelassen)
Diese Punkte hat die Umsetzung (`tools/city/akte.js`, `haus.js`) festgelegt; sie sind keine Vorgaben aus der Recherche.
- **Zusatzfelder:** `name` (Text oder null, Gebäudename; wird als Bauteiltitel genutzt) und `ensemble` (nicht-leerer Text; Akten mit gleichem Wert sind von der Nachbarschaftsregel ausgenommen). Unbekannte Felder sind ein Fehler in R11.
- **Aufzählungen:**
  - `geschosse[].art`: `eg`, `mezzanin`, `nobile`, `og`, `attika`; das erste Geschoss ist `eg`; `hoeheBl` ist eine Ganzzahl 3..16.
  - `fassade.material`: `putz`, `bugnato_abgestuft` (EG Rustika, Nobile Bruchstein, darüber glatt), `bugnato_glatt`, `bruchstein`, `stein_glatt` (Pietra serena). Bei `putz` ist `putzfarbe` Pflicht.
  - `fassade.erdgeschoss.art`: `portal_mittig`, `portal_seitlich`, `bottega_arcata`, `tor_und_fenster`, `geschlossen`, `loggia_offen`, `portal_giebel`; `fenster`: `rechteck`, `rechteck_vergittert`, `kniefenster`, `rundbogen`, `keine`.
  - `fassade.fenster.typ`: `rechteck`, `rundbogen`, `bifora`, `tabernakel`, `rahmen_stuck`; `rahmen`: `pietra_forte`, `pietra_serena`, `putz`, `keiner`; `laeden`: null, `gruen`, `holz`.
  - `fassade.gesims.art`: `keiner`, `gronda_holz`, `putzgesims`, `cornicione_stein`; `tiefeBl` 0 (nur bei `keiner`) oder 1..3.
  - `dach.form`: `walm`, `sattel`, `flach`; `dach.material`: `coppi`, `terrasse`.
- **Dach:** `walm` und `sattel` erzeugen dieselbe Form (Walm über dem Abstandsfeld, Anstieg 0,4, höchstens 10 Blöcke). `altana` und `extras` werden gespeichert, aber noch nicht gebaut.
- **Fassadenkanten:** Eine Außenkante ist straßenseitig, wenn weniger als die Hälfte der Messpunkte 1,5 Blöcke davor in der Parzelle eines anderen Gebäudes liegt (also Straße, Platz, Wasser oder freie Fläche). Kanten an Löchern sind Hofkanten. Öffnungen bekommen nur Kanten ab 6 Blöcken; Portale und Läden nur die längste Straßenkante.
- **Geschosshöhen** müssen sich auf `hoeheBl` ±2 summieren (R11); die Traufe liegt auf `bodenY + Summe`.
- **Nachbarschaft:** Zwei Häuser grenzen aneinander, wenn eine Zelle des einen in der 8er-Nachbarschaft einer Zelle des anderen liegt (Parzellenraster).
