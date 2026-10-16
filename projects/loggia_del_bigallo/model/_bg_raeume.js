'use strict';
// Ausstattung der Loggia del Bigallo: Rippengewölbe, Tabernakel mit Statuen, Wappen der Misericordia (Modul 3) und
// Museumssäle (Modul 5). Alles vereinfacht in vollen Blöcken (Rollen der Palette), Quellen im BAUTEIL_KATALOG.
const WZ = require('../../../tools/wahrzeichen');

function ausstatten(api) {
  const { P, D, T, FR, TR, Y, zelleBei } = api;
  const DIRS = { n: [0, -1], s: [0, 1], w: [-1, 0], o: [1, 0] };
  const zellen = (namen) => D.alle.filter((c) => namen.includes(c.zone));
  const gruppe = (namen, f) => zellen(namen).filter((c) => P.get(c.x, Y(f), c.z) && !P.hat(c.x, Y(f + 1), c.z));
  const block = (teil, c, f, j, t) => { if (!c) return false; P.frei(c.x, Y(f + j), c.z); return P.set(c.x, Y(f + j), c.z, t, teil); };

  // Wandfeld: Wandzellen neben der Luft der Zonen namen im Geschoss mit Boden f, Seite seite, Zeilen j0..j1 (1 = Stehzelle)
  function feld(namen, f, seite, j0, j1, fn, teil) {
    const [dx, dz] = DIRS[seite];
    const ws = new Map();
    for (const c of gruppe(namen, f)) {
      const w = zelleBei(c.x + dx, c.z + dz);
      if (w && !namen.includes(w.zone)) ws.set(w.x + ',' + w.z, { w, a: (seite === 'n' || seite === 's') ? w.u : w.w });
    }
    const list = [...ws.values()];
    if (!list.length) return 0;
    const a0 = Math.min(...list.map((q) => q.a));
    let n = 0;
    for (const { w, a } of list) {
      for (let j = j0; j <= j1; j++) {
        const e = P.get(w.x, Y(f + j), w.z);
        if (!e || e.t === T.fenster) continue;
        const t = fn(Math.floor(a - a0 + 0.001), j - j0);
        if (t && P.ersetze(w.x, Y(f + j), w.z, t, teil)) n++;
      }
    }
    return n;
  }
  const rahmen = (a, b, w, h) => a === 0 || b === 0 || a === w - 1 || b === h - 1;

  // ---------------------------------------------------------------- Modul 3: Loggia
  // Rippengewölbe: je Joch ein Kreuz aus Rippen unter der Decke mit goldenem Schlussstein
  {
    const teil = 'rippengewoelbe';
    const joche = [[11.6, 18.9], [18.9, 26.2], [26.2, 34]];
    for (const c of D.alle) {
      if (!(c.zone === 'sal2' || c.zone === 'tr2' || c.zone === 'sal3') || c.w < 3) continue;
      const j = joche.find(([a, b]) => c.u >= a && c.u < b);
      if (!j) continue;
      const a = ((c.u - j[0]) / (j[1] - j[0])) * 2 - 1, b = ((c.w - 7.4) / 4.4);
      if (Math.abs(Math.abs(a) - Math.abs(b)) < 0.2) block(teil, c, 0, 8, T.weiss);
      if (Math.abs(a) < 0.16 && Math.abs(b) < 0.16) { const e = P.get(c.x, Y(8), c.z); if (e) P.ersetze(c.x, Y(8), c.z, T.gold, teil); }
    }
  }
  // Tabernakel in der Südwand: Nische mit Statue, Giebel darüber; Lünette mit der Madonna über dem mittleren
  {
    const teil = 'tabernakel_statuen';
    const NIS = [15.8, 22.3, 28.8];
    NIS.forEach((nu, k) => {
      for (const c of D.alle) {
        if (c.e !== 2 || c.zone !== 'wand') continue;
        const du = Math.abs(c.u - nu);
        if (c.d8 === 2 && du <= 0.55) {
          for (let yr = 2; yr <= 4; yr++) block(teil, c, 0, yr, k === 0 ? T.alt : T.weiss);
          block(teil, c, 0, 5, T.alt);
        }
        if (c.d8 <= 2 && du <= 1.6 && !P.istLuft(c.x, Y(7), c.z)) P.ersetze(c.x, Y(7), c.z, du <= 0.6 ? T.gold : T.orn, teil);
      }
    });
    for (const c of D.alle) {
      if (c.e !== 2 || c.zone !== 'wand' || c.d8 !== 2) continue;
      const du = c.u - NIS[1];
      if (Math.abs(du) <= 2.0) {
        const e = P.get(c.x, Y(8), c.z);
        if (e) P.ersetze(c.x, Y(8), c.z, Math.abs(du) <= 0.6 ? FR('weiss') : FR('blau'), teil);
      }
    }
  }
  // Wappen der Misericordia (rotes Kreuz auf Weiß) an der Ostfassade, Obergeschoss
  {
    const teil = 'wappen_misericordia';
    for (const c of D.alle) {
      if (c.e !== 1 || c.d8 !== 1 || c.zone !== 'wand') continue;
      const d = c.ue - 11.0;
      if (Math.abs(d) > 1.5) continue;
      for (let yr = 12; yr <= 14; yr++) {
        const kreuz = Math.abs(d) < 0.55 || yr === 13;
        const rand = Math.abs(d) > 1.0 || yr === 12 && false;
        if (P.get(c.x, Y(yr), c.z)) P.ersetze(c.x, Y(yr), c.z, kreuz ? FR('rot') : (rand ? T.gold : FR('weiss')), teil);
      }
    }
  }

  // ---------------------------------------------------------------- Modul 5: Museum und Halle
  const F1 = 9;
  const vitrine = (teil, f, namen, u, w, laenge) => {            // Sockel 1 hoch aus Pietra serena, Glashaube 1 hoch
    for (const c of gruppe(namen, f)) {
      if (c.u >= u && c.u < u + laenge && c.w >= w && c.w < w + 1.6) { block(teil, c, f, 1, T.serena); block(teil, c, f, 2, T.fenster); }
    }
  };
  // Saal 1: Kruzifix des Maestro del Bigallo, Fresken der Werkstatt Nardo di Cione, Holzsockel
  {
    const teil = 'saal_1';
    const N = ['hall'];
    for (const s of ['n', 's', 'w', 'o']) feld(N, F1, s, 1, 2, () => T.holz, teil);
    feld(N, F1, 's', 3, 7, (a, b) => (a % 5 < 4 ? (rahmen(a % 5, b, 4, 5) ? T.gold : FR(['orange', 'hellblau', 'gruen'][Math.floor(a / 5) % 3])) : null), teil);
    feld(N, F1, 'o', 2, 8, (a, b) => {                                    // Tafelkreuz an der Trennwand
      const kreuzA = 3;
      if (a === kreuzA && b <= 5) return T.holz;
      if (b === 4 && a >= kreuzA - 1 && a <= kreuzA + 1) return T.holz;
      if (b === 6 && a >= kreuzA - 1 && a <= kreuzA + 1) return T.gold;
      return b >= 1 && b <= 6 && a >= 1 && a <= 5 ? FR('blau') : null;
    }, teil);
  }
  // Saal 2: Triptychon von Bernardo Daddi (1333) und zwei Vitrinen
  {
    const teil = 'saal_2';
    const N = ['sal2'];
    for (const s of ['n', 's', 'w', 'o']) feld(N, F1, s, 1, 2, () => T.holz, teil);
    feld(N, F1, 's', 3, 8, (a, b) => {
      const A = a - 1;
      if (A < 0 || A > 8) return null;
      const mitte = A >= 3 && A <= 6;
      if (mitte) return (rahmen(A - 3, b, 4, 6)) ? T.gold : (b > 3 ? FR('blau') : FR('rot'));
      const seite = A <= 2 ? A : A - 7;
      if (b > 4) return null;
      return (rahmen(seite, b, 3, 5)) ? T.gold : FR(A <= 2 ? 'gruen' : 'orange');
    }, teil);
    vitrine(teil, F1, N, 14, 6.5, 3);
    vitrine(teil, F1, N, 19, 6.5, 3);
  }
  // Saal 3: Fresko Misericordia Domini mit einer der ältesten Stadtansichten von Florenz, je 18 Männer und Frauen
  {
    const teil = 'saal_3';
    const N = ['sal3'];
    for (const s of ['n', 's', 'o']) feld(N, F1, s, 1, 2, () => T.holz, teil);
    feld(N, F1, 'w', 1, 2, () => T.holz, teil);
    feld(N, F1, 'w', 3, 9, (a, b) => {
      if (a > 8) return null;
      if (rahmen(a, b, 9, 7)) return T.gold;
      const x = a - 1, y = b - 1;                                       // Feld 7 x 5
      if (y === 0) return x < 3 ? FR(x % 2 ? 'braun' : 'schwarz') : x > 3 ? FR(x % 2 ? 'weiss' : 'rot') : FR('blau');   // 18 Männer | Madonna | 18 Frauen
      if (x >= 2 && x <= 4 && y <= 3) return y === 3 ? FR('gelb') : FR('blau');                                             // Madonna mit Schutzmantel
      if (y === 1) return (x + 1) % 3 === 0 ? FR('weiss') : FR(x % 2 ? 'orange' : 'rot');                                    // Dächer und Türme der Stadt
      return FR('hellblau');
    }, teil);
    vitrine(teil, F1, N, 26.5, 5.5, 3);
  }
  // Eingangshalle: Steinbank an der Westwand, Kassentisch
  {
    const teil = 'eingangshalle';
    for (const c of gruppe(['hall'], 0)) {
      if (c.we !== undefined && false) continue;
      const nah = c.d8 === 3 || c.d8 === 4;
      if (nah && c.e === 3 && c.w > 8) block(teil, c, 0, 1, T.serena);
      if (c.u >= 6.5 && c.u < 9 && c.w >= 9.4 && c.w < 10.6) block(teil, c, 0, 1, T.holz);
    }
  }
}

module.exports = { ausstatten };
