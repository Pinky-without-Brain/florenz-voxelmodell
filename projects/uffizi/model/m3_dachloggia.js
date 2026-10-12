'use strict';
// Uffizien Modul 3: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emit } = require('./_emit.js');

module.exports = {
  module: 3,
  build(ctx) {
    emit(ctx, ['loggia_boden', 'loggia_pfeiler_saeulen', 'loggia_verglasung', 'loggia_rueckwand', 'kranzgesims']);
  }
};
