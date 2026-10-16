'use strict';
// Raumplan und Ausstattung des Museo dell'Opera del Duomo (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/museo_opera_duomo/).
// Rahmen MO (θ 33,7°): u nach Ostsüdost, w nach Südsüdwest. Geschosse: EG Lage 0..9, 1. OG 9..17, 2. OG 17..23 (Lage = Y − 65).
// Alles vereinfacht, nicht nach Vorbild; die Lage der Räume im Grundriss ist Stufe C (die Quellen nennen Räume und Reihenfolge, keine Koordinaten).
const P = require('../../../tools/city/poly.js');
const WZ = require('../../../tools/wahrzeichen');
const { kit, typen, kassette, schach, mod, hash } = require('../../../tools/wahrzeichen/palazzo_raum.js');

// Portale an der Südwestkante zur Piazza del Duomo (Eingang und zweiter Zugang zur Sala del Paradiso), 7 breit, 10 hoch
const PORTALE = [{ u: 37, w: 123, breite: 7, hoehe: 10 }, { u: 68, w: 147, breite: 7, hoehe: 10 }];
const TREPPE = { u: 106, w: 82 };

// Raumraster (lokal): Spalten A u<45, B 45..88, C >88; Zeilen 1 w<62, 2 w 62..105, 3 w>105
const T4 = { breite: 4.5, hoehe: 5 };
const WAENDE = [
  { s: [0, 2], achse: 'u', v: 45, von: 18, bis: 170, tueren: [40, 83, 128], ...T4 },
  { s: [0, 2], achse: 'u', v: 88, von: 18, bis: 108, tueren: [40, 83], ...T4 },
  { s: [0, 2], achse: 'w', v: 62, von: 3, bis: 140, tueren: [25, 66, 108], ...T4 },
  { s: [0, 2], achse: 'w', v: 105, von: 3, bis: 140, tueren: [25, 66, 100], ...T4 },
  // 1. OG: über der Sala del Paradiso (B3) fehlt der Geschossboden, deshalb keine Türen in den Hallenraum
  { s: 1, achse: 'u', v: 45, von: 18, bis: 170, tueren: [40, 83], ...T4 },
  { s: 1, achse: 'u', v: 88, von: 18, bis: 108, tueren: [40, 83], ...T4 },
  { s: 1, achse: 'w', v: 62, von: 3, bis: 140, tueren: [25, 66, 108], ...T4 },
  { s: 1, achse: 'w', v: 105, von: 3, bis: 140, tueren: [25], ...T4 }
];
// Räume (lokale Rechtecke innerhalb der Trennwände)
const RAUM = {
  A1: { u0: 3, u1: 44, w0: 17, w1: 61 }, B1: { u0: 46, u1: 87, w0: 17, w1: 61 }, C1: { u0: 89, u1: 140, w0: 0, w1: 61 },
  A2: { u0: 3, u1: 44, w0: 63, w1: 104 }, B2: { u0: 46, u1: 87, w0: 63, w1: 104 }, C2: { u0: 89, u1: 140, w0: 63, w1: 104 },
  A3: { u0: 3, u1: 44, w0: 106, w1: 170 }, B3: { u0: 46, u1: 140, w0: 106.2, w1: 170 }
};
// Sala del Paradiso (B3): Hallenraum über zwei Geschosse
const HALLE = { u0: 45, u1: 140, w0: 105, w1: 170 };

// Fenster nur dort, wo die Wand an die Piazza del Duomo grenzt (die übrigen Seiten stoßen an Nachbarhäuser)
let plaza = null;
function plazaZellen() {
  if (plaza) return plaza;
  plaza = new Set();
  const fl = require('../../../data/stadt/flaechen.json');
  for (const f of fl.plaetze) {
    if (!f.polygon) continue;
    const b = P.bbox(f.polygon);
    if (b.x1 < 90 || b.x0 > 160 || b.z1 < -70 || b.z0 > 40) continue;
    for (const [x, z] of P.cellsOf(f.polygon)) plaza.add(x + ',' + z);
  }
  return plaza;
}
function fensterOrt(c) {
  const S = plazaZellen();
  for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) if (S.has((c.x + dx) + ',' + (c.z + dz))) return true;
  return false;
}

const TEILE = ['eingangshalle', 'galleria_sculture', 'tribuna_pieta', 'sala_maddalena', 'korridor_marmor', 'sala_paradiso',
  'sala_navate', 'galleria_campanile', 'galleria_cupola', 'sala_cantorie', 'sala_silberaltar', 'fassadenentwuerfe', 'galerie_modelle', 'aussichtsraum', 'saal_giotto', 'saal_paramente'];

function vorher(api) {
  const { D, frei, Y, BASIS } = api;
  // Sala del Paradiso: der Geschossboden des 1. OG entfällt über der Halle (zwei Geschosse hoch)
  for (const c of D.haupt) {
    if (c.u >= HALLE.u0 + 1.5 && c.u < HALLE.u1 && c.w >= HALLE.w0 + 1.5 && c.w < HALLE.w1 && c.d8 > 2) frei(c.x, Y(BASIS[1]), c.z);
  }
}

function ausstatten(api) {
  const { Y, BASIS } = api;
  // Wandfelder bleiben im Bauteil ihrer Wand (Wände und Wandfelder stehen im selben Bauschritt; sonst verlieren die Restzellen der
  // Wand ihren Halt, R3); Böden, Decken und Möbel gehören den Teilen der Räume.
  const kitApi = Object.assign({}, api, {
    ersetze: (x, y, z, typ, teil) => { const e = api.zellen.get(api.key(x, y, z)); return api.ersetze(x, y, z, typ, e && api.WAND_TEILE.has(e.p) ? e.p : teil); }
  });
  const K = kit(kitApi);
  const t = typen();
  const FR = (n) => WZ.fresko(n);
  const geschlossen = (c) => c.d8 > 2;

  /** Stehzelle im Raum, die dem Ziel am nächsten liegt und mindestens `rand` von der Wand entfernt ist. */
  const nahe = (zs, u, w, rand = 5) => {
    let best = null, bd = Infinity;
    for (const c of zs) {
      if (c.d8 < rand) continue;
      const d = Math.hypot(c.u - u, c.w - w);
      if (d < bd) { bd = d; best = c; }
    }
    return best;
  };
  /** Raum einrichten: Boden, Wände, Decke. */
  const raum = (teil, s, r, o) => {
    const zs = K.steh(s, r);
    if (o.boden) K.boden(teil, s, zs, o.boden);
    if (o.waende) K.waende(teil, s, zs, o.waende);
    if (o.decke) K.decke(teil, s, zs, o.decke);
    return zs;
  };
  const figur = (teil, s, zs, u, w, o) => { const c = nahe(zs, u, w, o.rand || 5); if (c) K.figur(teil, s, c.u, c.w, o); return c; };
  const sockel = (teil, s, zs, u, w, a, b, h, typ) => { const c = nahe(zs, u, w, 4); if (c) K.quader(teil, s, { u0: c.u - a / 2, u1: c.u + a / 2, w0: c.w - b / 2, w1: c.w + b / 2 }, 1, h, typ); return c; };
  const vitrine = (teil, s, zs, u, w) => { const c = nahe(zs, u, w, 4); if (c) { const r = { u0: c.u - 1, u1: c.u + 1, w0: c.w - 1, w1: c.w + 1 }; K.quader(teil, s, r, 1, 2, t.pflaster); K.quader(teil, s, r, 3, 3, t.glas); } return c; };
  const pan = (farben, o = {}) => ({ pitch: o.pitch || 10, y0: 2, y1: o.y1 || 5, farben, rahmen: t.gold, pilaster: t.serena, sockel: { h: 1, typ: o.sockel || t.holz }, fries: o.fries });
  const kass = (n) => (c) => kassette(c, n, t.holz, t.putz, t.gold);
  const brett = (k, a, b) => (c) => schach(c, k, a, b);
  // Bild als Farbfeld in einer Wandfläche (lokales Rechteck r, Höhen j0..j1 relativ zum Boden des Geschosses s): fn(q, jj, B, H) mit q entlang `achse`
  const bild = (teil, s, r, achse, j0, j1, fn, nurD8) => {
    const a0 = achse === 'u' ? r.u0 : r.w0, B = Math.floor((achse === 'u' ? r.u1 - r.u0 : r.w1 - r.w0) + 0.5), H = j1 - j0 + 1;
    return K.flaeche(teil, s, r, j0, j1, (c, jj, j) => {
      if (nurD8 !== undefined && c.d8 !== nurD8) return null;
      if (BASIS.includes(j + BASIS[s]) && j + BASIS[s] > 0) return null;           // Geschossboden-Zeile nicht anfassen (Halt der Wand darüber)
      const q = Math.min(B - 1, Math.max(0, Math.floor((achse === 'u' ? c.u : c.w) - a0 + 0.0001)));
      return fn(q, jj, B, H);
    });
  };
  const rahmenGold = (q, jj, B, H) => q === 0 || q === B - 1 || jj === 0 || jj === H - 1;
  const tafelMotiv = (farbeGrund, farbeFigur) => (q, jj, B, H) => {
    if (rahmenGold(q, jj, B, H)) return t.gold;
    const cx = (B - 1) / 2;
    if (Math.abs(q - cx) <= 1 && jj <= H - 3) return jj === H - 3 ? FR('orange') : farbeFigur;
    return farbeGrund;
  };

  // ============================================================ Erdgeschoss
  // ---- Eingangshalle mit Corridoio dei nomi und der Statuengruppe von Ticciati (A3)
  {
    const teil = 'eingangshalle';
    const zs = raum(teil, 0, RAUM.A3, {
      boden: brett(4, t.weiss, t.serena),
      waende: { pitch: 8, y0: 2, y1: 6, farben: ['weiss'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 1, typ: t.serena }, fries: t.gold,
        motiv: (k, q, j, B, H) => ((hash(k, q, j) % 4 === 0) ? t.gold : null) },
      decke: kass(5)
    });
    const c = sockel(teil, 0, zs, 28, 117, 5, 5, 1, t.serena);                                       // Stufensockel (zwei Stufen)
    if (c) K.quader(teil, 0, { u0: c.u - 1.5, u1: c.u + 1.5, w0: c.w - 1.5, w1: c.w + 1.5 }, 2, 2, t.weiss);
    if (c) K.figur(teil, 0, c.u, c.w, { j0: 3, sockel: 0, typ: t.weiss, arme: 'hoch', sockelTyp: t.weiss, beine: 1, rumpf: 2 });   // Gloria di San Giovanni Battista (Ticciati, 1732)
  }
  // ---- Galleria delle Sculture: Fragmente der Porta della Mandorla (A2)
  {
    const teil = 'galleria_sculture';
    const zs = raum(teil, 0, RAUM.A2, { boden: brett(4, t.cotto, t.weiss), waende: pan(['hellblau', 'weiss']), decke: kass(6) });
    [[14, 78], [24, 90], [34, 78], [24, 70]].forEach(([u, w], k) => figur(teil, 0, zs, u, w, { typ: [t.weiss, t.ornament, t.weiss, t.ornament][k], sockelTyp: t.serena, sockel: 2, arme: k % 2 ? 'hoch' : 'seitlich' }));   // Tino di Camaino, Donatello, Nanni di Banco
  }
  // ---- Tribuna mit der Pietà Bandini (B2)
  {
    const teil = 'tribuna_pieta';
    const zs = raum(teil, 0, RAUM.B2, { boden: (c) => schach(c, 3, t.weiss, t.dunkel), waende: pan(['weiss', 'hellblau'], { sockel: t.dunkel }), decke: kass(6) });
    const c = nahe(zs, 66, 84, 6);
    if (c) {
      const R = (a, b, d, e) => ({ u0: c.u + a, u1: c.u + b, w0: c.w + d, w1: c.w + e });
      K.quader(teil, 0, R(-2.5, 2.5, -2.5, 2.5), 1, 1, t.dunkel);                                // Sockel (eine Stufe)
      K.quader(teil, 0, R(-1.8, 1.8, -1.8, 1.8), 2, 2, t.dunkel);                                 // zweite Stufe
      K.quader(teil, 0, R(-1.2, 1.2, -0.6, 0.6), 3, 4, t.weiss);                                  // Christus (Körper)
      K.quader(teil, 0, R(-0.6, 0.6, -0.6, 0.6), 5, 7, t.weiss);                                  // Nikodemus (Gesichtszüge Michelangelos) hinter dem Körper
      K.quader(teil, 0, R(0.8, 1.6, 0.8, 1.6), 3, 6, t.weiss);                                    // Maria
      K.quader(teil, 0, R(-1.6, -0.8, 0.8, 1.6), 3, 6, t.weiss);                                  // Magdalena
    }
  }
  // ---- Saal 8: Donatellos Maddalena penitente, Holzkruzifix, achteckige Kapelle mit Reliquiaren (A1)
  {
    const teil = 'sala_maddalena';
    const zs = raum(teil, 0, RAUM.A1, { boden: brett(4, t.holz, t.cotto), waende: pan(['hellblau'], { sockel: t.serena }), decke: kass(6) });
    figur(teil, 0, zs, 22, 38, { typ: t.holz, sockelTyp: t.serena, sockel: 2, arme: 'keine', beine: 1, rumpf: 3 });                  // Maddalena penitente (Holz)
    const cr = nahe(zs, 12, 28, 3);
    if (cr) bild(teil, 0, { u0: 3, u1: 6.3, w0: cr.w - 2, w1: cr.w + 2 }, 'w', 3, 9, (q, jj, B, H) => ((q === Math.floor(B / 2) && jj <= H - 1) || (jj === H - 3 && Math.abs(q - B / 2 + 0.5) <= 1.5)) ? t.holz : null, 2);   // Holzkruzifix (Giovanni di Balduccio, zugeschrieben)
    const ok = nahe(zs, 24, 52, 3);                                                                                                    // achteckiges Reliquiarkabinett
    if (ok) { K.boden(teil, 0, zs.filter((c) => Math.hypot(c.u - ok.u, c.w - ok.w) < 7 && (Math.abs(c.u - ok.u) + Math.abs(c.w - ok.w)) < 9), () => t.gold);
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; vitrine(teil, 0, zs, ok.u + Math.cos(a) * 5, ok.w + Math.sin(a) * 5); } }
  }
  // ---- Korridor mit Marmorfragmenten, darunter Reste des Taufbeckens (B1)
  {
    const teil = 'korridor_marmor';
    const zs = raum(teil, 0, RAUM.B1, { boden: brett(5, t.weiss, t.serena), waende: pan(['weiss'], { sockel: t.serena }), decke: kass(7) });
    [[56, 30], [66, 38], [76, 30], [60, 46], [72, 50]].forEach(([u, w]) => sockel(teil, 0, zs, u, w, 3, 2, 1, t.alt));
  }
  // ---- Sala del Paradiso: Halle über zwei Geschosse (B3), 1:1-Replik der Fassade des Arnolfo, drei Bronzeportale, Statuengruppen
  {
    const teil = 'sala_paradiso';
    const zs = K.steh(0, RAUM.B3);
    K.boden(teil, 0, zs, (c) => schach(c, 5, t.weiss, t.rot));
    K.waende(teil, 0, zs, { pitch: 14, y0: 2, y1: 7, farben: ['weiss', 'hellblau'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 1, typ: t.serena } });
    K.decke(teil, 1, zs, (c) => kassette(c, 8, t.holz, t.putz, t.gold));                          // Decke der Halle = Unterseite des 2. OG
    // Statuengruppen über den Portalen: Rustici (Predigt des Täufers), Sansovino (Taufe Christi), Danti (Enthauptung)
    [[94, 114], [90, 126], [86, 138]].forEach(([u, w], k) => figur(teil, 0, zs, u, w, { typ: [t.bronze, t.weiss, t.bronze][k], sockelTyp: t.serena, sockel: 3, arme: 'hoch', beine: 2, rumpf: 3 }));
    // Fragmente der 1587 abgerissenen Fassade: Marmorblöcke
    [[60, 118], [66, 130], [72, 142]].forEach(([u, w]) => sockel(teil, 0, zs, u, w, 4, 2, 1, t.alt));
  }
  {
    // drei Bronzeportale des Baptisteriums (Pisano, Ghiberti Nord, Ghiberti „Paradies“) an der Nordostwand der Halle
    const teil = 'sala_paradiso';
    const gold = [FR('braun'), FR('orange'), FR('gelb')];
    [[108, 0], [119.5, 1], [131, 2]].forEach(([w0, k]) => bild(teil, 0, { u0: 94, u1: 110, w0, w1: w0 + 10 }, 'w', 2, 12, (q, jj, B, H) => {
      if (q === 0 || q === B - 1 || jj === 0 || jj === H - 1) return t.bronze;
      const feld = (q % 3 !== 0) && (jj % 2 === 1);
      return feld ? (k === 2 ? t.gold : gold[k]) : t.bronze;
    }, 2));
  }
  {
    // Fassade des Arnolfo (1:1-Replik in der Sala del Paradiso): Feld 48 × 14 an der Nordwestwand (Seite zur Halle), hier auf Hallenhöhe verkürzt
    const teil = 'sala_paradiso';
    bild(teil, 0, { u0: 51, u1: 99, w0: 105, w1: 106.4 }, 'u', 2, 15, (q, jj, B, H) => {
      const cx = (B - 1) / 2, dx = Math.abs(q - cx);
      const giebel = jj >= 9 ? (B / 2) * (1 - (jj - 9) / (H - 8)) : B;                         // Giebel oberhalb von Reihe 9
      if (dx > giebel) return null;
      if (jj === 0) return t.serena;
      const mitte = dx <= 5 && jj <= 9 - Math.floor(Math.max(0, dx - 3) * 1.5);                 // Hauptportal (Spitzbogen)
      const seite = Math.abs(dx - 16) <= 3 && jj <= 6 - Math.floor(Math.max(0, Math.abs(dx - 16) - 2));
      if (mitte || seite) return t.dunkel;
      if (jj === 10 || jj === 4) return FR('gruen');
      if (Math.hypot(dx, jj - 12) < 2.3) return Math.hypot(dx, jj - 12) < 1.3 ? FR('hellblau') : t.gold;      // Rosette
      if (jj >= 11 && jj <= 13 && dx % 6 >= 2 && dx % 6 <= 3 && dx > 4) return FR('hellblau');                  // Statuennischen
      if (dx === Math.floor(giebel) || q === 0 || q === B - 1) return t.gold;
      return ((q + jj) & 1) ? t.weiss : t.alt;
    });
  }

  // ============================================================ 1. Obergeschoss
  {
    const teil = 'sala_navate';
    const zs = raum(teil, 1, RAUM.A3, { boden: brett(4, t.holz, t.cotto), waende: pan(['braun', 'rot'], { pitch: 12 }), decke: kass(5) });
    for (const [u, w] of [[16, 112], [28, 118]]) { const c = nahe(zs, u, w, 3); if (c) bild(teil, 1, { u0: c.u - 3, u1: c.u + 3, w0: c.w - 3, w1: c.w + 3 }, 'w', 2, 6, tafelMotiv(t.gold, FR('blau')), 2); }   // Trecento-Tafeln auf Goldgrund
  }
  {
    const teil = 'galleria_campanile';
    const zs = raum(teil, 1, RAUM.A2, { boden: brett(4, t.cotto, t.weiss), waende: pan(['weiss', 'hellblau'], { sockel: t.serena }), decke: kass(6) });
    [[12, 80], [22, 92], [32, 80], [22, 68]].forEach(([u, w], k) => figur(teil, 1, zs, u, w, { typ: [t.weiss, t.weiss, t.ornament, t.weiss][k], sockelTyp: t.serena, sockel: 2, arme: k === 3 ? 'hoch' : 'seitlich' }));   // Abacuc, Geremia, Profeta pensieroso, Sacrificio di Isacco
    for (const [u, w] of [[8, 66], [8, 100]]) { const c = nahe(zs, u, w, 3); if (c) bild(teil, 1, { u0: 3, u1: 6.3, w0: c.w - 3, w1: c.w + 3 }, 'w', 2, 6, (q, jj, B, H) => (rahmenGold(q, jj, B, H) ? t.gold : FR('weiss')), 2); }   // Reliefs (Pisano, Luca della Robbia)
  }
  {
    const teil = 'galleria_cupola';
    const zs = raum(teil, 1, RAUM.B2, { boden: brett(4, t.holz, t.cotto), waende: pan(['braun'], { sockel: t.holz }), decke: kass(6) });
    const c = nahe(zs, 66, 82, 6);
    if (c) {                                                                                   // Modell der Kuppel (Halbkugel) mit Laterne auf einem Tisch
      const R = (r) => ({ u0: c.u - r, u1: c.u + r, w0: c.w - r, w1: c.w + r });
      K.quader(teil, 1, R(5), 1, 1, t.holz);
      for (const cc of K.alle) { if (!K.imR(cc, R(5))) continue; const d = Math.hypot(cc.u - c.u, cc.w - c.w); if (d > 4.3) continue; const h = Math.floor(Math.sqrt(Math.max(0, 18.5 - d * d))); for (let j = 2; j <= 1 + h; j++) api.set(cc.x, Y(BASIS[1] + j), cc.z, j > h ? t.ornament : WZ.typ('ziegel_kuppel'), teil); }
      K.quader(teil, 1, R(0.6), 6, 8, t.weiss);                                                // Laterne
    }
    for (const [u, w] of [[52, 70], [80, 98]]) vitrine(teil, 1, zs, u, w);                    // Totenmaske Brunelleschis, Werkzeuge
  }
  {
    const teil = 'sala_cantorie';
    const zs = raum(teil, 1, RAUM.A1, { boden: brett(4, t.cotto, t.weiss), waende: pan(['hellblau', 'weiss'], { sockel: t.serena }), decke: kass(6) });
    for (const [u, w, f] of [[8, 30, 'blau'], [8, 48, 'rot']]) { const c = nahe(zs, u, w, 3); if (c) bild(teil, 1, { u0: 3, u1: 6.3, w0: c.w - 7, w1: c.w + 7 }, 'w', 2, 6, (q, jj, B, H) => (rahmenGold(q, jj, B, H) ? t.gold : (q % 2 ? FR('weiss') : FR(f))), 2); }   // Cantorie (Donatello, Luca della Robbia)
    figur(teil, 1, zs, 26, 36, { typ: t.weiss, sockelTyp: t.serena, sockel: 2, arme: 'seitlich' });                                    // Creazione di Eva
  }
  {
    const teil = 'sala_silberaltar';
    const zs = raum(teil, 1, RAUM.B1, { boden: (c) => schach(c, 3, t.weiss, t.dunkel), waende: pan(['weiss'], { sockel: t.dunkel }), decke: kass(5) });
    const c = nahe(zs, 66, 40, 6);
    if (c) {
      K.quader(teil, 1, { u0: c.u - 4, u1: c.u + 4, w0: c.w - 1.5, w1: c.w + 1.5 }, 1, 1, t.weiss);                 // Altare argenteo di San Giovanni (Silber, vereinfacht Quarz)
      K.quader(teil, 1, { u0: c.u - 3, u1: c.u + 3, w0: c.w - 0.6, w1: c.w + 0.6 }, 2, 3, t.ornament);
      K.quader(teil, 1, { u0: c.u - 0.5, u1: c.u + 0.5, w0: c.w - 0.5, w1: c.w + 0.5 }, 4, 6, t.gold);               // Kreuz von Pollaiolo und Betti
    }
    const b = nahe(zs, 66, 56, 3);
    if (b) bild(teil, 1, { u0: 48, u1: 86, w0: 54, w1: 61 }, 'u', 2, 4, (q, jj) => FR(['rot', 'gruen', 'blau', 'gelb', 'orange'][(q + jj) % 5]), 2);   // Stickereien des Parato di San Giovanni
  }
  {
    const teil = 'fassadenentwuerfe';
    const zs = raum(teil, 1, RAUM.C1, { boden: brett(5, t.cotto, t.weiss), waende: pan(['weiss'], { sockel: t.serena }), decke: kass(6) });
    [[100, 20], [120, 20], [110, 40]].forEach(([u, w]) => { const c = nahe(zs, u, w, 4); if (c) K.stellwand(teil, 1, 'w', c.w, c.u - 6, c.u + 6, { farben: ['rot', 'gelb', 'blau', 'weiss'], wand: t.putz }); });
  }

  // ============================================================ 2. Obergeschoss
  {
    const teil = 'galerie_modelle';
    const zs = raum(teil, 2, RAUM.A2, { boden: brett(4, t.holz, t.cotto), waende: pan(['braun'], { y1: 4, sockel: t.holz }), decke: kass(6) });
    [[12, 76], [24, 90], [34, 76], [24, 70]].forEach(([u, w]) => { const c = sockel(teil, 2, zs, u, w, 5, 3, 1, t.holz); if (c) K.quader(teil, 2, { u0: c.u - 1.5, u1: c.u + 1.5, w0: c.w - 0.8, w1: c.w + 0.8 }, 2, 3, t.putz); });   // Holzmodelle der Domfassade
  }
  {
    const teil = 'aussichtsraum';
    const zs = raum(teil, 2, RAUM.B2, { boden: brett(4, t.weiss, t.cotto), waende: pan(['hellblau', 'weiss'], { y1: 4, sockel: t.serena }), decke: kass(6) });
    [[56, 74], [66, 74], [76, 74]].forEach(([u, w]) => sockel(teil, 2, zs, u, w, 6, 1.6, 1, t.holz));   // Bänke
  }
  {
    const teil = 'saal_giotto';
    const zs = raum(teil, 2, RAUM.A1, { boden: brett(4, t.holz, t.cotto), waende: pan(['rot'], { y1: 4, sockel: t.holz }), decke: kass(6) });
    const c = nahe(zs, 12, 38, 3);
    if (c) bild(teil, 2, { u0: 3, u1: 6.3, w0: c.w - 4, w1: c.w + 4 }, 'w', 2, 5, tafelMotiv(t.gold, FR('blau')), 2);          // Giottos Madonna di San Giorgio alla Costa
  }
  {
    const teil = 'saal_paramente';
    const zs = raum(teil, 2, RAUM.B1, { boden: brett(4, t.cotto, t.weiss), waende: pan(['blau'], { y1: 4, sockel: t.holz }), decke: kass(6) });
    for (const [u, w] of [[56, 30], [70, 30], [66, 48]]) vitrine(teil, 2, zs, u, w);                                                  // Paramente
    const c = nahe(zs, 66, 24, 3);
    if (c) bild(teil, 2, { u0: c.u - 8, u1: c.u + 8, w0: 17, w1: 27 }, 'u', 2, 5, tafelMotiv(FR('gruen'), FR('rot')), 2);          // Gemälde des 16. Jahrhunderts
  }
}

module.exports = { PORTALE, TREPPE, WAENDE, RAUM, HALLE, TEILE, fensterOrt, vorher, ausstatten };
