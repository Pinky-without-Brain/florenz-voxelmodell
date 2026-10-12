'use strict';
// Rollen und Freskenfarben (Palette: tools/spec/palette.js).

const palette = require('../spec/palette.js');

/** typ(rolle) -> erster Blocktyp der Rolle; wirft bei unbekannter Rolle. */
function typ(rolle) {
  const t = palette.typesForRole(rolle);
  if (!t.length) throw new Error(`Unbekannte Rolle "${rolle}" (keine Palette-Type)`);
  return t[0];
}

const FRESKO = {
  rot: 'red_terracotta', weiss: 'white_terracotta', blau: 'blue_terracotta', hellblau: 'light_blue_terracotta',
  gelb: 'yellow_terracotta', orange: 'orange_terracotta', gruen: 'green_terracotta', braun: 'brown_terracotta',
  schwarz: 'black_concrete'
};

/** fresko(farbe) -> Keramik-Type der Rolle "fresko"; Farben: rot, weiss, blau, hellblau, gelb, orange, gruen, braun, schwarz. */
function fresko(farbe) {
  const t = FRESKO[farbe];
  if (!t) throw new Error(`Unbekannte Freskenfarbe "${farbe}" (erlaubt: ${Object.keys(FRESKO).join(', ')})`);
  if (!palette.rolesOf(t).includes('fresko')) throw new Error(`Palette: ${t} hat keine Rolle fresko`);
  return t;
}

module.exports = { typ, fresko, FRESKO_FARBEN: Object.keys(FRESKO) };
