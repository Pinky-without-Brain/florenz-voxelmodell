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
  const imR = (c, r) => c.u >= r.u0 && c.u < r.u1 && c.w >= r.w0 && c.w < r.w1;
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
   *        armTyp, beinTyp, schmuck: Typ (Krone/Helm auf dem Kopf), j0 = 1 (Höhe des Sockelbodens) }
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

  return { D, R, steh, block, boden, decke, waende, flaeche, quader, figur, loewe, zelle, imR, yS, lokal, alle };
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
