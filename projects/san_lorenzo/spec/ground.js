'use strict';
// Boden von San Lorenzo: Gelände der Stadt, in der Kirche abgetragen bis Y 66 (Boden Y 67), unter der Cappella dei
// Principi bis Y 60 (Krypta mit Boden Y 61, Eingang auf Straßenniveau der Piazza Madonna degli Aldobrandini).
const fs = require('node:fs');
const path = require('node:path');
const base = require('../../../tools/city/ground_stadt.js');
const WZ = require('../../../tools/wahrzeichen');

const DIR = path.resolve(__dirname, '..');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
let M = null;
const masken = () => M || (M = WZ.ladeMasken(PJ, { dir: DIR }));

function groundTopY(x, z) {
  const t = base.groundTopY(x, z);
  if (masken().masken.principi.innen(x, z)) return Math.min(t, 60);
  return masken().haupt.innen(x, z) ? Math.min(t, PJ.bodenY - 1) : t;
}

module.exports = { ...base, groundTopY };
