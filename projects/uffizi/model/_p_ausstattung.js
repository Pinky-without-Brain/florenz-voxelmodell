'use strict';
// Stufe 8: Ausgestaltung der Innenräume (BEGEHBARKEIT.md §2), vereinfacht in vollen Blöcken und nur in Rollen der Palette.
// Räume werden aus dem fertigen Plan erkannt (Stehzellen je Geschoss: Boden fest, 3 Lagen frei, Decke fest) und einem Raumbauteil
// zugeordnet. Die Ausstattung ersetzt Material und Besitzer bestehender fester Zellen (Bilder in der Wandfläche, Bodenmuster,
// bemalte Decken) oder stellt Blöcke auf freie Zellen (Statuen, Regale, Tafeln). Wege (Türen, Treppen) bleiben frei.

const WZ = require('../../../tools/wahrzeichen');

const F = (n) => WZ.fresko(n);
const GOLD = WZ.typ('gold'), WEISS = WZ.typ('marmor_weiss'), ORN = WZ.typ('marmor_ornament'), ROTM = WZ.typ('marmor_rot'),
  GRUENM = WZ.typ('marmor_gruen'), HOLZ = WZ.typ('holz'), SOCKEL = WZ.typ('pietra_forte'), PFLASTER = WZ.typ('pflaster'),
  LICHT = WZ.typ('licht');

const GESCHOSSE = [
  { n: 'eg', stand: 1, boden: 0, decke: 14 },
  { n: 'mz', stand: 15, boden: 14, decke: 20 },
  { n: 'pn', stand: 21, boden: 20, decke: 36 },
  { n: 'gal', stand: 37, boden: 36, decke: 51 }
];

const hash = (a, b = 0, c = 0) => { let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; };

module.exports = function ausstattung(P) {
  const { S, N, own, mt, SLOTS, AIR_ID, PID, matId, zone, tAll, ZONE_W, ZONE_E, ZONE_X, ZONE_S, K_GEN, NB_TRAUFE } = P;
  const { cx, cz, uu, ww, at } = S;
  const { rhoO, aO } = P.tribuna;
  const solid = (i, L) => { const v = own[i * SLOTS + L]; return v !== 0 && v !== AIR_ID; };
  const frei = (i, L) => { const v = own[i * SLOTS + L]; return v === 0 || v === AIR_ID; };
  const reown = (i, L, teil, mat) => { const k = i * SLOTS + L; if (!solid(i, L)) return false; own[k] = PID[teil]; mt[k] = matId(mat); return true; };
  // Nur das Material wechseln (Besitzer bleibt): Böden und Decken bleiben im Bauteil der Platte (Baubarkeit R3)
  const STUFENTEILE = new Set(['treppen', 'scalone_treppe', 'korridor_treppe', 'beleuchtung'].map((n) => PID[n]));
  const farbig = (i, L, mat) => { if (!solid(i, L) || STUFENTEILE.has(own[i * SLOTS + L])) return false; mt[i * SLOTS + L] = matId(mat); return true; };
  const setze = (i, L, teil, mat) => { const k = i * SLOTS + L; if (!frei(i, L)) return false; own[k] = PID[teil]; mt[k] = matId(mat); return true; };
  const modul = (w) => Math.max(0, Math.min(10, Math.floor((w - 12) / 24)));
  const nachb = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // ---------------------------------------------------------------- Räume erkennen
  const RAEUME = ['', 'portikus_ausstattung', 'amtsraeume_eg', 'amtsraeume_mezzanin', 'amtsraeume_piano_nobile', 'scalone_ausstattung',
    'galerie_ostkorridor', 'galerie_westkorridor', 'galerie_arno_korridor', 'sala_botticelli', 'sala_leonardo', 'sala_michelangelo_raffael',
    'galerie_saele_ost', 'galerie_saele_west', 'tribuna'];
  const RID = {};
  RAEUME.forEach((n, j) => { RID[n] = j; });
  const raum = GESCHOSSE.map(() => new Uint8Array(N));
  const scaloneHalle = (i) => zone[i] === ZONE_E && ww[i] < 62 && uu[i] >= 50;
  const benenne = (i, f) => {
    const z = zone[i];
    if (f === 'gal') {
      if (rhoO[i] <= aO - 3) return 'tribuna';
      if (z === ZONE_S) return 'galerie_arno_korridor';
      if (z === ZONE_W || z === ZONE_E) {
        const t = tAll[i];
        const ost = z === ZONE_E;
        if (t >= 4 && t <= 10) return ost ? 'galerie_ostkorridor' : 'galerie_westkorridor';
        if (!ost) return 'galerie_saele_west';
        if (scaloneHalle(i)) return 'scalone_ausstattung';
        if (t <= 26) {
          const k = modul(ww[i]);
          return k === 1 || k === 2 ? 'sala_botticelli' : k === 3 ? 'sala_leonardo' : k >= 9 ? 'sala_michelangelo_raffael' : 'galerie_saele_ost';
        }
        return 'galerie_saele_ost';
      }
      return uu[i] < 10 ? 'galerie_saele_west' : 'galerie_saele_ost';
    }
    if (f === 'eg' && (z === ZONE_W || z === ZONE_E) && tAll[i] <= 10) return 'portikus_ausstattung';
    if (scaloneHalle(i)) return 'scalone_ausstattung';
    return f === 'eg' ? 'amtsraeume_eg' : f === 'mz' ? 'amtsraeume_mezzanin' : 'amtsraeume_piano_nobile';
  };
  P.raumZellen = {};
  GESCHOSSE.forEach((g, fi) => {
    for (let i = 0; i < N; i++) {
      const lc = g.n === 'gal' && zone[i] === ZONE_X ? NB_TRAUFE : g.decke;
      if (!frei(i, g.stand) || !frei(i, g.stand + 1) || !frei(i, g.stand + 2)) continue;
      if (g.boden > 0 && !solid(i, g.boden)) continue;
      if (!solid(i, lc) && !(g.n === 'gal' && rhoO[i] <= aO - 3)) continue;
      const nm = benenne(i, g.n);
      raum[fi][i] = RID[nm];
      P.raumZellen[nm] = (P.raumZellen[nm] || 0) + 1;
    }
  });
  P.raumNach = raum;
  P.RAEUME = RAEUME;
  const raumVon = (i, fi) => RAEUME[raum[fi][i]];

  // ---------------------------------------------------------------- Böden
  GESCHOSSE.forEach((g, fi) => {
    if (g.boden === 0) return;
    for (let i = 0; i < N; i++) {
      const r = raum[fi][i];
      if (!r || !solid(i, g.boden)) continue;
      const nm = RAEUME[r];
      const a = Math.floor(ww[i]), b = Math.floor(uu[i]);
      if (nm === 'tribuna') {
        const q = Math.floor(rhoO[i]);
        const mat = rhoO[i] < 2.5 ? GOLD : q % 4 === 0 ? ROTM : q % 4 === 2 ? GRUENM : WEISS;      // Oktogon-Ringe
        farbig(i, g.boden, mat);
      } else if (g.n === 'gal') {
        farbig(i, g.boden, ((a >> 1) + (b >> 1)) % 2 === 0 ? WEISS : ROTM);                        // Marmor-Schachbrett
      } else if (nm.startsWith('amtsraeume')) {
        farbig(i, g.boden, ((a >> 2) + (b >> 2)) % 2 === 0 ? PFLASTER : HOLZ);                     // Cotto- und Holzfelder
      }
    }
  });

  // ---------------------------------------------------------------- bemalte Decken (Grotesken)
  const grotesk = (a, b) => {
    const pa = a % 12, pb = b % 6;
    if (pa === 0 || pa === 6) return GOLD;
    if (pb === 0) return F('rot');
    if (pb === 1 || pb === 5) return F('weiss');
    if (pb === 2 || pb === 4) return (a >> 2) % 2 ? F('blau') : F('gruen');
    return pa % 4 === 3 ? F('gelb') : F('hellblau');
  };
  GESCHOSSE.forEach((g, fi) => {
    for (let i = 0; i < N; i++) {
      const r = raum[fi][i];
      if (!r) continue;
      const nm = RAEUME[r];
      if (nm === 'tribuna' || !(g.n === 'gal' || nm === 'portikus_ausstattung')) continue;
      const lc = g.n === 'gal' && zone[i] === ZONE_X ? NB_TRAUFE : g.decke;
      farbig(i, lc, grotesk(Math.floor(ww[i]) + 120, Math.floor(uu[i]) + 120));
    }
  });

  // ---------------------------------------------------------------- Wandbilder in der Wandfläche
  const WAND = ['trennwaende', 'spinnwand_fluegel', 'portikus_rueckwand', 'loggia_rueckwand', 'nobile_wand', 'mezzanin_wand', 'rueckseiten_wand',
    'serliana_aufsatz', 'suedbau_waende', 'stirnwaende', 'loggia_anschluss', 'ostnord_front', 'verone_arno'].map((n) => PID[n]);
  const wandSet = new Set(WAND);
  const cosT = S.R.cos, sinT = S.R.sin;
  const STIL = {
    bild: { periode: 8, rahmenL: 1, rahmenR: 5, von: 2, bis: 4, reihen: [2, 3], rahmenU: 1, rahmenO: 4 },
    portrait: { periode: 5, rahmenL: 0, rahmenR: 3, von: 1, bis: 2, reihen: [2, 3, 4], rahmenU: 1, rahmenO: 5 }
  };
  const FELD = ['rot', 'blau', 'gruen', 'braun', 'orange', 'hellblau', 'gelb', 'schwarz', 'weiss'];
  const farbe = (pic, dx, r) => {
    const h = hash(pic, dx, r);
    if (h % 5 === 0) return F(FELD[(pic * 7 + 3) % FELD.length]);
    if (r >= 3 && dx === 1 && h % 3 === 0) return F('weiss');
    return F(FELD[pic % FELD.length]);
  };
  const stilVon = (nm) => (nm.includes('korridor') ? 'portrait' : 'bild');
  P.wandflaechen = {};
  GESCHOSSE.forEach((g, fi) => {
    for (let i = 0; i < N; i++) {
      for (let L = g.stand + 1; L <= g.stand + 6; L++) {
        const v = own[i * SLOTS + L];
        if (!wandSet.has(v) || mt[i * SLOTS + L] !== 1) continue;                       // nur Putzflächen
        for (const [dx, dz] of nachb) {
          const j = at(cx[i] + dx, cz[i] + dz);
          if (j < 0) continue;
          const r = raum[fi][j];
          if (!r) continue;
          const nm = RAEUME[r];
          if (nm === 'portikus_ausstattung' || nm === 'tribuna') continue;
          const nu = dx * cosT + dz * sinT, nw = -dx * sinT + dz * cosT;
          const langU = Math.abs(nu) >= Math.abs(nw);
          const a = Math.floor(langU ? ww[i] : uu[i]);
          const ebene = langU ? Math.round(uu[i]) : Math.round(ww[i]);
          const key = (langU ? 'u' : 'w') + ((langU ? nu : nw) > 0 ? '+' : '-');
          const rr = L - g.stand;
          const stil = STIL[stilVon(nm)];
          const ix = ((a % stil.periode) + stil.periode) % stil.periode;
          const pic = Math.floor(a / stil.periode) + (langU ? 0 : 50) + r * 7;
          let mat = null;
          if (rr === stil.rahmenU || rr === stil.rahmenO) { if (ix >= stil.rahmenL && ix <= stil.rahmenR) mat = GOLD; }
          else if (stil.reihen.includes(rr)) {
            if (ix === stil.rahmenL || ix === stil.rahmenR) mat = GOLD;
            else if (ix >= stil.von && ix <= stil.bis) mat = farbe(pic, ix - stil.von, rr);
          }
          if (mat) reown(i, L, nm, mat);
          if (rr === 2) {
            let m = P.wandflaechen[nm];
            if (!m) P.wandflaechen[nm] = m = new Map();
            const gk = key + ':' + ebene;
            let l = m.get(gk);
            if (!l) m.set(gk, l = []);
            l.push({ i, a, g, fi });
          }
          break;
        }
      }
    }
  });

  // ---------------------------------------------------------------- große Tafeln (Gemälde) in den benannten Sälen
  // muster(x, r): x 0..breite-1, r 0..hoch-1; Rahmen Gold. Gewählt wird die nr-längste Wandebene des Saals, Mitte = Median.
  P.tafeln = [];
  const tafel = (nm, titel, muster, breite, hoch, nr) => {
    const m = P.wandflaechen[nm];
    if (!m) return;
    const gruppen = [...m.entries()].filter(([, l]) => l.length > breite + 2).sort((p, q) => q[1].length - p[1].length);
    const gr = gruppen[Math.min(nr, gruppen.length - 1)];
    if (!gr) return;
    const l = gr[1];
    const as = l.map((e) => e.a).sort((p, q) => p - q);
    const ac = as[as.length >> 1] + (nr ? 0 : 0);
    const h = Math.floor(breite / 2);
    let n = 0;
    for (const e of l) {
      const dx = e.a - ac;
      if (Math.abs(dx) > h + 1) continue;
      for (let r = 0; r < hoch + 2; r++) {
        const L = e.g.stand + 1 + r;
        const rand = Math.abs(dx) === h + 1 || r === 0 || r === hoch + 1;
        if (reown(e.i, L, nm, rand ? GOLD : muster(dx + h, r - 1))) n++;
      }
    }
    P.tafeln.push({ raum: nm, titel, zellen: n });
  };
  const venus = (x, r) => {                                                    // Geburt der Venus: Meer, Muschel, Venus, Zephyr und Hora
    if (r >= 3) return x < 2 || x > 6 ? F('gruen') : F('hellblau');
    if (r === 2 && x >= 3 && x <= 5) return x === 4 ? F('orange') : F('weiss');
    if (r === 1 && x >= 2 && x <= 6) return F('weiss');
    if (r === 0) return x % 2 ? F('blau') : F('hellblau');
    return F('blau');
  };
  const primavera = (x, r) => {                                                // Primavera: Orangenhain mit Blüten
    const h = hash(x, r, 9);
    if (r === 0) return F('gruen');
    if (r <= 2) return h % 4 === 0 ? (h % 8 === 0 ? F('rot') : F('gelb')) : F('gruen');
    return h % 7 === 0 ? F('orange') : x % 3 === 0 ? F('braun') : F('gruen');
  };
  tafel('sala_botticelli', 'Geburt der Venus', venus, 9, 5, 0);
  tafel('sala_botticelli', 'Primavera', primavera, 9, 5, 1);
  tafel('sala_leonardo', 'Verkündigung', (x, r) => (r >= 3 ? F('hellblau') : r === 2 && (x === 1 || x === 7) ? F('weiss') : r <= 1 ? F('gruen') : F('gelb')), 9, 5, 0);
  tafel('sala_leonardo', 'Anbetung der Könige', (x, r) => (hash(x, r, 4) % 3 === 0 ? F('schwarz') : (x + r) % 2 ? F('braun') : F('orange')), 9, 5, 1);
  tafel('sala_michelangelo_raffael', 'Tondo Doni', (x, r) => {
    const d = Math.hypot(x - 4, r - 2);
    return d > 3.2 ? F('braun') : d > 2.4 ? GOLD : d < 1 ? F('orange') : (x + r) % 2 ? F('blau') : F('rot');
  }, 9, 5, 0);
  tafel('sala_michelangelo_raffael', 'Madonna del Cardellino', (x, r) => (r >= 3 ? F('hellblau') : Math.abs(x - 4) <= 3 - r ? (r === 2 ? F('rot') : F('blau')) : F('gruen')), 9, 5, 1);

  // ---------------------------------------------------------------- Statuen und Büsten (Blockfiguren, vereinfacht)
  const keineTuer = (i, fi) => {
    const L = GESCHOSSE[fi].stand + 1;
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
      const j = at(cx[i] + dx, cz[i] + dz);
      if (j >= 0 && own[j * SLOTS + L] === AIR_ID && !((zone[j] === ZONE_W || zone[j] === ZONE_E) && tAll[j] <= 3)) return false;
    }
    return true;
  };
  const TREPPEN = new Set(['treppen', 'scalone_treppe', 'korridor_treppe'].map((n) => PID[n]));
  // genug Platz ringsum: mindestens 14 von 24 Nachbarspalten (5 x 5) frei in Kopfhöhe und keine Treppe in der Nähe (kein Zustellen enger Wege)
  const platzDa = (i, fi) => {
    const L0 = GESCHOSSE[fi].stand;
    let n = 0;
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
      if (!dx && !dz) continue;
      const j = at(cx[i] + dx, cz[i] + dz);
      if (j < 0) continue;
      for (let h = 0; h <= 3; h++) if (TREPPEN.has(own[j * SLOTS + L0 + h])) return false;
      if (frei(j, L0) && frei(j, L0 + 1) && frei(j, L0 + 2)) n++;
    }
    return n >= 14;
  };
  const figur = (i, fi, nm, hoch, kopf) => {
    const L0 = GESCHOSSE[fi].stand;
    if (!platzDa(i, fi)) return false;
    for (let h = 0; h < hoch; h++) if (!frei(i, L0 + h)) return false;
    setze(i, L0, nm, SOCKEL); setze(i, L0 + 1, nm, SOCKEL);
    for (let h = 2; h < hoch - 1; h++) setze(i, L0 + h, nm, WEISS);
    setze(i, L0 + hoch - 1, nm, kopf ? ORN : WEISS);
    return true;
  };
  const wandNah = (i, fi) => nachb.some(([dx, dz]) => {
    const j = at(cx[i] + dx, cz[i] + dz);
    return j >= 0 && wandSet.has(own[j * SLOTS + GESCHOSSE[fi].stand + 1]);
  });
  P.figuren = { korridor: 0, arno: 0, scalone: 0, tribuna: 0 };
  // Korridore der Galerie: Marmorstatuen in Reihe entlang der Fensterseite (t = 4), alle 8 Blöcke
  for (let i = 0; i < N; i++) {
    const nm = raumVon(i, 3);
    if ((nm === 'galerie_ostkorridor' || nm === 'galerie_westkorridor') && tAll[i] === 4 && Math.floor(ww[i]) % 8 === 3 && keineTuer(i, 3)) {
      if (figur(i, 3, nm, 6, false)) P.figuren.korridor++;
    }
    if (nm === 'galerie_arno_korridor' && S.d8[i] === 5 && Math.floor(uu[i]) % 9 === 0 && keineTuer(i, 3)) {
      if (figur(i, 3, nm, 5, true)) P.figuren.arno++;
    }
  }
  // Scalone: Büsten auf Sockeln an den Wänden der Halle (EG, Piano nobile, Galerie)
  [0, 2, 3].forEach((fi) => {
    for (let i = 0; i < N; i++) {
      if (raumVon(i, fi) !== 'scalone_ausstattung' || !wandNah(i, fi)) continue;
      if (Math.floor(ww[i]) % 9 !== 0 || Math.floor(uu[i]) % 3 !== 0 || !keineTuer(i, fi)) continue;
      if (figur(i, fi, 'scalone_ausstattung', 5, true)) P.figuren.scalone++;
    }
  });

  // ---------------------------------------------------------------- Tribuna
  {
    const L0 = 37;
    const R = S.R;
    const mU = R.toLocal(-176, 1120).u, mW = R.toLocal(-176, 1120).w;
    for (let i = 0; i < N; i++) {
      if (rhoO[i] > aO - 3) continue;
      const r = rhoO[i];
      if (r <= 2.6) {                                                        // achteckiger Marmortisch mit Lichtkern
        setze(i, L0, 'tribuna', r <= 1 ? LICHT : ORN);
      }
    }
    for (let k = 0; k < 4; k++) {                                            // Venus de' Medici und drei weitere Statuen
      const ang = (k + 0.5) * Math.PI / 2;
      const p = R.toWorld(mU + 7.5 * Math.cos(ang), mW + 7.5 * Math.sin(ang));
      const i = at(Math.round(p.x), Math.round(p.z));
      if (i >= 0 && figur(i, 3, 'tribuna', 6, true)) P.figuren.tribuna++;
    }
    // Innenhaut: Ring rot (Samtbespannung) mit Goldbändern, Kuppel innen rot mit Goldrosetten und Perlmutt
    for (let i = 0; i < N; i++) {
      if (rhoO[i] > aO) continue;
      for (let L = 37; L <= 80; L++) {
        const v = own[i * SLOTS + L];
        if (v !== PID.tribuna_tambour && v !== PID.tribuna_kuppel) continue;
        const innen = frei(i, L - 1) || nachb.some(([dx, dz]) => { const j = at(cx[i] + dx, cz[i] + dz); return j >= 0 && rhoO[j] <= aO - 3 && frei(j, L); });
        if (!innen) continue;
        let mat;
        if (v === PID.tribuna_tambour) {
          mat = L === 45 || L === 51 ? GOLD : L >= 52 ? ((Math.floor(ww[i]) + L) % 2 ? F('weiss') : F('rot')) : F('rot');
        } else {
          const h = hash(Math.floor(uu[i]) >> 1, Math.floor(ww[i]) >> 1, L);
          mat = h % 5 === 0 ? GOLD : h % 7 === 0 ? F('weiss') : F('rot');
        }
        farbig(i, L, mat);
      }
    }
    for (let i = 0; i < N; i++) {                                            // Wandleuchter im Ring, Lage 44
      if (rhoO[i] > aO - 3 || rhoO[i] <= aO - 4.2) continue;
      if ((Math.floor(uu[i]) + Math.floor(ww[i])) % 5 === 0 && frei(i, 44)) setze(i, 44, 'tribuna', LICHT);
    }
    void mU; void mW;
  }

  // ---------------------------------------------------------------- Regale und Tische in den Amtsräumen (die Uffizi waren Amtsgebäude)
  [[0, 'amtsraeume_eg'], [1, 'amtsraeume_mezzanin'], [2, 'amtsraeume_piano_nobile']].forEach(([fi, nm]) => {
    for (let i = 0; i < N; i++) {
      if (raumVon(i, fi) !== nm) continue;
      const a = Math.floor(ww[i]), b = Math.floor(uu[i]);
      if (wandNah(i, fi) && a % 7 < 2 && keineTuer(i, fi) && platzDa(i, fi)) {
        for (let h = 0; h < (fi === 1 ? 3 : 4); h++) setze(i, GESCHOSSE[fi].stand + h, nm, HOLZ);   // Aktenregal
      } else if (a % 12 === 6 && b % 12 < 3 && keineTuer(i, fi) && !wandNah(i, fi) && platzDa(i, fi)) {
        setze(i, GESCHOSSE[fi].stand, nm, HOLZ);                                                    // niedriger Schreibtisch
      }
    }
  });
  void K_GEN; void ZONE_W;
};
