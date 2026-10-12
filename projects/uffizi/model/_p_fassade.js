'use strict';
// Stufe 1: Piazzale-Flügel (Katalog Module 1-3): Portikus, Mezzanin, Piano nobile, Dachloggia, Kranzgesims.

module.exports = function fassade(P) {
  const { S, N, claim, air, kind, tF, zone, side, elOf, fmod, fw, fe, over,
    PORTIKUS, MEZZ, PN, K_F, K_ST, ZONE_W } = P;
  const { cx, cz, ww, R, at } = S;

  const kranz = [];
  for (let i = 0; i < N; i++) {
    if (kind[i] !== K_F && kind[i] !== K_ST) continue;
    const t = tF[i];
    const st = kind[i] === K_ST;
    const { k, wl } = st ? { k: -1, wl: 0 } : fmod(ww[i]);
    const el = st ? null : elOf(wl);
    const fenster = !st && el.e === 'O' ? el : null;
    const gi = fenster ? 3 * k + fenster.oi : 0;      // laufende Fensternummer (Giebelwechsel Dreieck/Segment)
    if (t === 1) kranz.push(i);

    // --- Portikus Lage 1..14
    for (let L = 1; L <= PORTIKUS; L++) {
      if (st) { claim(i, L, 'stirnwaende', 'serena'); continue; }
      if (t <= 3) {
        if (L >= 13) { claim(i, L, 'portikus_gebaelk', 'serena'); continue; }
        if (el.e === 'P') {
          if (t === 1 && L >= 4 && L <= 10 && Math.abs(el.q) <= 1) { air(i, L); continue; }      // Nische 3 x 7 x 1
          if (L <= 12) claim(i, L, 'portikus_pfeiler', 'serena');
        } else if (el.e === 'C') {
          if (t <= 2 && L <= 10) claim(i, L, 'portikus_saeulen', 'serena');
          else if (t <= 2 && L <= 12) claim(i, L, 'portikus_saeulen', 'kapitell');
          else air(i, L);
        } else air(i, L);
      } else if (t <= 10) {
        if (L === PORTIKUS) claim(i, L, 'portikus_decke', 'serena'); else air(i, L);
      } else if (fenster && fenster.oi === 1 && Math.abs(fenster.q) <= 1 && L <= 8) {
        // Rückwand t 11..14: Tür 3 x 8 auf Öffnung 2, Holztür in t = 12
        if (t === 12) claim(i, L, 'portikus_rueckwand', 'holz'); else air(i, L);
      } else if (fenster && fenster.oi !== 1 && Math.abs(fenster.q) <= 1 && L >= 6 && L <= 8) {
        if (t === 12) claim(i, L, 'portikus_rueckwand', 'glas'); else air(i, L);                 // Fenster 3 x 3
      } else claim(i, L, 'portikus_rueckwand', 'putz');
    }

    // --- Mezzanin und Piano nobile Lage 15..36 (Wand t 1..4)
    for (let L = PORTIKUS + 1; L <= PN; L++) {
      if (t > 4) {
        // Galerieboden Lage 36 (Oberkante Y 101) unter Dachloggia und Rückwand: Auflager für Modul 3 (R3)
        if (L === PN) claim(i, L, 'loggia_boden', 'serena');
        continue;
      }
      // Giebel vor den Gurtgesimsen (K0: die Gesimse lassen Giebelzellen aus)
      let giebel = false;
      if (fenster && L >= 34 && t <= 2) {
        const dreieck = gi % 2 === 0, aq = Math.abs(fenster.q);
        if (dreieck) giebel = (L === 34 && aq <= 2) || (L === 35 && aq <= 1) || (L === 36 && aq === 0);
        else giebel = (L === 34 && aq <= 2) || (L === 35 && aq <= 2 && aq !== 0);          // Segmentgiebel: Mittelzelle 35 frei
        if (giebel) claim(i, L, 'nobile_wand', 'serena');
      }
      if (t <= 2 && (L === 19 || L === 20 || L === 35 || L === 36) && claim(i, L, 'gurtgesimse', 'serena')) continue;
      if (giebel) continue;
      const part = L <= MEZZ ? 'mezzanin_wand' : 'nobile_wand';
      if (fenster) {
        const aq = Math.abs(fenster.q);
        if (L <= MEZZ) {
          if (aq <= 1 && L >= 17 && L <= 18) { if (t === 3) claim(i, L, part, 'glas'); else air(i, L); continue; }   // Fenster 3 x 2
          if (aq <= 2 && L >= 16 && L <= 19 && t <= 2) { claim(i, L, part, 'serena'); continue; }
        } else {
          if (aq <= 1 && L >= 24 && L <= 31) { if (t === 3) claim(i, L, part, 'glas'); else air(i, L); continue; }   // Licht 3 x 8
          if (aq <= 2 && L >= 23 && L <= 33 && t <= 2) { claim(i, L, part, 'serena'); continue; }                    // Rahmen, Außenmaß 5 x 11
        }
      }
      claim(i, L, part, 'putz');
    }

    // --- Dachloggia Lage 37..49
    for (let L = PN + 1; L <= 49; L++) {
      if (st) {
        // Stirnende: Wand t 1..4, die Galerie schließt bei w = 10..11
        if (t <= 4 || Math.floor(ww[i]) >= 10) claim(i, L, 'loggia_rueckwand', 'putz');
        continue;
      }
      if (t <= 3) {
        if (el.e === 'P') claim(i, L, 'loggia_pfeiler_saeulen', 'serena');
        else if (el.e === 'C') {
          if (t <= 2) claim(i, L, 'loggia_pfeiler_saeulen', L <= 47 ? 'serena' : 'kapitell');
          else if (L <= 47) claim(i, L, 'loggia_verglasung', 'glas');
        } else if (t === 3 && L <= 47) claim(i, L, 'loggia_verglasung', 'glas');
      } else if (t >= 11 && t <= 14) {
        if (fenster && fenster.oi === 1 && Math.abs(fenster.q) <= 1 && L <= 44) air(i, L);
        else claim(i, L, 'loggia_rueckwand', 'putz');
      }
    }
    // --- Kranzgesims Lage 50..51 (Gebälk t 1..3)
    if (t <= 3) { claim(i, 50, 'kranzgesims', 'serena'); claim(i, 51, 'kranzgesims', 'serena'); }
  }
  P.kranzSpalten = kranz;

  // Kranzgesims +1 über dem Platz: Außenzellen mit Flächenkontakt zu einer Spalte t = 1; Konsolen auf Lage 50 jede 2. Zelle
  const seen = new Set();
  for (const i of kranz) {
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx[i] + dx, nz = cz[i] + dz;
      if (at(nx, nz) >= 0) continue;
      const key = nx * 100000 + nz;
      if (seen.has(key)) continue;
      const l = R.toLocal(nx, nz);
      const dd = side[i] === ZONE_W ? fw(l.w) - l.u : l.u - fe(l.w);
      if (dd >= 0) continue;                       // nicht auf der Platzseite
      seen.add(key);
      over.push({ x: nx, z: nz, L: 51, part: 'kranzgesims', mat: 'serena' });
      if (Math.floor(l.w) % 2 === 0) over.push({ x: nx, z: nz, L: 50, part: 'kranzgesims', mat: 'serena' });
    }
  }
  void zone;
};
