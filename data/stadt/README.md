# data/stadt

Erzeugte Stadtdaten (`node tools/data/build_stadtdaten.js`, reproduzierbar aus `data/osm/` und dem DTM).

## korrekturen.json (von Hand gepflegt, keine erzeugte Datei)
Dokumentierte Korrekturen gegenüber den OSM-Rohdaten, bisher nur Höhen:

```
{ "hoehen": { "<gebaeude-id>": { "hoeheBl": 40, "quelle": "<URL oder Text>", "notiz": "..." } } }
```

- Wird in `tools/data/gebaeude_build.js` nach der Höhenschätzung angewendet; das Gebäude erhält `hoeheQuelle: "korrektur"` und `korrekturQuelle`.
- Eine Korrektur braucht eine belegte Quelle. Ohne Beleg bleibt die OSM-Höhe oder Schätzung stehen.
- Nach Änderungen: Stadtdaten neu bauen, `node tools/emit/stadtbasis.js`, Hausakten des Projekts auf die neue Höhe bringen, `node tools/build.js --project <id>`.
- Aktuell: Palazzo Pasqui (w307544521, 40), Palazzo Incontri (w307544522, 32), Palazzetto del Bianco (w307544533, 29). Palazzo Naldini (w307544530): keine dokumentierte Höhe gefunden (it.Wikipedia nennt nur vier Achsen und drei Geschosse zur Piazza), daher keine Korrektur.
