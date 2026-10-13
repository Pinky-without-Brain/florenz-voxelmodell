'use strict';
// Uffizien Modul 7: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emitModul, unzugaenglich } = require('./_emit.js');
const { plan } = require('./_plan.js');

module.exports = {
  module: 7,
  build(ctx) {
    emitModul(ctx, 7);
    unzugaenglich(ctx, plan().dachraum, 'Dachboden zwischen Traufdecke und Walmdach der Flügel und Nebenbauten: leerer Dachraum ohne Ausstellung, ' +
      'im Original nur über Luken erreichbar; bleibt im Modell bewusst geschlossen');
  }
};
