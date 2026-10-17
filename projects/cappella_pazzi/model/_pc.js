'use strict';
// Primo Chiostro von Santa Croce (W7c, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/cappella_pazzi/): trecentesker Kreuzgang vor der Cappella de' Pazzi
// (ursprünglich zwei Höfe, ein rechteckiger vor der Kapelle und ein quadratischer; heute P-förmig, it.wikipedia). Freie Fläche des Stadtgrunds zwischen Konvent,
// Kapelle und dem Streifen w307539769, als Zusatzmaske `primo_chiostro` aus Rechtecken im Rahmen (θ 28,4°) angelegt.
// Arm u 12,5..134 × w 58..97,5 (Westarm = Hof des abgerissenen Inquisitionspalasts) und Lobus u 80..139 × w 97,5..128 (quadratischer Hof).
// Gartenhof mit Rasen und Wegekreuz, umlaufender Arkadengang (Rundbögen auf achteckigen Pfeilern, Stufe C) entlang der Konventwände, Grabplatten an der Nordseite,
// zwei Statuen (Dio Padre, Krieger) zwischen zehn Zypressen. Lagen yr = Y − 61. Bauplan als Zellen im Speicher; die Module 10-12 sind Teillisten.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { neuerPlan } = require('../../../tools/wahrzeichen/zellplan.js');
const GRUND = require('../spec/ground.js');

const DIR = path.resolve(__dirname, '..');
const BODEN_Y = 61;
const Y = (yr) => BODEN_Y + yr;

const T = {
  bruch: WZ.typ('pietra_forte_bruch'), rasen: WZ.typ('gruen_rasen'), weg: WZ.typ('gruen_weg'), pflaster: WZ.typ('pflaster'),
  serena: WZ.typ('pietra_serena'), ornament: WZ.typ('marmor_ornament'), putz: WZ.typ('putz_sand'), ziegel: WZ.typ('dachziegel'),
  weiss: WZ.typ('marmor_weiss'), alt: WZ.typ('marmor_weiss_alt'), dunkel: WZ.typ('kontrast_dunkel'), bronze: WZ.typ('bronze'),
  stamm: WZ.typ('gruen_stamm'), laub: WZ.typ('gruen_baum'), licht: WZ.typ('licht'), gold: WZ.typ('gold')
};

// ------------------------------------------------------------------ Maße (lokal, Blöcke; Maßstab 1:2)
const JOCH = 8, BREITE_BOGEN = 2.9, KAEMPFER = 5, PFEILER_H = 5, ARKADE_OBEN = 10, DACH = 11;   // Joch 8, Bogenhalbweite 2,9, Kämpfer Lage 5, Dach Lage 11
const TIEFE = 6, LINIE = 4.5;                                                                   // Tiefe des Gangs, Abstand der Pfeilerachse von der Außenkante
// Seiten des Arkadengangs (tang = Laufrichtung, kante = Kante der Maske, richtung = +1/−1 ins Innere)
const SEITEN = [
  { n: 'nord', tang: 'u', kante: 58, richtung: 1, t0: 12.5, t1: 124 },
  { n: 'sued_arm', tang: 'u', kante: 97.5, richtung: -1, t0: 12.5, t1: 80 },
  { n: 'west_arm', tang: 'w', kante: 12.5, richtung: 1, t0: 58, t1: 97.5 },
  { n: 'west_lobus', tang: 'w', kante: 80, richtung: 1, t0: 97.5, t1: 128 },
  { n: 'sued_lobus', tang: 'u', kante: 128, richtung: -1, t0: 80, t1: 139 },
  { n: 'ost_lobus', tang: 'w', kante: 139, richtung: -1, t0: 100, t1: 128 }
];
for (const s of SEITEN) s.linie = s.kante + s.richtung * LINIE;
const STATUEN = [{ u: 28, w: 72, typ: 'dio_padre' }, { u: 28, w: 84, typ: 'krieger' }];                 // Statuen im Westarm (Stufe C)
const ZYPRESSEN = [[22, 68], [22, 78], [22, 88], [34, 68], [34, 78], [34, 88], [28, 66], [28, 90], [40, 72], [40, 84]];   // zehn (it.wikipedia)
const WEG = { arm_w: 77.75, lobus_u: 109.5, halb: 1.1 };

let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const M = masken.masken.primo_chiostro, R = masken.rahmen;
  const alle = M.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, d8: M.d8(x, z), gt: GRUND.groundTopY(x, z) };
  });
  for (const c of alle) c.gang = gangVon(c);
  L = { json, masken, M, R, alle, byKey: new Map(alle.map((c) => [c.x + ',' + c.z, c])) };
  return L;
}
const koord = (s, c) => (s.tang === 'u' ? { n: c.w, t: c.u } : { n: c.u, t: c.w });
/** Seite des Arkadengangs, in deren Streifen die Zelle liegt (erste gewinnt), oder null. */
function gangVon(c) {
  for (const s of SEITEN) {
    const { n, t } = koord(s, c);
    const a = s.kante + (s.richtung > 0 ? 0 : -TIEFE), b = a + TIEFE;
    if (n >= a && n < b && t >= s.t0 && t < s.t1) return s;
  }
  return null;
}
/** Pfeiler / Bogenfeld der Linie einer Seite: { pfeiler: bool, hoehe: Lichte des Bogens (0 = Wandfeld) } oder null abseits der Linie. */
function linieVon(s, c) {
  const { n, t } = koord(s, c);
  const dn = n - s.linie;
  if (Math.abs(dn) >= 1.1) return null;
  const k = Math.round((t - s.t0 - 1.5) / JOCH), mitte = s.t0 + 1.5 + JOCH * k;
  const dt = t - mitte;
  if (Math.abs(dt) < 1.1 && Math.abs(dt) + Math.abs(dn) < 1.9) return { pfeiler: true, hoehe: 0 };
  const x = t - (mitte + JOCH / 2), xs = x < -JOCH / 2 ? x + JOCH : x;
  const h = Math.abs(xs) < BREITE_BOGEN ? KAEMPFER + Math.floor(Math.sqrt(BREITE_BOGEN * BREITE_BOGEN - xs * xs)) : 0;
  return { pfeiler: false, hoehe: h };
}
const weg = (c) => (c.u >= 18.5 && c.u < 124 && Math.abs(c.w - WEG.arm_w) < WEG.halb) || (c.w >= 97.5 && c.w < 122 && Math.abs(c.u - WEG.lobus_u) < WEG.halb);
const nahe = (c, u, w, r) => Math.abs(c.u - u) < r && Math.abs(c.w - w) < r;

// ------------------------------------------------------------------ Plan
let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const P = neuerPlan();
  const set = P.set;
  const bogen = [];

  for (const c of D.alle) {
    const { x, z } = c, s = c.gang;
    for (let y = c.gt + 1; y <= Y(-1); y++) set(x, y, z, T.bruch, 'chiostro_fundament');
    set(x, Y(0), z, s ? T.pflaster : (weg(c) ? T.weg : T.rasen), 'chiostro_boden');
    if (!s) continue;
    // Linie des Gangs (Pfeilerachse): Pfeiler, Bogenöffnungen, Wandfelder darüber
    const li = linieVon(s, c);
    for (let yr = 1; yr <= ARKADE_OBEN; yr++) {
      if (li && li.pfeiler && yr <= PFEILER_H) { set(x, Y(yr), z, yr === PFEILER_H ? T.ornament : T.serena, 'chiostro_pfeiler'); continue; }
      if (li && yr > (li.pfeiler ? PFEILER_H : li.hoehe)) { set(x, Y(yr), z, yr <= ARKADE_OBEN - 2 ? T.putz : T.serena, 'chiostro_bogen'); continue; }
      bogen.push([x, Y(yr), z]);                                      // Luft des Gangs: offen zum Garten (arkade)
    }
    set(x, Y(DACH), z, T.ziegel, 'chiostro_dach');
  }
  for (const [x, y, z] of bogen) if (!P.hat(x, y, z)) P.oeffnung('arkade', 'chiostro_bogen', x, y, z);

  // Grabplatten an der Nordseite (die Grabmäler des ersten Kreuzgangs wurden 1964-86 unter das Portikus der Nordseite verlegt)
  for (const c of D.alle) {
    if (c.gang !== SEITEN[0] || c.w < 59.5 || c.w >= 61.4 || c.u < 20 || c.u > 118) continue;
    const a = Math.floor(c.u / 3), b = Math.floor(c.w * 1.0);
    P.ersetze(c.x, Y(0), c.z, ((a + b) & 1) ? T.dunkel : T.alt, 'chiostro_grabplatten');
  }

  // Zypressen: plusförmige Säulen ohne Überhang (Stamm unten, Laub darüber), zehn Stück
  for (const [u, w] of ZYPRESSEN) {
    const mitte = D.alle.reduce((b, c) => (Math.hypot(c.u - u, c.w - w) < Math.hypot(b.u - u, b.w - w) ? c : b));
    for (const c of D.alle) {
      const du = Math.abs(c.u - mitte.u), dw = Math.abs(c.w - mitte.w);
      if (c.gang || du + dw > 1.2) continue;
      const kern = du + dw < 0.5;
      for (let yr = 1; yr <= (kern ? 9 : 8); yr++) set(c.x, Y(yr), c.z, yr <= 2 && kern ? T.stamm : T.laub, 'chiostro_zypressen');
    }
  }
  // Statuen: Sockel 3 × 3 (2 hoch) mit Figur ohne Überhang: Dio Padre (Marmor, sitzend, breiter Sitz) und Krieger (Bronze)
  for (const st of STATUEN) {
    const mitte = D.alle.reduce((b, c) => (Math.hypot(c.u - st.u, c.w - st.w) < Math.hypot(b.u - st.u, b.w - st.w) ? c : b));
    for (const c of D.alle) {
      const du = Math.abs(c.u - mitte.u), dw = Math.abs(c.w - mitte.w);
      if (c.gang || du > 1.6 || dw > 1.6) continue;
      for (let yr = 1; yr <= 2; yr++) set(c.x, Y(yr), c.z, T.serena, 'chiostro_statuen');
      if (st.typ === 'dio_padre' && du <= 1.1 && dw <= 1.1) set(c.x, Y(3), c.z, T.weiss, 'chiostro_statuen');       // Thron (Sitz)
      if (du < 0.5 && dw < 0.5) {
        const hoch = st.typ === 'dio_padre' ? [4, 5, 6, 7] : [3, 4, 5, 6, 7];
        for (const yr of hoch) set(c.x, Y(yr), c.z, st.typ === 'dio_padre' ? (yr === 7 ? T.alt : T.weiss) : T.bronze, 'chiostro_statuen');
      }
    }
  }

  // Seelaternen im Boden des Gangs (Raster 9), nur abseits der Pfeilerlinie
  {
    const steh = D.alle.filter((c) => c.gang && !linieVon(c.gang, c) && !P.get(c.x, Y(1), c.z) && P.get(c.x, Y(0), c.z) && P.get(c.x, Y(0), c.z).p === 'chiostro_boden')
      .map((c) => ({ x: c.x, y: Y(1), z: c.z }));
    for (const l of WZ.licht.lichtRaster(steh, { abstand: 9 })) P.ersetze(l.x, l.y, l.z, T.licht, 'chiostro_licht');
  }
  PLAN = P;
  return P;
}

module.exports = {
  modul: (n, ids) => ({ module: n, build(ctx) { return plan().modul(n, ids, plan).build(ctx); } }),
  lade, plan, Y, T, SEITEN, STATUEN, ZYPRESSEN, DACH, ARKADE_OBEN
};
