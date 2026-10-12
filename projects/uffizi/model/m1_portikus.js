'use strict';
// Uffizien Modul 1: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emit } = require('./_emit.js');

module.exports = {
  module: 1,
  build(ctx) {
    emit(ctx, ['portikus_pfeiler', 'portikus_saeulen', 'portikus_gebaelk', 'portikus_rueckwand', 'portikus_decke', 'stirnwaende']);
  }
};
