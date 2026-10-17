'use strict';
// Filter für Außenbauteile (Bänke, Stufen, Laternen) von Wahrzeichen (W8a, Muster aus palazzo_gondi/_raeume.js):
// erlaubt sind nur Straßen-/Platzzellen, die in keinem fremden Gebäudepolygon aus gebaeude.json liegen und deren
// 5 × 5-Umfeld ebenfalls frei von fremden Gebäuden ist (Nachbarhäuser bauen Eingangsstufen auf die Straße).
//   const aufStrasse = require('.../strasse.js').aufStrasseFuer(projektDir);   aufStrasse(x, z) -> bool
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('./index.js');
const PO = require('../city/poly.js');
const { umfeldVon } = require('../city/umfeld.js');

function aufStrasseFuer(dir) {
  const root = path.resolve(__dirname, '..', '..');
  const PJ = JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8'));
  const UMFELD = umfeldVon(JSON.parse(fs.readFileSync(path.join(root, 'data', 'stadt', 'flaechen.json'), 'utf8')));
  const MASKE = WZ.ladeMasken(PJ, { dir }).alle;
  const g = JSON.parse(fs.readFileSync(path.join(root, 'data', 'stadt', 'gebaeude.json'), 'utf8')).gebaeude;
  const xs = MASKE.cells.map((c) => c[0]), zs = MASKE.cells.map((c) => c[1]);
  const x0 = Math.min(...xs) - 6, x1 = Math.max(...xs) + 6, z0 = Math.min(...zs) - 6, z1 = Math.max(...zs) + 6;
  const fremde = [];
  for (const b of g) {
    if ((PJ.gebaeude || []).includes(b.id)) continue;               // eigene Polygone sind keine fremden Gebäude
    const r = b.polygon && b.polygon.aussen && b.polygon.aussen[0];
    if (!r) continue;
    const bx = r.map((p) => p[0]), bz = r.map((p) => p[1]);
    if (Math.max(...bx) < x0 || Math.min(...bx) > x1 || Math.max(...bz) < z0 || Math.min(...bz) > z1) continue;
    fremde.push(PO.normalize(b.polygon));
  }
  const inFremdem = (x, z) => fremde.some((poly) => PO.contains(poly, x + 0.5, z + 0.5));
  const strasseOderEigen = (x, z) => {
    if (MASKE.innen(x, z)) return true;
    const k = UMFELD.klasse(x, z);
    return (k === 'strasse' || k === 'platz') && !inFremdem(x, z);
  };
  return (x, z) => {
    if (!strasseOderEigen(x, z) || MASKE.innen(x, z)) return false;
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) if (!strasseOderEigen(x + dx, z + dz)) return false;
    return true;
  };
}

module.exports = { aufStrasseFuer };
