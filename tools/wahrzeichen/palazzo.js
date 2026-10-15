'use strict';
// Gemeinsamer Bauplan für Florentiner Palazzi (Wahrzeichen-Welle 4): Block um einen oder mehrere Höfe (Löcher des
// OSM-Polygons), Geschosse mit Böden, Außenwand mit Fenstern je Geschoss, Hof mit Arkaden im Erdgeschoss, Loggia
// dahinter, Innenwand mit Türen, eine Wendeltreppe durch alle Geschosse, Kranzgesims und Walmdach (oder Zinnen).
// Ein Projekt ruft palazzo(cfg) auf und bekommt { lade, plan, modul, zelleBei, Y }; Sonderbauteile (Turm, Loggia an
// der Straße) hängen über cfg.extra an. Erste Setzung gewinnt; Öffnungen werden vor allen Wänden freigehalten.
//
// cfg = {
//   dir, geschosse: [h0, h1, ...]   Geschosshöhen in Blöcken (Böden auf Y(0), Y(h0), Y(h0+h1), ...)
//   dach: { hoehe, art: 'walm'|'flach' }, zinnen?: { hoehe, abstand }
//   hof: { tiefe: Loggiatiefe (0 = keine), joch, kaempfer, minZellen: kleinere Löcher sind Lichthöfe ohne Arkaden,
//          mitArkaden?: [Lochindex] statt minZellen, garten?: [Lochindex] mit Rasen }
//   fenster: { abstand, breite, sohle: [je Geschoss], hoehe: [je Geschoss], bifora: [je Geschoss] }
//   material(s, c, yr, info) -> Blocktyp der Außenschale (d8 = 1) im Geschoss s (info: { gesims, sockel })
//   portale: [{ u, w, breite, hoehe }]  (lokale Mitte; Außenwandzellen näher als breite/2 werden Tor)
//   portikus?: { test(c) -> bool, kaempfer, joch, versatz?, entlang?: 'u'|'w' }  Erdgeschoss-Loggia an der Straße
//              (Innocenti); Rückwand (Bauteil loggiawand) mit Türen alle zwei Joche
//   fenster.versatz?: Verschiebung des Fensterrasters (lokal)
//   treppe?: { u, w }   bevorzugte Lage der Wendeltreppe (lokal)
//   extra?(api)         zusätzliche Bauteile, api = { D, set, hat, frei, oeffnung, unzug, key, Y, T, zelleBei }
// }

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('./index.js');
const PAL = require('../spec/palette.js');
const P = require('../city/poly.js');

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const N8 = N4.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);

function palazzo(cfg) {
  const DIR = cfg.dir;
  const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const BODEN_Y = PJ.bodenY;
  const Y = (yr) => BODEN_Y + yr;
  const GRUND = require(path.join(DIR, 'spec', 'ground.js'));
  const BASIS = [0];
  for (const h of cfg.geschosse) BASIS.push(BASIS[BASIS.length - 1] + h);
  const TRAUFE = BASIS[BASIS.length - 1];                 // oberste Decke
  const T = {
    forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), rustika: WZ.typ('pietra_forte_rustika'), mauer: WZ.typ('mauerwerk'),
    serena: WZ.typ('pietra_serena'), putz: WZ.typ('putz_weiss'), ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'),
    weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), terrakotta: WZ.typ('putz_rosa'), pflaster: WZ.typ('pflaster'),
    licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), gold: WZ.typ('gold'), bronze: WZ.typ('bronze'), rasen: WZ.typ('gruen_rasen')
  };
  const hof = Object.assign({ tiefe: 5, joch: 7, kaempfer: 9, minZellen: 150 }, cfg.hof || {});
  const fen = cfg.fenster;

  // ---------------------------------------------------------------- Laden: Zellen, Hofabstand, Außennormale
  let L = null;
  function lade() {
    if (L) return L;
    const masken = WZ.ladeMasken(PJ, { dir: DIR });
    const R = masken.rahmen, H = masken.haupt;
    const loecher = H.loecher().map((m, i) => ({ i, n: m.size, gross: hof.mitArkaden ? hof.mitArkaden.includes(i) : m.size >= hof.minZellen }));
    const haupt = H.cells.map(([x, z]) => {
      const l = R.toLocal(x, z);
      let dHof = Infinity, gross = false;
      for (const lo of loecher) { const d = H.dLoch(lo.i, x, z); if (d < dHof) { dHof = d; gross = lo.gross; } else if (d === dHof && lo.gross) gross = true; }
      return { x, z, u: l.u, w: l.w, d8: H.d8(x, z), dHof, grossHof: gross, gt: GRUND.groundTopY(x, z) };
    });
    const byKey = new Map();
    for (const c of haupt) byKey.set(P.ck(c.x, c.z), c);
    const hofZellen = [];
    H.loecher().forEach((lo, i) => { for (const [x, z] of lo.cells) { const l = R.toLocal(x, z); hofZellen.push({ x, z, u: l.u, w: l.w, gt: GRUND.groundTopY(x, z), hof: true, garten: !!(hof.garten && hof.garten.includes(i)) }); } });
    for (const c of haupt) {
      // Außennormale: Lage entlang der Wand (lokal) für das Fensterraster
      let entlang = null;
      for (const [dx, dz] of N4) {
        if (H.innen(c.x + dx, c.z + dz)) continue;
        const l = R.toLocal(c.x + dx, c.z + dz);
        entlang = Math.abs(l.u - c.u) > Math.abs(l.w - c.w) ? 'w' : 'u';
        break;
      }
      c.entlang = entlang;
      let hofEntlang = null;
      if (c.dHof <= 2) for (const [dx, dz] of N8) {
        if (!H.innen(c.x + dx, c.z + dz) || H.has(c.x + dx, c.z + dz)) continue;   // Lochzelle
        const l = R.toLocal(c.x + dx, c.z + dz);
        hofEntlang = Math.abs(l.u - c.u) > Math.abs(l.w - c.w) ? 'w' : 'u';
        break;
      }
      c.hofEntlang = hofEntlang;
      c.portikus = !!(cfg.portikus && cfg.portikus.test(c));
      c.entlangPortikus = cfg.portikus ? (cfg.portikus.entlang || 'w') : null;
    }
    L = { PJ, masken, R, H, haupt, hofZellen, byKey, alle: haupt };
    return L;
  }
  const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

  const geschossVon = (yr) => { for (let s = cfg.geschosse.length - 1; s >= 0; s--) if (yr > BASIS[s]) return s; return 0; };
  const dachLage = (c) => {                                          // Walmdach: steigt von Außenkante und Hofkante
    if (!cfg.dach || cfg.dach.art === 'flach') return TRAUFE + 1;
    const d = Math.min(c.d8, c.dHof === Infinity ? 99 : c.dHof);
    return TRAUFE + 1 + Math.min(cfg.dach.hoehe, Math.floor((d - 1) / 2));
  };
  // Fensterraster entlang einer Wand: lokale Koordinate v, Raster abstand, Fenster |rest| < breite/2
  const imRaster = (v, abstand, breite) => { const r = ((v % abstand) + abstand) % abstand - abstand / 2; return Math.abs(r) < breite / 2 ? r : null; };
  function fensterZelle(c, yr, entlang, aussen) {
    const s = geschossVon(yr), v = (entlang === 'u' ? c.u : c.w) - (fen.versatz || 0);
    if (!entlang) return null;
    const r = imRaster(v, fen.abstand, fen.breite);
    if (r === null) return null;
    const sohle = BASIS[s] + fen.sohle[s], top = sohle + fen.hoehe[s];
    if (yr < sohle || yr > top) return null;
    const bogenTop = fen.bogen === false ? top : sohle + fen.hoehe[s] - fen.breite / 2 + Math.sqrt(Math.max(0, (fen.breite / 2) ** 2 - r * r));
    if (yr > bogenTop + 0.5) return null;
    if (fen.bifora && fen.bifora[s] && Math.abs(r) < 0.5 && yr < top - 1) return aussen ? 'saeule' : 'saeule';
    return 'glas';
  }

  // ---------------------------------------------------------------- Bauplan
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
    const oeff = new Map();
    const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); frei(x, y, z); };
    const unz = new Map();
    const unzug = (p, b, x, y, z) => { const k = p + '|' + b; if (!unz.has(k)) unz.set(k, []); unz.get(k).push({ x, y, z }); };
    const GLAS = PAL.typesForRole('glas');
    const glas = (a, b) => GLAS[Math.abs(a * 5 + b * 3) % GLAS.length];
    const api = { D, set, hat, frei, oeffnung, unzug, key, Y, T, zelleBei, BASIS, TRAUFE, luft, zellen, teile };

    // Zonen je Zelle
    const istHofwand = (c) => c.dHof <= 2;
    const istLoggia = (c) => c.grossHof && hof.tiefe > 0 && c.dHof > 2 && c.dHof <= 2 + hof.tiefe && c.d8 > 2;
    const istInnenwand = (c) => c.grossHof && hof.tiefe > 0 && c.dHof > 2 + hof.tiefe && c.dHof <= 3 + hof.tiefe && c.d8 > 2;
    // Rückwand der Straßenloggia: Nachbarzelle des Portikus, selbst kein Portikus (Erdgeschoss, mit Türen)
    const istPortikuswand = (c) => cfg.portikus && !c.portikus && c.d8 > 2 && N8.some(([dx, dz]) => { const n = zelleBei(c.x + dx, c.z + dz); return n && n.portikus; });

    // ---- Öffnungen: Portale, Portikus (Erdgeschoss-Loggia zur Straße)
    for (const c of D.haupt) {
      if (c.d8 > 2) continue;
      for (const p of cfg.portale || []) {
        const d = Math.hypot(c.u - p.u, c.w - p.w);
        if (d > Math.max(p.breite, 3)) continue;
        const v = c.entlang === 'u' ? c.u - p.u : c.w - p.w;
        if (Math.abs(v) >= p.breite / 2) continue;
        for (let yr = 1; yr <= rund(p.hoehe - p.breite / 2, v, p.breite / 2); yr++) oeffnung('tor', 'portale', c.x, Y(yr), c.z);
      }
      if (c.portikus && c.d8 === 1) {
        const pk = cfg.portikus, v = c.entlang === 'u' ? c.u : c.w;
        const r = ((v - (pk.versatz || 0)) % pk.joch + pk.joch) % pk.joch - pk.joch / 2;
        if (Math.abs(r) < pk.joch / 2 - 1) for (let yr = 1; yr <= rund(pk.kaempfer, r, pk.joch / 2 - 1); yr++) oeffnung('arkade', 'portikus', c.x, Y(yr), c.z);
      }
    }
    // Hofarkaden: Bogengänge zum Hof (Erdgeschoss), Türen in der Innenwand
    for (const c of D.haupt) {
      if (istHofwand(c) && c.grossHof && hof.tiefe > 0 && c.hofEntlang) {
        const v = c.hofEntlang === 'u' ? c.u : c.w;
        const r = ((v % hof.joch) + hof.joch) % hof.joch - hof.joch / 2;
        if (Math.abs(r) < hof.joch / 2 - 1) for (let yr = 1; yr <= rund(hof.kaempfer, r, hof.joch / 2 - 1); yr++) oeffnung('arkade', 'hofarkaden', c.x, Y(yr), c.z);
      }
      if (istHofwand(c) && !c.grossHof && c.hofEntlang && c.d8 > 2) {     // Türen in Gärten und Lichthöfe
        const v = c.hofEntlang === 'u' ? c.u : c.w;
        if (imRaster(v, 20, 3) !== null) for (let yr = 1; yr <= 6; yr++) oeffnung('tuer', 'hofwaende', c.x, Y(yr), c.z);
      }
      if (istPortikuswand(c) && imRaster(c.entlangPortikus === 'u' ? c.u : c.w, cfg.portikus.joch * 2, 3) !== null) for (let yr = 1; yr <= 7; yr++) oeffnung('tuer', 'loggiawand', c.x, Y(yr), c.z);
      if (istInnenwand(c)) {
        const v = c.hofEntlang ? (c.hofEntlang === 'u' ? c.u : c.w) : c.u + c.w;
        if (imRaster(v, 14, 3) !== null) for (let yr = 1; yr <= 6; yr++) oeffnung('tuer', 'innenwaende', c.x, Y(yr), c.z);
      }
    }
    if (cfg.extra && cfg.extra.oeffnungen) cfg.extra.oeffnungen(api);

    // ---- Wendeltreppe durch alle Geschosse (Kern 3 × 3, Ring 2)
    let treppe = null;
    if (cfg.geschosse.length > 1) {
      const frei7 = (c) => c.d8 > 3 && !istHofwand(c) && !istLoggia(c) && !istInnenwand(c) && c.dHof > 3 && !c.portikus;
      const ok = new Set(D.haupt.filter(frei7).map((c) => P.ck(c.x, c.z)));
      const ziel = cfg.treppe || { u: 0, w: 0 };
      let best = null, bd = Infinity;
      for (const c of D.haupt) {
        if (!ok.has(P.ck(c.x, c.z))) continue;
        let pass = true;
        for (let dx = -4; dx <= 4 && pass; dx++) for (let dz = -4; dz <= 4; dz++) if (!ok.has(P.ck(c.x + dx, c.z + dz))) { pass = false; break; }
        const d = Math.hypot(c.u - ziel.u, c.w - ziel.w);
        if (pass && d < bd) { bd = d; best = c; }
      }
      if (!best) throw new Error(`Palazzo ${PJ.id}: kein Platz für die Wendeltreppe`);
      treppe = WZ.treppe.wendeltreppe({ mitte: { x: best.x, z: best.z }, radiusInnen: 1, radiusAussen: 3, yVon: Y(0), yBis: Y(BASIS[cfg.geschosse.length - 1]), rolle: 'pietra_serena', drehsinn: 'rechts' });
      for (const l of WZ.treppe.treppenloch(treppe.lauf, 3)) frei(l.x, l.y, l.z);
      for (const b of treppe) {                                        // Kopffreiheit auch über den Eckpodesten
        if (Math.max(Math.abs(b.x - best.x), Math.abs(b.z - best.z)) <= 1) continue;
        for (let h = 1; h <= 3; h++) if (b.y + h <= Y(BASIS[cfg.geschosse.length - 1])) frei(b.x, b.y + h, b.z);
      }
      for (const b of treppe) if (b.y > Y(0)) set(b.x, b.y, b.z, b.typ, 'treppe', true);
      api.treppe = treppe;
    }
    if (cfg.extra && cfg.extra.vorher) cfg.extra.vorher(api);

    // ---- Modul 0: Fundament, Böden (Erdgeschoss), Hofpflaster
    for (const c of D.haupt) for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
    for (const c of D.hofZellen) for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
    for (const c of D.haupt) set(c.x, Y(0), c.z, istLoggia(c) || c.portikus ? T.serena : ((Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1) ? T.terrakotta : T.weiss, 'boden');
    for (const c of D.hofZellen) set(c.x, Y(0), c.z, c.garten ? T.rasen : T.pflaster, 'hof');

    // ---- Modul 1: Außenwand mit Fenstern, Gesimsen und Kranzgesims
    for (const c of D.haupt) {
      if (c.d8 > 2) continue;
      for (let yr = 1; yr <= TRAUFE; yr++) {
        if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
        const s = geschossVon(yr);
        if (c.portikus && yr <= BASIS[1]) {                            // Portikus: Säulen und Bögen statt Wand
          if (c.d8 === 1) set(c.x, Y(yr), c.z, T.serena, 'portikus');
          continue;
        }
        const f = fensterZelle(c, yr, c.entlang, true);
        if (f === 'glas') { set(c.x, Y(yr), c.z, glas(Math.round(c.u + c.w), yr), 'fenster'); continue; }
        if (f === 'saeule') { set(c.x, Y(yr), c.z, T.serena, 'fenster'); continue; }
        const gesims = BASIS.includes(yr) && yr > 0, kranz = yr >= TRAUFE - 1;
        const t = c.d8 === 1 ? cfg.material(s, c, yr, { gesims, kranz, sockel: yr <= 1 }) : T.putz;
        set(c.x, Y(yr), c.z, t, kranz ? 'kranzgesims' : 'aussenwand');
      }
    }

    // ---- Modul 2: Hof (Arkaden, Hofwände), Loggia, Innenwände
    for (const c of D.haupt) {
      if (!istHofwand(c) || c.d8 <= 2) continue;
      for (let yr = 1; yr <= TRAUFE; yr++) {
        if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
        const s = geschossVon(yr);
        if (s >= 1 || !c.grossHof || hof.tiefe === 0) {
          const f = s >= 1 ? fensterZelle(c, yr, c.hofEntlang, false) : null;
          if (f === 'glas') { set(c.x, Y(yr), c.z, glas(Math.round(c.u - c.w), yr), 'hoffenster'); continue; }
          if (f === 'saeule') { set(c.x, Y(yr), c.z, T.serena, 'hoffenster'); continue; }
          set(c.x, Y(yr), c.z, BASIS.includes(yr) ? T.serena : (c.dHof === 1 ? (cfg.hofMaterial ? cfg.hofMaterial(s, c, yr) : T.putz) : T.putz), 'hofwaende');
          continue;
        }
        set(c.x, Y(yr), c.z, yr <= hof.kaempfer ? T.serena : (yr === BASIS[1] ? T.serena : T.putz), 'hofarkaden');
      }
    }
    for (const c of D.haupt) {
      if (!istInnenwand(c) && !istPortikuswand(c)) continue;
      const p = istPortikuswand(c) ? 'loggiawand' : 'innenwaende';
      for (let yr = 1; yr < BASIS[1]; yr++) if (!hat(c.x, Y(yr), c.z) && !luft.has(key(c.x, Y(yr), c.z))) set(c.x, Y(yr), c.z, p === 'loggiawand' ? T.serena : T.putz, p);
    }

    // ---- Modul 3: Geschossböden (mit Treppenloch), oberste Decke
    for (const c of D.haupt) {
      if (c.d8 <= 2 || istHofwand(c)) continue;
      for (let s = 1; s < BASIS.length; s++) {
        const yr = BASIS[s];
        if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
        const holz = s < BASIS.length - 1 ? ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? T.terrakotta : T.holz) : T.putz;
        set(c.x, Y(yr), c.z, s === BASIS.length - 1 ? T.putz : holz, s === BASIS.length - 1 ? 'decke' : 'geschossboeden');
      }
    }

    // ---- Modul 4: Dach (Walm von Außen- und Hofkante) oder Flachdach mit Zinnen; Dachraum unzugänglich
    for (const c of D.haupt) {
      const top = dachLage(c);
      let lo = top;
      for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); const nt = n ? dachLage(n) : TRAUFE + 1; if (nt < lo) lo = nt; }
      for (let yr = Math.min(lo, top); yr <= top; yr++) if (!hat(c.x, Y(yr), c.z) && !luft.has(key(c.x, Y(yr), c.z))) set(c.x, Y(yr), c.z, yr === top ? (cfg.dach && cfg.dach.art === 'flach' ? T.pflaster : T.ziegel) : T.mauer, 'dach');
      for (let yr = TRAUFE + 1; yr < Math.min(lo, top); yr++) if (!hat(c.x, Y(yr), c.z)) unzug('dach', 'Dachraum unter dem Walmdach (ohne Zugang)', c.x, Y(yr), c.z);
    }
    if (cfg.zinnen) {
      for (const c of D.haupt) {
        if (c.d8 !== 1) continue;
        const v = c.entlang === 'u' ? c.u : c.w;
        for (let yr = TRAUFE + 2; yr <= TRAUFE + 1 + cfg.zinnen.hoehe; yr++) {
          const luecke = yr > TRAUFE + 1 + Math.floor(cfg.zinnen.hoehe / 2) && (((Math.floor(v / cfg.zinnen.abstand)) % 2 + 2) % 2 === 1);
          if (!luecke) set(c.x, Y(yr), c.z, T.forte, 'zinnen');
        }
      }
    }
    if (cfg.extra && cfg.extra.nachher) cfg.extra.nachher(api);

    // ---- Licht: je Geschoss im Raster 12
    const lt = [];
    for (let s = 0; s < cfg.geschosse.length; s++) {
      const steh = [];
      for (const c of D.haupt) {
        const b = zellen.get(key(c.x, Y(BASIS[s]), c.z));
        if (b && (b.p === 'boden' || b.p === 'geschossboeden') && !hat(c.x, Y(BASIS[s] + 1), c.z) && !hat(c.x, Y(BASIS[s] + 2), c.z)) steh.push({ x: c.x, y: Y(BASIS[s] + 1), z: c.z });
      }
      for (const l of WZ.lichtRaster(steh, { abstand: 12 })) {
        const k = key(l.x, l.y, l.z); const e = zellen.get(k); if (!e) continue;
        teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = 'licht'; lt.push(k);
      }
    }
    teile.set('licht', lt);

    PLAN = { zellen, teile, oeff, unz, treppe };
    return PLAN;
  }

  const OEFF_TEIL = Object.assign({ portale: 'aussenwand', portikus: 'portikus', loggiawand: 'loggiawand', hofarkaden: 'hofarkaden', innenwaende: 'innenwaende' }, cfg.oeffnungTeil || {});
  function modul(n, liste) {
    return {
      module: n,
      build(ctx) {
        const Pl = plan();
        for (const id of liste) {
          const keys = Pl.teile.get(id) || [];
          if (keys.length) {
            const cells = keys.map((k) => Pl.zellen.get(k));
            const typ = new Map(cells.map((c) => [c.x + ',' + c.y + ',' + c.z, c.t]));
            ctx.part(id).fill(cells, (x, y, z) => typ.get(x + ',' + y + ',' + z));
          }
          for (const [k, z] of Pl.oeff) { const [art, pp] = k.split('|'); if ((OEFF_TEIL[pp] || pp) === id) ctx.oeffnung(z, art); }
          for (const [k, z] of Pl.unz) { const i = k.indexOf('|'); if (k.slice(0, i) === id) ctx.unzugaenglich(z, k.slice(i + 1)); }
        }
      }
    };
  }

  return { lade, plan, modul, zelleBei, Y, BODEN_Y, BASIS, TRAUFE, cfg };
}

module.exports = { palazzo };
