'use strict';
// Boden des Palazzo Pitti: Gelände der Stadt (tools/city/ground_stadt.js), im eigenen Footprint aber abgetragen bis
// Y = bodenY − 1 (Aushub, Katalog §0.8: der Stadtgrund endet dort bei min(groundTopY, 82)).
const fs = require('node:fs');
const path = require('node:path');
const base = require('../../../tools/city/ground_stadt.js');
const WZ = require('../../../tools/wahrzeichen');

const DIR = path.resolve(__dirname, '..');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
let maske = null;
const innen = (x, z) => (maske || (maske = WZ.ladeMasken(PJ, { dir: DIR }).haupt)).innen(x, z);

function groundTopY(x, z) {
  const t = base.groundTopY(x, z);
  return innen(x, z) ? Math.min(t, PJ.bodenY - 1) : t;
}

module.exports = { ...base, groundTopY };
