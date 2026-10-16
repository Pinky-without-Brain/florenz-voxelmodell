'use strict';
// Ausstattung von Santo Stefano al Ponte (Modul 4, Katalog): zehn Seitenaltäre mit Altarbildern, Hochaltar mit Tacca-Paliotto, Kapelle und falsche
// Kapelle, Chorgestühl und Stuckfigur des Hl. Stephan im Chor, Orgel, Kruzifix, Licht. Alles vereinfacht; die Zuordnung der Bilder zu den Altären
// und die Lage im Grundriss sind Stufe C. Ersetzt Zellen der Rohbauteile (Wandflächen) oder setzt Neues in freie Zellen.
const WZ = require('../../../tools/wahrzeichen');

const mod = (a, n) => ((a % n) + n) % n;

/** Goldrahmen (1 breit) um ein Feld, innen inner(q, j, B, H). */
const rahmen = (T, inner) => (q, j, B, H) => ((q === 0 || q === B - 1 || j === 0 || j === H - 1) ? T.gold : inner(q - 1, j - 1, B - 2, H - 2));

/** Altarbild: Himmel, Boden, Hauptfigur mit Nimbus und zwei Nebenfiguren; Farben aus der Nummer (vereinfacht). */
function altarbild(T, FR, nr) {
  const himmel = [FR('hellblau'), FR('gelb'), FR('blau'), FR('orange'), FR('weiss')][nr % 5];
  const robe = [FR('rot'), FR('blau'), FR('weiss'), FR('gruen'), FR('orange')][(nr * 3) % 5];
  return rahmen(T, (q, j, B, H) => {
    const cx = Math.floor((B - 1) / 2);
    if (j < 1) return FR('braun');
    const dx = Math.abs(q - cx);
    if (dx === 0 && j <= 3) return robe;
    if (dx === 0 && j === 4) return FR('orange');
    if (dx <= 1 && j === 5) return T.gold;
    if (dx === 1 && j <= 2) return nr % 2 ? FR('rot') : FR('gruen');
    return himmel;
  });
}

/** Taufe Christi (Confortini 1667) auf dem Altar der falschen Kapelle. */
const taufe = (T, FR) => rahmen(T, (q, j, B, H) => {
  const cx = Math.floor((B - 1) / 2);
  if (j < 2) return FR('hellblau');                                     // Jordan
  if (Math.abs(q - cx) === 0 && j < H - 2) return j === H - 3 ? FR('orange') : FR('weiss');
  if (Math.abs(q - cx) === 0 && j === H - 2) return T.gold;
  if (q === 0 && j < 4) return FR('braun');
  return j > H - 3 ? FR('gelb') : FR('gruen');
});

function feld(K, teil, filter, achse, start, B, H, j0, fn) {
  const { D, Y, ersetze, get } = K;
  let n = 0;
  for (const c of D.cells) {
    if (!filter(c)) continue;
    const q = Math.floor((achse === 'u' ? c.u : c.w) - start);
    if (q < 0 || q >= B) continue;
    for (let jj = 0; jj < H; jj++) {
      const e = get(c.x, Y(j0 + jj), c.z);
      if (!e || e.p === 'sa_fenster' || e.p === 'sa_fassade_fenster' || e.p === 'sa_licht') continue;
      const t = fn(q, jj, B, H);
      if (t && ersetze(c.x, Y(j0 + jj), c.z, t, teil)) n++;
    }
  }
  return n;
}

function ausstatten(api) {
  const { D, set, ersetze, get, Y, T, FR, hash } = api;
  const ST = require('./_st.js');
  const luftAn = (c, yr) => api.istLuft(c.x, yr, c.z);

  // ------------------------------------------------------------ zehn Seitenaltäre: Altarbild mit Goldrahmen (4 breit, 8 hoch), eckiger Aufsatz, Altartisch
  ST.ALTAR_U.forEach((a, k) => {
    for (const nord of [true, false]) {
      const nr = k * 2 + (nord ? 0 : 1);
      const seite = (c) => c.zone === 'aussen' && c.d8 === 2 && (nord ? c.w < 6 : c.w > 33.5) && c.u >= 2.5 && c.u < 57;
      feld(api, 'sa_altaere', seite, 'u', a - 2, 4, 8, 3, altarbild(T, FR, nr));
      // eckiger Aufsatz (Pietra serena): breiter Sims und ein schmaler Giebel aus Eckblöcken, keine Rundungen (Quelle: Barockbau ohne Kurven)
      feld(api, 'sa_altaere', seite, 'u', a - 2.5, 5, 1, 11, () => T.serena);
      feld(api, 'sa_altaere', seite, 'u', a - 1, 2, 1, 12, () => T.serena);
      // Altartisch (Marmor, 1 Block hoch, 3 breit) vor dem Bild
      for (const c of D.cells) {
        if (c.zone !== 'schiff' || c.d8 !== 3 || (nord ? c.w >= 6 : c.w <= 33.5) || Math.abs(c.u - a) > 1.7) continue;
        if (luftAn(c, 1) && luftAn(c, 2) && luftAn(c, 3)) set(c.x, Y(1), c.z, T.weiss, 'sa_altaere');
      }
    }
  });

  // ------------------------------------------------------------ Hochaltar (Giambologna, 1594) mit Paliotto von Tacca (1656) in der Tribuna
  for (const c of D.cells) {
    if (c.zone !== 'trib') continue;
    const dw = Math.abs(c.w - ST.TRIB.cw);
    if (dw < 2.6 && c.u >= 72.5 && c.u < 75.5) set(c.x, Y(6), c.z, c.u < 73.5 ? T.bronze : T.weiss, 'sa_hochaltar');
    if (dw < 1.3 && c.u >= 75.5 && c.u < 77) { for (let yr = 6; yr <= 8; yr++) set(c.x, Y(yr), c.z, yr === 8 ? T.gold : T.weiss, 'sa_hochaltar'); }
  }

  // ------------------------------------------------------------ echte Kapelle (Nord): Altar und Bild an der Ostwand
  {
    const K = ST.KAP_N;
    feld(api, 'sa_kapelle', (c) => c.zone === 'kn' && c.u >= 72 && c.u < 73.4 && c.w > 2.5 && c.w < 11.5, 'w', 3.5, 6, 8, 2, altarbild(T, FR, 7));
    for (const c of D.cells) if (c.zone === 'kn' && c.u >= 70 && c.u < 72 && Math.abs(c.w - 7) < 1.8 && luftAn(c, 1)) set(c.x, Y(1), c.z, T.weiss, 'sa_kapelle');
    void K;
  }
  // ------------------------------------------------------------ falsche Kapelle (Süd): Nische mit Altar, Taufe Christi von Confortini (1667)
  feld(api, 'sa_scheinkapelle', (c) => c.zone === 'ks' && c.u >= 60 && c.u < 61.4 && c.w > 28.5 && c.w < 36.5, 'w', 29, 7, 8, 2, taufe(T, FR));
  for (const c of D.cells) if (c.zone === 'ks' && c.u >= 58 && c.u < 60 && Math.abs(c.w - 32.5) < 1.8 && luftAn(c, 1)) set(c.x, Y(1), c.z, T.weiss, 'sa_scheinkapelle');

  // ------------------------------------------------------------ Chor: Gestühl aus Nussholz (Sitz und Rücken) und Stuckfigur des hl. Stephan
  for (const c of D.cells) {
    if (c.zone !== 'chor') continue;
    if (!luftAn(c, 6) || !luftAn(c, 7) || !luftAn(c, 8)) continue;
    const nb = api.N4.map(([dx, dz]) => api.zelleBei(c.x + dx, c.z + dz));
    if (!nb.some((n) => n && n.zone === 'aussen')) continue;
    if (c.u < 83 && Math.abs(c.w - ST.W_MID) < 5) continue;
    set(c.x, Y(6), c.z, T.holz, 'sa_chorgestuehl');
    set(c.x, Y(7), c.z, T.holz, 'sa_chorgestuehl');
  }
  {
    const R = D.R, p = R.toWorld(89.5, ST.W_MID), x0 = Math.round(p.x), z0 = Math.round(p.z);
    for (let yr = 6; yr <= 7; yr++) for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) set(x0 + dx, Y(yr), z0 + dz, T.serena, 'sa_stuckfigur');
    for (let yr = 8; yr <= 10; yr++) set(x0, Y(yr), z0, T.weiss, 'sa_stuckfigur');
    set(x0, Y(11), z0, T.weiss, 'sa_stuckfigur'); set(x0, Y(12), z0, T.gold, 'sa_stuckfigur');
    set(x0 + 1, Y(10), z0, T.weiss, 'sa_stuckfigur'); set(x0 - 1, Y(10), z0, T.weiss, 'sa_stuckfigur');
  }

  // ------------------------------------------------------------ Orgel (Toskana, 17. Jh.) an der Südwand: Pfeifen aus Bronze und Gold in Holzrahmen
  feld(api, 'sa_orgel', (c) => c.zone === 'aussen' && c.d8 === 2 && c.w > 33.5 && c.u >= 2.5 && c.u < 57, 'u', 42.5, 6, 9, 5, (q, j, B, H) => {
    if (q === 0 || q === B - 1 || j === 0 || j === H - 1) return T.holz;
    return (q % 2) ? T.bronze : (j > (q % 4) + 2 ? T.gold : T.bronze);
  });

  // ------------------------------------------------------------ Holzkruzifix (1576) mit Fresko von Niccolò Lapi auf der Innenseite der Fassade
  feld(api, 'sa_kruzifix', (c) => c.zone === 'fassade' && c.d8 === 2 && c.w > 2.5 && c.w < 7.5, 'w', 3.5, 4, 8, 3, (q, j, B, H) => {
    const cx = 1;
    if (q === cx || q === cx + 1) return j >= 1 && j <= H - 2 ? (j === H - 3 ? FR('orange') : T.holz) : null;
    if (j === H - 3) return T.holz;
    return FR('hellblau');
  });

  // ------------------------------------------------------------ Licht: Seelaternen im Boden je Raum (höchstens 12 Blöcke Abstand)
  const raeume = { schiff: [], trib: [], chor: [], kn: [], ks: [] };
  for (const c of D.cells) {
    const raum = c.zone === 'schiff' || c.zone === 'endwand' ? 'schiff' : c.zone;
    if (!raeume[raum]) continue;
    for (const y0 of [0, ST.PODIUM_OBEN]) {                            // Schiffsboden und Podiumboden (Tribuna, Chor, Durchgang, Treppenpodest)
      if (!get(c.x, Y(y0), c.z)) continue;
      if (!luftAn(c, y0 + 1) || !luftAn(c, y0 + 2) || !luftAn(c, y0 + 3) || api.hat(c.x, Y(y0 + 1), c.z)) continue;
      const g = y0 ? (raum === 'schiff' ? 'trib' : raum) : raum;
      if (y0 === 0 && (raum === 'trib' || raum === 'chor')) continue;
      raeume[g].push({ x: c.x, y: Y(y0 + 1), z: c.z });
    }
  }
  for (const zs of Object.values(raeume)) {
    for (const l of WZ.lichtRaster(zs, { abstand: 12 })) ersetze(l.x, l.y, l.z, T.licht, 'sa_licht');
  }
  void hash; void mod;
}

module.exports = { ausstatten };
