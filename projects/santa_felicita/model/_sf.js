'use strict';
// Gemeinsame Geometrie und Bauplan von Santa Felicita (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/santa_felicita/).
// Ein Bauplan für alle Module, erste Setzung gewinnt; Module sind Teillisten (modul(n, [...])).
//
// Rahmen SF (θ = 48,6°): u von der Fassade (Nordwesten, Piazza Santa Felicita) zum Chor (Südosten), w quer, w > 0 nach
// Südwesten, also rechts beim Eintreten. Lagen yr = Y − 66. Der Portikus (u 0..9) gehört dem Corridoio Vasariano
// (Pitti Modul 9, gemeinsame Geometrie `_portikus.js`); die Kirche beginnt mit ihrer Fassade bei u 9,2.
// Ruggieri-Bau (1736–39): ein Schiff mit Tonne und Stichkappen, drei Kapellen je Seite, Querhaus mit Vierungskuppel
// ohne Tambour, quadratische Cappella maggiore (Cigoli) mit Segelgewölbe; der Glockenturm ist die Torre dei Fifanti (w119180019).

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const PORT = require('./_portikus.js');
const BODEN_Y = 66;
const Y = (yr) => BODEN_Y + yr;

// ------------------------------------------------------------------ Maße (Referenzmaße §2/§3; Stufen dort)
const AX = 15.5;                                  // Achse des Schiffs (Mitte des Rechtecks w −1,6..32,5)
const U = { wand: 11.2, bay0: 11.2, bayLen: 12, quer0: 47.2, quer1: 64.1, chor0: 66.1 };
const NAVE_A = 8, ARK_A = 10;                     // Schiff |w − AX| < 8, Pfeilerwand 8..10, Kapellen und Querarme ab 10
const NV = { sp: 20, first: 36, traufe: 29 };     // Schiff: Kämpfer Lage 20, Tonne r 8, First 36
const KAP = { decke: 15, dachI: 22, dachA: 17 };
const ARM = { decke: 20, dachI: 27, dachA: 23 };
const VIER = { uc: (47.2 + 64.1) / 2, base: 24 };
const CH = { ac: 14.75, uc: 79, base: 22, top: 29, firstI: 38 };
const TURM = { rect: { u0: 92, u1: 105, w0: 7.2, w1: 22 }, glocke0: 28, glocke1: 36, spitze0: 37, top: 42, tuerW: 10.8 };

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), rustika: WZ.typ('pietra_forte_rustika'), mauer: WZ.typ('mauerwerk'),
  serena: WZ.typ('pietra_serena'), putz: WZ.typ('putz_weiss'), ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'),
  weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), gold: WZ.typ('gold'), sand: WZ.typ('putz_sand'),
  terrakotta: WZ.typ('putz_rosa'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), bronze: WZ.typ('bronze')
};
const FR = (n) => WZ.fresko(n);
const GLAS = PAL.typesForRole('glas');
const glas = (a, b) => GLAS[Math.abs(a * 5 + b * 3) % GLAS.length];

// ------------------------------------------------------------------ Laden
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt, C = masken.masken.campanile;
  const mk = (x, z, m, wo) => { const l = R.toLocal(x, z); return { x, z, u: l.u, w: l.w, a: Math.abs(l.w - AX), d8: m.d8(x, z), gt: GRUND.groundTopY(x, z), wo }; };
  const haupt = H.cells.map(([x, z]) => mk(x, z, H, 'kirche'));
  const camp = C.cells.map(([x, z]) => mk(x, z, C, 'campanile'));
  for (const c of haupt) c.zone = zone(c);
  for (const c of camp) c.zone = 'campanile';
  const byKey = new Map();
  for (const c of haupt.concat(camp)) byKey.set(P.ck(c.x, c.z), c);
  L = { json, masken, R, H, C, haupt, camp, alle: haupt.concat(camp), byKey };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

function zone(c) {
  if (c.u < U.wand) return 'fassade';
  if (c.u >= U.chor0) return 'chor';
  if (c.u >= U.quer1) return 'endwand';
  if (c.u < U.quer0) return c.a < NAVE_A ? 'schiff' : c.a < ARK_A ? 'arkade' : 'kapelle';
  return c.a < NAVE_A ? 'vierung' : c.a < ARK_A ? 'arkade' : 'arm';
}
const rel = (u) => (u - U.bay0) % U.bayLen;                       // Lage im Joch 0..12
const trennU = (u) => u >= U.bay0 && u < U.quer0 && rel(u) >= 10;  // Trennwand zwischen zwei Kapellen
const bayIdx = (u) => Math.max(0, Math.min(2, Math.floor((u - U.bay0) / U.bayLen)));
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);
const f1 = (t) => Math.sqrt(Math.max(0, 1 - Math.min(1, Math.abs(t))));
const capponi = (c) => c.zone === 'kapelle' && c.w > AX && bayIdx(c.u) === 0 && !trennU(c.u);

function decke(c) {
  switch (c.zone) {
    case 'schiff': return Math.floor(NV.sp + Math.sqrt(Math.max(0, 64 - c.a * c.a)));
    case 'vierung': { const r = Math.hypot(c.u - VIER.uc, c.a); return VIER.base + Math.floor(0.85 * Math.sqrt(Math.max(0, 72.25 - r * r))); }
    case 'kapelle': {
      if (!capponi(c)) return KAP.decke;
      const r = Math.hypot(c.u - 16.2, c.a - 12.5);                // Cappella Capponi (Brunelleschi): flache Kuppel auf Pendentifs
      return KAP.decke + Math.floor(3 * Math.sqrt(Math.max(0, 1 - r * r / 22)));
    }
    case 'arm': return ARM.decke;
    case 'chor': return Math.floor(CH.base + (CH.top - CH.base) * Math.max(f1((c.u - CH.uc) / 12), f1((c.w - CH.ac) / 10)));
    default: return null;
  }
}
function fassadeHoehe(c) { return Math.round(40 - 16 * Math.min(1, Math.abs(c.w - PORT.C) / 17)); }
function dach(c) {
  switch (c.zone) {
    case 'fassade': return fassadeHoehe(c);
    case 'schiff': case 'arkade': return Math.round(NV.first - (NV.first - NV.traufe) * Math.min(1, c.a / 8.5));
    case 'kapelle': return Math.round(KAP.dachI - (KAP.dachI - KAP.dachA) * Math.min(1, (c.a - ARK_A) / 7));
    case 'vierung': return Math.round(38 - 0.95 * Math.max(Math.abs(c.u - VIER.uc), c.a));
    case 'endwand': return c.a < ARK_A ? Math.round(38 - 0.95 * Math.max(Math.abs(c.u - VIER.uc), c.a)) : Math.round(ARM.dachI - (ARM.dachI - ARM.dachA) * Math.min(1, (c.a - ARK_A) / 7));
    case 'arm': return Math.round(ARM.dachI - (ARM.dachI - ARM.dachA) * Math.min(1, (c.a - ARK_A) / 7));
    case 'chor': return Math.round(CH.firstI - 6 * Math.min(1, Math.abs(c.w - CH.ac) / 11));
    default: return null;
  }
}
// Öffnung der Pfeilerwand zwischen Schiff und Kapellen/Querarmen: Rundbogen je Joch
function arkadeLai(u) {
  if (u < U.quer0) {
    if (rel(u) >= 10) return -1;
    const dx = rel(u) - 5;
    return Math.abs(dx) < 4.4 ? Math.floor(9 + Math.sqrt(4.4 * 4.4 - dx * dx)) : -1;
  }
  if (u >= U.quer1) return -1;
  const dx = u - VIER.uc;
  return Math.abs(dx) < 6.45 ? Math.floor(10 + Math.sqrt(6.45 * 6.45 - dx * dx)) : -1;
}

// ------------------------------------------------------------------ Bilder als Farbfelder (ersetzen Zellen der inneren Wandlage)
const FARBEN = { H: 'hellblau', B: 'blau', G: 'gelb', O: 'orange', R: 'rot', N: 'gruen', K: 'braun', W: 'weiss', S: 'schwarz' };
// Pontormo, Kreuzabnahme (1525–28): helle Rosa-, Blau- und Grüntöne in einer Gruppe um den Leichnam
const DEPOSIZIONE = ['...HHBH...', '..HOHBOH..', '.HNOWWOGH.', '.HGOWWOBH.', '.NGOWWOHN.', '..GOWWOG..', '..KOOHHK..', '...GOOG...', '...KGGK...'];
// Pontormo, Verkündigung (zwei Felder links und rechts des Fensters): Gabriel in Rosa/Gelb, Maria in Blau/Rot
const GABRIEL = ['.H.', 'HOH', 'OGO', 'OGO', 'GOG', 'KGK', 'KGK'];
const MARIA = ['.B.', 'BWB', 'BRB', 'BRB', 'RBR', 'KRK', 'KRK'];
// Poccetti, Fresken der Cappella Canigiani (1589–90)
const POCCETTI = ['RRGGOOHH', 'RGGOOHHB', 'GOOKKHBB', 'OOKWWKBB', 'OKWWWWKB', 'OOKWWKNB', 'GOOKKNNN', 'RGGOONNH', 'RRGGOOHH'];
// Ciseri, Martyrium der Makkabäer (1863), 3. Kapelle rechts
const CISERI = ['RRRBBBBRRR', 'RKKBBBBKKR', 'RKWWKKWWKR', 'GKWOKKOWKG', 'GKKOGGOKKG', 'NNKGGGGKNN', 'NNNKKKKNNN', 'KKKKKKKKKK'];
const TOSINI = ['HHGGHH', 'HOWWOH', 'GOWWOG', 'NOWWON', 'KNOONK', 'KKGGKK'];       // Begegnung von Anna und Joachim (Tosini)
const FRANCESCHINI = ['BBHHBB', 'BOWWOB', 'HOWWOH', 'GWOOWG', 'KGWWGK', 'KKGGKK'];  // Himmelfahrt (Franceschini, 1677)
const BRINA = ['HHBBBBHH', 'HGWWWWGH', 'BGOWWOGB', 'BGOWWOGB', 'NGKWWKGN', 'NKKGGKKN', 'KKKKKKKK'];  // Altarbild der Cappella maggiore (Brina zugeschrieben)

// ------------------------------------------------------------------ Bauplan
let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const zellen = new Map(), teile = new Map();
  const key = (x, y, z) => x + ',' + y + ',' + z;
  const luft = new Set();
  const set = (x, y, z, t, p, force) => {
    const k = key(x, y, z);
    if (zellen.has(k) || (!force && luft.has(k))) return false;
    zellen.set(k, { x, y, z, t, p });
    let a = teile.get(p); if (!a) teile.set(p, a = []); a.push(k);
    return true;
  };
  const hat = (x, y, z) => zellen.has(key(x, y, z));
  const frei = (x, y, z) => luft.add(key(x, y, z));
  const istFrei = (x, y, z) => luft.has(key(x, y, z));
  const oeff = new Map();
  const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); frei(x, y, z); };
  const unz = new Map();
  const unzug = (p, b, x, y, z) => { const k = p + '|' + b; if (!unz.has(k)) unz.set(k, []); unz.get(k).push({ x, y, z }); };
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const N8 = N4.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
  const zoneBei = (x, z) => { const n = zelleBei(x, z); return n ? n.zone : null; };
  // Zelle in ein anderes Bauteil (und anderes Material) verschieben
  const umteil = (x, y, z, t, p) => {
    const k = key(x, y, z), e = zellen.get(k);
    if (!e) return false;
    teile.set(e.p, teile.get(e.p).filter((q) => q !== k));
    e.t = t; e.p = p;
    let a = teile.get(p); if (!a) teile.set(p, a = []); a.push(k);
    return true;
  };

  const D_ = new Map();
  for (const c of D.haupt) D_.set(P.ck(c.x, c.z), dach(c));
  const dachBei = (x, z) => D_.get(P.ck(x, z));

  // ---- Öffnungen: Hauptportal in der Fassade (Rundbogen 8 breit, Scheitel Lage 12)
  const fa = (c) => c.w - PORT.C;
  for (const c of D.haupt) {
    if (c.zone !== 'fassade') continue;
    for (let yr = 1; yr <= rund(8, fa(c), 4); yr++) oeffnung('tor', 'portale', c.x, Y(yr), c.z);
  }

  // ---- Campanile (Torre dei Fifanti): Zugang vom Chor, Wendeltreppe, Glockenstube, Pyramidendach
  const camp = WZ.campanile.baueCampanile({
    cells: D.camp, set, frei, istFrei, hat, oeffnung, unzug, Y, zellen, teile, key,
    T: { wand: T.mauer, sockel: T.rustika, gesims: T.serena, dach: T.ziegel, spitze: T.bronze, holz: T.holz, glocke: T.bronze, fenster: T.fenster, licht: T.licht }
  }, {
    rect: TURM.rect, top: TURM.top, glocke0: TURM.glocke0, glocke1: TURM.glocke1, spitze0: TURM.spitze0, abschluss: 'pyramide', sockel: 0,
    gesimse: [TURM.glocke0 - 1], bogen: { anzahl: 2, breite: 2 }, kleineGlocken: 0, lichtAbstand: 8,
    zugang: { u: TURM.rect.u0, w: TURM.tuerW }
  });
  // Gegenstück in der Chorostwand: Tür 3 × 4 zum Turm
  for (const c of D.haupt) {
    if (c.zone !== 'chor' || c.u < 88 || c.d8 > 3 || c.w < TURM.tuerW - 1.5 || c.w > TURM.tuerW + 2) continue;
    for (let yr = 1; yr <= 4; yr++) oeffnung('tuer', 'turmtuer', c.x, Y(yr), c.z);
  }

  // ---- Modul 0: Fundament und Boden
  for (const c of D.alle) for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
  for (const c of D.alle) {
    let t = T.terrakotta;
    if (c.zone === 'schiff' || c.zone === 'vierung') t = ((Math.floor(c.u / 3) + Math.floor((c.w + 60) / 3)) % 2) ? T.serena : T.weiss;
    else if (c.zone === 'chor') t = T.weiss;
    else if (c.zone === 'campanile') t = T.bruch;
    set(c.x, Y(0), c.z, t, 'boden');
  }

  // ---- Modul 1: Fassade (a capanna), Außenwände und Fenster
  const fensterAussen = (c, yr) => {
    if (c.zone === 'fassade') {
      const af = Math.abs(fa(c));
      if (af <= 6.5 && yr >= PORT.FENSTER.y0 - 66 && yr <= PORT.FENSTER.y1 - 66) return true;                // Balkonfenster zum Corridoio (Palco der Medici)
      if (Math.abs(af - 8.5) < 0.9 && yr >= 5 && yr <= rund(8, af - 8.5, 0.9) + 1) return true;           // Monofore für die Eingangskapellen
      if (Math.abs(af - 13) < 1.4 && yr >= 24 && yr <= 27) return true;                                   // zwei niedrige Bogenfenster im Giebelfeld
      return false;
    }
    if (c.zone === 'kapelle') { if (bayIdx(c.u) === 0 || (bayIdx(c.u) === 2 && c.w > AX)) return false; const dx = rel(c.u) - 5; return Math.abs(dx) < 1.4 && yr >= 5 && yr <= rund(9, dx, 1.4) + 2; }
    if (c.zone === 'arm') return Math.abs(c.u - VIER.uc) < 1.4 && yr >= 9 && yr <= rund(14, c.u - VIER.uc, 1.4) + 3;
    if (c.zone === 'chor') return c.u < 88 && (Math.abs(c.u - 73) < 1.5 || Math.abs(c.u - 85) < 1.5) && yr >= 12 && yr <= 20;
    return false;
  };
  for (const c of D.haupt) {
    if (c.d8 > 2 && c.zone !== 'fassade') continue;
    const top = dachBei(c.x, c.z); if (top == null) continue;
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || istFrei(c.x, Y(yr), c.z)) continue;
      if (fensterAussen(c, yr)) { set(c.x, Y(yr), c.z, glas(Math.round(c.u), yr), 'fenster'); continue; }
      let t = c.d8 === 1 ? T.sand : T.putz;
      if (c.zone === 'fassade') {
        const af = Math.abs(fa(c));
        if (yr === 22 || yr === 23 || yr === top - 1) t = T.serena;                                     // Gebälk über dem Corridoio und Giebelkante
        else if (af < 1.2 && yr >= 29 && yr <= 33) t = T.weiss;                                          // Wappenfeld im Giebel
      } else if (c.d8 === 1 && yr <= 2) t = T.serena;
      set(c.x, Y(yr), c.z, t, c.zone === 'fassade' ? 'fassade' : 'aussenwaende');
    }
  }

  // ---- Modul 2: Pfeilerwände mit Rundbögen, Trennwände der Kapellen, Triumphbogen zur Cappella maggiore
  for (const c of D.haupt) {
    if (c.d8 <= 2 && c.zone !== 'arkade') continue;
    let wand = null;
    if (c.zone === 'arkade') wand = 'arkaden';
    else if (c.zone === 'kapelle' && c.d8 > 2 && trennU(c.u)) wand = 'kapellenwaende';
    else if (c.zone === 'endwand' && c.d8 > 2) wand = 'triumphbogen';
    if (!wand) continue;
    const top = dachBei(c.x, c.z); if (top == null) continue;
    const lai = c.zone === 'arkade' ? arkadeLai(c.u) : c.zone === 'endwand' ? rund(18, c.w - CH.ac, 6.5) : -1;
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || istFrei(c.x, Y(yr), c.z)) continue;
      if (yr <= lai) continue;
      // Obergaden: große Rundbogenfenster über den Kapellendächern, je Joch ein Fenster
      if (c.zone === 'arkade' && c.u < U.quer0 && yr >= 23 && yr <= 27 && Math.abs(rel(c.u) - 5) < 1.8 && yr <= 24 + Math.round(Math.sqrt(Math.max(0, 3.2 - (rel(c.u) - 5) ** 2)) * 1.5) + 1) {
        set(c.x, Y(yr), c.z, glas(Math.round(c.u), yr), wand); continue;
      }
      set(c.x, Y(yr), c.z, yr <= lai + 1 ? T.serena : (c.zone === 'arkade' && yr <= 14 ? T.serena : T.putz), wand);
    }
  }

  // ---- Modul 3: Gewölbe und Decken, Dächer; Dachräume unzugänglich
  for (const c of D.haupt) {
    if (c.zone === 'fassade' || c.d8 <= 2) continue;
    const dk = decke(c), top = dachBei(c.x, c.z);
    if (dk == null || top == null) continue;
    let lo = dk;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); if (n && n.wo === 'kirche' && n.d8 > 2) { const nd = decke(n); if (nd != null && nd < lo) lo = nd; } }
    let nbDach = Infinity;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < nbDach) nbDach = n; }
    for (let yr = lo; yr <= dk; yr++) if (!hat(c.x, Y(yr), c.z) && !istFrei(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, yr > nbDach ? T.mauer : T.putz, 'gewoelbe');
    for (let yr = dk + 1; yr < top; yr++) if (!hat(c.x, Y(yr), c.z) && !istFrei(c.x, Y(yr), c.z)) unzug('daecher', 'Dachraum über Gewölben und Decken (ohne Zugang)', c.x, Y(yr), c.z);
  }
  for (const c of D.haupt) {
    if (c.zone === 'fassade') continue;
    const top = dachBei(c.x, c.z);
    if (top == null) continue;
    let lo = top;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < lo && zoneBei(c.x + dx, c.z + dz) !== 'fassade') lo = n; }
    for (let yr = lo; yr <= top; yr++) if (!hat(c.x, Y(yr), c.z) && !istFrei(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.mauer, yr >= top - 1 ? 'daecher' : 'schildwaende');
  }

  // ---- Modul 6: Ausstattung nach Quellen (Katalog §3)
  // Farbfeld auf der Innenseite einer Wand: Ebene (|Koordinate − ebene| < 1,2, Wandzellen mit d8 = 2), s0..s1 entlang der Wand,
  // Muster von oben nach unten ab Unterkante y0 (Rahmen aus Gold rundum, '.' lässt die Wand stehen)
  const bild = (opt) => {
    const { achse, ebene, s0, s1, y0, muster, teil, zonen } = opt;
    const zeilen = muster.length, spalten = muster[0].length;
    let n = 0;
    for (const c of D.haupt) {
      if (c.d8 !== 2 || (zonen && !zonen.includes(c.zone))) continue;
      const pl = achse === 'w' ? c.w : c.u, s = achse === 'w' ? c.u : c.w;
      if (Math.abs(pl - ebene) > 1.2 || s < s0 || s >= s1) continue;
      for (let yr = y0; yr < y0 + zeilen + 2; yr++) {
        const ry = yr - y0 - 1;                    // 0..zeilen−1 von unten
        let t;
        const col = Math.min(spalten - 1, Math.floor((s - s0) / (s1 - s0) * spalten));
        if (ry < 0 || ry >= zeilen || col === 0 || col === spalten - 1) t = T.gold;
        else { const ch = muster[zeilen - 1 - ry][col]; t = ch === '.' ? null : FR(FARBEN[ch]); }
        if (t == null) continue;
        const e = zellen.get(key(c.x, Y(yr), c.z));
        if (!e || (e.p !== 'aussenwaende' && e.p !== 'fassade' && e.p !== 'kapellenwaende' && e.p !== 'arkaden')) continue;
        if (umteil(c.x, Y(yr), c.z, t, teil)) n++;
      }
    }
    return n;
  };
  bild({ achse: 'w', ebene: 30.5, s0: 11.8, s1: 20.6, y0: 3, muster: DEPOSIZIONE, teil: 'capponi_kreuzabnahme', zonen: ['kapelle'] });
  bild({ achse: 'u', ebene: 10.6, s0: 26.1, s1: 28.6, y0: 4, muster: GABRIEL, teil: 'capponi_verkuendigung', zonen: ['fassade', 'kapelle'] });
  bild({ achse: 'u', ebene: 10.6, s0: 29.1, s1: 31.6, y0: 4, muster: MARIA, teil: 'capponi_verkuendigung', zonen: ['fassade', 'kapelle'] });
  bild({ achse: 'w', ebene: 0.5, s0: 12.2, s1: 20.2, y0: 3, muster: POCCETTI, teil: 'canigiani_fresken', zonen: ['kapelle'] });
  bild({ achse: 'w', ebene: 30.5, s0: 36.2, s1: 44.2, y0: 3, muster: CISERI, teil: 'ciseri_makkabaeer', zonen: ['kapelle'] });
  bild({ achse: 'w', ebene: 29.3, s0: 52.6, s1: 58.6, y0: 3, muster: TOSINI, teil: 'tosini_begegnung', zonen: ['arm'] });
  bild({ achse: 'w', ebene: 0.5, s0: 52.6, s1: 58.6, y0: 3, muster: FRANCESCHINI, teil: 'franceschini_himmelfahrt', zonen: ['arm'] });
  bild({ achse: 'u', ebene: 90.2, s0: 14.2, s1: 22.2, y0: 5, muster: BRINA, teil: 'hochaltar_cigoli', zonen: ['chor'] });
  for (const c of D.haupt) {   // Fresko des Segelgewölbes der Cappella maggiore (Cinganelli, um 1620)
    if (c.zone !== 'chor' || c.d8 <= 2) continue;
    const dk = decke(c);
    const e = zellen.get(key(c.x, Y(dk), c.z));
    if (!e || e.p !== 'gewoelbe') continue;
    const farbe = ['hellblau', 'blau', 'gelb', 'orange'][(Math.floor(c.u / 3) + Math.floor(c.w / 3)) % 4];
    if (Math.abs(c.u - CH.uc) < 4 && Math.abs(c.w - CH.ac) < 4) umteil(c.x, Y(dk), c.z, FR('gelb'), 'chorgewoelbe_fresko');
    else if ((Math.floor(c.u / 3) + Math.floor(c.w / 3)) % 2 === 0) umteil(c.x, Y(dk), c.z, FR(farbe), 'chorgewoelbe_fresko');
  }
  const quader = (u0, u1, w0, w1, y0, y1, t, p) => {
    for (const c of D.haupt) {
      if (c.u < u0 || c.u >= u1 || c.w < w0 || c.w >= w1) continue;
      for (let yr = y0; yr <= y1; yr++) set(c.x, Y(yr), c.z, typeof t === 'function' ? t(yr) : t, p);
    }
  };
  quader(13.5, 19.5, 28.4, 29.8, 1, 2, T.weiss, 'capponi_altar');
  quader(13.5, 19.5, 28.4, 29.8, 3, 3, T.gold, 'capponi_altar');
  quader(86.5, 88.5, 15.2, 20.2, 1, 3, (yr) => (yr === 3 ? T.gold : T.weiss), 'hochaltar_cigoli');
  // Palco der Medici (coretto): hölzerne Loge an der Eingangswand über den Eingangskapellen, Boden Lage 12 (Gangboden des Corridoio)
  const palco = (c) => c.zone === 'schiff' && c.u < 14.2 && Math.abs(fa(c)) <= 6.5;
  for (const c of D.haupt) {
    if (!palco(c)) continue;
    set(c.x, Y(12), c.z, T.holz, 'palco_medici');
    if (c.u < 12.4) set(c.x, Y(11), c.z, T.holz, 'palco_medici');                                // Konsolen unter dem Boden
    const rand = c.u >= 13.2 || Math.abs(fa(c)) > 5.5;
    if (rand) set(c.x, Y(13), c.z, T.holz, 'palco_medici');                                      // Brüstung
    for (let yr = 13 + (rand ? 1 : 0); yr <= 15; yr++) unzug('palco_medici', 'Loge der Medici (Zugang nur vom Corridoio Vasariano, einem anderen Projekt)', c.x, Y(yr), c.z);
  }

  // ---- Modul 5: Licht
  const steh = [];
  for (const c of D.alle) {
    if (c.zone === 'campanile') continue;
    const b = zellen.get(key(c.x, Y(0), c.z));
    if (b && b.p === 'boden' && !hat(c.x, Y(1), c.z) && !hat(c.x, Y(2), c.z)) steh.push({ x: c.x, y: Y(1), z: c.z });
  }
  const lt = [];
  for (const l of WZ.lichtRaster(steh, { abstand: 12 })) {
    const k = key(l.x, l.y, l.z); const e = zellen.get(k); if (!e) continue;
    teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = 'licht'; lt.push(k);
  }
  teile.set('licht', lt);

  PLAN = { zellen, teile, oeff, unz, camp };
  return PLAN;
}

const OEFF_TEIL = { portale: 'fassade', turmtuer: 'aussenwaende' };
function modul(n, liste) {
  return {
    module: n,
    build(ctx) {
      const Pl = plan();
      for (const id of liste) {
        const keys = Pl.teile.get(id) || [];
        if (!keys.length) continue;
        const cells = keys.map((k) => Pl.zellen.get(k));
        const typ = new Map(cells.map((c) => [c.x + ',' + c.y + ',' + c.z, c.t]));
        ctx.part(id).fill(cells, (x, y, z) => typ.get(x + ',' + y + ',' + z));
        for (const [k, z] of Pl.oeff) { const [art, pp] = k.split('|'); if ((OEFF_TEIL[pp] || pp) === id) ctx.oeffnung(z, art); }
        for (const [k, z] of Pl.unz) { const i = k.indexOf('|'); if (k.slice(0, i) === id) ctx.unzugaenglich(z, k.slice(i + 1)); }
      }
    }
  };
}

module.exports = { modul, lade, plan, zelleBei, zone, decke, dach, Y, BODEN_Y, T, AX, U, NV, KAP, ARM, VIER, CH, TURM, PORT };
