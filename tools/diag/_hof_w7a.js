'use strict';
// Hilfsskript W7a: lokale Grenzen der Löcher (Höfe) und Rand des Hauptgebäudes je w-Zeile. Aufruf: node tools/diag/_hof_w7a.js <projekt-id>
const path = require('node:path');
const fs = require('node:fs');
const WZ = require('../wahrzeichen');
const ROOT = path.resolve(__dirname, '..', '..');
const dir = path.join(ROOT, 'projects', process.argv[2]);
const PJ = JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8'));
const M = WZ.ladeMasken(PJ, { dir });
const R = M.rahmen, H = M.haupt;
H.loecher().forEach((lo, i) => {
  let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
  for (const [x, z] of lo.cells) { const l = R.toLocal(x, z); a = Math.min(a, l.u); b = Math.max(b, l.u); c = Math.min(c, l.w); d = Math.max(d, l.w); }
  console.log('Loch', i, 'Zellen', lo.size, 'u', a.toFixed(1), '..', b.toFixed(1), 'w', c.toFixed(1), '..', d.toFixed(1));
});
// u-Bereich der Maske je w-Zeile (alle 4)
const rows = new Map();
for (const [x, z] of H.cells) { const l = R.toLocal(x, z), w = Math.round(l.w / 4) * 4; const e = rows.get(w) || [1e9, -1e9]; e[0] = Math.min(e[0], l.u); e[1] = Math.max(e[1], l.u); rows.set(w, e); }
for (const w of [...rows.keys()].sort((a, b) => a - b)) console.log('w', w, 'u', rows.get(w)[0].toFixed(0), '..', rows.get(w)[1].toFixed(0));
