'use strict';
// Bibliothek für Wahrzeichen-Projekte (W0): Rahmen, Masken, Rollen, Boden, Projektfelder.

module.exports = {
  ...require('./rahmen.js'),
  ...require('./maske.js'),
  rollen: require('./rollen.js'),
  ...require('./rollen.js'),
  boden: require('./boden.js'),
  fundamentZellen: require('./boden.js').fundamentZellen,
  treppe: require('./treppe.js'),
  licht: require('./licht.js'),
  ...require('./licht.js'),
  ...require('./projekt.js'),
  campanile: require('./campanile.js')
};
