'use strict';
// Bauplan des Tempio Maggiore als Zellen im Speicher (Geometrie und Spalten in _tm.js); die Module m0..m6 sind Teillisten.
const WZ = require('../../../tools/wahrzeichen');
const kirche = require('../../../tools/wahrzeichen/kirche.js');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');
const TM = require('./_tm.js');
const { T, Y, FR, N4, N8, key, mod } = TM;

let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = TM.lade();
  const W = kirche.werkzeuge();
  const { set, hat, frei, istFrei, oeffnung, unzug, zellen, teile } = W;
  const infos = { tuerme: [] };

  // ---- Ecktürme: Schaft mit Wendeltreppe 5 × 5, Laterne mit Bogenöffnungen, Kupferkuppel mit Spitze (ohne Glocken)
  const gesimse = [];
  for (let yr = 3; yr <= 44; yr += 4) gesimse.push(yr, yr + 1);
  for (const tid of ['N', 'S']) {
    const tz = D.cells.filter((c) => c.tower === tid);
    const mk = WZ.Maske.vonZellen(tz.map((c) => [c.x, c.z]));
    const cells = tz.map((c) => ({ x: c.x, z: c.z, u: c.u, w: c.w, d8: mk.d8(c.x, c.z) }));
    const us = cells.map((c) => c.u), ws = cells.map((c) => c.w);
    const rect = { u0: Math.min(...us), u1: Math.max(...us) + 1, w0: Math.min(...ws), w1: Math.max(...ws) + 1 };
    // Tür zur Empore (Lagen 13..16) in der Wand zur Vorhalle, vor dem Bau des Schafts freigeben
    const tuerZellen = [];
    const byK = new Map(cells.map((c) => [P.ck(c.x, c.z), c]));
    for (const c of cells) {
      if (c.d8 > 2) continue;
      const wd = D.byKey.get(P.ck(c.x, c.z));
      if (wd.u < 3.2 || wd.u > 8.4) continue;
      if (tid === 'N' ? wd.w >= 10.2 : wd.w <= 51.8) tuerZellen.push(c);
    }
    for (const c of tuerZellen) for (let yr = 13; yr <= 16; yr++) oeffnung('tuer', 'campanile_schaft', c.x, Y(yr), c.z);
    const info = WZ.campanile.baueCampanile({
      cells, set, frei, istFrei, hat, oeffnung, unzug, Y, zellen, teile, key,
      T: { wand: T.trav, sockel: T.bruch, gesims: T.pomato, dach: T.kupfer, spitze: T.gold, holz: T.holz, glocke: T.bronze, fenster: T.fenster, licht: T.licht }
    }, {
      rect, top: 68, glocke0: 45, glocke1: 52, spitze0: 53, abschluss: 'kuppel', sockel: 0, gesimse,
      schlitze: { periode: 12, a: 5, b: 7, bis: 40 }, bogen: { anzahl: 1, breite: 4 }, lichtAbstand: 8, ohneGlocken: true,
      rolle: 'pietra_serena', zugang: { u: 6, w: tid === 'N' ? 14 : 47.5 }
    });
    // Bodenplatte der Empore im Turm: Ring um die Treppe auf Lage 12
    const m = info.mitte;
    let ring = 0;
    for (const c of cells) {
      if (c.d8 - 1 < 2) continue;
      if (Math.abs(c.x - m.x) <= 2 && Math.abs(c.z - m.z) <= 2) continue;
      if (set(c.x, Y(12), c.z, T.holz, 'turm_empore')) ring++;
    }
    infos.tuerme.push({ id: tid, mitte: m, ring, tueren: tuerZellen.length, rect });
  }

  // ---- Fundament und Boden
  for (const c of D.cells) {
    for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
    set(c.x, Y(0), c.z, TM.bodenTyp(c), 'boden');
  }

  // ---- Spalten: Wände, Decken, Dächer, Kuppel
  for (const c of D.cells) {
    if (c.tower) continue;
    const col = TM.buildCol(c);
    for (let yr = 1; yr <= col.top; yr++) {
      const d = col[yr];
      if (d === null || d === TM.AIR) continue;
      if (d === TM.CAV) { unzug('kuppel_aussen', 'Hohlraum zwischen Innen- und Außenschale der Kuppel (ohne Zugang)', c.x, Y(yr), c.z); continue; }
      const m = TM.matOf(c, yr, d);
      set(c.x, Y(yr), c.z, m.t, m.p);
    }
  }
  // Portale der Fassade deklarieren (Luftzellen der Hufeisenbögen)
  for (const c of D.cells) {
    if (!TM.istFassade(c)) continue;
    const col = TM.buildCol(c);
    for (let yr = 1; yr <= col.top; yr++) if (col[yr] === TM.AIR && c.u < 4.6) oeffnung('tor', 'fassade', c.x, Y(yr), c.z);
  }

  // ---- Licht: Seelaternen im Boden (Erdgeschoss, Empore, Nebenräume), höchstens 12 Blöcke Abstand
  const steh = [];
  for (const c of D.cells) {
    if (c.tower) continue;
    const col = TM.buildCol(c);
    for (const yb of [0, TM.GAL.boden]) {
      const fl = yb === 0 ? zellen.get(key(c.x, Y(0), c.z)) : zellen.get(key(c.x, Y(yb), c.z));
      if (!fl || (fl.p !== 'boden' && fl.p !== 'empore')) continue;
      if (yb > 0 && TM.galTyp(c) !== 'galerie') continue;
      if ([1, 2, 3].every((h) => col[yb + h] === TM.AIR)) steh.push({ x: c.x, y: Y(yb + 1), z: c.z });
    }
  }
  infos.lichter = kirche.licht(W, T, steh);

  // ---- Ausstattung
  require('./_tm_ausstattung.js').ausstatten({ W, D, TM, steh });

  PLAN = { zellen, teile, oeff: W.oeff, unz: W.unz, infos, W };
  return PLAN;
}

const modul = kirche.modul(plan, {});

module.exports = { plan, modul };
