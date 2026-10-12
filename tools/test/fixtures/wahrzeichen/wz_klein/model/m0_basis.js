'use strict';
// Testwahrzeichen: Bodenplatte auf bodenY und ein Wandband (d8 <= 2) darüber, gebaut mit tools/wahrzeichen.
// Der Platzhalter für den Bibliothekspfad wird vom Test ersetzt (die Fixture wird in ein Temp-Verzeichnis kopiert).
const WZ = require('@WZ_LIB@');
const path = require('node:path');

module.exports = { module: 0, build(ctx) {
  const root = path.resolve(__dirname, '..');
  const json = JSON.parse(require('node:fs').readFileSync(path.join(root, 'project.json'), 'utf8'));
  const m = WZ.ladeMasken(json, { dir: root });
  const pflaster = WZ.typ('pflaster'), stein = WZ.typ('pietra_forte');
  ctx.part('bodenplatte').fill(m.haupt.cells.map(([x, z]) => ({ x, y: json.bodenY, z })), pflaster);
  const band = m.haupt.cells.filter(([x, z]) => m.haupt.d8(x, z) <= 2);
  const w = ctx.part('wandband');
  for (let y = json.bodenY + 1; y <= json.bodenY + 2; y++) w.fill(band.map(([x, z]) => ({ x, y, z })), stein);
  // @EXTRA@
} };
