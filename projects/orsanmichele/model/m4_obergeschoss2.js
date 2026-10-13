'use strict';
// Modul 4: 2. Obergeschoss und Arkadenfries (Katalog §5, mit K0 aus dem Prüfbericht D1).
// Aufteilung der Lagen (K0): og2_wand 52..69 ohne Fenster und Wappen, Wappen 68..69, arkadenfries 70..73, kranzgesims 74,
// decke_og2 (Modul 7) 74 nur d >= 4. Fenster 10 hoch (y 58..67), sonst wie OG1.
// Fries: 6er-Takt, Konsolenpaar (2 breit, Takt 0..1) und Blendbogen (4 breit, Takt 2..5, 1 tief, Kämpfer y 72, Scheitel y 73,
// weil Lage 74 das Kranzgesims ist); dahinter ein Dreipassfeld (2 x 2 in d = 2). Konsolen kragen 1 (y 70..71) bzw. 2 (y 72..73) aus
// (Luftraum, Katalog §0.5). Der Takt beginnt an der Ecke (u -34 bzw. w -24); die Seiten sind nicht spiegelsymmetrisch.
const WZ = require('../../../tools/wahrzeichen');
const O = require('../lib/om.js');

const FY0 = 58, FY1 = 67, WAPPEN_Y0 = 68, WAPPEN_Y1 = 69;

module.exports = {
  module: 4,
  build(ctx) {
    const L = O.lade();
    const forte = WZ.typ('pietra_forte'), serena = WZ.typ('pietra_serena'), weiss = WZ.typ('marmor_weiss'), glas = WZ.typ('glas_fenster');
    const orn = WZ.typ('marmor_ornament');
    const wand = L.zellen.filter((c) => c.d <= 3);
    const frei = (c, yr) => O.fensterInhalt(c, yr, FY0, FY1) !== null || O.wappenIdx(c, yr, WAPPEN_Y0, WAPPEN_Y1) >= 0;

    // 1. Wand y 52..69
    const w = [];
    for (let yr = 52; yr <= 69; yr++) for (const c of wand) if (!frei(c, yr)) w.push({ x: c.x, y: O.Y(yr), z: c.z });
    ctx.part('og2_wand').fill(w, forte);

    // 2. Biforien und Wappen
    const bi = [];
    for (let yr = FY0; yr <= FY1; yr++) {
      for (const c of wand) {
        const t = O.fensterInhalt(c, yr, FY0, FY1);
        if (t === 'weiss' || t === 'glas') bi.push({ x: c.x, y: O.Y(yr), z: c.z, t });
      }
    }
    for (let yr = WAPPEN_Y0; yr <= WAPPEN_Y1; yr++) {
      for (const c of wand) {
        const i = O.wappenIdx(c, yr, WAPPEN_Y0, WAPPEN_Y1);
        if (i >= 0) bi.push({ x: c.x, y: O.Y(yr), z: c.z, t: 'wappen', i });
      }
    }
    const biMap = new Map(bi.map((b) => [`${b.x},${b.y},${b.z}`, b]));
    ctx.part('og2_biforien').fill(bi, (x, y, z) => {
      const b = biMap.get(`${x},${y},${z}`);
      return b.t === 'glas' ? glas : b.t === 'wappen' ? WZ.fresko(O.FARBEN[(b.i + 2) % 4]) : weiss;
    });

    const nischen2 = [];
    for (let yr = FY0; yr <= FY1; yr++) for (const c of wand) if (c.d === 1 && O.fensterInhalt(c, yr, FY0, FY1) === 'luft') nischen2.push({ x: c.x, y: O.Y(yr), z: c.z });
    ctx.oeffnung(nischen2, 'fenster_offen');

    // 3. Arkadenfries y 70..73: Wand, Blendbögen (Aussparung), Dreipassfelder, Konsolen im Luftraum
    const fr = [];
    for (let yr = 70; yr <= 73; yr++) {
      for (const c of wand) {
        const p = O.takt(O.laengs(c, c.seite), c.seite);
        if (c.d === 1 && ((yr === 72 && p >= 2) || (yr === 73 && p >= 3 && p <= 4))) continue;   // Blendbogen
        const dreipass = c.d === 2 && yr >= 72 && p >= 3 && p <= 4;
        fr.push({ x: c.x, y: O.Y(yr), z: c.z, m: dreipass ? orn : forte });
      }
      // Konsolen: s = 1 nur mit Wandkontakt, s = 2 nur mit Kontakt zu s = 1 (Rasterversatz durch die Drehung)
      const wandSet = new Set(fr.filter((f) => f.y === O.Y(yr)).map((f) => O.K(f.x, f.z)));
      const hat = (set, x, z) => set.has(O.K(x + 1, z)) || set.has(O.K(x - 1, z)) || set.has(O.K(x, z + 1)) || set.has(O.K(x, z - 1));
      const s1 = new Set();
      const cand = O.aussen().filter((a) => a.seite && O.takt(a.q, a.seite) <= 1);
      for (const a of cand) if (a.s === 1 && hat(wandSet, a.x, a.z)) { s1.add(O.K(a.x, a.z)); fr.push({ x: a.x, y: O.Y(yr), z: a.z, m: forte }); }
      if (yr >= 72) for (const a of cand) if (a.s === 2 && hat(s1, a.x, a.z)) fr.push({ x: a.x, y: O.Y(yr), z: a.z, m: forte });
    }
    const frMap = new Map(fr.map((b) => [`${b.x},${b.y},${b.z}`, b.m]));
    ctx.part('arkadenfries').fill(fr, (x, y, z) => frMap.get(`${x},${y},${z}`));
    const blend = [];                                  // Blendbogen-Nischen des Frieses (d = 1): offene Nischen
    for (let yr = 72; yr <= 73; yr++) for (const c of wand) {
      const p = O.takt(O.laengs(c, c.seite), c.seite);
      if (c.d === 1 && ((yr === 72 && p >= 2) || (yr === 73 && p >= 3 && p <= 4))) blend.push({ x: c.x, y: O.Y(yr), z: c.z });
    }
    ctx.oeffnung(blend, 'fenster_offen');

    // 4. Kranzgesims y 74: Wandring d <= 3 und Auskragung s <= 2 (Luftraum)
    const kg = wand.map((c) => ({ x: c.x, y: O.Y(74), z: c.z })).concat(O.aussen().map((a) => ({ x: a.x, y: O.Y(74), z: a.z })));
    ctx.part('kranzgesims').fill(kg, serena);
  }
};
