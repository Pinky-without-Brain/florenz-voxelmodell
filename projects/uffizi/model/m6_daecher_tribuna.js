'use strict';
// Uffizien Modul 6: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emit } = require('./_emit.js');

module.exports = {
  module: 6,
  build(ctx) {
    emit(ctx, ['dach_nebenbau', 'dach_fluegel', 'tribuna_tambour', 'tribuna_kuppel', 'tribuna_laterne']);
  }
};
