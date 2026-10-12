'use strict';
// Gesamtablauf Stadtdaten (A2): node tools/data/build_stadtdaten.js [DTM-Verzeichnis]
// DTM-Verzeichnis: Argument, sonst Umgebungsvariable DTM_DIR, sonst Standardpfad (Scratchpad).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const gb = require('./gelaende_build.js');
const gel = require('../geo/gelaende.js');
const g2 = require('./geom2d.js');
const { buildBuildings } = require('./gebaeude_build.js');
const { buildIsolati } = require('./isolati_build.js');
const { buildAreas } = require('./flaechen_build.js');
const { buildLandmarks } = require('./wahrzeichen_build.js');
const { renderSvg } = require('./uebersicht_svg.js');

const ROOT = path.join(__dirname, '..', '..');
const OSM = path.join(ROOT, 'data', 'osm');
const OUT = path.join(ROOT, 'data', 'stadt');
const DATE = '2026-10-12';
const DEFAULT_DTM = 'C:/Users/tomkl/AppData/Local/Temp/claude/C--Users-tomkl-Desktop-Cathedral-of-Santa-Maria-del-Fiore/695cd823-6e59-43f6-b88b-1944f0f7a521/scratchpad/dl_dtm2017/x/02.02.04.01_TILE_ASCII';
const DTM_DIR = process.argv[2] || process.env.DTM_DIR || DEFAULT_DTM;
const ATTR = 'Comune di Firenze, DTM LiDAR 2017, CC BY 4.0';

const rd = (f) => JSON.parse(fs.readFileSync(path.join(OSM, f), 'utf8'));
const t0 = Date.now();
const log = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
const ownJson = (o) => JSON.stringify(o) + '\n';

function writeList(file, meta, key, arr) {
  const body = arr.map((x) => JSON.stringify(x)).join(',\n');
  fs.writeFileSync(path.join(OUT, file), `{"meta":${JSON.stringify(meta)},\n"${key}":[\n${body}\n]}\n`);
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  // 1. Gelände
  const T = gb.buildTerrain(DTM_DIR);
  const bin = gb.encodeBin(T.dm, T.W, T.H);
  fs.writeFileSync(path.join(OUT, 'gelaende.bin'), bin);
  const b = T.bounds;
  const baseMeta = { grenzen: { x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1 }, referenzhoehe: { h0: T.h0 } };
  fs.writeFileSync(path.join(OUT, 'gelaende.json'), ownJson(baseMeta));
  gel.reset(); gel.load(OUT);
  log(`Gelände ${T.W}x${T.H}, H0=${T.h0.toFixed(3)} m`);

  // 2. Gebäude
  const korFile = path.join(OUT, 'korrekturen.json');
  const bres = buildBuildings(rd(`gebaeude_${DATE}.json`), rd(`gebaeude_relationen_${DATE}.json`), fs.existsSync(korFile) ? JSON.parse(fs.readFileSync(korFile, 'utf8')) : null);
  const B = bres.buildings;
  log(`Gebäude ${B.length}`);
  // 3. Isolati
  const ires = buildIsolati(B);
  log(`Isolati ${ires.isolati.length}`);
  // 4. Flächen
  const layers = {};
  for (const k of ['strassen', 'plaetze', 'wasser', 'gruen', 'bruecken', 'mauern']) layers[k] = rd(`${k}_${DATE}.json`);
  const fres = buildAreas(layers);
  const A = fres.areas;
  log('Flächen');
  // 5. Wahrzeichen
  const L = buildLandmarks(B, A);
  log(`Wahrzeichen-Kandidaten ${L.kandidaten.length}, nicht gefunden: ${L.nichtGefunden.length}`);

  // Statistik per Raster
  const W = T.W, H = T.H;
  const mask = new Uint8Array(W * H);
  const BITS = { strasse: 1, wasser: 2, gruen: 4, platz: 8, gebaeude: 16, bruecke: 32 };
  const paint = (poly, bit) => g2.scanPoly(poly, (z, xa, xb) => {
    if (z < b.z0 || z > b.z1) return;
    for (let x = Math.max(xa, b.x0); x < Math.min(xb, b.x1 + 1); x++) mask[(z - b.z0) * W + x - b.x0] |= bit;
  });
  const sums = { strasse: 0, wasser: 0, gruen: 0, platz: 0, gebaeude: 0, bruecke: 0 };
  for (const a of A.strassen) if (!a.tunnel && !a.bruecke) { paint(a.polygon, BITS.strasse); sums.strasse += g2.polyArea(a.polygon); }
  for (const a of A.wasser) { paint(a.polygon, BITS.wasser); sums.wasser += g2.polyArea(a.polygon); }
  for (const a of A.gruen) { paint(a.polygon, BITS.gruen); sums.gruen += g2.polyArea(a.polygon); }
  for (const a of A.plaetze) { paint(a.polygon, BITS.platz); sums.platz += g2.polyArea(a.polygon); }
  for (const a of A.bruecken) { paint(a.polygon, BITS.bruecke); sums.bruecke += g2.polyArea(a.polygon); }
  for (const x of B) { paint(x.polygon, BITS.gebaeude); sums.gebaeude += x.flaecheBl; }
  const cnt = {};
  const ov = { 'strasse&gebaeude': 0, 'strasse&wasser': 0, 'strasse&gruen': 0, 'strasse&platz': 0, 'platz&gebaeude': 0, 'wasser&gebaeude': 0, 'gruen&gebaeude': 0, 'bruecke&wasser': 0 };
  for (const k of Object.keys(BITS)) cnt[k] = 0;
  for (let i = 0; i < mask.length; i++) {
    const m = mask[i];
    if (!m) continue;
    for (const k in BITS) if (m & BITS[k]) cnt[k]++;
    for (const k in ov) { const [p, q] = k.split('&'); if ((m & BITS[p]) && (m & BITS[q])) ov[k]++; }
  }
  const m2 = (bl) => Math.round(bl / 4);
  const flaechenStat = {};
  for (const k of Object.keys(BITS)) flaechenStat[k] = { vereinigungBl: cnt[k], vereinigungM2: m2(cnt[k]), summeRohBl: Math.round(sums[k]), mehrfachabdeckung: cnt[k] ? Math.round(sums[k] / cnt[k] * 1000) / 1000 : null };
  const ueberlappung = {};
  for (const k in ov) ueberlappung[k] = { bl: ov[k], m2: m2(ov[k]) };

  // Prüfpunkte
  const yAt = (x, z) => gel.groundTopY(x, z);
  const cellsY = (polys) => { const ys = []; for (const p of polys) g2.scanPoly(p, (z, xa, xb) => { if (z < b.z0 || z > b.z1) return; for (let x = Math.max(xa, b.x0); x < Math.min(xb, b.x1 + 1); x++) ys.push(yAt(x, z)); }); return ys; };
  const ys = (arr) => arr.length ? { median: med(arr), min: arr.reduce((a, v) => (v < a ? v : a), 1e9), max: arr.reduce((a, v) => (v > a ? v : a), -1e9), zellen: arr.length } : null;
  const domY = T.ring.map(([x, z]) => yAt(x, z));
  const arnoPolys = A.wasser.filter((w) => (w.typ === 'river' || w.typ === 'riverbank') && g2.polyArea(w.polygon) > 50000).map((w) => w.polygon);
  const wasserAlle = A.wasser.map((w) => w.polygon);
  const byName = (list, re) => list.filter((x) => x.name && re.test(x.name));
  const sig = byName(A.plaetze, /signoria/i), pitti = byName(A.plaetze, /pitti/i);
  const belv = B.filter((x) => x.name && /belvedere/i.test(x.name));
  let hi = { y: -1 };
  for (let z = b.z0; z <= b.z1; z += 2) for (let x = b.x0; x <= b.x1; x += 2) { const y = yAt(x, z); if (y > hi.y) hi = { y, x, z }; }
  let ymin = 1e9, ymax = -1e9;
  const h0 = T.h0;
  for (let i = 0; i < T.dm.length; i++) { const y = gb.yOf(T.dm[i] / 10, h0); if (y < ymin) ymin = y; if (y > ymax) ymax = y; }
  const sorted = Int16Array.from(T.dm).sort();
  const pruef = {
    domplatzRing: ys(domY),
    domMitte: { x: 0, z: 0, groundTopY: yAt(0, 0), hoeheM: gel.heightM(0, 0) },
    arnoWasser: ys(cellsY(arnoPolys)),
    wasserAlle: ys(cellsY(wasserAlle)),
    piazzaSignoria: ys(cellsY(sig.map((x) => x.polygon))) ,
    piazzaPitti: ys(cellsY(pitti.map((x) => x.polygon))),
    forteBelvedere: belv.length ? { name: belv[0].name, bodenY: belv[0].bodenY, ys: ys(cellsY([belv[0].polygon])) } : null,
    hoechsterPunkt: hi,
    yBereich: { min: ymin, max: ymax, ausserhalb0bis319: ymin < 0 || ymax > 319 }
  };
  const gm = (v) => v / 10;
  const gjson = {
    titel: 'Geländemodell Florenz im Modellsystem',
    quelle: { name: 'DTM LiDAR 2017', herausgeber: 'Comune di Firenze', lizenz: 'CC BY 4.0', namensnennung: ATTR, crs: 'ETRS89 / UTM 32N (EPSG:25832)', zellgroesseM: 1, kachelnGenutzt: T.tiles, nodata: T.fill },
    grenzen: { x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, breite: W, hoehe: H, hinweis: 'gemessene Bbox lat 43.7615–43.7795, lon 11.2380–11.2670 im Modellsystem + 16 Blöcke Rand, auf 16er-Chunks ausgerichtet' },
    format: {
      datei: 'gelaende.bin', einheit: 'Dezimeter ü. NN', typ: 'Int16 little endian', anordnung: 'Zeile = z (z0..z1), Spalte = x (x0..x1), Zelle (x,z) am ganzzahligen Punkt',
      kodierung: 'je Zeile Differenz zum Vorgänger (Int16, Zeilenanfang gegen 0), dann zlib deflate; Entpacken: tools/geo/gelaende.js',
      rohgroesseBytes: W * H * 2, interpolation: 'bilinear aus dem DTM (1 m Zellen), Projektion exakt über tools/geo/utm.js + tools/spec/frame.js'
    },
    statistik: { minM: gm(sorted[0]), maxM: gm(sorted[sorted.length - 1]), medianM: gm(sorted[sorted.length >> 1]) },
    referenzhoehe: { h0: Math.round(T.h0 * 10000) / 10000, methode: 'Mittel des DTM auf dem Ring 5..25 Blöcke außerhalb der Fundament-Grundfläche (footprint aus m0_fundament.js)', zellen: T.h0Cells },
    umrechnung: 'Y = 64 + round(2 · (h − H0)), h in m ü. NN',
    pruefpunkte: pruef
  };
  // H0 exakt wie bei der Berechnung speichern (für groundTopY)
  gjson.referenzhoehe.h0 = T.h0;
  fs.writeFileSync(path.join(OUT, 'gelaende.json'), JSON.stringify(gjson, null, 1) + '\n');
  log('gelaende.json');

  // Ausgaben
  const strip = (x) => { const o = { ...x }; delete o._c; delete o._bb; delete o._names; delete o._wz; return o; };
  const quelleOsm = 'OpenStreetMap-Mitwirkende, ODbL 1.0; Overpass-Abfrage 12.10.2026';
  const hoeheStat = { height: 0, levels: 0, schaetzung: 0, korrektur: 0 };
  for (const x of B) hoeheStat[x.hoeheQuelle]++;
  writeList('gebaeude.json', {
    quelle: quelleOsm, einheit: 'Modellkoordinaten (Blöcke, 0,5 m), polygon: aussen = Ringe positiv, loecher = Ringe negativ',
    hoehenregel: 'Korrektur (data/stadt/korrekturen.json) | height-Tag (m·2) | building:levels·3,4 m + 1,5 m | Schätzung: Median der benannten Nachbarn (Schwerpunktabstand ≤ 40 Blöcke, mit height/levels), sonst 4 Geschosse = 15,1 m; Kleinbauten (shed, garage, roof, kiosk …) 1 Geschoss',
    zaehlung: { gesamt: B.length, ...hoeheStat, ...bres.stats }
  }, 'gebaeude', B.map(strip));
  writeList('isolati.json', { quelle: 'abgeleitet aus gebaeude.json; Regel: Abstand ≤ 1 Block oder Berührung', statistik: ires.stats }, 'isolati', ires.isolati);

  const flaechenOut = {
    meta: { quelle: quelleOsm, einheit: 'Modellkoordinaten; Linien gepuffert (Breite aus width, lanes·3 m oder Typ), Überlappungen nicht aufgelöst', statistik: { flaechen: flaechenStat, ueberlappung, aufbereitung: fres.stats, anzahl: Object.fromEntries(Object.keys(A).map((k) => [k, A[k].length])) } },
    ...A
  };
  const fl = [`{"meta":${JSON.stringify(flaechenOut.meta)}`];
  for (const k of Object.keys(A)) fl.push(`"${k}":[\n${A[k].map((x) => JSON.stringify(x)).join(',\n')}\n]`);
  fs.writeFileSync(path.join(OUT, 'flaechen.json'), fl.join(',\n') + '}\n');

  // Wahrzeichen: Brückenpositionen
  const brPos = [];
  for (const br of L.plan.filter((p) => p.quelle === 'brueckenebene')) {
    const ids = br.treffer.map((t) => t.id);
    const el = A.bruecken.filter((x) => ids.includes(x.id)).sort((p, q) => g2.polyArea(q.polygon) - g2.polyArea(p.polygon))[0];
    if (el) { const bb = g2.bbox(el.polygon.aussen); brPos.push({ name: br.name, id: el.id, pos: [(bb.x0 + bb.x1) / 2, (bb.z0 + bb.z1) / 2] }); }
  }
  fs.writeFileSync(path.join(OUT, 'wahrzeichen.json'), JSON.stringify({
    meta: { quelle: 'abgeleitet aus gebaeude.json und flaechen.json; Plan: STADTMODELL_PLAN §4', kriterien: 'kirche | palazzo/historisch (Name + wikidata/historic) | wikidata (Name, ≥150 Blöcke²) | palazzo gross (≥600 Blöcke²) | plan' },
    plan: L.plan, nichtGefunden: L.nichtGefunden, bruecken: brPos, kandidaten: L.kandidaten
  }, null, 1) + '\n');

  // Karte
  const wzIds = new Set(L.kandidaten.filter((c) => c.plan).map((c) => c.id));
  for (const x of B) x._wz = wzIds.has(x.id);
  const labels = L.kandidaten.filter((c) => c.plan).map((c) => ({ label: c.plan, pos: c.schwerpunkt }));
  for (const p of brPos) labels.push({ label: p.name, pos: p.pos });
  const svg = renderSvg({ bounds: b, terrain: { dm: T.dm, W: T.W }, areas: A, buildings: B, isolati: ires.isolati, landmarks: labels });
  fs.writeFileSync(path.join(OUT, 'uebersicht.svg'), svg);
  log('Karte');

  // Zusammenfassung
  const mitHoehe = B.filter((x) => x.hoeheQuelle !== 'schaetzung').length;
  const summary = {
    gebaeude: B.length, mitHoehe, hoeheQuellen: hoeheStat, teile: bres.stats.teile, isolati: ires.stats,
    flaechenStat, ueberlappung, h0: T.h0, grenzen: b, pruefpunkte: pruef, nichtGefunden: L.nichtGefunden,
    bauStats: bres.stats, flaechenAufbereitung: fres.stats
  };
  console.log(JSON.stringify(summary, null, 1));
  for (const f of fs.readdirSync(OUT).sort()) {
    const buf = fs.readFileSync(path.join(OUT, f));
    console.log(`${f}\t${buf.length}\t${crypto.createHash('sha256').update(buf).digest('hex')}`);
  }
  log('fertig');
}

main();
