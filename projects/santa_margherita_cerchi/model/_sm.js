'use strict';
// Santa Margherita de' Cerchi (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/santa_margherita_cerchi/).
// Kleine romanische Kirche, einschiffig, Giebelfassade mit Rundbogenportal und zwei Okuli, quadratische Apsis mit
// Tonnengewölbe, zwei Seitenaltäre, Hochaltar mit Altarbild von Neri di Bicci (it.wikipedia).
// Rahmen: θ = 0, iu = x − 39 (nach Osten, Fassade im Westen an der Via Santa Margherita), iw = z − 401 (nach Süden).
// Lagen yr = Y − 66: Boden 0, Schiff-Luft 1..11, Schiffsdecke 12, Dachhaut bis rH.
// Bauplan als Zellen im Speicher (tools/wahrzeichen/zellplan.js); die Module m0-m5 sind Teillisten.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { neuerPlan } = require('../../../tools/wahrzeichen/zellplan.js');
const GRUND = require('../spec/ground.js');

const DIR = path.resolve(__dirname, '..');
const BODEN_Y = 66, X0 = 39, Z0 = 401;
const Y = (yr) => BODEN_Y + yr;
const FR = (n) => WZ.fresko(n);
const T = {
  weiss: WZ.typ('marmor_weiss'), orn: WZ.typ('marmor_ornament'), saeule: WZ.typ('marmor_saeule'), alt: WZ.typ('marmor_weiss_alt'),
  forte: WZ.typ('pietra_forte'), rust: WZ.typ('pietra_forte_rustika'), serena: WZ.typ('pietra_serena'), mauer: WZ.typ('mauerwerk'),
  putz: WZ.typ('putz_weiss'), pflaster: WZ.typ('pflaster'), ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'), gold: WZ.typ('gold'),
  licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), bruch: WZ.typ('pietra_forte_bruch')
};

// ---------------------------------------------------------------- Geometrie
const SCHIFF_OBEN = 11, DECKE = 12;                     // Luft 1..11, Decke Lage 12
const BREITE = 18;                                       // iw 0..17
const APSIS = { u0: 18, u1: 22, w0: 5, w1: 12 };         // Innenraum der Apsis (8 breit, 5 tief)
const BOGEN_W = [5, 12];                                  // Triumphbogen in der Querwand iu 16..17
const PORTAL_W = [7, 10];                                 // Portal (4 breit)
const portalOben = (iw) => (iw === PORTAL_W[0] || iw === PORTAL_W[1] ? 6 : 7);
const rH = (c) => 13 + Math.floor(Math.max(0, Math.min(c.iw, BREITE - 1 - c.iw)) * 0.5);   // Dachhaut (Satteldach, First entlang u)
const apsisDecke = (iw) => { const d = Math.abs(iw - 8.5); return 7 + Math.floor(3.3 * Math.sqrt(Math.max(0, 1 - (d / 4) * (d / 4)))); };
const bogenOben = (iw) => { const d = Math.abs(iw - 8.5); return 5 + Math.floor(Math.sqrt(Math.max(0, 16 - d * d))); };

let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const H = masken.haupt;
  const alle = H.cells.map(([x, z]) => ({ x, z, iu: x - X0, iw: z - Z0, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z) }));
  const byKey = new Map(alle.map((c) => [c.x + ',' + c.z, c]));
  for (const c of alle) c.zone = zoneVon(c);
  L = { json, masken, H, alle, byKey };
  return L;
}
function zoneVon(c) {
  const { iu, iw } = c;
  if (iw >= BREITE || iw <= 1 || iw >= BREITE - 2 || iu >= 23) return iu <= 2 ? 'fassade' : 'wand';
  if (iu <= 2) return 'fassade';
  if (iu >= 16 && iu <= 17) return 'querwand';
  if (iu >= 18) return (iw >= APSIS.w0 && iw <= APSIS.w1) ? 'apsis' : 'massiv';
  return 'schiff';
}
const zelleBei = (x, z) => lade().byKey.get(x + ',' + z);
const istRaum = (c) => c && (c.zone === 'schiff' || c.zone === 'apsis');
const deckeHoehe = (c) => (c.zone === 'apsis' ? apsisDecke(c.iw) : DECKE);

// ---------------------------------------------------------------- Plan
let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const P = neuerPlan();
  const set = P.set;
  const X = (iu) => X0 + iu, Zz = (iw) => Z0 + iw;

  // Öffnungen vorab: Portal (Rundbogen, bis zum Boden offen), Triumphbogen
  for (const c of D.alle) {
    if (c.zone === 'fassade' && c.iw >= PORTAL_W[0] && c.iw <= PORTAL_W[1]) for (let yr = 1; yr <= portalOben(c.iw); yr++) P.oeffnung('tuer', 'fassade', c.x, Y(yr), c.z);
    if (c.zone === 'querwand' && c.iw >= BOGEN_W[0] && c.iw <= BOGEN_W[1]) for (let yr = 1; yr <= bogenOben(c.iw); yr++) P.luft(c.x, Y(yr), c.z);
  }
  // Fenster: Okulus über dem Portal (Achse) und linker Okulus (Nordseite), durch alle drei Lagen verglast
  const glas = new Set();
  for (const [cw, cy, r] of [[8.5, 9.5, 1.8], [3.5, 9.5, 1.2]]) {
    for (const c of D.alle) {
      if (c.zone !== 'fassade' || c.iu > 2) continue;
      for (let yr = 5; yr <= 14; yr++) if (Math.hypot(c.iw - cw, yr - cy) <= r) glas.add(c.x + ',' + yr + ',' + c.z);
    }
  }

  for (const c of D.alle) {
    const { x, z } = c;
    for (let y = c.gt + 1; y <= Y(-1); y++) set(x, y, z, T.bruch, 'fundament');
    set(x, Y(0), z, bodenTyp(c), 'boden');
    const top = rH(c);
    const raum = istRaum(c);
    const dh = raum ? deckeHoehe(c) : 0;
    for (let yr = 1; yr <= top; yr++) {
      if (P.istLuft(x, Y(yr), z)) continue;
      if (raum && yr < dh) continue;                                    // Luft
      let t, p;
      if (raum) {
        if (yr === dh) { t = c.zone === 'apsis' ? FR('hellblau') : (c.iu % 3 === 0 ? T.holz : T.putz); p = c.zone === 'apsis' ? 'gewoelbe_apsis' : 'decke'; }
        else if (c.zone === 'apsis' && yr <= SCHIFF_OBEN) { t = T.mauer; p = 'gewoelbe_apsis'; }
        else { t = yr === top ? T.ziegel : T.mauer; p = 'dach'; }
      } else if (yr <= SCHIFF_OBEN) { const w = wand(c, yr, P); t = w.t; p = w.p; }
      else if (c.zone === 'fassade') { t = c.iu === 0 ? giebel(c, yr) : T.mauer; p = 'fassade'; }
      else { t = yr === top ? T.ziegel : T.mauer; p = 'dach'; }
      if (glas.has(x + ',' + yr + ',' + z)) { t = T.fenster; p = 'fassade'; }
      set(x, Y(yr), z, t, p);
    }
  }
  require('./_sm_raeume.js').ausstatten({ P, D, T, FR, Y, X, Zz, zelleBei, istRaum });
  lichtSetzen(P, D);
  PLAN = P;
  return P;
}

function giebel(c, yr) { return yr === rH(c) ? T.rust : T.forte; }

// Wandzelle in Lage yr (1..11): Typ und Teil
function wand(c, yr, P) {
  const inner = innenAn(c, yr);
  if (c.zone === 'fassade') {
    if (c.iu === 0) {                                                    // Außenlage: Quader aus Pietra forte, Rahmen des Portals aus Pietra serena
      const rahmen = (c.iw === PORTAL_W[0] - 1 || c.iw === PORTAL_W[1] + 1) && yr <= 7 || (yr === portalOben(c.iw) + 1 && c.iw >= PORTAL_W[0] - 1 && c.iw <= PORTAL_W[1] + 1);
      if (rahmen) return { t: T.serena, p: 'fassade' };
      return { t: ((c.iw + yr) & 1) ? T.forte : T.rust, p: 'fassade' };
    }
    return { t: inner ? T.putz : T.mauer, p: 'fassade' };
  }
  if (c.zone === 'querwand') {
    const rand = c.iw >= BOGEN_W[0] - 1 && c.iw <= BOGEN_W[1] + 1 && yr <= bogenOben(Math.min(Math.max(c.iw, BOGEN_W[0]), BOGEN_W[1])) + 1;
    return { t: rand ? T.serena : (inner ? T.putz : T.mauer), p: 'aussenwaende' };
  }
  return { t: c.d8 === 1 ? T.forte : (inner ? T.putz : T.mauer), p: 'aussenwaende' };
}
// grenzt (4er) an eine Raumzelle, die in Lage yr Luft ist?
function innenAn(c, yr) {
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const n = zelleBei(c.x + dx, c.z + dz);
    if (istRaum(n) && yr < deckeHoehe(n)) return true;
    if (n && n.zone === 'querwand' && c.zone !== 'querwand' && false) return true;
  }
  return false;
}
function bodenTyp(c) {
  if (c.zone === 'apsis') return ((c.iu + c.iw) & 1) ? T.weiss : T.serena;
  if (c.zone === 'schiff') return (c.iw >= 7 && c.iw <= 10) ? T.serena : ((Math.floor(c.iu / 2) + Math.floor(c.iw / 2)) & 1 ? T.pflaster : T.ziegel);
  return T.pflaster;
}

// Seelaternen im Boden, Schiff und Apsis getrennt, Abstand höchstens 9
function lichtSetzen(P, D) {
  const gruppen = { schiff: [], apsis: [] };
  for (const c of D.alle) {
    if (!istRaum(c)) continue;
    const b = P.get(c.x, Y(0), c.z);
    if (!b || b.p !== 'boden') continue;
    if (P.hat(c.x, Y(1), c.z) || P.hat(c.x, Y(2), c.z) || P.hat(c.x, Y(3), c.z)) continue;
    gruppen[c.zone].push({ x: c.x, y: Y(1), z: c.z });
  }
  for (const zs of Object.values(gruppen)) for (const l of WZ.licht.lichtRaster(zs, { abstand: 9 })) P.ersetze(l.x, l.y, l.z, T.licht, 'licht');
}

module.exports = {
  modul: (n, ids) => ({ module: n, build(ctx) { return plan().modul(n, ids, plan).build(ctx); } }),
  lade, plan, zelleBei, Y, T, DECKE, X0, Z0, APSIS
};
