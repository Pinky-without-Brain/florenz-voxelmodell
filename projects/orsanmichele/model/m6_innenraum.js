'use strict';
// Modul 6: Innenraum Erdgeschoss (Katalog §7): zwei Schiffe, drei Joche, Pfeiler, Wandvorlagen, Kreuzgewölbe, Decke.
// Entscheidungen (Widerspruch im Katalog: "d >= 7" ergibt u -28..28, w -18..17, genannt sind u -27..27, w -17..16):
//  - Gewölbefelder decken den ganzen Innenraum d >= 7 (Joche u -28..-10 / -9..9 / 10..28, Schiffe w -18..-1 / 0..17).
//  - Pfeiler und Wandvorlagen reichen bis unter die Gewölbeunterkante (Kämpferblöcke), weil die Laibung am Rand über Lage 14 liegt.
//  - Gurtbögen: je Pfeilerachse eine um 1 abgesenkte Rippe (2 breit) unter dem Gewölbe.
//  - decke_eg liegt über allen Nicht-Pfeilerzellen d >= 3 (Katalog: d >= 7), sonst klafft über den Füllwänden (d 3..6) ein Graben
//    zwischen Gewölbe und Obergeschoss. Die Gewölbescheitel (Lage 22/23) bleiben unter der Deckenunterkante (Lage 25).
const WZ = require('../../../tools/wahrzeichen');
const O = require('../lib/om.js');

module.exports = {
  module: 6,
  build(ctx) {
    const L = O.lade();
    const V = ctx.vaults;
    const serena = WZ.typ('pietra_serena'), orn = WZ.typ('marmor_ornament'), bruch = WZ.typ('pietra_forte_bruch');
    const blau = WZ.fresko('blau'), gold = WZ.typ('gold'), rot = WZ.fresko('rot'), gelb = WZ.fresko('gelb');
    const innen = L.zellen.filter((c) => c.d >= 7);
    const PI = { u: [[-11, -8], [8, 11]], w: [-2, 1] };      // freistehende Pfeiler (lib/om.js: PFEILER_INNEN)
    const lo = (c) => O.gewLaibung(V, O.feldVon(c), c.ui, c.wi);
    const rippe = (c) => c.ui === -10 || c.ui === -9 || c.ui === 9 || c.ui === 10 || c.wi === -1 || c.wi === 0;

    // Bemalte Pfeiler (vereinfacht): Heiligenfelder auf den Außenzellen, Grund blau, Rahmen rot, Nimbus gold
    const bemalt = (c, yr) => {
      const ring = c.wi === PI.w[0] || c.wi === PI.w[1] || (PI.u.some(([a, b]) => c.ui === a || c.ui === b));
      if (!ring) return serena;
      if (yr === 4 || yr === 9) return rot;
      return yr === 8 && (c.ui + c.wi) % 2 === 0 ? gold : (yr === 6 || yr === 7) && (c.ui + c.wi) % 2 === 0 ? gelb : blau;
    };
    // Säulenzellen (stehen auf dem Boden, Katalog y 3..: ab Lage 1, sonst schweben sie): Schaft y 1..11, Kapitell y 12..13 (nur freistehende Pfeiler), Kämpferblock y 14..lo-1
    const saeule = (pred, kapitell) => {
      const out = [];
      for (const c of innen) {
        if (!pred(c)) continue;
        const top = lo(c) - 1;
        for (let yr = 1; yr <= Math.max(13, top); yr++) out.push({ x: c.x, y: O.Y(yr), z: c.z, m: kapitell && (yr === 12 || yr === 13) ? orn : kapitell && yr >= 4 && yr <= 9 ? bemalt(c, yr) : serena });
      }
      return out;
    };
    const mk = (list) => { const m = new Map(list.map((b) => [`${b.x},${b.y},${b.z}`, b.m])); return (x, y, z) => m.get(`${x},${y},${z}`); };

    // 1. Zwei freistehende Pfeiler 4 x 4
    const ip = saeule(O.innenpfeilerSaeule, true);
    ctx.part('innenpfeiler').fill(ip, mk(ip));
    // 2. Wandvorlagen 2 x 2 (N, S bei u = +-9,5 und W, E bei w = -0,5)
    const wv = saeule(O.vorlageSaeule, false);
    ctx.part('wandvorlagen').fill(wv, serena);

    // 3. Sechs Kreuzgewölbe, Dicke 2 (Laibung y 14 + floor(h), Scheitel Lage 22); Gurtbögen als abgesenkte Rippen
    const saeulenSpalte = new Set(innen.filter((c) => O.innenpfeilerSaeule(c) || O.vorlageSaeule(c)).map((c) => O.K(c.x, c.z)));
    const gw = [];
    const gewKey = new Set();
    const put = (c, yr) => { const k = `${c.x},${yr},${c.z}`; if (!gewKey.has(k)) { gewKey.add(k); gw.push({ x: c.x, y: O.Y(yr), z: c.z }); } };
    for (const c of innen) {
      const f = O.feldVon(c);
      const l = lo(c);
      let hi = l + 1;                                                   // Dicke 2
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = O.zelle(c.x + dx, c.z + dz);
        if (!n || n.d < 7) continue;
        const fn = O.feldVon(n);
        if (fn && fn.j === f.j && fn.s === f.s) hi = Math.max(hi, lo(n));
      }
      for (let yr = l; yr <= hi; yr++) put(c, yr);
      if (rippe(c) && !saeulenSpalte.has(O.K(c.x, c.z))) put(c, l - 1);
    }
    // Kantenkontakte (nur diagonale Berührung) werden flächig verbunden; Ergänzungen nur im freien Innenraum
    for (const e of V.connectEdges(gw)) {
      const c = O.zelle(e.x, e.z);
      if (c && c.d >= 7 && !saeulenSpalte.has(O.K(e.x, e.z))) put(c, e.y - O.BODEN_Y);
    }
    // Laternen: Stehzellen des Erdgeschosses (ohne Pfeiler) -> Lichtraster, Laterne anstelle der untersten Schalenzelle der Säule
    const stehen = innen.filter((c) => !O.innenpfeilerSaeule(c) && !O.vorlageSaeule(c)).map((c) => [c.x, O.Y(1), c.z]);
    const lampSp = new Set(WZ.licht.lichtRaster(stehen, { abstand: 9 }).map((q) => O.K(q.x, q.z)));
    const minY = new Map();
    for (const b of gw) { const k = O.K(b.x, b.z); minY.set(k, Math.min(minY.has(k) ? minY.get(k) : 1e9, b.y)); }
    const lampen = gw.filter((b) => lampSp.has(O.K(b.x, b.z)) && b.y === minY.get(O.K(b.x, b.z)));
    const lampKeys = new Set(lampen.map((b) => O.K(b.x, b.y) + ',' + b.z));
    const gwOhne = gw.filter((b) => !lampKeys.has(O.K(b.x, b.y) + ',' + b.z));
    // Bemalung: unterste Schicht jeder Säule blau (Sternenhimmel), goldene Sterne im Raster 3 x 3
    ctx.part('kreuzgewoelbe').fill(gwOhne, (x, y, z) => {
      if (y !== minY.get(O.K(x, z))) return serena;
      const c = O.zelle(x, z);
      return c.ui % 3 === 0 && c.wi % 3 === 0 ? gold : blau;
    });
    ctx.part('gewoelbe_laternen').fill(lampen, WZ.typ('licht'));

    // Hinterfüllung: freie Zellen über dem Gewölbe (d >= 7) und über dem Maßwerk der Füllwand (d 3..6) bis Lage 24
    const hi = new Map();
    for (const b of gw) { const k = O.K(b.x, b.z); hi.set(k, Math.max(hi.has(k) ? hi.get(k) : 0, b.y - O.BODEN_Y)); }
    const hf = [];
    for (const c of L.zellen) {
      if (c.d < 3) continue;
      const r = O.ring(c);
      if (r && r.typ !== 'feld') continue;
      let start;
      if (c.d >= 7) start = hi.get(O.K(c.x, c.z)) + 1;
      else { let top = 0; for (let yr = 3; yr <= 24; yr++) if (O.bogenBereich(r.a, yr) === 'luft') top = yr; start = top + 1; }
      for (let yr = start; yr <= 24; yr++) if (!O.laneZelle(c.x, c.z, yr)) hf.push({ x: c.x, y: O.Y(yr), z: c.z });
    }
    ctx.part('gewoelbe_hinterfuellung').fill(hf, bruch);

    // 4. Decke y 25..26 über allen Nicht-Pfeilerzellen d >= 3
    const dk = [];
    for (let yr = 25; yr <= 26; yr++) {
      for (const c of L.zellen) {
        if (c.d < 3) continue;
        const r = O.ring(c);
        if (r && r.typ !== 'feld') continue;
        if (O.laneZelle(c.x, c.z, yr)) continue;
        dk.push({ x: c.x, y: O.Y(yr), z: c.z });
      }
    }
    ctx.part('decke_eg').fill(dk, serena);
  }
};
