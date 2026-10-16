'use strict';
// Boden von Santa Maria del Carmine: Gelände der Stadt, in den Masken des Projekts abgetragen bis Y = bodenY − 1.
const fs = require('node:fs');
const path = require('node:path');
const base = require('../../../tools/city/ground_stadt.js');
const WZ = require('../../../tools/wahrzeichen');

const DIR = path.resolve(__dirname, '..');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
let M = null;
const masken = () => M || (M = WZ.ladeMasken(PJ, { dir: DIR }));
const innen = (x, z) => masken().alle.innen(x, z);

// Der Campanile (V5b) steht im Kreuzgangshof, sein Boden liegt eine Lage tiefer als die Kirche (Y bodenY − 1, bündig mit dem Hof)
function groundTopY(x, z) {
  const t = base.groundTopY(x, z);
  if (masken().masken.campanile.innen(x, z)) return Math.min(t, PJ.bodenY - 2);
  return innen(x, z) ? Math.min(t, PJ.bodenY - 1) : t;
}

module.exports = { ...base, groundTopY };
