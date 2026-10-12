'use strict';
// Stufe 4: Tribuna (Modul 6): Oktogon (OSM-Teil w673458435, Mitte (-176 | 1120), Umkreisradius 17), Tambour, flache
// Kuppel (Kämpfer Lage 59, Scheitel 67, Dicke 2) und Laterne (OSM-Teil w673458443, Mitte (-176,5 | 1120)).
// Die Teile sind nicht in gebaeude.json enthalten; die Grundrisse werden als regelmäßige Achtecke im Rahmen UF
// aus Mitte und Umkreisradius abgeleitet (Katalog §7, Stufe C).

const { arches } = { arches: require('../../../tools/geom/arches.js') };

module.exports = function tribuna(P) {
  const { S, N, claim, air, range, zone, tAll, ZONE_E } = P;
  const { R, cx, cz } = S;
  void zone; void tAll; void ZONE_E;

  const OKT = { x: -176, z: 1120, r: 17 };
  const LAT = { x: -176.5, z: 1120, r: 4 };
  const apothem = (r) => r * Math.cos(Math.PI / 8);
  const rho = (du, dw) => { const a = Math.abs(du), b = Math.abs(dw); return Math.max(a, b, (a + b) / Math.SQRT2); };
  const lo = R.toLocal(OKT.x, OKT.z), ll = R.toLocal(LAT.x, LAT.z);
  const aO = apothem(OKT.r), aL = apothem(LAT.r);

  const rhoO = new Float32Array(N).fill(99), rhoL = new Float32Array(N).fill(99);
  const angO = new Float32Array(N);
  const inO = [];
  for (let i = 0; i < N; i++) {
    const du = S.uu[i] - lo.u, dw = S.ww[i] - lo.w;
    const r = rho(du, dw);
    if (r <= aO) { rhoO[i] = r; angO[i] = Math.atan2(dw, du); inO.push(i); }
    const r2 = rho(S.uu[i] - ll.u, S.ww[i] - ll.w);
    if (r2 <= aL) rhoL[i] = r2;
  }
  P.tribuna = { inO, rhoO, rhoL, aO, aL };

  // Schacht der Tribuna (Lage 37..51): Wand 3 dick, Raum innen frei
  for (const i of inO) {
    const r = rhoO[i];
    if (r > aO - 3) {
      // Wandring: Schachtwand und Tambour
      range(i, 1, 51, 'tribuna_tambour', 'putz');
      // Tambour Lage 52..58 mit 8 Fenstern 3 x 4 (Lage 54..57), Glas in der mittleren Wandzelle
      const phi = angO[i], f = Math.round(phi / (Math.PI / 4)), off = rhoO[i] * Math.sin(phi - f * (Math.PI / 4));
      const radius = Math.hypot(S.uu[i] - lo.u, S.ww[i] - lo.w);
      const off2 = radius * Math.sin(phi - f * (Math.PI / 4));
      void off;
      for (let L = 52; L <= 58; L++) {
        if (L >= 54 && L <= 57 && Math.abs(off2) < 1.5) {
          if (r > aO - 2 && r <= aO - 1) claim(i, L, 'tribuna_tambour', 'glas'); else air(i, L);
        } else claim(i, L, 'tribuna_tambour', L === 52 || L === 58 ? 'serena' : 'putz');
      }
    } else {
      for (let L = 37; L <= 51; L++) air(i, L);          // Raum
    }
  }

  // Flache Kuppel über dem Oktogon (Klostergewölbe, Rise 8, Dicke 2); Rand springt bei Lage 59
  const SPRING = 59, RISE = 8, THICK = 2;
  const prof = arches.profileForRise(aO + 0.5, RISE);
  const topOf = new Int16Array(N).fill(-1);
  for (const i of inO) topOf[i] = SPRING + Math.floor(prof(rhoO[i]));
  const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const i of inO) {
    const lo0 = topOf[i];
    let yHi = lo0 + THICK - 1;
    for (const [dx, dz] of neighbors) {
      const j = S.at(cx[i] + dx, cz[i] + dz);
      if (j < 0 || topOf[j] < 0) { continue; }
      yHi = Math.max(yHi, topOf[j]);
    }
    const yLo = rhoO[i] > aO - 1 ? SPRING : lo0;
    for (let L = yLo; L <= yHi; L++) claim(i, L, 'tribuna_kuppel', 'dach');
  }
  P.tribuna.kuppelTop = topOf;

  // Laterne: Wand 1 dick (Lage 68..76), vier Öffnungen 2 x 4 (Lage 70..73), Dach Lage 77..78
  for (let i = 0; i < N; i++) {
    if (rhoL[i] > aL) continue;
    const ring = rhoL[i] > aL - 1;
    const du = S.uu[i] - ll.u, dw = S.ww[i] - ll.w;
    const offen = ring && (Math.abs(du) < 1 || Math.abs(dw) < 1) && !(Math.abs(du) < 1 && Math.abs(dw) < 1);
    for (let L = 68; L <= 76; L++) {
      if (!ring) continue;
      if (offen && L >= 70 && L <= 73) { air(i, L); continue; }
      claim(i, L, 'tribuna_laterne', 'serena');
    }
    range(i, 77, 78, 'tribuna_laterne', 'dach');
  }
};
