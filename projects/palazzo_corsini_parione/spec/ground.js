'use strict';
// Boden des Palazzo Gondi: Gelände der Stadt, in den Masken des Projekts abgetragen bis Y = bodenY − 1.
const fs = require('node:fs');
const path = require('node:path');
const base = require('../../../tools/city/ground_stadt.js');
const WZ = require('../../../tools/wahrzeichen');

const DIR = path.resolve(__dirname, '..');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
let maske = null;
const innen = (x, z) => (maske || (maske = WZ.ladeMasken(PJ, { dir: DIR }).alle)).innen(x, z);

function groundTopY(x, z) {
  const t = base.groundTopY(x, z);
  return innen(x, z) ? Math.min(t, PJ.bodenY - 1) : t;
}

module.exports = { ...base, groundTopY };
