'use strict';
// Uffizien Modul 6: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emitModul, unzugaenglich } = require('./_emit.js');
const { plan } = require('./_plan.js');

module.exports = {
  module: 6,
  build(ctx) {
    emitModul(ctx, 6);
    unzugaenglich(ctx, plan().laterneInnen, 'Innenraum der Tribuna-Laterne über dem Scheitel der Kuppel: nur ein enger Wartungsraum, nicht für Besucher');
  }
};
