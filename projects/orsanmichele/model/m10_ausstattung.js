'use strict';
// Modul 10 (B3): Ausstattung der Innenräume, alles vereinfacht (Blockfiguren und Blockmöbel, nicht nach Vorbild).
//  - Erdgeschoss: Orcagna-Tabernakel (gotischer Marmor-Baldachin mit Madonnenbild) im östlichen Ende des Nordschiffs,
//    Altar der hl. Anna am Westende des Südschiffs, Kirchenbänke im Südschiff.
//  - 1. Obergeschoss: Museumssaal mit den vierzehn Zunftstatuen auf Sockeln (Originale im Museum, Kopien an den Außennischen).
// Lage der Räume: lib/om.js (ui, wi; Tiefen dN/dS/dW/dE). Die Bauteile liegen nach dem Rohbau auf freien Zellen.
const WZ = require('../../../tools/wahrzeichen');
const O = require('../lib/om.js');
const { schliesse } = require('../lib/riss.js');

module.exports = {
  module: 10,
  build(ctx) {
    const L = O.lade();
    const weiss = WZ.typ('marmor_weiss'), orn = WZ.typ('marmor_ornament'), saeule = WZ.typ('marmor_saeule'), gold = WZ.typ('gold');
    const holz = WZ.typ('holz'), bronze = WZ.typ('bronze');
    const blau = WZ.fresko('blau'), rot = WZ.fresko('rot'), gelb = WZ.fresko('gelb'), weissF = WZ.fresko('weiss');
    const innenEG = L.zellen.filter((c) => c.d >= 7);
    const sel = (list, u0, u1, w0, w1) => list.filter((c) => c.ui >= u0 && c.ui <= u1 && c.wi >= w0 && c.wi <= w1);
    const mk = (list) => { const m = new Map(list.map((b) => [`${b.x},${b.y},${b.z}`, b.m])); return (x, y, z) => m.get(`${x},${y},${z}`); };
    const put = (out, cells, lagen, m) => { for (const c of cells) for (const yr of lagen) out.push({ x: c.x, y: O.Y(yr), z: c.z, m }); };
    const rng = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

    // ---------------------------------------------------------------- Orcagna-Tabernakel (1349-1359, Marmor)
    // Grundfläche ui 21..27 (a = 0 vorn .. 6 hinten zur Ostwand), wi -14..-5 (b = 0..9). Stufen 1..2, Altartisch 3..4, vier Säulchen 3..9,
    // Gebälk 10, Spitzgiebel 11..13, goldene Spitze 13; hinten das Madonnenbild (Fresko) zwischen den Hinterpfeilern.
    {
      const tab = [];
      const feld = sel(innenEG, 21, 27, -14, -5);
      const A = (c) => c.ui - 21, B = (c) => c.wi + 14;
      for (const c of feld) {
        const a = A(c), b = B(c);
        tab.push({ x: c.x, y: O.Y(1), z: c.z, m: weiss });
        if (a >= 1 && a <= 5 && b >= 1 && b <= 8) tab.push({ x: c.x, y: O.Y(2), z: c.z, m: weiss });
        if (a >= 2 && a <= 4 && b >= 3 && b <= 6) for (const yr of [3, 4]) tab.push({ x: c.x, y: O.Y(yr), z: c.z, m: orn });   // Altartisch
        if ((a === 1 || a === 5) && (b === 2 || b === 7)) for (const yr of rng(3, 9)) tab.push({ x: c.x, y: O.Y(yr), z: c.z, m: saeule });
        if (a >= 1 && a <= 5 && b >= 2 && b <= 7) tab.push({ x: c.x, y: O.Y(10), z: c.z, m: weiss });                              // Gebälk
        if (a >= 2 && a <= 4 && b >= 3 && b <= 6) tab.push({ x: c.x, y: O.Y(11), z: c.z, m: orn });                                // Giebel
        if (a === 3 && b >= 4 && b <= 5) tab.push({ x: c.x, y: O.Y(12), z: c.z, m: orn });
        if (a === 3 && b === 4) tab.push({ x: c.x, y: O.Y(13), z: c.z, m: gold });                                                  // Spitze
      }
      // Diagonalrisse der Säulchen und des Altartischs schließen (Zusatzzelle im Grundriss)
      const feldSet = new Set(feld.map((c) => O.K(c.x, c.z)));
      const da = new Set(tab.map((b) => `${b.x},${b.y},${b.z}`));
      for (const e of schliesse(tab.map((b) => ({ x: b.x, y: b.y, z: b.z })), (x, y, z) => feldSet.has(O.K(x, z)) && !da.has(`${x},${y},${z}`))) tab.push({ x: e.x, y: e.y, z: e.z, m: orn });
      ctx.part('orcagna_tabernakel').fill(tab, mk(tab));
      // Das Dach des Baldachins ist keine Standfläche
      const dach = [];
      for (const c of feld) for (let yr = 11; yr <= 14; yr++) dach.push({ x: c.x, y: O.Y(yr), z: c.z });
      ctx.unzugaenglich(dach, 'Oberseite des Tabernakel-Baldachins: Kunstwerk, nicht zum Besteigen gedacht');
      // Madonnenbild (Bernardo Daddi, 1347): Feld a = 5, b 3..6, Lage 5..9: blauer Grund, rotes Gewand, goldener Nimbus und Rahmen
      const bild = [];
      for (const c of feld) {
        if (A(c) !== 5 || B(c) < 3 || B(c) > 6) continue;
        const b = B(c);
        for (const yr of rng(5, 9)) {
          let m = blau;
          if (yr === 9 || yr === 5) m = gold;
          else if (yr === 8 && (b === 4 || b === 5)) m = gold;           // Nimbus
          else if (yr === 7 && (b === 4 || b === 5)) m = weissF;         // Gesicht
          else if (yr === 6 && (b === 4 || b === 5)) m = rot;            // Gewand
          bild.push({ x: c.x, y: O.Y(yr), z: c.z, m });
        }
      }
      ctx.part('orcagna_madonna').fill(bild, mk(bild));
    }

    // ---------------------------------------------------------------- Altar der hl. Anna (Francesco da Sangallo, um 1526)
    // Westende des Südschiffs: Stufe, Mensa (ui -27..-26, wi 5..9), Retabel (Fresko) an der Westwand ui -28.
    {
      const al = [], rt = [];
      for (const c of sel(innenEG, -28, -25, 4, 10)) {
        if (c.ui >= -27) al.push({ x: c.x, y: O.Y(1), z: c.z, m: weiss });
        if (c.ui >= -27 && c.ui <= -26 && c.wi >= 5 && c.wi <= 9) { al.push({ x: c.x, y: O.Y(2), z: c.z, m: orn }); al.push({ x: c.x, y: O.Y(3), z: c.z, m: weiss }); }
      }
      for (const c of sel(innenEG, -28, -28, 5, 9)) {
        const b = c.wi - 5;
        for (const yr of rng(3, 8)) {
          let m = blau;
          if (yr === 8 || yr === 3) m = gold;
          else if (b === 2 && yr >= 5 && yr <= 6) m = rot;               // Maria
          else if (b === 1 && yr >= 5 && yr <= 6) m = gelb;              // Anna
          else if (b === 3 && yr === 5) m = weissF;                      // Kind
          rt.push({ x: c.x, y: O.Y(yr), z: c.z, m });
        }
      }
      ctx.part('anna_altar').fill(al, weiss);
      ctx.part('anna_retabel').fill(rt, mk(rt));
    }

    // ---------------------------------------------------------------- Kirchenbänke (Holz): Südschiff, zwei Blöcke zu je vier Reihen
    {
      const out = [];
      for (const [u0, u1] of [[-22, -14], [14, 22]]) for (const w of [5, 7, 9, 11]) put(out, sel(innenEG, u0, u1, w, w), [1], holz);
      ctx.part('gestuehl').fill(out, holz);
    }

    // ---------------------------------------------------------------- Museumssaal im 1. Obergeschoss: vierzehn Zunftstatuen auf Sockeln
    // Sockel 2 x 2 x 2 (Lage 27..28), Figur Körper 2 breit x 1 tief x 4 (Lage 29..32), Kopf Lage 33; Tiefe 4..5 von der Wand.
    {
      const saal = L.zellen.filter((c) => c.d >= 4);
      const plaetze = [];
      for (const u of [-30, -18, -6, 6, 18, 30]) plaetze.push({ seite: 'N', q: u });
      for (const u of [28, 31]) plaetze.push({ seite: 'S', q: u });
      for (const w of [-16, -8, 0]) plaetze.push({ seite: 'W', q: w });
      for (const w of [-16, -8, 0]) plaetze.push({ seite: 'E', q: w });
      const sockel = [], figur = [];
      for (const p of plaetze) {
        const t = (c) => O.tiefe(c, p.seite);
        const zellen = saal.filter((c) => O.laengs(c, p.seite) >= p.q && O.laengs(c, p.seite) <= p.q + 1 && t(c) >= 4 && t(c) <= 5);
        for (const c of zellen) {
          for (const yr of [27, 28]) sockel.push({ x: c.x, y: O.Y(yr), z: c.z });
          if (t(c) === 4) for (const yr of rng(29, 32)) figur.push({ x: c.x, y: O.Y(yr), z: c.z });
        }
        const kopf = zellen.filter((c) => t(c) === 4 && O.laengs(c, p.seite) === p.q);
        for (const c of kopf) figur.push({ x: c.x, y: O.Y(33), z: c.z });
      }
      ctx.part('museum_sockel').fill(sockel, weiss);
      ctx.part('museum_statuen').fill(figur, bronze);
    }
  }
};
