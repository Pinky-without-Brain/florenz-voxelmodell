'use strict';
// Modul 8 (optional): Verbindungsbogen zum Palazzo dell'Arte della Lana (Katalog §9), Maske M_BR = Way w1394931261
// (gehört diesem Projekt). Boden Lage 26 (Oberkante = Boden 1. OG), Wände 2 dick Lage 27..34, Decke Lage 35..36.
// Entscheidungen: Der Durchgang (5 breit, w 6..10, Lage 27..33) durchbricht die Westwand OG1 (Modul 3 lässt ihn aus) und die
// beiden östlichsten Spalten des Bogens (Zeilen w 7..10); die Zeile w 6 des Bogens bleibt Wand, weil ihre Nordseite im
// Freien liegt. Das Fenster über dem Bogenfeld B1 (Rahmenzeile Lage 33) gewinnt (K0), der Durchgang ist dort nur 6 hoch.
// Die Türlaibung (Katalog Teil 2) sind die Wandzellen w 5 und w 11 neben dem Durchgang (Lage 27..33), ohne Fensterzellen.
const WZ = require('../../../tools/wahrzeichen');
const O = require('../lib/om.js');
const { schliesse } = require('../lib/riss.js');
const boden = require('../../../tools/city/ground_stadt.js');

module.exports = {
  module: 8,
  build(ctx) {
    const L = O.lade();
    const B = L.bogen;
    const forte = WZ.typ('pietra_forte'), serena = WZ.typ('pietra_serena'), weiss = WZ.typ('marmor_weiss');
    const zellen = B.cells.map(([x, z]) => {
      const l = L.R.toLocal(x, z);
      return { x, z, ui: Math.floor(l.u + 0.5), wi: Math.floor(l.w + 0.5), d: B.d8(x, z) };
    });
    const umax = new Map();
    for (const c of zellen) umax.set(c.wi, Math.max(umax.has(c.wi) ? umax.get(c.wi) : -99, c.ui));
    const durch = (c, yr) => yr >= 27 && yr <= 33 && c.wi >= 7 && c.wi <= 10 && c.ui >= umax.get(c.wi) - 1;   // beide östlichsten Spalten

    // 1. Pontile: Boden, Wände (d <= 2 der Bogenmaske), Decke
    const pt = [];
    for (const c of zellen) pt.push({ x: c.x, y: O.Y(26), z: c.z, m: serena });
    for (let yr = 27; yr <= 34; yr++) for (const c of zellen) if (c.d <= 2 && !durch(c, yr)) pt.push({ x: c.x, y: O.Y(yr), z: c.z, m: forte });
    for (let yr = 35; yr <= 36; yr++) for (const c of zellen) pt.push({ x: c.x, y: O.Y(yr), z: c.z, m: forte });
    // Diagonalrisse der einzelligen Wandschicht schließen (BEGEHBARKEIT.md §1.4): Zusatzzellen im Bogen
    const bogenSet = new Set(zellen.map((c) => O.K(c.x, c.z)));
    const gesetzt = new Set(pt.map((b) => b.x + ',' + b.y + ',' + b.z));
    const byK = new Map(zellen.map((c) => [O.K(c.x, c.z), c]));
    const erl = (x, y, z) => {
      if (gesetzt.has(x + ',' + y + ',' + z)) return false;
      const yr = y - O.BODEN_Y, bc = byK.get(O.K(x, z));
      if (bc) return true;                                       // Randzellen des Bogens (Ecken der Wandschicht)
      const c = O.zelle(x, z);
      return !!c && O.durchgang(c, yr);              // Randzelle des Durchgangs in der Westwand (Modul 3 lässt sie aus)
    };
    const laibungFest = (x, y, z) => {                  // Türlaibung (Teil 2) zählt als fest
      const c = O.zelle(x, z), yr = y - O.BODEN_Y;
      return !!c && yr >= 27 && yr <= 33 && O.laibung(c, yr) && O.fensterInhalt(c, yr, O.OG1.f0, O.OG1.f1) === null && O.wappenIdx(c, yr, O.OG1.w0, O.OG1.w1) < 0;
    };
    const extra = schliesse(pt.map((b) => ({ x: b.x, y: b.y, z: b.z })), erl, laibungFest);
    for (const e of extra) pt.push({ x: e.x, y: e.y, z: e.z, m: forte });
    ctx.part('pontile').fill(pt, (x, y, z) => (y === O.Y(26) ? serena : forte));
    // Öffnungen: die Durchfahrt unter dem Bogen (Straße) und das offene Ende an der Projektgrenze (tor)
    const unter = [], ende = [];
    const xmin = Math.min(...zellen.map((c) => c.x));
    for (const c of zellen) {
      for (let y = boden.groundTopY(c.x, c.z) + 1; y < O.Y(26); y++) unter.push({ x: c.x, y, z: c.z });
      if (c.d >= 3 && c.x <= xmin + 1) for (let yr = 27; yr <= 34; yr++) ende.push({ x: c.x, y: O.Y(yr), z: c.z });
    }
    ctx.oeffnung(unter, 'arkade');
    ctx.oeffnung(ende, 'tor');

    // 2. Türlaibung in der Westwand OG1 (Fensterzellen gehören Modul 3)
    const lb = [];
    for (let yr = 27; yr <= 33; yr++) {
      for (const c of L.zellen) {
        if (!O.laibung(c, yr)) continue;
        if (O.fensterInhalt(c, yr, O.OG1.f0, O.OG1.f1) !== null || O.wappenIdx(c, yr, O.OG1.w0, O.OG1.w1) >= 0) continue;
        lb.push({ x: c.x, y: O.Y(yr), z: c.z });
      }
    }
    ctx.part('pontile_tuer').fill(lb, weiss);
  }
};
