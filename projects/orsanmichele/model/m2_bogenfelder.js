'use strict';
// Modul 2: Erdgeschoss, zugemauerte Bogenfelder mit Maßwerk (Katalog §3). 10 Felder, lokale Koordinate a = -7..7.
// Spitzbogen: Kämpfer y_rel 13, Scheitel 22, rho 9,15 (lib/om.js: yIn). Die Archivolte liegt auf den Pfeilern (Modul 1).
// Entscheidungen: Füllwandfuß liegt ab Lage 1 (Katalog: ab 3), damit die Wand nicht über dem Rücksprung schwebt;
// Türlaibung, Türsturz (Lage 13) und Türzellen gehen den Füllwänden vor (K0).
const WZ = require('../../../tools/wahrzeichen');
const O = require('../lib/om.js');
const { schliesse } = require('../lib/riss.js');

const LICHT_A = [-5, -4, -3, -1, 0, 1, 3, 4, 5];       // Lichten des Trifora
const LICHT_Y0 = 12, LICHT_Y1 = 18;                     // 7 hoch

module.exports = {
  module: 2,
  build(ctx) {
    const L = O.lade();
    const forte = WZ.typ('pietra_forte'), weiss = WZ.typ('marmor_weiss'), glas = WZ.typ('glas_fenster');
    const orn = WZ.typ('marmor_ornament'), holz = WZ.typ('holz');

    // Feldzellen mit Klasse (nur Bogenfelder)
    const felder = [];
    for (const c of L.zellen) {
      const r = O.ring(c);
      if (r && r.typ === 'feld') felder.push({ c, r });
    }
    const sammle = (fn) => {
      const out = [];
      for (const { c, r } of felder) fn(c, r, (yr, m) => { if (!O.laneZelle(c.x, c.z, yr)) out.push({ x: c.x, y: O.Y(yr), z: c.z, m }); });
      return out;
    };
    const fillM = (w, cells) => w.fill(cells, (x, y, z) => cells.map.get(`${x},${y},${z}`));
    const mit = (cells) => { cells.map = new Map(Array.from(cells).map((b) => [`${b.x},${b.y},${b.z}`, b.m])); return cells; };

    // 1. Füllwandfuß: d 3..6, y 1..11 (Lage 1..2 Fuß, 3..11 unter den Lichten), ohne Türzellen
    ctx.part('fuellwand_sockel').fill(
      sammle((c, r, put) => {
        if (r.ds < 3 || r.ds > 6) return;
        for (let yr = 1; yr <= 11; yr++) if (!O.tuer(r, yr, r.ds)) put(yr, forte);
      }), forte);

    // 2. Maßwerk: Füllwand d 3..6 von y 12 bis unter die Laibung; Trifora, Pfosten a = +-2, Vierpass (Kreuz) a -1..1, y 20..22
    const mw = mit(sammle((c, r, put) => {
      if (r.ds < 3 || r.ds > 6) return;
      const a = r.a, aa = Math.abs(a);
      for (let yr = 12; yr <= 24; yr++) {
        if (O.bogenBereich(a, yr) !== 'luft') continue;
        if (O.tuer(r, yr, r.ds)) continue;
        if (yr <= LICHT_Y1 && aa === 2) { put(yr, weiss); continue; }                   // Pfosten
        if (yr <= LICHT_Y1 && LICHT_A.includes(a)) { if (r.ds === 4) put(yr, glas); continue; }   // Lichten, Glas in d = 4
        const vierpass = r.ds === 3 && ((a === 0 && (yr === 20 || yr === 21)) || (aa === 1 && yr === 21));
        put(yr, vierpass ? orn : forte);
      }
    }));
    // Diagonalrisse der Maßwerkschicht schließen: Zusatzzelle in der Füllwand (d 3..6) neben dem Riss, Material der Wand
    const mwSet = new Set(Array.from(mw).map((b) => `${b.x},${b.y},${b.z}`));
    const byCol = new Map(felder.map(({ c, r }) => [O.K(c.x, c.z), r]));
    const extra = schliesse(Array.from(mw).map((b) => ({ x: b.x, y: b.y, z: b.z })), (x, y, z) => {
      const r = byCol.get(O.K(x, z));
      return !!r && r.ds >= 3 && r.ds <= 6 && !mwSet.has(`${x},${y},${z}`) && !O.tuer(r, y - O.BODEN_Y, r.ds) && !O.laneZelle(x, z, y - O.BODEN_Y);
    });
    for (const e of extra) { mw.push({ x: e.x, y: e.y, z: e.z, m: forte }); }
    mit(mw);
    fillM(ctx.part('fuellwand_masswerk'), mw);

    // 3. Spandrillen: d <= 2, a -7..7, y 14..26, oberhalb der Archivolte
    ctx.part('spandrillen').fill(sammle((c, r, put) => {
      if (r.ds > 2) return;
      for (let yr = 14; yr <= 26; yr++) if (O.bogenBereich(r.a, yr) === 'spandrille') put(yr, forte);
    }), forte);

    // 4. Archivolten: 2 Zellen über der Laibung, d 1..2, y 13..24
    ctx.part('bogenringe').fill(sammle((c, r, put) => {
      if (r.ds > 2) return;
      for (let yr = 13; yr <= 24; yr++) if (O.bogenBereich(r.a, yr) === 'ring') put(yr, weiss);
    }), weiss);

    // Arkaden: Luft der Bogenöffnungen in den Rücksprüngen (d 1..2) unter der Laibung; dahinter schließt die Füllwand (B3: deklariert, R14)
    const rueck = [];
    for (const { c, r } of felder) {
      if (r.ds > 2) continue;
      for (let yr = 1; yr <= 23; yr++) if (O.bogenBereich(r.a, yr) === 'luft') rueck.push({ x: c.x, y: O.Y(yr), z: c.z });
    }
    ctx.oeffnung(rueck, 'arkade');

    // 5. Statuettenträger am Bogenansatz (Kämpfer y 13, a = +-7, d = 1)
    ctx.part('statuetten_konsolen').fill(sammle((c, r, put) => {
      if (r.ds === 1 && Math.abs(r.a) === 7) put(13, orn);
    }), orn);

    // 6. Türen: Nord A1 (u 0) und Ost B1 (w 10), 5 breit, y 1..12 (B3: offene Portale ohne Flügel, Schätzung)
    const tz = mit(sammle((c, r, put) => {
      for (let yr = 3; yr <= 13; yr++) {
        const t = O.tuer(r, yr, r.ds);
        if (t === 'holz') put(yr, holz);
        else if (t === 'laibung') put(yr, weiss);
      }
    }));
    fillM(ctx.part('tueren'), tz);
    const tuerLuft = [];
    for (const { c, r } of felder) {
      if (r.ds < 3 || r.ds > 6) continue;
      for (let yr = 1; yr <= 12; yr++) if (O.tuer(r, yr, r.ds) === 'offen') tuerLuft.push({ x: c.x, y: O.Y(yr), z: c.z });
    }
    ctx.oeffnung(tuerLuft, 'tuer');
  }
};
