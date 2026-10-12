# OSM-Rohdaten
Quelle: OpenStreetMap-Mitwirkende, ODbL 1.0 (https://www.openstreetmap.org/copyright). Abfrage über Overpass API am 12.10.2026.
- `gebaeude_2026-10-12.json`: building/building:part/Relationen, bbox lat 43.7615–43.7795, lon 11.2380–11.2670
- `gebaeude_relationen_2026-10-12.json`: building-Relationen (Multipolygone) mit Mitgliedern und Geometrie, nachgeladen am 12.10.2026, weil `gebaeude_2026-10-12.json` die Relationen ohne Mitglieder enthält. Abfrage: `relation["building"](bbox); out geom;`
- `strassen_`, `plaetze_`, `wasser_`, `gruen_`, `bruecken_`, `mauern_2026-10-12.json`: Overpass `out geom`, gleiche bbox, am 12.10.2026 (Abfragen in `tools/data/fetch_osm.js`: highway/area:highway/pedestrian-Relationen; place=square; natural=water, waterway=riverbank|river; leisure=garden|park, landuse=grass; bridge=yes, man_made=bridge; barrier=wall|city_wall).

# Geländedaten
Comune di Firenze, DTM LiDAR 2017, CC BY 4.0 (ESRI-ASCII, 1 m, ETRS89 / UTM 32N). Die Rohkacheln liegen außerhalb des Projekts; `data/stadt/gelaende.bin` ist die daraus abgeleitete Rasterung im Modellsystem. Namensnennung: „Comune di Firenze, DTM LiDAR 2017, CC BY 4.0“.
