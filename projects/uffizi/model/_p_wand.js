'use strict';
// Stufe 3: Außenwände (Wandband d8 <= 4): Rückseiten und Nebenbaukörper (Modul 5), Südbau-Wände (Modul 4),
// Loggia-Anschluss, Nordfront des Ostflügels mit Korridoröffnung.

module.exports = function wand(P) {
  const { S, N, claim, air, d8x, kind, zone, nearE, kant, elOf,
    TRAUFE, NB_TRAUFE, ZONE_X, ZONE_S, K_GEN, KANTEN_LA, KANTEN_ON, KANTEN_FSR, KANTE_KORRIDOR, TUER_S0, TUER_S1 } = P;
  const { cx, cz, uu, d8 } = S;
  void d8x;

  // Hausecken: Polygonecken mit Innenwinkel < 135 Grad (konvex)
  const corners = (() => {
    const n = kant.length, out = [];
    let a2 = 0;
    for (let j = 0; j < n; j++) { const p = kant[j].a, q = kant[(j + 1) % n].a; a2 += p.x * q.z - q.x * p.z; }
    for (let j = 0; j < n; j++) {
      const pr = kant[(j + n - 1) % n], cu = kant[j];
      const d1 = [(pr.b.x - pr.a.x) / pr.L, (pr.b.z - pr.a.z) / pr.L], d2 = [(cu.b.x - cu.a.x) / cu.L, (cu.b.z - cu.a.z) / cu.L];
      const cr = d1[0] * d2[1] - d1[1] * d2[0], dt = d1[0] * d2[0] + d1[1] * d2[1];
      if (Math.atan2(Math.abs(cr), dt) > Math.PI / 4 && cr * a2 > 0) out.push({ x: Math.round(cu.a.x), z: Math.round(cu.a.z) });
    }
    return out;
  })();
  // Eckquader 3 x 3, abwechselnd Läufer (3 in x) und Binder (3 in z) je Lage
  const quoin = (i, L) => {
    if (d8[i] > 2) return false;
    const ax = L % 2 === 0 ? 2 : 1, az = L % 2 === 0 ? 1 : 2;
    for (const c of corners) if (Math.abs(cx[i] - c.x) <= ax && Math.abs(cz[i] - c.z) <= az) return true;
    return false;
  };

  const sOf = (i, e) => kant[e].rahmen.toLocal(cx[i], cz[i]).u;
  // Fenstermitten entlang einer Kante: zentriert, Abstand sp, Rand 3
  const centersCache = new Map();
  const centersOf = (e, sp) => {
    const key = e * 100 + sp;
    let c = centersCache.get(key);
    if (!c) {
      c = [];
      const Le = kant[e].L;
      if (Le >= 6) {
        const n = Math.floor((Le - 6) / sp) + 1, st = (Le - sp * (n - 1)) / 2;
        for (let j = 0; j < n; j++) c.push(st + sp * j);
      }
      centersCache.set(key, c);
    }
    return c;
  };
  const nearest = (s, cs) => { let b = Infinity; for (const c of cs) if (Math.abs(s - c) < Math.abs(b)) b = s - c; return b; };
  const ROWS_KLEIN = [[10, 14], [22, 26], [38, 42]];     // Fenster 3 x 5 (Rückseiten)
  const ROWS_R7 = [[17, 18], [24, 31]];                  // Mezzanin 3 x 2, Piano nobile 3 x 8 (7er-Raster)
  const FSR_MITTEN = [-22, -15, -8, -1, 6, 13, 20, 27, 34, 41, 48, 55, 62, 69, 76];
  // 'glas' | 'rahmen' | 'luft' | null; Glas in der zweiten Wandzelle, Rahmen in der Außenzelle
  const fensterBand = (L, ds, d, rows) => {
    const ad = Math.abs(ds);
    for (const [a, b] of rows) {
      if (L < a - 1 || L > b + 1) continue;
      if (L >= a && L <= b && ad < 1.5) return d === 2 ? 'glas' : 'luft';
      if (ad < 2.5 && d === 1) return 'rahmen';
    }
    return null;
  };

  for (let i = 0; i < N; i++) {
    if (kind[i] !== K_GEN || d8[i] > 4 || nearE[i] < 0) continue;
    const e = nearE[i], d = d8[i], z = zone[i];
    const la = KANTEN_LA.has(e), on = KANTEN_ON.has(e);
    const sued = KANTEN_FSR.has(e) || e === 54;
    const H = sued || la || on || z !== ZONE_X ? TRAUFE : NB_TRAUFE;
    const s = sOf(i, e), u = uu[i];
    const fsr = KANTEN_FSR.has(e);
    const wand = sued ? 'suedbau_waende' : la ? 'loggia_anschluss' : on ? 'ostnord_front' : 'rueckseiten_wand';
    let ds = 99, rows = ROWS_KLEIN;
    if (fsr) { ds = nearest(u, FSR_MITTEN); rows = ROWS_R7; }
    else if (sued || on) { ds = nearest(s, centersOf(e, 7)); rows = ROWS_R7; }
    else if (!la) ds = nearest(s, centersOf(e, 8));
    const jw = Math.floor(u) + 26, wl = jw - 24 * Math.floor(jw / 24), elf = elOf(wl);
    for (let L = 1; L <= H; L++) {
      // Gegenöffnung der Korridorbrücke in Kante 41: 7 breit, Lage 37..43 (Y 102..108)
      if (e === KANTE_KORRIDOR && L >= 37 && L <= 43 && s >= TUER_S0 && s < TUER_S1) { air(i, L); continue; }
      // Austritt zum Lungarno: Tür 7 breit in Kante 1 (Kantenabschnitt 2,5..9,5), Lage 14..20 (Y 79..85), Laibung 1 Pietra serena
      if (e === 1 && L >= 13 && L <= 21 && d <= 4) {
        if (L >= 14 && L <= 20 && s >= 2.5 && s < 9.5) { air(i, L); continue; }
        if (d === 1 && s >= 1.5 && s < 10.5) { claim(i, L, wand, 'serena'); continue; }
      }
      // Türen 3 x 8 der Arno-Fassade an u -10, 20, 50
      if (fsr && L <= 8 && [-10, 20, 50].some((c) => Math.abs(u - c) < 1.5)) {
        if (d === 2) claim(i, L, wand, 'holz'); else air(i, L);
        continue;
      }
      // Dachloggia der Arno-Fassade mit großen Fenstern 5 x 9 (verone_arno)
      if (fsr && L >= 37 && L <= 49) {
        if (d <= 3) {
          if (elf.e === 'P') { claim(i, L, 'verone_arno', 'serena'); continue; }
          if (elf.e === 'C' && d <= 2) { claim(i, L, 'verone_arno', L <= 47 ? 'serena' : 'kapitell'); continue; }
          if (elf.e === 'O' && L >= 38 && L <= 46) { if (d === 3) claim(i, L, 'verone_arno', 'glas'); else air(i, L); continue; }
        }
        claim(i, L, wand, 'putz');
        continue;
      }
      // Gesims auf d8 = 1 (Nebenbau Lage 44, sonst Lage 50..51)
      if (H === TRAUFE ? L >= 50 && d === 1 : L === H && d === 1) {
        claim(i, L, la || on || sued ? wand : 'rueckseiten_gesims', 'serena');
        continue;
      }
      if ((sued || on) && (L === 19 || L === 20 || L === 35 || L === 36) && d <= 2) { claim(i, L, wand, 'serena'); continue; }
      if (ds !== 99) {
        const f = fensterBand(L, ds, d, rows);
        if (f === 'glas') { claim(i, L, wand, 'glas'); continue; }
        if (f === 'luft') { air(i, L); continue; }
        if (f === 'rahmen') { claim(i, L, wand, 'serena'); continue; }
      }
      if (L >= 9 && !sued && !la && !on && quoin(i, L)) { claim(i, L, 'rueckseiten_wand', 'serena'); continue; }
      if (L <= 8 && !sued && !la && !on) { claim(i, L, 'rueckseiten_sockel', 'forte'); continue; }
      claim(i, L, wand, 'putz');
    }
  }
};
