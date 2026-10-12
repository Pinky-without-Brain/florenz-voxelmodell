'use strict';
// Uffizien Modul 5: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emit } = require('./_emit.js');

module.exports = {
  module: 5,
  build(ctx) {
    emit(ctx, ['rueckseiten_sockel', 'rueckseiten_wand', 'rueckseiten_gesims', 'loggia_anschluss', 'ostnord_front']);
  }
};
