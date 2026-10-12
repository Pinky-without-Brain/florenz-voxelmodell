'use strict';
// Uffizien Modul 4: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emit } = require('./_emit.js');

module.exports = {
  module: 4,
  build(ctx) {
    emit(ctx, ['suedbau_waende', 'serliana', 'durchgang_arno', 'verone_arno']);
  }
};
