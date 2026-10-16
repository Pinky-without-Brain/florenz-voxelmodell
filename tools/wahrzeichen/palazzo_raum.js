'use strict';
// Ausstattungs-Werkzeug für die Palazzi (V5a, Ergänzung zu palazzo.js): ersetzt Zellen der Rohbauteile (Boden, Wand)
// durch Muster und setzt Decken, Möbel und Blockfiguren. Wird aus cfg.raeume.ausstatten(api) heraus mit dem Plan-api
// von palazzo.js benutzt:
//
//   const K = require('../../../tools/wahrzeichen/palazzo_raum.js').kit(api);
//   const z = K.steh(1, { u0: 40, u1: 60, w0: 10, w1: 30 });        // stehbare Zellen im Rechteck (lokal) im Geschoss 1
//   K.boden('saal', 1, z, (c) => schach(c, 3, a, b));               // Bodenmuster (Teil "saal")
//   K.waende('saal', 1, z, { pitch: 8, y0: 3, y1: 9, farben: ['blau', 'rot'], rahmen: gold });
//   K.decke('saal', 1, z, (c) => kassette(c));
//   K.quader('saal', 1, { u0, u1, w0, w1 }, 1, 2, holz);            // Möbel in lokalen Rechtecken
//   K.figur('saal', 1, u, w, { sockel: 2, ... });
//
// Alle Koordinaten (u, w) sind lokal im Rahmen des Projekts; Höhen k sind relativ zur Oberkante des Geschossbodens
// (k = 1 ist die Stehzelle). Ersetzte Zellen werden dem Teil zugeordnet; Neues setzt nur in freie Zellen.

const WZ = require('./index.js');

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const mod = (a, n) => ((a % n) + n) % n;

function kit(api) {
  const { D, zellen, key, Y, BASIS, set, hat, ersetze, bodenTeile, WAND_TEILE } = api;
  const R = D.R;
  const alle = D.haupt.concat(D.hofZellen);
  const EPS = 1e-6;
  const imR = (c, r) => c.u >= r.u0 - EPS && c.u < r.u1 - EPS && c.w >= r.w0 - EPS && c.w < r.w1 - EPS;
  const lokal = (x, z) => (D.byKey.get(x + ',' + z) || R.toLocal(x, z));
  const yS = (s, k) => Y(BASIS[s] + k);

  /** Stehbare Zellen eines Geschosses im lokalen Rechteck r (Boden vorhanden, Luft darüber). */
  function steh(s, r) {
    const out = [];
    for (const c of D.haupt) {
      if (r && !imR(c, r)) continue;
      const b = zellen.get(key(c.x, yS(s, 0), c.z));
      if (b && !hat(c.x, yS(s, 1), c.z) && !hat(c.x, yS(s, 2), c.z) && bodenTeile.has(b.p)) out.push(c);
    }
    return out;
  }

  /** Ein Block in eine freie Zelle (Luft des Planes); false, wenn belegt oder als Öffnung freigehalten. */
  const block = (teil, x, y, z, t) => set(x, y, z, t, teil);

  /** Bodenmuster: ersetzt die Bodenzelle jeder Stehzelle durch fn(c) (null = unverändert). */
  function boden(teil, s, zs, fn) {
    bodenTeile.add(teil);
    let n = 0;
    for (const c of zs) {
      const t = fn(c);
      if (t && ersetze(c.x, yS(s, 0), c.z, t, teil)) n++;
    }
    return n;
  }

  /** Decke: Verkleidung unter dem Geschossboden darüber (oberste Luftzelle), fn(c, d) mit Tiefe d (null = frei lassen). */
  function decke(teil, s, zs, fn, tiefe = 1) {
    const hoch = BASIS[s + 1] - BASIS[s];
    let n = 0;
    for (const c of zs) {
      for (let d = 0; d < tiefe; d++) {
        const t = fn(c, d);
        if (t && set(c.x, yS(s, hoch - 1 - d), c.z, t, teil)) n++;
      }
    }
    return n;
  }

  /**
   * Wandfelder: Alle Wandzellen, die an die Stehzellen zs grenzen (Teile aus WAND_TEILE, kein Glas), werden zu einem
   * Raster aus Pilastern, Rahmen und Feldern. Je Tafel: Breite pitch (1 Pilaster + pitch - 1 Rahmen/Feld), Felder
   * Höhe y0..y1 (relativ zum Boden; Rahmen auf y0 und y1, Füllung dazwischen).
   *  o = { pitch = 8, y0 = 3, y1 = 9, t0 = 0, farben: [Farbnamen oder Typen], rahmen: Typ, pilaster?: Typ,
   *        sockel?: { h, typ }, fries?: Typ (Zeile y1 + 1), motiv?(k, q, j, B, H) -> Typ oder null,
   *        nur?(e, achse, t) -> bool (Filter nach Wandzelle, Normalenachse und Tangentialkoordinate),
   *        nurTeile?: [Teile] }
   */
  function waende(teil, s, zs, o) {
    const P = o.pitch || 8, y0 = o.y0 === undefined ? 3 : o.y0, y1 = o.y1 === undefined ? 9 : o.y1, t0 = o.t0 || 0;
    const farben = (o.farben || ['weiss']).map((f) => (typeof f === 'string' && !f.includes('_') ? WZ.fresko(f) : f));
    const gesehen = new Set();
    let n = 0;
    const B = P - 1, H = y1 - y0 + 1;
    for (const c of zs) {
      const lc = lokal(c.x, c.z);
      for (const [dx, dz] of N4) {
        const nx = c.x + dx, nz = c.z + dz;
        const ln = lokal(nx, nz);
        const achse = Math.abs(ln.u - lc.u) > Math.abs(ln.w - lc.w) ? 'u' : 'w';
        const t = achse === 'u' ? ln.w : ln.u;
        const ti = Math.floor(t + 0.5 - t0);
        const i = mod(ti, P), kk = Math.floor(ti / P);
        for (let j = 1; j <= y1 + 1; j++) {
          const k = key(nx, yS(s, j), nz);
          if (gesehen.has(k)) continue;
          const e = zellen.get(k);
          if (!e || !WAND_TEILE.has(e.p) || (o.nurTeile && !o.nurTeile.includes(e.p))) continue;
          if (o.nur && !o.nur(e, achse, t)) continue;
          let typ = null;
          if (o.sockel && j <= o.sockel.h) typ = o.sockel.typ;
          else if (j > y1) typ = o.fries || null;
          else if (j < y0) typ = null;
          else if (i === 0) typ = o.pilaster || null;
          else {
            const q = i - 1, jj = j - y0;
            if (q === 0 || q === B - 1 || jj === 0 || jj === H - 1) typ = o.rahmen;
            else typ = (o.motiv && o.motiv(kk, q - 1, jj - 1, B - 2, H - 2)) || farben[mod(kk, farben.length)];
          }
          if (!typ) continue;
          gesehen.add(k);
          if (ersetze(nx, yS(s, j), nz, typ, teil)) n++;
        }
      }
    }
    return n;
  }

  /** Fläche in bestehenden Wandzellen (beliebiger Teil außer Glas) in lokalem Rechteck r, Höhen j0..j1 (relativ zum Boden). */
  function flaeche(teil, s, r, j0, j1, fn) {
    let n = 0;
    for (const c of alle) {
      if (!imR(c, r)) continue;
      for (let j = j0; j <= j1; j++) {
        const e = zellen.get(key(c.x, yS(s, j), c.z));
        if (!e || e.p === 'fenster' || e.p === 'hoffenster') continue;
        const t = fn(c, j - j0, j);
        if (t && ersetze(c.x, yS(s, j), c.z, t, teil)) n++;
      }
    }
    return n;
  }

  /** Quader (Möbel, Sockel): setzt in alle freien Zellen des lokalen Rechtecks r die Höhen j0..j1; typ oder fn(c, j). */
  function quader(teil, s, r, j0, j1, typ) {
    let n = 0;
    for (const c of alle) {
      if (!imR(c, r)) continue;
      for (let j = j0; j <= j1; j++) {
        const t = typeof typ === 'function' ? typ(c, j) : typ;
        if (t && set(c.x, yS(s, j), c.z, t, teil)) n++;
      }
    }
    return n;
  }

  /** Weltzelle zu lokalen Koordinaten (u, w). */
  const zelle = (u, w) => { const p = R.toWorld(u, w); return { x: Math.round(p.x), z: Math.round(p.z) }; };

  /**
   * Blockfigur in Weltzellen um (u, w): Sockel (3 x 3), Beine, Rumpf mit Armen, Kopf. Maße in Blöcken (Maßstab 1:2).
   *  o = { sockel = 2, sockelTyp, beine = 2, rumpf = 2, typ (Körper), kopf (Typ), arme = seitlich, hoch oder keine,
   *        armTyp, beinTyp, schmuck: Typ (Krone/Helm auf dem Kopf), j0 = 1 (Höhe des Sockelbodens),
   *        draussen: true im Hof (Luft unter den Armen wird als offene Luft deklariert) }
   * Rückgabe: Oberkante der Figur (relativ zum Boden).
   */
  function figur(teil, s, u, w, o) {
    const { x, z } = zelle(u, w);
    let j = o.j0 || 1;
    const sh = o.sockel === undefined ? 2 : o.sockel;
    for (let h = 0; h < sh; h++, j++) for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) set(x + dx, yS(s, j), z + dz, o.sockelTyp, teil);
    for (let h = 0; h < (o.beine === undefined ? 2 : o.beine); h++, j++) set(x, yS(s, j), z, o.beinTyp || o.typ, teil);
    const rumpf = o.rumpf === undefined ? 2 : o.rumpf;
    for (let h = 0; h < rumpf; h++, j++) {
      set(x, yS(s, j), z, o.typ, teil);
      if (h === rumpf - 1 && o.arme !== 'keine') {
        const a = o.armTyp || o.typ;
        for (const [dx, dz] of [[1, 0], [-1, 0]]) {
          set(x + dx, yS(s, j), z + dz, a, teil);
          if (o.arme === 'hoch') set(x + dx, yS(s, j + 1), z + dz, a, teil);
          // im Freien ist die Luft unter den Armen offene Hofluft (für R14 als Öffnung deklariert)
          if (o.draussen) for (let jj = (o.j0 || 1) + sh; jj < j; jj++) if (!hat(x + dx, yS(s, jj), z + dz)) api.oeffnung('fenster_offen', teil, x + dx, yS(s, jj), z + dz);
        }
      }
    }
    set(x, yS(s, j), z, o.kopf || o.typ, teil); j++;
    if (o.schmuck) { set(x, yS(s, j), z, o.schmuck, teil); j++; }
    return j - 1;
  }

  /** Liegendes Tier (Marzocco): Körper 3 lang entlang der Weltachse achse (x oder z) auf einem Sockel, Kopf und Mähne vorn. */
  function loewe(teil, s, u, w, o) {
    const { x, z } = zelle(u, w);
    const ax = o.achse === 'z' ? [0, 1] : [1, 0], q = o.achse === 'z' ? [1, 0] : [0, 1];
    let j = o.j0 || 1;
    for (let h = 0; h < (o.sockel === undefined ? 2 : o.sockel); h++, j++) for (let a = -2; a <= 2; a++) for (let b = -1; b <= 1; b++) set(x + ax[0] * a + q[0] * b, yS(s, j), z + ax[1] * a + q[1] * b, o.sockelTyp, teil);
    for (let a = -1; a <= 1; a++) for (let h = 0; h < 2; h++) set(x + ax[0] * a, yS(s, j + h), z + ax[1] * a, o.typ, teil);
    set(x - ax[0], yS(s, j + 2), z - ax[1], o.typ, teil);
    for (let h = 0; h < 3; h++) set(x + ax[0] * 2, yS(s, j + h), z + ax[1] * 2, o.maehne || o.typ, teil);
    set(x + ax[0] * 2, yS(s, j + 3), z + ax[1] * 2, o.typ, teil);
    return j + 3;
  }

  /** Brunnen: Becken (Rand 2 hoch, Wasser innen), Mittelsäule; r = Außenradius (lokal). Teil und Geschoss wie bei quader. */
  function brunnen(teil, s, u, w, r, o = {}) {
    const rand = o.rand || WZ.typ('pietra_serena'), kopf = o.kopf || WZ.typ('marmor_weiss'), wasser = o.wasser || WZ.typ('wasser');
    const j0 = o.j0 || 1;
    let n = 0;
    for (const c of alle) {
      const d = Math.hypot(c.u - u, c.w - w);
      if (d > r + 0.4) continue;
      if (d > r - 1.3) { set(c.x, yS(s, j0), c.z, rand, teil); set(c.x, yS(s, j0 + 1), c.z, d > r - 0.6 ? kopf : rand, teil); n++; }
      else {
        set(c.x, yS(s, j0), c.z, wasser, teil);
        if (d < 0.8) for (let h = 1; h <= (o.saeule === undefined ? 4 : o.saeule); h++) set(c.x, yS(s, j0 + h), c.z, h === (o.saeule === undefined ? 4 : o.saeule) ? kopf : rand, teil);
      }
    }
    return n;
  }

  /** Baum: Stamm der Höhe h, Krone (Kugel mit Radius 2) darüber. */
  function baum(teil, s, u, w, h, o = {}) {
    const { x, z } = zelle(u, w);
    const stamm = o.stamm || WZ.typ('gruen_stamm'), laub = o.laub || WZ.typ('gruen_baum');
    for (let j = o.j0 || 1; j <= h; j++) set(x, yS(s, j), z, stamm, teil);
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let dj = -1; dj <= 2; dj++) {
      if (dx * dx + dz * dz + dj * dj * 1.5 > 5.5) continue;
      set(x + dx, yS(s, h + dj), z + dz, laub, teil);
    }
    // Luft unter und in der Krone ist offene Hofluft (für R14 als Öffnung deklariert)
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
      let top = 0;
      for (let j = 1; j <= h + 3; j++) if (hat(x + dx, yS(s, j), z + dz) && (dx || dz)) top = j;
      for (let j = 1; j < top; j++) if (!hat(x + dx, yS(s, j), z + dz)) api.oeffnung('fenster_offen', teil, x + dx, yS(s, j), z + dz);
    }
  }

  /** Laterne: Pfosten aus Bronze der Höhe h mit Seelaterne oben. */
  function laterne(teil, s, u, w, h, o = {}) {
    const { x, z } = zelle(u, w);
    for (let j = 1; j <= h; j++) set(x, yS(s, j), z, o.pfosten || WZ.typ('bronze'), teil);
    set(x, yS(s, h + 1), z, WZ.typ('licht'), teil);
  }

  /**
   * Kamin an einer Wand: Mitte (u, w), richtung = die Seite, zu der der Kamin schaut (u+, u-, w+ oder w-); die Wand liegt
   * auf der abgewandten Seite. Breite 5 (Wangen), Tiefe 2, Feuerstelle aus dunklem Stein, Sturz und Rauchfang.
   */
  function kamin(teil, s, u, w, richtung, o = {}) {
    const wange = o.wange || WZ.typ('pietra_serena'), feuer = o.feuer || WZ.typ('kontrast_dunkel'), sturz = o.sturz || WZ.typ('marmor_ornament');
    const achseU = richtung[0] === 'w';                                  // schaut in w-Richtung: Breite entlang u
    const sg = richtung[1] === '+' ? 1 : -1;
    let n = 0;
    for (const c of alle) {
      const t = achseU ? c.u - u : c.w - w, tiefe = achseU ? (c.w - w) * sg : (c.u - u) * sg;
      if (Math.abs(t) > 2.5 || tiefe < -0.5 || tiefe > 1.5) continue;
      for (let j = 1; j <= 9; j++) {
        let typ = null;
        if (j <= 2) typ = Math.abs(t) >= 1.5 ? wange : (tiefe < 0.5 ? feuer : null);
        else if (j === 3) typ = sturz;
        else if (Math.abs(t) <= 1.2 && tiefe < 0.5) typ = wange;
        if (typ && set(c.x, yS(s, j), c.z, typ, teil)) n++;
      }
    }
    return n;
  }

  /**
   * Stellwand (freistehende Tafel, 1 Zelle dick): entlang achse (u oder w) bei Koordinate v von von bis bis, Höhe 7;
   * Bilder (4 breit, 3 hoch, Unterkante 2 über dem Boden) in den Farben aus farben (Freskofarben), dazwischen Wandfarbe.
   */
  function stellwand(teil, s, achse, v, von, bis, o) {
    const farben = o.farben.map((f) => WZ.fresko(f));
    let n = 0;
    for (const c of D.haupt) {
      const a = achse === 'u' ? c.u : c.w, t = achse === 'u' ? c.w : c.u;
      if (a < v - 0.55 || a >= v + 0.55 || t < von || t > bis) continue;
      const k = Math.floor((t - von) / 6), i = mod(Math.floor(t - von), 6);
      for (let j = 1; j <= 7; j++) {
        let typ = o.wand;
        if (j >= 3 && j <= 5 && i >= 1 && i <= 4) typ = farben[mod(k + (j === 4 && i % 2 ? 1 : 0), farben.length)];
        if (set(c.x, yS(s, j), c.z, typ, teil)) n++;
      }
    }
    return n;
  }

  /** Zellen außerhalb der Maske, die an die Außenwand grenzen (dAussen = 1): [{ x, z, u, w, fx, fz }] mit der Fassadenzelle (fx, fz). */
  function aussenZellen() {
    const out = [], seen = new Set();
    for (const c of D.haupt) {
      if (c.d8 !== 1) continue;
      for (const [dx, dz] of N4) {
        const x = c.x + dx, z = c.z + dz, k = x + ',' + z;
        if (seen.has(k) || D.H.innen(x, z)) continue;
        seen.add(k);
        const l = R.toLocal(x, z);
        out.push({ x, z, u: l.u, w: l.w, fx: c.x, fz: c.z });
      }
    }
    return out;
  }

  return { aussenZellen, D, R, steh, block, boden, decke, waende, flaeche, quader, figur, loewe, brunnen, baum, laterne, kamin, stellwand, zelle, imR, yS, lokal, alle };
}

/** Schachbrettmuster aus lokalen Koordinaten (Kachelgröße k). */
const schach = (c, k, a, b) => (((Math.floor(c.u / k) + Math.floor(c.w / k)) & 1) ? a : b);

// ---------------------------------------------------------------- Bausteine für Wand- und Deckenbilder
/** Blocktypen der Ausstattung (nur Rollen der Palette). */
function typen() {
  const t = (r) => WZ.typ(r);
  return {
    gold: t('gold'), holz: t('holz'), bronze: t('bronze'), serena: t('pietra_serena'), putz: t('putz_weiss'), pflaster: t('pflaster'),
    weiss: t('marmor_weiss'), ornament: t('marmor_ornament'), rot: t('marmor_rot'), gruen: t('marmor_gruen'), dunkel: t('kontrast_dunkel'),
    cotto: t('dachziegel'), terrakotta: t('putz_rosa'), forte: t('pietra_forte'), glas: t('glas_fenster'), saeule: t('marmor_saeule'),
    rasen: t('gruen_rasen'), kies: t('gruen_weg'), stamm: t('gruen_stamm'), baum: t('gruen_baum'), mauer: t('mauerwerk'), licht: t('licht'),
    fr: (n) => WZ.fresko(n), glasFarbe: (i) => require('../spec/palette.js').typesForRole('glas')[i % 6]
  };
}

const hash = (a, b, c) => ((Math.imul(a, 73856093) ^ Math.imul(b, 19349663) ^ Math.imul(c, 83492791)) >>> 0);

/** Kassettendecke: Raster der Kantenlänge n (lokal), Rippen und Füllung (Bretter und Gold). */
function kassette(c, n, rippe, fuell, mitte) {
  const a = mod(Math.floor(c.u + 0.5), n), b = mod(Math.floor(c.w + 0.5), n);
  if (a === 0 || b === 0) return rippe;
  if (mitte && a === (n >> 1) && b === (n >> 1)) return mitte;
  return fuell;
}

/** Schild (Wappen) in einem Feld: 3 breit, 4 hoch, mittig; Farben aus der Tafelnummer k. null außerhalb des Schildes. */
function schildMotiv(k, q, j, B, H, farben, gold, weiss) {
  const c0 = (B - 3) >> 1, r0 = (H - 4) >> 1;
  const x = q - c0, y = j - r0;
  if (x < 0 || x > 2 || y < 0 || y > 3) return null;
  const f = farben[mod(k, farben.length)];
  if (y === 3) return gold;                              // Schildhaupt
  if (y === 0) return x === 1 ? f : null;                // Spitze
  if (y === 2 && x === 1) return weiss;                  // Figur im Schild
  return f;
}

/**
 * Figurenfries nach Art eines Freskos (Himmel oben, Wiese unten, Figuren in Reihen): k Tafel, q Spalte, j Zeile (unten 0),
 * B, H Größe der Füllung; farbig nach hash. himmel/wiese: Typen, figuren: Typen der Gewänder, haut: Typ, gold: Typ.
 */
function figurenFries(k, q, j, B, H, o) {
  const rel = j / Math.max(1, H - 1);
  if (rel > 0.72) return o.himmel;
  if (rel < 0.18) return o.wiese;
  const sp = mod(q + (k & 1), 3);
  const h = 2 + (hash(k, q - sp, 7) % 3);                // Figurhöhe 2..4 Zeilen ab der Wiese
  const j0 = Math.ceil(0.18 * (H - 1));
  if (sp === 1 && j - j0 < h) {
    if (j - j0 === h - 1) return (hash(k, q, 3) % 4 === 0) ? o.gold : o.haut;     // Kopf oder Krone
    return o.figuren[hash(k, q, 11) % o.figuren.length];
  }
  return (j - j0 <= 1 && hash(k, q, 5) % 3 === 0) ? o.huegel : null;
}

module.exports = { kit, schach, mod, typen, kassette, schildMotiv, figurenFries, hash };
