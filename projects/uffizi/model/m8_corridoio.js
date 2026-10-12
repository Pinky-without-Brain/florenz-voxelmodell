'use strict';
// Uffizien Modul 8: Corridoio Vasariano diesseits des Arno (Katalog §9). Alle Zellen liegen in der Maske M_COR
// (Zellen von w328477211, r2302811, w1344547176 mit x >= -528, ohne die Masken der Nachbarwahrzeichen). Die Brücke über die
// Via della Ninna und der Lungarno-Streifen sind die zusammenhängenden Teile der Maske; die Schnittlinie zum Ponte Vecchio
// bei x = -528 bleibt ohne Stirnwand, der Querschnitt dort ist der des Streifens (Platte 77..78, Wände 79..85, Decke 86..87).
// Die Treppe zum Cavalcavia und der Austritt zum Lungarno liegen in M_UF und gehören nach K8 zu Modul 7 (korridor_treppe).

const WZ = require('../../../tools/wahrzeichen');
const { get, TYP } = require('./_uf.js');

// Brücke über die Via della Ninna (Lagen in Y; Lage 26 = Y 91)
const Y_KAEMPFER = 91, R_BOGEN = 8, DICKE_BOGEN = 2, Y_SCHEITEL = 99;
const Y_BRUECKE_BODEN = [100, 101];
const Y_GANG = [102, 108];                // Gang 7 x 7 (Lage 37..43)
const Y_BRUECKE_DECKE = [109, 110];
const T0 = 3.35, T1 = 10.35;              // Gang 7 breit; Wände je 3,35 (wie die Öffnungen in Palast und Kante 41)
const B_BREITE = 13.7;
// Lungarno
const KAEMPFER = 72, SCHEITEL_R = 4.5, ARKADE_OBEN = 76;
const BODEN = [77, 78], WAND = [79, 85], DECKE = [86, 87];
const PERIODE = 12, PFEILER_B = 3, PFEILER_C0 = 6;

/** Zusammenhängende Teile (8er-Nachbarschaft) einer Maske als Zellenlisten, größte zuerst. */
function komponenten(m) {
  const key = (x, z) => x * 10000 + z;
  const set = new Set(m.cells.map(([x, z]) => key(x, z)));
  const seen = new Set();
  const out = [];
  for (const [x, z] of m.cells) {
    if (seen.has(key(x, z))) continue;
    const st = [[x, z]], comp = [];
    seen.add(key(x, z));
    while (st.length) {
      const [a, b] = st.pop();
      comp.push([a, b]);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const k = key(a + dx, b + dz);
          if (set.has(k) && !seen.has(k)) { seen.add(k); st.push([a + dx, b + dz]); }
        }
      }
    }
    out.push(comp);
  }
  return out.sort((p, q) => q.length - p.length);
}

const zk = (c) => c.x * 1000000 + c.z * 1000 + c.y;

/** Zellen, die von unten her tragen (Geländekontakt oder Zelle darunter, dann seitlich je Lage); Rest fällt weg (R3). */
function stuetzen(list, gt) {
  const all = new Set(list.map(zk));
  const byY = new Map();
  for (const c of list) { if (!byY.has(c.y)) byY.set(c.y, []); byY.get(c.y).push(c); }
  const ok = new Set();
  for (const y of [...byY.keys()].sort((p, q) => p - q)) {
    const st = [];
    for (const c of byY.get(y)) {
      if (y === gt(c.x, c.z) + 1 || ok.has(zk({ x: c.x, y: y - 1, z: c.z }))) { ok.add(zk(c)); st.push(c); }
    }
    while (st.length) {
      const c = st.pop();
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = { x: c.x + dx, y, z: c.z + dz };
        if (all.has(zk(n)) && !ok.has(zk(n))) { ok.add(zk(n)); st.push(n); }
      }
    }
  }
  return ok;
}

// Fenster 2 breit im Abstand 8 (Mitte bei 4 + 8 k)
const inFenster = (s) => { const m = (((s - 4) % 8) + 8) % 8; return m < 1 || m >= 7; };

module.exports = {
  module: 8,
  build(ctx) {
    const S = get();
    const K = S.masken.masken.korridor;
    const brueckeMaske = WZ.Maske.ausGebaeude(['w328477211']);
    const teile = komponenten(K);
    const bruecke = teile.find((c) => brueckeMaske.has(c[0][0], c[0][1]));
    const lungarno = teile.find((c) => c !== bruecke);          // größter übriger Teil
    // Die übrigen Zellen der Maske (Haarlinien von w1344547176 an Brücke und Uffizien, 64 Zellen) tragen kein Bauteil des Katalogs.

    // ---------------------------------------------------------------- Brücke
    // Rahmen: s entlang der Brücke von der Palastkante (s ~ 0) zur Uffizienkante 41 (s ~ 16,2), v quer von West nach Ost
    const P0 = { x: -97, z: 906.5 };
    const dl = Math.hypot(-103 + 97, 921.5 - 906.5);
    const ds = { x: (-103 + 97) / dl, z: (921.5 - 906.5) / dl };
    const dn = { x: ds.z, z: -ds.x };
    const sv = (x, z) => ({ s: (x - P0.x) * ds.x + (z - P0.z) * ds.z, v: (x - P0.x) * dn.x + (z - P0.z) * dn.z });
    let s0 = Infinity, s1 = -Infinity;
    for (const [x, z] of bruecke) { const p = sv(x, z); s0 = Math.min(s0, p.s); s1 = Math.max(s1, p.s); }
    const sc = (s0 + s1) / 2;
    const bogen = [], boden = [], wandB = [], deckeB = [], fensterB = [];
    for (const [x, z] of bruecke) {
      const { s, v } = sv(x, z);
      // Tragbogen unter dem Boden (Halbkreis, Kämpfer Y 91, Scheitel Y 99, Dicke 2) und Spandrillen bis unter den Boden
      for (let y = Y_KAEMPFER; y <= Y_SCHEITEL; y++) {
        if (Math.hypot(s - sc, y - Y_KAEMPFER) > R_BOGEN - DICKE_BOGEN) bogen.push({ x, y, z });
      }
      for (const y of Y_BRUECKE_BODEN) boden.push({ x, y, z });
      const seite = v < T0 ? 0 : v >= T1 ? 2 : 1;
      if (seite !== 1) {
        const dv = seite === 0 ? v : B_BREITE - v;                  // Tiefe in der Wand
        for (let y = Y_GANG[0]; y <= Y_GANG[1]; y++) {
          if (y >= 104 && y <= 106 && inFenster(s)) { if (dv >= 1 && dv < 2) fensterB.push({ x, y, z }); }   // 2 x 3, Glas mittig
          else wandB.push({ x, y, z });
        }
      }
      for (const y of Y_BRUECKE_DECKE) deckeB.push({ x, y, z });
    }
    ctx.part('bruecke_bogen').fill(bogen, TYP.pietra_serena);
    const k = ctx.part('bruecke_korridor');
    k.fill(boden, TYP.pietra_serena);
    k.fill(wandB, TYP.pietra_forte);
    if (fensterB.length) k.fill(fensterB, TYP.glas_fenster);
    k.fill(deckeB, TYP.pietra_forte);

    // ---------------------------------------------------------------- Lungarno-Streifen
    // Randabstand ohne die Ränder zu den Uffizien und zum Schnitt bei x = -528 (dort stehen keine Wände): Vereinigung aus
    // Streifen, M_UF und einem Streifen hinter dem Schnitt (x <= -529)
    const lg = WZ.makeRahmen({ ox: -350, oz: 1141.5, thetaDeg: 206.8 });
    const inside = lungarno.slice();
    for (const c of S.cells) inside.push(c);
    let zMin = Infinity, zMax = -Infinity;
    for (const c of lungarno) { zMin = Math.min(zMin, c[1]); zMax = Math.max(zMax, c[1]); }
    for (let x = -560; x <= -529; x++) for (let z = zMin - 20; z <= zMax + 20; z++) inside.push([x, z]);
    const U = WZ.Maske.vonZellen(inside);
    const info = lungarno.map(([x, z]) => {
      const l = lg.toLocal(x, z);
      return { x, z, d: U.d8(x, z), u: l.u, v: -l.w };
    });
    // Flussseite: v größer als die Mitte des örtlichen Querschnitts
    const bins = new Map();
    for (const c of info) {
      const b = Math.floor(c.u / 4);
      let e = bins.get(b);
      if (!e) { e = { lo: Infinity, hi: -Infinity }; bins.set(b, e); }
      e.lo = Math.min(e.lo, c.v); e.hi = Math.max(e.hi, c.v);
    }
    const gt = WZ.boden.groundTopY;
    const arkade = [], pfeiler = [], bodenL = [], wandL = [], glasL = [], deckeL = [];
    for (const c of info) {
      const e = bins.get(Math.floor(c.u / 4));
      const fluss = c.v > (e.lo + e.hi) / 2;
      if (c.d <= 3) {
        // Arkade: Pfeiler 3 x 3 im Abstand 12 (u = 6 + 12 k) bis Y 72, Halbkreisbögen Spannweite 9 (Kämpfer Y 72), Spandrillen bis Y 76
        let dp = (((c.u - PFEILER_C0) % PERIODE) + PERIODE) % PERIODE;
        if (dp > PERIODE / 2) dp -= PERIODE;
        const istPfeiler = Math.abs(dp) < PFEILER_B / 2;
        const da = PERIODE / 2 - Math.abs(dp);                        // Abstand von der Bogenmitte
        for (let y = gt(c.x, c.z) + 1; y <= ARKADE_OBEN; y++) {
          const offen = !istPfeiler && (y <= KAEMPFER || (y - KAEMPFER) < Math.sqrt(Math.max(0, SCHEITEL_R * SCHEITEL_R - da * da)));
          if (offen) continue;
          (istPfeiler && y <= KAEMPFER ? pfeiler : arkade).push({ x: c.x, y, z: c.z });
        }
        // Korridorwände 3 dick (Y 79..85); kleine Fenster 2 x 3 auf der Flussseite (Y 81..83), Glas in der mittleren Zelle
        for (let y = WAND[0]; y <= WAND[1]; y++) {
          if (fluss && y >= 81 && y <= 83 && inFenster(c.u)) { if (c.d === 2) glasL.push({ x: c.x, y, z: c.z }); }
          else wandL.push({ x: c.x, y, z: c.z });
        }
      }
      for (const y of BODEN) bodenL.push({ x: c.x, y, z: c.z });
      for (const y of DECKE) deckeL.push({ x: c.x, y, z: c.z });
    }
    const a = ctx.part('lungarno_arkade');
    const stuetz = stuetzen([...pfeiler, ...arkade], gt);
    a.fill(pfeiler.filter((c) => stuetz.has(zk(c))), TYP.pietra_forte);
    a.fill(arkade.filter((c) => stuetz.has(zk(c))), TYP.pietra_serena);
    ctx.part('lungarno_boden').fill(bodenL, TYP.pietra_serena);
    const lk = ctx.part('lungarno_korridor');
    lk.fill(wandL, TYP.pietra_forte);
    if (glasL.length) lk.fill(glasL, TYP.glas_fenster);
    lk.fill(deckeL, TYP.pietra_forte);
  }
};
