'use strict';
// Rolle -> Blocktyp für den Hausgenerator (V3, Palette A3). Die Rollen stehen in tools/spec/palette.js.

const ROLE_TYPE = Object.freeze({
  putz_ocker: 'yellow_terracotta',
  putz_gelb: 'smooth_sandstone',
  putz_rosa: 'pink_terracotta',
  putz_sand: 'end_stone_bricks',
  putz_weiss: 'white_concrete',
  putz_grau: 'light_gray_concrete',
  putz_terrakotta: 'orange_terracotta',
  pietra_forte: 'polished_andesite',
  pietra_serena: 'smooth_stone',
  pietra_forte_rustika: 'tuff_bricks',
  pietra_forte_bruch: 'tuff',
  dach: 'terracotta',
  dach_first: 'bricks',
  holz_sporto: 'spruce_planks',
  fensterladen: 'green_concrete',
  glas_fenster: 'gray_stained_glass',
  // Ergänzung C1: Fußböden und Terrassen
  pflaster: 'polished_tuff'
});

// Putzfarben der Akte -> Rolle
const PUTZ_ROLLE = Object.freeze({
  ocker: 'putz_ocker', gelb: 'putz_gelb', rosa: 'putz_rosa', sand: 'putz_sand',
  weiss: 'putz_weiss', grau: 'putz_grau', terrakotta: 'putz_terrakotta'
});

function typ(role) {
  const t = ROLE_TYPE[role];
  if (!t) throw new RangeError(`Unbekannte Material-Rolle: ${role}`);
  return t;
}

// Blocktyp des Wandputzes zur Akte-Farbe (null -> Sandfarbe)
function putzTyp(farbe) {
  return typ(PUTZ_ROLLE[farbe] || 'putz_sand');
}

module.exports = { ROLE_TYPE, PUTZ_ROLLE, typ, putzTyp };
