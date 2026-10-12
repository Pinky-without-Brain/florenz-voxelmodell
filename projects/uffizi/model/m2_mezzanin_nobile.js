'use strict';
// Uffizien Modul 2: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emit } = require('./_emit.js');

module.exports = {
  module: 2,
  build(ctx) {
    emit(ctx, ['mezzanin_wand', 'nobile_wand', 'gurtgesimse']);
  }
};
