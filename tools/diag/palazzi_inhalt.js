'use strict';
// Schreibt content/modul_N.json der Ausstattungsmodule der Palazzi (V5a) aus INHALT in projects/<id>/model/_raeume.js und
// ergänzt in modul_2/modul_3 die Trennwände. Aufruf: node tools/diag/palazzi_inhalt.js [<projekt-id> ...]
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const PROJEKTE = { bargello: 7, palazzo_strozzi: 6, palazzo_rucellai: 6, palazzo_medici_riccardi: 6, ospedale_degli_innocenti: 6 };
const TRENN = {
  2: ['trennwaende', { title: 'Trennwände', description: 'Trennwände teilen den Saalring im Erdgeschoss in einzelne Säle; jede Wand hat eine Tür von 3 Blöcken Breite und 5 Höhe.', tip: 'Türen beim Bauen frei lassen.', caution: 'Die Wände stehen auf dem Boden des Erdgeschosses.', fact: 'Raumfolgen (Enfiladen) verbinden die Säle der Palazzi untereinander.' }],
  3: ['trennwaende_og', { title: 'Trennwände der Obergeschosse', description: 'Auf den Geschossböden teilen Trennwände die Obergeschosse in Säle; jede Wand hat eine Tür von 3 Blöcken Breite und 5 Höhe.', tip: 'Erst den Boden, dann die Wand darauf.', caution: 'Türen frei lassen.', fact: 'Das Hauptgeschoss (piano nobile) liegt in Florentiner Palazzi eine Treppe über der Straße.' }]
};

for (const id of (process.argv.length > 2 ? process.argv.slice(2) : Object.keys(PROJEKTE))) {
  const R = require(path.join(ROOT, 'projects', id, 'model', '_raeume.js'));
  const dir = path.join(ROOT, 'projects', id, 'content');
  const n = PROJEKTE[id];
  const teile = {};
  for (const t of R.TEILE) {
    const c = R.INHALT.teile[t];
    if (!c) throw new Error(`${id}: Content für ${t} fehlt`);
    teile[t] = { title: c.title, description: c.description, tip: c.tip, caution: c.caution, fact: c.fact };
  }
  const extra = Object.keys(R.INHALT.teile).filter((t) => !R.TEILE.includes(t));
  if (extra.length) throw new Error(`${id}: Content ohne Bauteil: ${extra.join(', ')}`);
  const j = { module: n, title: R.INHALT.titel, subtitle: `Bautüte ${n}: ${R.INHALT.untertitel}`, icon: R.INHALT.icon, parts: teile };
  fs.writeFileSync(path.join(dir, `modul_${n}.json`), JSON.stringify(j, null, 2));
  for (const m of [2, 3]) {
    const f = path.join(dir, `modul_${m}.json`);
    const c = JSON.parse(fs.readFileSync(f, 'utf8'));
    c.parts[TRENN[m][0]] = TRENN[m][1];
    fs.writeFileSync(f, JSON.stringify(c, null, 2));
  }
  console.log(`${id}: modul_${n}.json (${R.TEILE.length} Bauteile), Trennwände in modul_2 und modul_3`);
}
