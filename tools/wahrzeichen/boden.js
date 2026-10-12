'use strict';
// Boden: Provider des Stadtgeländes (tools/city/ground_stadt.js) und Fundamentzellen.

const provider = require('../city/ground_stadt.js');

/**
 * fundamentZellen(maske, bodenY) -> [[x, y, z], ...] je Maskenzelle von groundTopY+1 bis bodenY-1
 * (Reihenfolge: Zellen der Maske, je Zelle y aufsteigend). Zellen mit groundTopY >= bodenY-1 liefern nichts.
 */
function fundamentZellen(maske, bodenY) {
  const out = [];
  for (const [x, z] of maske.cells) {
    for (let y = provider.groundTopY(x, z) + 1; y <= bodenY - 1; y++) out.push([x, y, z]);
  }
  return out;
}

module.exports = { ...provider, provider, fundamentZellen };
