'use strict';
// Holt die OSM-Ebenen per Overpass (einmalig; der Build liest nur die gespeicherten Rohdaten).
// Aufruf: node tools/data/fetch_osm.js [YYYY-MM-DD]
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BBOX = '43.7615,11.2380,43.7795,11.2670';
const DATE = process.argv[2] || new Date().toISOString().slice(0, 10);
const OUT = path.join(__dirname, '..', '..', 'data', 'osm');
const ENDPOINT = 'https://overpass-api.de/api/interpreter';

const LAYERS = {
  // gebaeude_<datum>.json (Vorgabe) enthält Relationen ohne Mitglieder; hier mit Geometrie nachgeholt.
  gebaeude_relationen: `(relation["building"](${BBOX}););`,
  strassen: `(way["highway"](${BBOX});way["area:highway"](${BBOX});relation["area:highway"](${BBOX});relation["highway"="pedestrian"](${BBOX}););`,
  plaetze: `(way["place"="square"](${BBOX});relation["place"="square"](${BBOX}););`,
  wasser: `(way["natural"="water"](${BBOX});relation["natural"="water"](${BBOX});way["waterway"="riverbank"](${BBOX});relation["waterway"="riverbank"](${BBOX});way["waterway"="river"](${BBOX}););`,
  gruen: `(way["leisure"~"^(garden|park)$"](${BBOX});relation["leisure"~"^(garden|park)$"](${BBOX});way["landuse"="grass"](${BBOX});relation["landuse"="grass"](${BBOX}););`,
  bruecken: `(way["bridge"="yes"](${BBOX});way["man_made"="bridge"](${BBOX});relation["man_made"="bridge"](${BBOX}););`,
  mauern: `(way["barrier"="wall"](${BBOX});way["barrier"="city_wall"](${BBOX}););`
};

function sleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
function fetchRetry(data) {
  for (let i = 1; ; i++) {
    try {
      return execFileSync('curl', ['-sS', '--fail', '-A', 'SMdF-voxel-research/1.0', '--data-urlencode', 'data=' + data, ENDPOINT],
        { maxBuffer: 1 << 29, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      if (i >= 6) throw e;
      console.log('Versuch', i, 'fehlgeschlagen, warte');
      sleep(20000 * i);
    }
  }
}

for (const [name, q] of Object.entries(LAYERS)) {
  const file = path.join(OUT, `${name}_${DATE}.json`);
  if (fs.existsSync(file)) { console.log('vorhanden', file); continue; }
  const data = `[out:json][timeout:180];${q}out geom;`;
  const buf = fetchRetry(data);
  JSON.parse(buf.toString('utf8')); // Plausibilität
  fs.writeFileSync(file, buf);
  console.log(name, buf.length, 'Bytes');
  sleep(5000);
}
