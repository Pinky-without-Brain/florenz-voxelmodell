# Prüfbericht D2 – Stadtgrund, Ponte Vecchio, Palazzo Pitti

Geprüft wurden `UEBERSICHT_WELLE2.md`, `stadtgrund/SPEZIFIKATION.md` und die Kataloge `ponte_vecchio` und `palazzo_pitti`. **Diese Entscheidungen gehen den Katalogen vor.** Zusätzlich gilt der Standard `../BEGEHBARKEIT.md`, mit echten Treppenblöcken.

## Entscheidungen zu den offenen Fragen (UEBERSICHT_WELLE2 §5)
| Nr. | Frage | Entscheidung |
|---|---|---|
| 1 | Spannweiten Ponte Vecchio | **Verhältnis aus der Literatur (27 : 30 : 27), skaliert auf die gemessene OSM-Länge zwischen den Widerlagern.** Die Wasserbreite im DGM/OSM ist kein Maß für die Bögen, weil die Pfeiler im Wasser stehen. Pfeilerbreite wie im Katalog. Die Spannweiten werden als Konstanten oben im Modul festgelegt. |
| 2 | Korridorseite | Ostzeile, wie empfohlen. |
| 3 | Cellini-Büste | Westseite der Terrasse. |
| 4 | Pitti-Höhe | 38 m. |
| 5 | Pitti-Achsen | Der Katalogwert 21 gilt (drei Wikipedia-Ausgaben). Er steht als Parameter `PITTI_ACHSEN` oben im Modul und wird mit Fotos im Bildindex (A5) geprüft. |
| 6 | Pitti am Hang | Eine Bodenplatte, das Gelände wird abgetragen; Stadtgrund und Säulenregel übernehmen das. |
| 7 | Korridor Oltrarno | `palazzo_pitti` Modul 9. |
| 8 | Torre dei Mannelli | 28 m, der Gang dort ist 3 breit. **Ausnahme vom Begehbarkeits-Standard:** 3 breit ist erlaubt, weil der Gang historisch so schmal ist; lichte Höhe ≥ 3. |
| 9 | Stadtgrund | Zuerst den Kern bauen (131 Kacheln). Bäume später als Option. |
| 10 | Pipeline S0 | **Teilprojekte statt eines Riesen-Grids:** `stadtgrund_<kachel>` als eigene Projekte, die ein Generator erzeugt; jedes ist unter 300 k Blöcken. Der gemeinsame Code liegt in `tools/stadtgrund/`. `--cross` arbeitet streamend über Säulen-Raster. Begründung: bewährte Pipeline, keine Grid-Grenzen, Kacheln einzeln neu baubar. |
| 11 | Uferabgänge | Entfallen (nicht belegt). |
| 12 | Grotta del Buontalenti | Welle 3. |
| 13 | Loggia-Treppe am Ponte Vecchio | Bauen und im Content als „Spielzugang, nicht historisch“ kennzeichnen. |
| übrige | | wie empfohlen. |

## Reihenfolge
1. **S0:** Stadtgrund-Generator und Teilprojekte, Datendateien `besitz_duomo.json` und `aussparung.json`, Erweiterungen der `project.json` (`flaechen`, `zMin`/`zMax`, `abzugAlle`, `gelaendeBis`) und neue Einträge in `vorrang.json`.
   - Voraussetzung ist der Merge von B0 (Treppen, `ctx.oeffnung`, R13/R14).
2. **Bau:** Ponte Vecchio, Palazzo Pitti (ein Agent je Wahrzeichen) und die Stadtgrund-Kacheln des Kerns.
3. **Abnahme:** `--cross` über alle Projekte, Begehbarkeit (R13/R14) als Pflicht, Minecraft-Export, Sichtprüfung.
