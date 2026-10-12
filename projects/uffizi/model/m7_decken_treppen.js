'use strict';
// Uffizien Modul 7: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emit } = require('./_emit.js');

module.exports = {
  module: 7,
  build(ctx) {
    emit(ctx, ['decke_14', 'decke_20', 'decke_36', 'decke_traufe', 'spinnwand_fluegel', 'treppen', 'korridor_treppe']);
  }
};
