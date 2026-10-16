'use strict';
// Gemeinsame Geometrie und Bauplan von San Lorenzo mit den Cappelle Medicee
// (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/san_lorenzo/). Ein Bauplan für alle Module, erste Setzung gewinnt.
//
// Rahmen SL: u von der Fassade (Osten, Piazza San Lorenzo) zum Chor und zur Cappella dei Principi (Westen),
// w quer (w > 0 Norden). wc = w + 2,5: Abstand zur Mittelachse des Langhauses. Lagen yr = Y − 67.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');   // Gelände mit Aushub (Kirche bis Y 66, Principi bis Y 60)
const BODEN_Y = 67;
const Y = (yr) => BODEN_Y + yr;
const WC0 = -2.5;                         // Mittelachse des Langhauses (OSM-Teil w673454455: w −15..10)

// ------------------------------------------------------------------ Maße (Referenzmaße §2/§3)
const U_FASS = 3;                         // Fassade u 0..3
const U_VIER0 = 112, U_VIER1 = 138;       // Vierung (26 × 26 Blöcke = 13 m = zwei Module)
const U_CHOR1 = 158;                      // Chorende
const JOCH = (U_VIER0 - U_FASS) / 7;      // 7 Langhausjoche
const SAEULEN_U = [1, 2, 3, 4, 5, 6].map((k) => U_FASS + k * JOCH);
const W_SAEULE0 = 12, W_SAEULE1 = 14;     // Säulenreihe |wc| in [12, 14)
const W_KAP0 = 25, W_KAP1 = 26.5;         // Kapellenpfeiler-Linie
const KAEMPFER = 17;                      // Säule 1..14, Kapitell 15, Kämpferaufsatz 16
const DECKE = 42;                         // Kassettendecke Mittelschiff, Querhaus, Chor
const TRAUFE = 46, FIRST = 54;            // Mittelschiff/Querhaus/Chor
const S_TRAUFE_I = 32, S_TRAUFE_A = 27;   // Pultdach der Seitenschiffe (innen/außen)
const S_GEWOELBE = 19;                    // Hängekuppeln der Seitenschiffe: Kämpfer 19, Scheitel 24
const K_DECKE = 16;                       // Kapellen
const VIER_M = { u: 125, wc: 0 };         // Vierungskuppel
const TAMBUR0 = 48, KUPPEL0 = 58, R_KI = 12.5, R_KA = 14.5;
const SAK_ALT = { u: 144.4, w: -54.5, ri: 11.5, wand: 24 };   // Kreis w673454442
const SAK_NEU = { u: 144.0, w: 55.0, ri: 11.5, wand: 26 };
const OKT = { u: 201, w: -2.3, innen: 28, aussen: 34.5, wand: 50, tambur: 66, kuppel: 104, laterne: 112 };
const KRYPTA0 = -6, KRYPTA1 = -2;
// Campanile (Ferdinando Ruggieri 1740–41, 54 m; Lage: neben der Sagrestia Nuova am Nordende des Querhauses, Stufe C)
// Gelände dort Y 63–64, Boden des Turms Y 67 (wie die Kirche); 54 m = 108 Blöcke ab Gelände 63 -> Oberkante Y 171 = Lage 104.
const CAMP = { rect: { u0: 114, u1: 128, w0: 51, w1: 67 }, u: 121, top: 104, glocke0: 78, glocke1: 92, spitze0: 93 };         // Krypta: Boden yr −6 (Y 61), Stehhöhe −5..−3, Decke −1

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'),
  serena: WZ.typ('pietra_serena'), putz: WZ.typ('putz_weiss'), ziegel: WZ.typ('dachziegel'), kuppel: WZ.typ('ziegel_kuppel'),
  holz: WZ.typ('holz'), gold: WZ.typ('gold'), weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'),
  gruen: WZ.typ('marmor_gruen'), rot: WZ.typ('marmor_rot'), dunkel: WZ.typ('kontrast_dunkel'), bronze: WZ.typ('bronze'),
  pflaster: WZ.typ('pflaster'), terrakotta: WZ.typ('putz_rosa'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'),
  rustika: WZ.typ('pietra_forte_rustika'), sand: WZ.typ('putz_sand')
};
const GLAS = PAL.typesForRole('glas');
const FRESKO = ['blue_terracotta', 'light_blue_terracotta', 'yellow_terracotta', 'white_terracotta'];

// ------------------------------------------------------------------ Laden
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt, PR = masken.masken.principi, CA = masken.masken.campanile;
  const geb = new Map(require('../../../data/stadt/gebaeude.json').gebaeude.map((g) => [g.id, g]));
  // Sakristeien: OSM-Teile von w599900778 als eigene Masken (Randabstand für die Wände)
  const teil = (osm) => {
    const t = geb.get('w599900778').teile.find((q) => q.osm.id === osm);
    return WZ.Maske.vonZellen(P.cellsOf(t.polygon).filter(([x, z]) => H.has(x, z)));
  };
  const SA = teil(599900777), SN = teil(599900772);
  const mk = (x, z, m, wo) => {
    const l = R.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, wc: l.w - WC0, d8: m.d8(x, z), gt: GRUND.groundTopY(x, z), wo };
  };
  const haupt = H.cells.map(([x, z]) => mk(x, z, H, 'kirche'));
  const prin = PR.cells.map(([x, z]) => mk(x, z, PR, 'principi'));
  for (const c of haupt) {
    if (SA.has(c.x, c.z)) { c.zone = 'sak_alt'; c.ds = SA.d8(c.x, c.z); } else if (SN.has(c.x, c.z)) { c.zone = 'sak_neu'; c.ds = SN.d8(c.x, c.z); } else c.zone = zone(c);
  }
  const camp = CA.cells.map(([x, z]) => mk(x, z, CA, 'campanile'));
  for (const c of camp) c.zone = 'campanile';
  for (const c of prin) { c.do = dOkt(c); c.zone = c.do < OKT.innen ? 'oktogon' : c.do < OKT.aussen ? 'oktwand' : 'nebenraum'; }
  const byKey = new Map();
  for (const c of haupt.concat(prin, camp)) byKey.set(P.ck(c.x, c.z), c);
  L = { json, masken, R, H, PR, CA, haupt, prin, camp, alle: haupt.concat(prin, camp), byKey };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));
const dOkt = (c) => { const a = Math.abs(c.u - OKT.u), b = Math.abs(c.w - OKT.w); return Math.max(a, b, (a + b) / Math.SQRT2); };

function zone(c) {
  const a = Math.abs(c.wc);
  if (c.u < U_FASS) return 'fassade';
  if (c.u >= 96 && c.u < 131 && Math.abs(c.w) > 32.5) return 'querkapelle';
  if (c.u < U_VIER0) return a < W_SAEULE1 ? 'mittel' : a < W_KAP0 ? 'seite' : a < W_KAP1 ? 'kapellenlinie' : 'kapelle';
  if (c.u < U_VIER1) return a < 13 ? 'vierung' : 'quer';
  if (a < 13) return 'chor';
  return 'chorkapelle';
}

// ------------------------------------------------------------------ Hilfen
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1); // Rundbogen-Laibung
function joch(u) {
  const k = Math.max(0, Math.min(6, Math.floor((u - U_FASS) / JOCH)));
  return { k, u0: U_FASS + k * JOCH, u1: U_FASS + (k + 1) * JOCH, uc: U_FASS + (k + 0.5) * JOCH };
}
const istSaeule = (c) => SAEULEN_U.some((s) => Math.abs(c.u - s) < 1);
/** Arkadenbogen (Säulenreihe): Laibung über der Zelle oder -1 an den Säulen/Pfeilern. */
function arkade(u) {
  const faces = [U_FASS].concat(SAEULEN_U.map((s) => s + 1));
  const ends = SAEULEN_U.map((s) => s - 1).concat([U_VIER0 - 2]);
  for (let k = 0; k < 7; k++) if (u >= faces[k] && u < ends[k]) return rund(KAEMPFER, u - (faces[k] + ends[k]) / 2, (ends[k] - faces[k]) / 2);
  return -1;
}

// Dachhöhe (Lage der Dachhaut) und Decke (oberste Innenraumlage + 1) je Spalte der Kirche
function dach(c) {
  const a = Math.abs(c.wc);
  switch (c.zone) {
    case 'fassade': return null;
    case 'mittel': case 'chor': return Math.round(FIRST - (FIRST - TRAUFE) * Math.min(1, a / 14));
    case 'quer': case 'vierung': return Math.round(FIRST - (FIRST - TRAUFE) * Math.min(1, Math.abs(c.u - 125) / 13));
    case 'seite': case 'kapellenlinie': case 'kapelle': case 'chorkapelle': case 'querkapelle':
      return Math.round(S_TRAUFE_I - (S_TRAUFE_I - S_TRAUFE_A) * Math.min(1, Math.max(0, a - 14) / 17));
    case 'sak_alt': case 'sak_neu': return null; // Kuppelbauten: eigene Hülle
    default: return null;
  }
}
function decke(c) {
  switch (c.zone) {
    case 'mittel': case 'quer': case 'chor': return DECKE;
    case 'seite': {
      const j = joch(c.u), hu = JOCH / 2, hw = 5.5;
      const wa = Math.sign(c.wc) * 19.5;
      const r2 = (((c.u - j.uc) / hu) ** 2 + ((c.wc - wa) / hw) ** 2) / 2;
      return S_GEWOELBE + Math.max(0, Math.round(5 * (1 - r2)));
    }
    case 'kapelle': case 'kapellenlinie': return K_DECKE;
    case 'chorkapelle': case 'querkapelle': return 24;
    default: return null;
  }
}

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
    if (zellen.has(k) || (!force && luft.has(k))) return false;   // Öffnungen und Treppenlöcher bleiben frei
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

  // Dachhöhen; Fassade, Sakristeien und Principi liefern ihre Hülle selbst, zählen aber als Nachbarn
  const D_ = new Map();
  const fassTop = (c) => { const a = Math.abs(c.wc); return a < 14 ? FIRST + 4 - Math.round(4 * a / 14) : S_TRAUFE_I + 2; };
  for (const c of D.haupt) {
    let d = dach(c);
    if (c.zone === 'fassade') d = fassTop(c);
    if (c.zone === 'sak_alt' || c.zone === 'sak_neu') d = (c.zone === 'sak_alt' ? SAK_ALT : SAK_NEU).wand + 2;
    if (c.zone === 'vierung') d = Math.hypot(c.u - VIER_M.u, c.wc - VIER_M.wc) >= R_KA ? TAMBUR0 - 1 : null; // Terrasse um den Tambour
    D_.set(P.ck(c.x, c.z), d);
  }
  const dachBei = (x, z) => D_.get(P.ck(x, z));

  // ---- Öffnungen: Portale (Fassade), Sakristeitüren, Krypta, Principi
  const PORTALE = [{ w0: -6, w1: 1, h: 12, art: 'tor' }, { w0: -24, w1: -20, h: 9, art: 'tuer' }, { w0: 16, w1: 20, h: 9, art: 'tuer' }];
  for (const c of D.haupt) {
    if (c.zone !== 'fassade') continue;
    for (const p of PORTALE) {
      if (c.w < p.w0 || c.w >= p.w1) continue;
      const a = (p.w1 - p.w0) / 2, top = rund(p.h, c.w - (p.w0 + p.w1) / 2, a);
      for (let yr = 1; yr <= top; yr++) oeffnung(p.art, 'portale', c.x, Y(yr), c.z);
    }
  }
  // Sakristeitüren aus den Querarmen (3 breit, 5 hoch) durch die Sakristeiwand
  for (const c of D.haupt) {
    if (c.zone === 'sak_alt' && c.ds <= 2 && c.w > -42 && c.u >= 132 && c.u < 135) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'sakristei_alt', c.x, Y(yr), c.z);
    if (c.zone === 'sak_alt' && c.ds <= 2 && c.u > 154 && c.w > -61 && c.w < -57) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'sakristei_alt', c.x, Y(yr), c.z); // in den Raum hinter der Sakristei
    if (c.zone === 'sak_neu' && c.ds <= 2 && c.w < 42 && c.u >= 130 && c.u < 133) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'sakristei_neu', c.x, Y(yr), c.z);
  }
  // Campanile (V5b): Tür aus der Querarm-Kapelle durch die Nordwand (3 breit, 4 hoch), über beide Wände bis in den Turm
  for (const c of D.alle) {
    if ((c.wo === 'kirche' || c.wo === 'campanile') && c.d8 <= 2 && Math.abs(c.u - CAMP.u) < 1.5 && c.w >= 49 && c.w < 55.5) for (let yr = 1; yr <= 4; yr++) oeffnung('tuer', 'campanile_schaft', c.x, Y(yr), c.z);
  }
  // Krypta-Eingang (Westseite, Piazza Madonna degli Aldobrandini), Tür der Krypta ins Oktogon, Tür Vorraum -> Oktogon
  for (const c of D.prin) {
    if (c.d8 <= 2 && c.u > 246 && Math.abs(c.w - OKT.w) < 2) for (let yr = KRYPTA0 + 1; yr <= KRYPTA0 + 4; yr++) oeffnung('tuer', 'krypta', c.x, Y(yr), c.z);
    if (c.zone === 'oktwand' && c.u > OKT.u && Math.abs(c.w - OKT.w) < 2) {
      for (let yr = KRYPTA0 + 1; yr <= KRYPTA0 + 3; yr++) oeffnung('tuer', 'krypta', c.x, Y(yr), c.z);
      for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'oktogon_wand', c.x, Y(yr), c.z);
    }
    if (c.zone === 'oktwand' && c.u < OKT.u && Math.abs(c.w - OKT.w) < 2) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'oktogon_wand', c.x, Y(yr), c.z);
  }

  // ---- Modul 0: Fundament, Böden, Krypta
  const kryptaZelle = (c) => c.wo === 'principi' && (c.zone === 'oktogon' || (c.zone === 'nebenraum' && c.u > 236 && c.d8 > 2));
  for (const c of D.alle) {
    const bis = kryptaZelle(c) ? Y(KRYPTA0 - 1) : Y(-1);
    for (let y = c.gt + 1; y <= bis; y++) set(c.x, y, c.z, T.bruch, 'fundament');
  }
  // Treppe Krypta -> Vorraum (Weltachse o/w), im hinteren Nebenraum
  const vorraum = D.prin.filter((c) => c.zone === 'nebenraum' && c.u > 237 && c.d8 > 3);
  let treppe = null;
  {
    const richt = WZ.treppe.weltRichtung('w', D.R);      // lokal −u (zum Oktogon hin) -> Weltrichtung
    const [dx, dz] = WZ.treppe.DIR[richt];
    const [qx, qz] = WZ.treppe.DIR[WZ.treppe.RECHTS[richt]];
    const ok = new Set(vorraum.map((c) => P.ck(c.x, c.z)));
    for (const s of vorraum.sort((a, b) => Math.abs(a.w - OKT.w - 6) - Math.abs(b.w - OKT.w - 6))) {
      let passt = true;
      for (let k = -1; k <= 7 && passt; k++) for (let q = 0; q < 2; q++) if (!ok.has(P.ck(s.x + dx * k + qx * q, s.z + dz * k + qz * q))) { passt = false; break; }
      if (!passt) continue;
      treppe = WZ.treppe.geradeTreppe({ start: { x: s.x, y: Y(KRYPTA0 + 1), z: s.z }, richtung: richt, stufen: 6, breite: 2, rolle: 'pietra_serena' });
      break;
    }
    if (!treppe) throw new Error('San Lorenzo: kein Platz für die Kryptatreppe');
    for (const l of WZ.treppe.treppenloch(treppe.lauf, 3)) frei(l.x, l.y, l.z);
    for (const b of treppe) {
      set(b.x, b.y, b.z, b.typ, 'krypta_treppe', true);
      for (let y = Y(KRYPTA0 + 1); y < b.y; y++) set(b.x, y, b.z, T.serena, 'krypta_treppe', true); // Unterbau der Stufen
    }
  }

  for (const c of D.alle) {
    if (!kryptaZelle(c)) continue;
    set(c.x, Y(KRYPTA0), c.z, T.pflaster, 'krypta');                           // Kryptaboden
    const pf = (Math.abs(Math.round(c.u)) % 8 < 2) && (Math.abs(Math.round(c.w)) % 8 < 2) && c.zone === 'oktogon' && c.do < 25;
    if (pf) for (let yr = KRYPTA0 + 1; yr <= KRYPTA1; yr++) set(c.x, Y(yr), c.z, T.serena, 'krypta'); // Pfeiler
    set(c.x, Y(-1), c.z, T.serena, 'krypta_decke');                             // Kryptadecke (trägt den Kapellenboden)
  }
  // Böden yr 0
  for (const c of D.alle) {
    if (istFrei(c.x, Y(0), c.z)) continue;
    let t = T.serena, p = 'boden';
    if (c.zone === 'mittel' || c.zone === 'vierung' || c.zone === 'chor') {
      const iu = Math.floor(c.u / 3), iw = Math.floor((c.wc + 30) / 3);
      t = (iu + iw) % 2 ? T.serena : T.weiss;
    } else if (c.wo === 'principi' && c.zone === 'oktogon') {
      const r = Math.floor(c.do / 4);
      t = r % 3 === 0 ? T.rot : r % 3 === 1 ? T.weiss : T.gruen; p = 'oktogon_boden';
    } else if (c.zone === 'sak_alt' || c.zone === 'sak_neu') t = T.terrakotta;
    if (kryptaZelle(c)) p = 'oktogon_boden';                 // liegt auf der Kryptadecke (Modul 7)
    set(c.x, Y(0), c.z, t, p);
  }

  // ---- Modul 1: Fassade (rohe Bruchsteinfront, nie verkleidet)
  for (const c of D.haupt) {
    if (c.zone !== 'fassade') continue;
    const top = fassTop(c);
    for (let yr = 1; yr <= top; yr++) {
      if (istFrei(c.x, Y(yr), c.z)) continue;
      const rahmen = PORTALE.some((p) => c.w >= p.w0 - 1 && c.w < p.w1 + 1 && yr <= rund(p.h, c.w - (p.w0 + p.w1) / 2, (p.w1 - p.w0) / 2 + 1));
      const oculus = Math.hypot(c.w - (WC0), yr - 38) <= 3.2;
      set(c.x, Y(yr), c.z, oculus ? GLAS[(yr + Math.round(c.w)) % GLAS.length] : rahmen ? T.serena : ((yr * 7 + Math.round(c.w) * 3) % 5 === 0 ? T.mauer : T.bruch),
        oculus ? 'fassade_okulus' : 'fassade');
    }
  }

  // ---- Modul 2: Säulen und Arkaden, Kapellenlinie (Langhaus)
  for (const c of D.haupt) {
    if (c.zone !== 'mittel') continue;
    const a = Math.abs(c.wc);
    if (a < W_SAEULE0) continue;
    const top = dachBei(c.x, c.z);
    const lai = arkade(c.u);
    const saeule = istSaeule(c);
    const j = joch(c.u);
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z)) continue;
      if (saeule && yr <= KAEMPFER - 1) { set(c.x, Y(yr), c.z, yr === 15 ? T.ornament : T.serena, 'saeulen'); continue; }
      if (lai >= 0 && yr <= lai) continue;                                  // Arkadenöffnung
      if (Math.abs(c.u - j.uc) < 1.5 && yr >= 28 && yr <= rund(33, c.u - j.uc, 1.6)) { set(c.x, Y(yr), c.z, T.fenster, 'obergaden_fenster'); continue; }
      const t = lai >= 0 && yr <= lai + 1 ? T.serena : yr === DECKE ? T.serena : T.putz;  // Archivolte, Gebälk unter der Decke
      set(c.x, Y(yr), c.z, t, yr < 25 ? 'arkaden' : 'obergaden');
    }
  }
  for (const c of D.haupt) {
    if (c.zone !== 'kapellenlinie') continue;
    const top = dachBei(c.x, c.z);
    const j = joch(c.u);
    const a0 = j.u0 + 1.5, a1 = j.u1 - 1.5;
    const lai = c.u >= a0 && c.u < a1 ? rund(9, c.u - (a0 + a1) / 2, (a1 - a0) / 2) : -1;
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z)) continue;
      if (lai >= 0 && yr <= lai) continue;
      set(c.x, Y(yr), c.z, lai >= 0 && yr <= lai + 1 ? T.serena : T.putz, 'kapellenpfeiler');
    }
  }
  // Kapellen-Trennwände auf den Jochgrenzen
  for (const c of D.haupt) {
    if (c.zone !== 'kapelle' || c.d8 <= 2) continue;
    if (!SAEULEN_U.some((s) => Math.abs(c.u - s) < 1)) continue;
    const top = dachBei(c.x, c.z);
    for (let yr = 1; yr < top; yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, T.putz, 'kapellen_trennwaende');
  }

  // ---- Modul 3: Vierung (Pfeiler, Bögen, Pendentifs, Tambour, Kuppel, Laterne)
  const rV = (c) => Math.hypot(c.u - VIER_M.u, c.wc - VIER_M.wc);
  for (const c of D.haupt) {
    if (c.zone !== 'vierung' && !(c.u >= 109 && c.u < 141 && Math.abs(c.wc) < 16)) continue;
    const a = Math.abs(c.wc);
    const amRand = (c.u < 114 || c.u >= 136) || a >= 11;
    const pfeiler = (c.u < 114 || c.u >= 136) && a >= 11 && a < 15;
    if (pfeiler) for (let yr = 1; yr <= 38; yr++) set(c.x, Y(yr), c.z, T.serena, 'vierungspfeiler');
    const r = rV(c);
    if (c.zone !== 'vierung') {                       // Tambour und Kuppel ragen an den Seitenmitten über das Vierungsquadrat
      if (r >= R_KI && r < R_KA) for (let yr = TAMBUR0; yr < KUPPEL0; yr++) set(c.x, Y(yr), c.z, T.serena, 'tambour');
      if (r < R_KA) { const ho = KUPPEL0 + Math.sqrt(R_KA * R_KA - r * r); for (let yr = KUPPEL0 - 1; yr <= Math.floor(ho); yr++) set(c.x, Y(yr), c.z, yr >= Math.floor(ho) ? T.ziegel : T.putz, 'vierungskuppel'); }
      continue;
    }
    // Vierungsbögen: Laibung Kämpfer 27, Radius 11
    if (amRand && !pfeiler) {
      const x = c.u < 114 || c.u >= 136 ? c.wc : c.u - 125;
      const lai = rund(27, x, 11);
      for (let yr = Math.max(lai + 1, 1); yr <= 41; yr++) set(c.x, Y(yr), c.z, yr <= lai + 1 ? T.serena : T.putz, 'vierungsboegen');
    }
    for (let yr = 39; yr < TAMBUR0; yr++) if (r >= R_KI) set(c.x, Y(yr), c.z, T.putz, 'pendentifs');   // Pendentifs
    if (r >= R_KI && r < R_KA) {
      for (let yr = TAMBUR0; yr < KUPPEL0; yr++) {
        const phi = Math.atan2(c.wc, c.u - VIER_M.u) * 180 / Math.PI;
        const fenster = yr >= 51 && yr <= 54 && Math.abs((((phi % 45) + 45) % 45) - 22.5) < 6;
        set(c.x, Y(yr), c.z, fenster ? T.fenster : T.serena, 'tambour');
      }
    }
    if (r < R_KA) {
      const ho = KUPPEL0 + Math.sqrt(R_KA * R_KA - r * r);
      const hi = r < R_KI ? KUPPEL0 + Math.sqrt(R_KI * R_KI - r * r) : KUPPEL0 - 1;
      for (let yr = Math.ceil(hi); yr <= Math.floor(ho); yr++) set(c.x, Y(yr), c.z, yr >= Math.floor(ho) ? T.ziegel : T.putz, 'vierungskuppel');
      if (r < 2.5) for (let yr = Math.floor(ho) + 1; yr <= 80; yr++) set(c.x, Y(yr), c.z, yr >= 79 ? T.gold : (r < 1.5 && yr < 78 ? T.weiss : T.weiss), 'laterne');
    }
  }

  // ---- Modul 4: Außenwände der Kirche (d8 ≤ 2), Querhaus, Chor, Kapellen
  for (const c of D.haupt) {
    if (c.zone === 'fassade' || c.zone === 'sak_alt' || c.zone === 'sak_neu') continue;
    const top = dachBei(c.x, c.z);
    let innen = null;
    const a = Math.abs(c.wc);
    if (c.zone === 'chorkapelle' && a < 15 && c.u >= U_VIER1) innen = 'chorwaende';                 // Chor zu den Kapellen
    if ((c.zone === 'chorkapelle' || c.zone === 'quer') && c.u >= U_VIER1 - 1 && c.u < U_VIER1 + 1 && a >= 15) innen = 'querhaus_ostwand';
    if (c.d8 > 2 && !innen) continue;
    const p = c.d8 <= 2 ? (c.zone === 'chor' || c.zone === 'chorkapelle' ? 'chor_aussen' : c.zone === 'quer' || c.zone === 'querkapelle' || c.zone === 'vierung' ? 'querhaus_aussen' : 'seitenwaende') : innen;
    for (let yr = 1; yr < top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      if (c.d8 > 2) {
        if (innen === 'chorwaende' && yr <= rund(14, c.u - 148, 8)) continue;                         // Bögen zu den Chorkapellen
        if (innen === 'querhaus_ostwand' && yr <= rund(14, c.wc - Math.sign(c.wc) * 26, 9)) continue;
      } else {
        // Fenster: je Joch ein Rundbogenfenster in den Kapellen, Querhaus- und Chorfenster
        const j = joch(c.u);
        const fe = (c.zone === 'kapelle' || c.zone === 'seite') && Math.abs(c.u - j.uc) < 1 && yr >= 8 && yr <= rund(12, c.u - j.uc, 1.1)
          || (c.zone === 'quer' && (Math.abs(c.u - 118.5) < 1 || Math.abs(c.u - 131.5) < 1) && yr >= 24 && yr <= rund(34, 0, 1))
          || (c.zone === 'chor' && Math.abs(c.wc) < 2 && yr >= 22 && yr <= rund(34, c.wc, 2.1));
        if (fe) { set(c.x, Y(yr), c.z, c.d8 === 1 ? T.serena : T.fenster, 'fenster'); continue; }
      }
      const t = c.d8 === 1 ? (yr <= 2 ? T.serena : (c.zone === 'chor' || c.zone === 'quer' ? T.bruch : T.mauer)) : c.d8 === 2 ? T.putz : T.putz;
      set(c.x, Y(yr), c.z, t, p);
    }
  }

  // ---- Modul 5: Decken (Kassetten, Hängekuppeln) und Dachhaut; Dachräume unzugänglich
  for (const c of D.haupt) {
    const top = dachBei(c.x, c.z);
    const dk = decke(c);
    if (top == null || dk == null) continue;
    if (c.d8 <= 2) continue;
    if (hat(c.x, Y(dk), c.z)) continue;
    let t = T.putz, p = 'gewoelbe';
    // Spalten am Rand zu tieferen Dächern: die Decke liegt dort in der Außenwand (Steinziegel statt Holz)
    const aussenRand = N4.some(([dx, dz]) => { const n = dachBei(c.x + dx, c.z + dz); return n != null && n < dk; });
    if (dk === DECKE) {                                                      // Kassettendecke: Holz, vergoldete Rosetten
      t = aussenRand ? T.mauer : (Math.round(c.u) % 4 === 0 && Math.round(c.wc) % 4 === 0) ? T.gold : T.holz; p = 'kassettendecke';
    } else if (c.zone === 'seite' && SAEULEN_U.some((s) => Math.abs(c.u - s) < 0.8)) t = T.serena;   // Gurtbögen
    // Decke ohne Diagonallücken: bis zur tieferen Nachbardecke
    let lo = dk;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); if (n && n.wo === 'kirche' && n.d8 > 2) { const nd = decke(n); if (nd != null && nd < lo) lo = nd; } }
    for (let yr = lo; yr <= dk; yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, t, p);
    for (let yr = dk + 1; yr < top; yr++) unzug(p === 'kassettendecke' ? 'dach_langhaus' : 'dach_seiten', 'Dachraum über Decke und Gewölben (ohne Zugang)', c.x, Y(yr), c.z);
  }
  for (const c of D.haupt) {
    if (c.zone === 'fassade' || c.zone === 'sak_alt' || c.zone === 'sak_neu') continue;
    const top = dachBei(c.x, c.z);
    if (top == null) continue;                                              // Vierung im Tambour: offen zur Kuppel
    let lo = top;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < lo) lo = n; }
    const p = c.zone === 'mittel' || c.zone === 'chor' ? 'dach_langhaus' : c.zone === 'quer' || c.zone === 'vierung' ? 'dach_querhaus' : 'dach_seiten';
    for (let yr = lo; yr <= top; yr++) {
      if (hat(c.x, Y(yr), c.z) || istFrei(c.x, Y(yr), c.z)) continue;
      set(c.x, Y(yr), c.z, yr === top ? (c.zone === 'vierung' ? T.serena : T.ziegel) : T.mauer, yr === top ? p : 'schildwaende');
    }
  }

  // ---- Modul 6: Sakristeien (Würfel mit Kuppel)
  for (const [zoneName, S, teil] of [['sak_alt', SAK_ALT, 'sakristei_alt'], ['sak_neu', SAK_NEU, 'sakristei_neu']]) {
    const cells = D.haupt.filter((c) => c.zone === zoneName);
    const R_A = S.ri + 2;
    for (const c of cells) {
      const r = Math.hypot(c.u - S.u, c.w - S.w);
      const wand = c.ds <= 2;
      const top = S.wand + 2;
      for (let yr = 1; yr <= top; yr++) {
        if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
        if (wand) { set(c.x, Y(yr), c.z, yr === top ? T.ziegel : (yr % 8 === 0 ? T.serena : (c.ds === 1 ? T.bruch : T.putz)), teil); continue; }
        // Innen: Würfelraum bis S.wand, darüber Pendentifs außerhalb des Kuppelkreises
        if (yr > S.wand - 2 && r >= S.ri) set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.putz, teil);
      }
      // Kuppel (Halbkugel) über dem Kreis, Laterne
      if (r < R_A) {
        const b = S.wand;
        const ho = b + Math.sqrt(R_A * R_A - r * r), hi = r < S.ri ? b + Math.sqrt(S.ri * S.ri - r * r) : b + 1;
        for (let yr = Math.ceil(hi); yr <= Math.floor(ho); yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, yr >= Math.floor(ho) ? T.ziegel : (r < S.ri - 1 ? T.putz : T.serena), teil + '_kuppel');
        if (r < 2) for (let yr = Math.floor(ho) + 1; yr <= b + R_A + 5; yr++) set(c.x, Y(yr), c.z, yr === b + R_A + 5 ? T.bronze : T.weiss, teil + '_kuppel');
      }
    }
  }

  // ---- Modul 7: Cappella dei Principi (Oktogon, Tambour, Kuppel, Laterne) und Nebenräume
  const winkelRippe = (c) => { const ph = Math.atan2(c.w - OKT.w, c.u - OKT.u) * 180 / Math.PI; return Math.abs((((ph - 22.5) % 45) + 45) % 45 - 22.5) > 20; };
  for (const c of D.prin) {
    if (c.zone === 'oktwand') {
      for (let yr = KRYPTA0 + 1; yr <= OKT.wand; yr++) {
        if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
        const innenFlaeche = c.do < OKT.innen + 1;
        // Fenster der Oktogonseiten (zwei Reihen) in der Seitenmitte
        const sm = Math.min(Math.abs(c.u - OKT.u), Math.abs(c.w - OKT.w), Math.abs((c.u - OKT.u) - (c.w - OKT.w)) / Math.SQRT2, Math.abs((c.u - OKT.u) + (c.w - OKT.w)) / Math.SQRT2);
        if (sm < 2 && yr >= 34 && yr <= 44) { set(c.x, Y(yr), c.z, T.fenster, 'oktogon_wand'); continue; }
        const t = innenFlaeche ? ((yr % 6 < 3) ? T.dunkel : (yr % 12 < 6 ? T.rot : T.gruen)) : (c.do >= OKT.aussen - 1 ? (yr % 10 === 0 ? T.weiss : T.forte) : T.mauer);
        set(c.x, Y(yr), c.z, yr === OKT.wand ? T.serena : t, 'oktogon_wand');
      }
    }
    if (c.zone === 'oktogon' || c.zone === 'oktwand') {
      // Tambour: Ring 26 ≤ d < 30 von Lage 51 bis 66, acht Fenster
      if (c.do >= 26 && c.do < 30) for (let yr = OKT.wand + 1; yr <= OKT.tambur; yr++) {
        const sm = Math.min(Math.abs(c.u - OKT.u), Math.abs(c.w - OKT.w), Math.abs((c.u - OKT.u) - (c.w - OKT.w)) / Math.SQRT2, Math.abs((c.u - OKT.u) + (c.w - OKT.w)) / Math.SQRT2);
        set(c.x, Y(yr), c.z, sm < 2.5 && yr >= 55 && yr <= 62 ? T.fenster : (c.do >= 29 ? T.forte : T.dunkel), 'tambour_principi');
      }
      // Terrasse auf der Oktogonwand außerhalb des Tambours
      // Kuppel: Klostergewölbe, innen a_i, außen a_o
      for (let yr = OKT.tambur + 1; yr <= OKT.kuppel; yr++) {
        const ti = (yr - OKT.tambur) / (OKT.kuppel - 4 - OKT.tambur), to = (yr - OKT.tambur) / (OKT.kuppel - OKT.tambur);
        const ai = ti < 1 ? 26 * Math.sqrt(1 - ti * ti) : -1, ao = 30 * Math.sqrt(Math.max(0, 1 - to * to));
        if (c.do < ao && c.do >= ai) set(c.x, Y(yr), c.z, ai >= 0 && c.do < ai + 1.2 ? FRESKO[Math.floor(yr / 6) % FRESKO.length] : (winkelRippe(c) ? T.weiss : T.kuppel), 'kuppel_principi'); // innen Fresko, außen Ziegel mit Marmorrippen
      }
      const dl = Math.hypot(c.u - 200.7, c.w + 2.5);
      if (dl < 6) for (let yr = OKT.kuppel - 3; yr <= OKT.laterne; yr++) if (!hat(c.x, Y(yr), c.z)) {
        const ring = dl >= 4.5;
        if (ring || yr >= OKT.laterne - 2 || yr <= OKT.kuppel - 2) set(c.x, Y(yr), c.z, yr === OKT.laterne ? T.gold : (ring && yr % 3 === 0 ? T.fenster : T.weiss), 'laterne_principi');
        else unzug('laterne_principi', 'Inneres der Laterne über der Kuppel', c.x, Y(yr), c.z);
      }
    }
    if (c.zone === 'nebenraum') {
      const top = 20;
      for (let yr = KRYPTA0 + 1; yr <= top + 1; yr++) {
        if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
        if (c.d8 <= 2) { set(c.x, Y(yr), c.z, yr > top ? T.ziegel : (c.d8 === 1 ? T.forte : T.putz), 'nebenraeume'); continue; }
        if (yr <= 0 && !kryptaZelle(c)) continue;
        if (yr === top + 1 || yr === top) set(c.x, Y(yr), c.z, yr > top ? T.ziegel : T.putz, 'nebenraeume');
        else if (c.u < 236 && yr >= 1) unzug('nebenraeume', 'Nebenräume der Cappella dei Principi (Lager und Treppen, nicht ausgebaut)', c.x, Y(yr), c.z);
      }
    }
  }
  // Grabmäler im Oktogon: sechs Sarkophage vor den Seitenmitten (nicht vor den Türseiten u ±)
  for (const c of D.prin) {
    if (c.zone !== 'oktogon' || c.do < 24 || c.do >= OKT.innen) continue;
    const du = c.u - OKT.u, dw = c.w - OKT.w;
    const phi = ((Math.atan2(dw, du) * 180 / Math.PI) + 360) % 360;
    const seite = Math.round(phi / 45) % 8;
    if (seite === 0 || seite === 4) continue;                         // Türseiten (Osten/Westen)
    const sm = Math.abs(((phi - seite * 45 + 540) % 360) - 180);
    const mitte = Math.abs(180 - sm);
    if (mitte > 6) continue;
    for (let yr = 1; yr <= 4; yr++) set(c.x, Y(yr), c.z, yr === 4 ? T.bronze : T.rot, 'grabmaeler');
  }

  // ---- Modul 9: Campanile (Ruggieri 1740, 54 m): Schaft, Wendeltreppe, Glockenstube mit fünf Glocken, Kuppelhelm
  const camp = WZ.campanile.baueCampanile({
    cells: D.camp, set, frei, istFrei, hat, oeffnung, unzug, Y, zellen, teile, key,
    T: { wand: T.forte, sockel: T.rustika, gesims: T.serena, dach: T.kuppel, spitze: T.bronze, holz: T.holz, glocke: T.bronze, fenster: T.fenster, licht: T.licht }
  }, {
    rect: CAMP.rect, top: CAMP.top, glocke0: CAMP.glocke0, glocke1: CAMP.glocke1, spitze0: CAMP.spitze0, abschluss: 'kuppel', sockel: 6,
    gesimse: [18, 38, 58, CAMP.glocke0 - 1], schlitze: { periode: 20, a: 8, b: 11, bis: CAMP.glocke0 },
    bogen: { anzahl: 1, breite: 6 }, kleineGlocken: 2, lichtAbstand: 8
  });

  // ---- Licht: Kirche, Oktogon, Krypta, Nebenräume
  const steh = [], stehK = [];
  for (const c of D.alle) {
    const b = zellen.get(key(c.x, Y(0), c.z));
    if (b && (b.p === 'boden' || b.p === 'oktogon_boden') && !hat(c.x, Y(1), c.z) && !hat(c.x, Y(2), c.z)) steh.push({ x: c.x, y: Y(1), z: c.z });
    const k = zellen.get(key(c.x, Y(KRYPTA0), c.z));
    if (k && k.p === 'krypta' && !hat(c.x, Y(KRYPTA0 + 1), c.z)) stehK.push({ x: c.x, y: Y(KRYPTA0 + 1), z: c.z });
  }
  const lichtTeil = [];
  for (const l of WZ.lichtRaster(steh, { abstand: 12 }).concat(WZ.lichtRaster(stehK, { abstand: 12 }))) {
    const k = key(l.x, l.y, l.z); const e = zellen.get(k); if (!e) continue;
    teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = 'licht'; lichtTeil.push(k);
  }
  teile.set('licht', lichtTeil);

  PLAN = { zellen, teile, oeff, unz, treppe, camp };
  return PLAN;
}

// ------------------------------------------------------------------ Module aus dem Plan
const OEFF_TEIL = { portale: 'fassade', krypta: 'krypta', sakristei_alt: 'sakristei_alt', sakristei_neu: 'sakristei_neu', oktogon_wand: 'oktogon_wand' };
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

module.exports = { modul, lade, plan, zelleBei, Y, BODEN_Y, T, OKT, JOCH, CAMP };
