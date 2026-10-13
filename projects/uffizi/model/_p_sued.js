'use strict';
// Stufe 2: Südende der Flügel (Stirnwände), Serliana an der Nordfläche FSN und Durchgang zum Arno (Katalog Modul 4).

module.exports = function sued(P) {
  const { S, N, claim, air, range, kind, zone, fsn, PORTIKUS, ZONE_S, K_SS, K_SER } = P;
  const { uu, ww } = S;

  for (let i = 0; i < N; i++) {
    if (kind[i] === K_SS) range(i, 1, PORTIKUS, 'stirnwaende', 'serena');       // massive Südenden der Flügel
  }

  // Serliana (u 0..27, w 276..278, Lage 1..20): Pfeiler 2 / Öffnung 4 / Säule 2 / Bogen 12 / Säule 2 / Öffnung 4 / Pfeiler 2
  const el = (ur) => (ur <= 1 || ur >= 26 ? 'P' : ur <= 5 || ur >= 22 ? 'A' : ur <= 7 || ur >= 20 ? 'C' : 'B');
  // oberste offene Lage des Rundbogens (Spannweite 12, Kämpfer Lage 12, Scheitel Lage 18) über Spaltenindex ur (u 8..19)
  const bogenOffen = (ur) => 12 + Math.round(Math.sqrt(Math.max(0, 36 - (ur + 0.5 - 14) ** 2)));
  const nische = (ur) => ur === 2 || ur === 3 || ur === 24 || ur === 25;
  for (let i = 0; i < N; i++) {
    if (kind[i] !== K_SER) continue;
    const ur = Math.floor(uu[i]);
    const ts = Math.max(1, Math.floor(ww[i] - fsn(uu[i])) + 1);
    const e = el(ur);
    if (ts <= 3) {
      for (let L = 1; L <= 20; L++) {
        if (e === 'A' && L <= 12) { air(i, L, 'arkade', 'serliana'); continue; }
        if (e === 'C' && L <= 12 && ts === 3) { air(i, L, 'arkade', 'serliana'); continue; }
        if (e === 'B' && L <= bogenOffen(ur)) { air(i, L, 'arkade', 'serliana'); continue; }
        claim(i, L, 'serliana', 'serena');
      }
    } else if (nische(ur)) {
      // Nische hinter den Seitenöffnungen: Hohlraum bis zur Rückwand bei w = 282
      if (Math.floor(ww[i]) === 282) range(i, 1, 14, 'serliana', 'serena');
      else { for (let L = 1; L <= 12; L++) air(i, L); range(i, 13, 14, 'serliana', 'serena'); }
    }
    // Aufsatz über der Serliana (Nordwand des Arno-Riegels, ts 1..4): Piano nobile mit drei Fenstern, verglaste Loggia, Kranzgesims
    if (ts <= 4) {
      const fensterU = [4, 14, 23];
      const nahe = fensterU.reduce((b, c) => (Math.abs(ur - c) < Math.abs(b) ? ur - c : b), 99);
      const aq = Math.abs(nahe);
      for (let L = 21; L <= 51; L++) {
        if (L <= 36) {
          if (L >= 35 && ts <= 2) { claim(i, L, 'serliana_aufsatz', 'serena'); continue; }       // Gurtgesims
          if (aq <= 1 && L >= 24 && L <= 31) {
            if (ts === 3) claim(i, L, 'serliana_aufsatz', 'glas'); else air(i, L, ts <= 2 ? 'fenster_offen' : null, 'serliana_aufsatz');
            continue;
          }
          if (aq <= 2 && L >= 23 && L <= 32 && ts <= 2) { claim(i, L, 'serliana_aufsatz', 'serena'); continue; }   // Fensterrahmen
          claim(i, L, 'serliana_aufsatz', 'putz');
        } else if (L <= 49) {
          const pf = [0, 1, 6, 7, 13, 14, 20, 21, 26, 27].includes(ur);
          if (ts <= 3 && pf) claim(i, L, 'serliana_aufsatz', L <= 47 ? 'serena' : 'kapitell');
          else if (ts === 3) claim(i, L, 'serliana_aufsatz', 'glas');
          else if (ts <= 2) air(i, L, 'loggia', 'serliana_aufsatz');
        } else if (ts <= 3) claim(i, L, 'serliana_aufsatz', 'serena');
      }
    }
  }

  // Eckpfeiler des Aufsatzes: die Spalten u = -1 und u = 28 neben der Serliana (Ecke Flügelfront / Arno-Riegel) schließen die Hülle
  for (let i = 0; i < N; i++) {
    if (kind[i] !== K_SS) continue;
    const fu = Math.floor(uu[i]);
    if ((fu !== -1 && fu !== 28) || ww[i] >= 283) continue;
    const ts = Math.max(1, Math.floor(ww[i] - fsn(Math.max(0, Math.min(27.7, uu[i])))) + 1);
    if (ts > 4) continue;
    for (let L = 15; L <= 51; L++) claim(i, L, 'serliana_aufsatz', L <= 36 || L >= 50 ? (L >= 50 ? 'serena' : 'putz') : (L <= 47 ? 'serena' : 'kapitell'));
  }

  // Durchgang zum Arno (u 8..19, w 279..297) mit Tonne, Seitenwände 4 dick (u 4..7 und 20..23); an der Arno-Fassade
  // Bogenöffnung gleichen Profils (die Tonne läuft bis zum Rand der Maske)
  for (let i = 0; i < N; i++) {
    if (zone[i] !== ZONE_S || kind[i] === K_SS) continue;
    const ur = Math.floor(uu[i]);
    if (ur < 4 || ur > 23) continue;
    if (ww[i] - fsn(Math.max(0, Math.min(27.7, uu[i]))) < 3) continue;           // erst hinter der Serliana
    if (kind[i] === K_SER && nische(ur)) continue;
    if (ur >= 8 && ur <= 19) {
      const ho = bogenOffen(ur);
      for (let L = 1; L <= ho; L++) air(i, L, S.d8[i] <= 2 ? 'tor' : null, 'durchgang_arno');
      range(i, ho + 1, ho + 2, 'durchgang_arno', 'serena');                      // Tonnenschale, Dicke 2
      range(i, ho + 3, 19, 'durchgang_arno', 'putz');                            // Hinterfüllung bis unter Decke 20
    } else range(i, 1, 14, 'durchgang_arno', 'putz');
  }
};
