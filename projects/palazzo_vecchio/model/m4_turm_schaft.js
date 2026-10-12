'use strict';
// Modul 4: Turm der Signoria, Schaft (Katalog §5 mit K2). Der Unterbau y_rel 1..62 steht als erstes Bauteil hier,
// weil der Schaft auf den früher gebauten Außenwänden und Zinnen (Module 1..3) aufsetzt.
// Der Turmhohlraum bleibt von y_rel 1 bis 143 leer; die Abschlussdecke liegt auf y_rel 144.
const pv = require('./pv_lib.js');

// Lage einer Turmzelle im Turmrechteck (Fassadenrahmen: u 23,9..45,7, w 0..14,1)
const TU0 = 23.9, TU1 = 45.7, TW0 = 0, TW1 = 14.1, TUC = 34.8, TWC = 7.05;

module.exports = {
  module: 4,
  TU0, TU1, TW0, TW1, TUC, TWC,
  build(ctx) {
    const S = pv.state(ctx);
    const TY = pv.TY;
    const T = S.g.recs.filter((r) => r.zone === 'T');
    const band = T.filter((r) => r.dT <= 4);

    // 1) Unterbau: Turmwandband in y_rel 1..62; Zellen der Außenwände, des Ballatoio und der Zinnen sind schon belegt
    const ub = ctx.part('turm_unterbau');
    // (die Volumen der Außenwand samt ihren Öffnungen, d8 <= t(y), gehören den Modulen 1..3 und bleiben frei)
    S.band(ub, band, 1, 62, (r, y) => (y <= 56 && r.d8 <= pv.tWall(y) ? null : TY.pietra_forte), 'turm_unterbau');

    // 2) Schaft 63..104
    const s1 = ctx.part('schaft_63_104');
    S.band(s1, band, 63, 104, () => TY.pietra_forte, 'schaft_63_104');

    // 3) Schaft 105..144 mit je einem Schlitzfenster (1 x 6) pro Seite in y_rel 112..117 und 130..135
    const s2 = ctx.part('schaft_105_144');
    const schlitz = (r, y) => {
      if (!((y >= 112 && y <= 117) || (y >= 130 && y <= 135))) return false;
      const dw = Math.min(r.w - TW0, TW1 - r.w), du = Math.min(r.u - TU0, TU1 - r.u);
      return dw < du ? Math.abs(r.u - TUC) < 0.5 : Math.abs(r.w - TWC) < 0.5;
    };
    S.band(s2, band, 105, 144, (r, y) => (schlitz(r, y) ? null : TY.pietra_forte), 'schaft_105_144');

    // 4) Abschlussdecke y_rel 144 über dem Hohlraum
    const dk = ctx.part('schaft_abschlussdecke');
    S.band(dk, T.filter((r) => r.dT > 4), 144, 144, () => TY.pietra_forte, 'schaft_abschlussdecke');
  }
};
