'use strict';
// Treppen-Bibliothek (B0, BEGEHBARKEIT.md §1.3): gerade Läufe, Podesttreppen, Wendeltreppen, Treppenloch.
// Auch für Quartiere nutzbar (nur Palette und Rahmen werden gebraucht).
//
// Konventionen (alle Koordinaten sind WELTkoordinaten, ganzzahlig):
//  - Richtung n|o|s|w = Aufstieg: n = -z, o = +x, s = +z, w = -x (wie die Palette: treppe(rolle, richtung)).
//  - Gedrehte Gebäude: Treppenblöcke haben nur Weltachsen. Wird ein `rahmen` (makeRahmen) übergeben,
//    ist `richtung` eine LOKALE Richtung (o = +u, s = +w, ...) und wird auf die nächste Weltachse gerundet.
//    Treppen in gedrehten Gebäuden laufen also achsparallel (bei -79,8° wird aus lokal "o" Welt "s").
//    Die Treppenzellen selbst übernimmt der Aufrufer in Weltkoordinaten (start = Weltzelle der ersten Stufe).
//  - Höhenregel: Der Boden unten ist massiv in Zelle yB. Die Spielfigur steht in S0 = yB + 1.
//    Stufe k (k = 0..n-1) ist ein Treppenblock in Zelle S0 + k, k Zellen vom Start entfernt in Aufstiegsrichtung.
//    Der obere Boden ist ein massiver Block in Zelle S0 + n - 1 (hinter der letzten Stufe, Position n), Stehzelle S0 + n.
//    `start.y` ist S0, also die Zelle der ersten Stufe (gleiche Höhe wie die Stehzelle unten).
//  - Breite: `breite` Zellen quer zum Lauf, ausgehend von `start` nach RECHTS (n -> o, o -> s, s -> w, w -> n).
//  - Ein Rückgabewert ist ein Array [{ x, y, z, typ }] mit der Zusatzeigenschaft `.lauf` (Metadaten für
//    treppenloch / kopffreiheit).

const palette = require('../spec/palette.js');
const rollen = require('./rollen.js');

const DIR = { n: [0, -1], o: [1, 0], s: [0, 1], w: [-1, 0] };
const RECHTS = { n: 'o', o: 's', s: 'w', w: 'n' };
const LINKS = { n: 'w', w: 's', s: 'o', o: 'n' };
const GEGEN = { n: 's', s: 'n', o: 'w', w: 'o' };

/** Lokale Richtung (n|o|s|w im Rahmen) -> Weltrichtung, gerundet auf die nächste Achse. Ohne Rahmen: unverändert. */
function weltRichtung(richtung, rahmen) {
  if (!DIR[richtung]) throw new Error(`Treppenrichtung muss n|o|s|w sein: ${richtung}`);
  if (!rahmen) return richtung;
  // lokale Achsen: o = +u, s = +w, w = -u, n = -w; Weltvektor aus toWorld (Differenz zweier Punkte)
  const l = { n: [0, -1], o: [1, 0], s: [0, 1], w: [-1, 0] }[richtung];
  const a = rahmen.toWorld(0, 0), b = rahmen.toWorld(l[0], l[1]);
  const dx = b.x - a.x, dz = b.z - a.z;
  if (Math.abs(dx) >= Math.abs(dz)) return dx >= 0 ? 'o' : 'w';
  return dz >= 0 ? 's' : 'n';
}

/** Vollblock-Typ zu einer Rolle (oder zu einem Treppen-Basisnamen: dessen Vollblock). */
function volltyp(rolle) {
  const b = palette.STAIR_BASES.find((x) => x[0] === rolle);
  return b ? b[1] : rollen.typ(rolle);
}

function pruefeLauf({ start, stufen, breite }) {
  if (!start || ![start.x, start.y, start.z].every(Number.isInteger)) throw new TypeError('start braucht ganzzahlige x, y, z');
  if (!Number.isInteger(stufen) || stufen < 1) throw new RangeError('stufen muss eine Ganzzahl >= 1 sein');
  if (!Number.isInteger(breite) || breite < 2) throw new RangeError('breite muss >= 2 sein (BEGEHBARKEIT.md §1.3)');
}

// Ein Lauf: Metadaten { x, y, z, d, quer, stufen, breite }. d = Aufstieg, quer = Richtung nach rechts.
function lauf1(start, d, stufen, breite) {
  return { x: start.x, y: start.y, z: start.z, d, quer: RECHTS[d], stufen, breite };
}

function laufBloecke(l, rolle, oben) {
  const [dx, dz] = DIR[l.d], [qx, qz] = DIR[l.quer];
  const typ = palette.treppe(rolle, l.d, !!oben);
  const out = [];
  for (let k = 0; k < l.stufen; k++) {
    for (let q = 0; q < l.breite; q++) {
      out.push({ x: l.x + dx * k + qx * q, y: l.y + k, z: l.z + dz * k + qz * q, typ });
    }
  }
  return out;
}

function mitLauf(arr, lauf) {
  Object.defineProperty(arr, 'lauf', { value: lauf, enumerable: false });
  return arr;
}

/**
 * Gerade Treppe. geradeTreppe({ start, richtung, stufen, breite, rolle, rahmen?, oben? }) -> [{x,y,z,typ}]
 * (`.lauf` = Metadaten). Höhenregel und Breite siehe Kopf der Datei. Der obere Boden (Position `stufen`) und die
 * Decke mit Treppenloch gehören dem Aufrufer; treppenloch(arr.lauf) liefert die freizuhaltenden Zellen.
 */
function geradeTreppe(opts) {
  pruefeLauf(opts);
  const d = weltRichtung(opts.richtung, opts.rahmen);
  const l = lauf1(opts.start, d, opts.stufen, opts.breite);
  return mitLauf(laufBloecke(l, opts.rolle, opts.oben), { laeufe: [l], podeste: [] });
}

/**
 * Podesttreppe (Wendepodest, zwei antiparallele Läufe nebeneinander).
 * podestTreppe({ start, richtung, stufen1, stufen2, breite, rolle, drehsinn: 'rechts'|'links', podestTiefe?, rahmen? })
 * Lauf 1 ab `start` in Richtung `richtung` (stufen1 Stufen), dahinter das Podest aus Vollblöcken (Breite 2*breite, Tiefe
 * podestTiefe, Vorgabe breite), Lauf 2 läuft zurück, auf der Seite `drehsinn` (rechts = quer-rechts des ersten Laufs).
 * Rückgabe: Stufen- und Podestblöcke; `.lauf.laeufe` hat beide Läufe, `.lauf.podeste` die Podestzellen,
 * `.lauf.oben` = Zelle der oberen Stehfläche { x, y, z } am Ende von Lauf 2 (erste Zelle hinter der letzten Stufe, Stehhöhe).
 */
function podestTreppe(opts) {
  const { stufen1, stufen2, breite, rolle } = opts;
  pruefeLauf({ start: opts.start, stufen: stufen1, breite });
  pruefeLauf({ start: opts.start, stufen: stufen2, breite });
  const d = weltRichtung(opts.richtung, opts.rahmen);
  const rechts = (opts.drehsinn || 'rechts') === 'rechts';
  const tiefe = opts.podestTiefe === undefined ? breite : opts.podestTiefe;
  if (!Number.isInteger(tiefe) || tiefe < 1) throw new RangeError('podestTiefe muss >= 1 sein');
  const [dx, dz] = DIR[d];
  // Quer-Achse des Gesamtbaus: von Lauf 1 aus zur Seite von Lauf 2. Lauf 1 belegt quer-rechts 0..breite-1 (bei "links"
  // wird Lauf 1 an die rechte Seite des Paares gelegt, damit Lauf 2 links davon liegt).
  const s0 = opts.start;
  const qd = RECHTS[d];
  const [qx, qz] = DIR[qd];
  const l1start = rechts ? s0 : { x: s0.x + qx * breite, y: s0.y, z: s0.z + qz * breite };
  const l1 = lauf1(l1start, d, stufen1, breite);
  // Podest: dahinter, gesamte Paarbreite 2*breite, auf Höhe der oberen Stehfläche von Lauf 1 (massiv in Zelle y0 + n1 - 1)
  const pY = s0.y + stufen1 - 1;
  const podeste = [];
  const typPodest = volltyp(rolle);
  const bloecke = laufBloecke(l1, rolle, opts.oben);
  const paarX0 = s0.x, paarZ0 = s0.z; // Paar belegt quer 0..2*breite-1 ab start
  for (let k = 0; k < tiefe; k++) {
    for (let q = 0; q < 2 * breite; q++) {
      const c = { x: paarX0 + dx * (stufen1 + k) + qx * q, y: pY, z: paarZ0 + dz * (stufen1 + k) + qz * q };
      podeste.push(c);
      bloecke.push({ ...c, typ: typPodest });
    }
  }
  // Lauf 2: läuft in Gegenrichtung, Stehhöhe unten = pY + 1. Seine erste Stufe (Zelle pY + 1) liegt auf Position
  // stufen1 - 1 (Höhe des Podest-Randes), neben Lauf 1 (quer breite..2*breite-1 ab Paarstart).
  const g = GEGEN[d];
  const [gx, gz] = DIR[g];
  const zweiteSeite = rechts ? breite : 0; // quer-Index (ab Paarstart) der Zelle mit kleinstem Index von Lauf 2
  // Lauf 2 hat Aufstieg g; sein "quer rechts" ist RECHTS[g] = Gegenrichtung von qd, also beginnt er an der höchsten
  // quer-Position seiner Spur
  const hoechsterQuer = zweiteSeite + breite - 1;
  const l2start = { x: paarX0 + dx * (stufen1 - 1) + qx * hoechsterQuer, y: pY + 1, z: paarZ0 + dz * (stufen1 - 1) + qz * hoechsterQuer };
  const l2 = lauf1(l2start, g, stufen2, breite);
  bloecke.push(...laufBloecke(l2, rolle, opts.oben));
  const [ex, ez] = [l2start.x + gx * stufen2, l2start.z + gz * stufen2];
  return mitLauf(bloecke, { laeufe: [l1, l2], podeste, oben: { x: ex, y: pY + 1 + stufen2, z: ez } });
}

/**
 * Wendeltreppe: quadratische Spirale um einen Kern.
 * wendeltreppe({ mitte: {x, z}, radiusInnen, radiusAussen, yVon, yBis, rolle, drehsinn: 'rechts'|'links', kern?: true })
 *  - Kern: Quadrat |dx|,|dz| <= radiusInnen (Vollblöcke, y yVon..yBis; mit kern:false weggelassen).
 *  - Ring: Zellen mit radiusInnen < Chebyshev <= radiusAussen, Breite W = radiusAussen - radiusInnen >= 2.
 *  - Je Seite ein gerader Abschnitt mit 2*radiusInnen+1 Treppenblöcken über die volle Ringbreite; die vier Ecken (W x W)
 *    sind Podeste aus Vollblöcken. Pro Viertelumlauf steigt die Treppe um 2*radiusInnen+1 Blöcke.
 *  - yVon = massive Zelle des Startpodests (Ecke Nordwest bei "rechts"/im Uhrzeigersinn, Ecke Nordost bei "links"),
 *    yBis = massive Zelle des obersten Podests (Geschossboden oben). Der letzte Abschnitt wird gekürzt, der Rest der
 *    Seite wird auf yBis mit Vollblöcken aufgefüllt, so dass oben eine ebene Fläche entsteht.
 *  - Rückgabe: Kern-, Treppen- und Podestblöcke; `.lauf.laeufe` (je Seite), `.lauf.podeste`, `.lauf.start` (Stehzelle Start),
 *    `.lauf.ende` (Stehzelle oben, im letzten Podest/Seitenrest).
 */
function wendeltreppe(opts) {
  const { mitte, radiusInnen, radiusAussen, yVon, yBis, rolle } = opts;
  if (!mitte || !Number.isInteger(mitte.x) || !Number.isInteger(mitte.z)) throw new TypeError('mitte braucht ganzzahlige x, z');
  if (!Number.isInteger(radiusInnen) || radiusInnen < 0) throw new RangeError('radiusInnen muss >= 0 sein');
  const W = radiusAussen - radiusInnen;
  if (!Number.isInteger(radiusAussen) || W < 2) throw new RangeError('radiusAussen - radiusInnen muss >= 2 sein (Breite >= 2)');
  if (!Number.isInteger(yVon) || !Number.isInteger(yBis) || yBis <= yVon) throw new RangeError('yBis muss > yVon sein');
  const rechts = (opts.drehsinn || 'rechts') === 'rechts';
  const Ls = 2 * radiusInnen + 1;
  // Ls >= 1: mindestens 4 Blöcke Anstieg je Umlauf, damit bleibt über jeder Stufe Kopffreiheit 3 (Stufe c, Podest der Runde darüber c + 4)
  const typVoll = volltyp(rolle);
  const blocks = [];
  const r = radiusInnen + 1, R = radiusAussen;
  const cx = mitte.x, cz = mitte.z;
  if (opts.kern !== false) {
    for (let y = yVon; y <= yBis; y++) for (let dx = -radiusInnen; dx <= radiusInnen; dx++) for (let dz = -radiusInnen; dz <= radiusInnen; dz++) {
      blocks.push({ x: cx + dx, y, z: cz + dz, typ: typVoll });
    }
  }
  // Seiten: Aufstiegsrichtung d und Quadrant (Vorzeichen sx, sz) der Anfangsecke.
  // Uhrzeigersinn ("rechts"): Nordseite nach O ab Ecke NW, Ostseite nach S ab NO, Südseite nach W ab SO, Westseite nach N ab SW.
  // Gegen den Uhrzeigersinn ("links"): Nordseite nach W ab NO, Westseite nach S ab NW, Südseite nach O ab SW, Ostseite nach N ab SO.
  const folge = rechts ? [
    { d: 'o', ecke: [-1, -1] }, { d: 's', ecke: [1, -1] }, { d: 'w', ecke: [1, 1] }, { d: 'n', ecke: [-1, 1] }
  ] : [
    { d: 'w', ecke: [1, -1] }, { d: 's', ecke: [-1, -1] }, { d: 'o', ecke: [-1, 1] }, { d: 'n', ecke: [1, 1] }
  ];
  const eckeCells = (sx, sz) => { // W x W Quadrant-Ecke
    const o = [];
    for (let a = 0; a < W; a++) for (let b = 0; b < W; b++) o.push([cx + sx * (r + a), cz + sz * (r + b)]);
    return o;
  };
  const laeufe = [], podeste = [];
  let cl = yVon; // massive Zelle des aktuellen Podests
  const put = (x, y, z, typ) => blocks.push({ x, y, z, typ });
  const podestAuf = (sx, sz, y) => { for (const [x, z] of eckeCells(sx, sz)) { podeste.push({ x, y, z }); put(x, y, z, typVoll); } };
  podestAuf(folge[0].ecke[0], folge[0].ecke[1], cl);
  const start = { x: cx + folge[0].ecke[0] * r, y: cl + 1, z: cz + folge[0].ecke[1] * r };
  let i = 0, ende = null;
  while (cl < yBis) {
    const s = folge[i % 4];
    const n = Math.min(Ls, yBis - cl);
    const [dx, dz] = DIR[s.d];
    // Seitenabschnitt: Zellen entlang d, beginnend an der Ecke (erste Zelle neben der Ecke), quer über die Ringbreite.
    // Ausgangspunkt: erste Zelle der Seite = Ecke (innerste Zelle) + d; die Ringbreite liegt von innen (r) nach außen (R).
    const normal = s.d === 'o' || s.d === 'w' ? [0, s.ecke[1]] : [s.ecke[0], 0]; // Richtung von innen nach außen quer zur Seite
    const innen0 = s.d === 'o' || s.d === 'w'
      ? { x: cx + s.ecke[0] * r + dx, z: cz + normal[1] * r }
      : { x: cx + normal[0] * r, z: cz + s.ecke[1] * r + dz };
    const l = { x: innen0.x, y: cl + 1, z: innen0.z, d: s.d, quer: null, stufen: n, breite: W, innenNachAussen: normal };
    const typ = palette.treppe(rolle, s.d);
    for (let k = 0; k < Ls; k++) {
      for (let q = 0; q < W; q++) {
        const x = innen0.x + dx * k + normal[0] * q, z = innen0.z + dz * k + normal[1] * q;
        if (k < n) put(x, cl + 1 + k, z, typ);
        else { podeste.push({ x, y: yBis, z }); put(x, yBis, z, typVoll); } // gekürzter letzter Abschnitt: ebene Fläche
      }
    }
    laeufe.push(l);
    cl += n;
    // nächste Ecke (am Seitenende) auf neuer Höhe: Quadrant = Ecke der nächsten Seite
    const nx = folge[(i + 1) % 4].ecke;
    podestAuf(nx[0], nx[1], cl);
    ende = { x: cx + nx[0] * r, y: cl + 1, z: cz + nx[1] * r };
    i++;
  }
  return mitLauf(blocks, { laeufe, podeste, start, ende, spirale: true });
}

/**
 * Zellen, die die Decke über der Treppe aussparen muss: über jeder Stufe `kopf` (Vorgabe 3) Luftzellen
 * (Stehzelle plus zwei darüber), also y = Stufenzelle + 1 .. + kopf. Rückgabe [{x, y, z}] ohne Doppelte.
 * Der Aufrufer zieht diese Zellen von seinen Decken-/Bodenflächen ab (oder legt dort ein Loch an).
 */
function treppenloch(lauf, kopf = 3) {
  const seen = new Set(), out = [];
  for (const l of lauf.laeufe) {
    const [dx, dz] = DIR[l.d];
    const [qx, qz] = l.innenNachAussen || DIR[l.quer];
    for (let k = 0; k < l.stufen; k++) {
      for (let q = 0; q < l.breite; q++) {
        for (let h = 1; h <= kopf; h++) {
          const c = { x: l.x + dx * k + qx * q, y: l.y + k + h, z: l.z + dz * k + qz * q };
          const key = c.x + ',' + c.y + ',' + c.z;
          if (!seen.has(key)) { seen.add(key); out.push(c); }
        }
      }
    }
  }
  return out;
}

/**
 * Kopffreiheit prüfen: istFrei(x, y, z) -> true bei Luft. Liefert die Zellen von treppenloch(lauf, kopf), die nicht frei
 * sind (ohne die Zellen, die selbst Stufen/Podeste dieser Treppe sind). Leere Liste = Kopffreiheit gegeben.
 */
function kopffreiheit(bloecke, istFrei, kopf = 3) {
  const eigen = new Set(bloecke.map((b) => b.x + ',' + b.y + ',' + b.z));
  return treppenloch(bloecke.lauf, kopf).filter((c) => !eigen.has(c.x + ',' + c.y + ',' + c.z) && !istFrei(c.x, c.y, c.z));
}

module.exports = { geradeTreppe, podestTreppe, wendeltreppe, treppenloch, kopffreiheit, weltRichtung, volltyp, DIR, RECHTS, LINKS, GEGEN };
