'use strict';
// Übersichtskarte als SVG (deterministisch, ca. 2.500 px breit).
const WIDTH_PX = 2500;
const BAND_M = 5;          // Höhenschichten alle 5 m
const CELL = 16;           // Rasterweite der Höhenschichten (Blöcke)
const GRID = 500;          // Koordinatenraster (Blöcke)

const f1 = (v) => (Math.round(v * 10) / 10).toString();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function renderSvg(d) {
  const { bounds: b, terrain, areas, buildings, isolati, landmarks } = d;
  const W = b.x1 - b.x0 + 1, H = b.z1 - b.z0 + 1;
  const s = WIDTH_PX / W;
  const HPX = Math.round(H * s);
  const X = (x) => f1((x - b.x0) * s), Z = (z) => f1((z - b.z0) * s);
  const ring = (r) => 'M' + r.map((p) => X(p[0]) + ' ' + Z(p[1])).join('L') + 'Z';
  const polyD = (p) => p.aussen.concat(p.loecher).map(ring).join('');
  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH_PX}" height="${HPX}" viewBox="0 0 ${WIDTH_PX} ${HPX}" font-family="Arial, Helvetica, sans-serif">`);
  o.push(`<title>Stadtmodell Florenz – Übersicht (Modellkoordinaten, Raster ${GRID} Blöcke)</title>`);
  o.push(`<rect width="${WIDTH_PX}" height="${HPX}" fill="#f4f4f2"/>`);

  // Gelände: Höhenschichten
  let hmin = Infinity, hmax = -Infinity;
  for (let i = 0; i < terrain.dm.length; i += 7) { const v = terrain.dm[i] / 10; if (v < hmin) hmin = v; if (v > hmax) hmax = v; }
  const b0 = Math.floor(hmin / BAND_M), nb = Math.ceil(hmax / BAND_M) - b0 + 1;
  const bands = Array.from({ length: nb }, () => []);
  const cw = Math.ceil(W / CELL), ch = Math.ceil(H / CELL);
  for (let cz = 0; cz < ch; cz++) {
    let runStart = -1, runBand = -1;
    const flush = (cx) => {
      if (runStart >= 0) bands[runBand].push([runStart, cz, cx - runStart]);
      runStart = -1;
    };
    for (let cx = 0; cx < cw; cx++) {
      const x = Math.min(W - 1, cx * CELL + (CELL >> 1)), z = Math.min(H - 1, cz * CELL + (CELL >> 1));
      const band = Math.floor(terrain.dm[z * terrain.W + x] / 10 / BAND_M) - b0;
      if (band !== runBand) { flush(cx); runStart = cx; runBand = band; }
    }
    flush(cw);
  }
  o.push('<g id="gelaende">');
  bands.forEach((runs, i) => {
    if (!runs.length) return;
    const t = nb > 1 ? i / (nb - 1) : 0;
    const gray = Math.round(246 - t * 120);
    const sz = f1(CELL * s);
    const d2 = runs.map(([cx, cz, n]) => `M${f1(cx * CELL * s)} ${f1(cz * CELL * s)}h${f1(n * CELL * s)}v${sz}h-${f1(n * CELL * s)}z`).join('');
    o.push(`<path fill="rgb(${gray},${gray},${gray})" d="${d2}"/>`);
  });
  o.push('</g>');

  const group = (id, attrs, items, fn) => {
    o.push(`<g id="${id}" ${attrs}>`);
    for (const it of items) o.push(fn(it));
    o.push('</g>');
  };
  const pathOf = (p) => `<path d="${polyD(p)}"/>`;
  group('gruen', 'fill="#a9d3a1" fill-opacity="0.85"', areas.gruen, (a) => pathOf(a.polygon));
  group('plaetze', 'fill="#f3ead2"', areas.plaetze, (a) => pathOf(a.polygon));
  group('strassen', 'fill="#ffffff" stroke="#e2dfd6" stroke-width="0.3"', areas.strassen.filter((a) => !a.tunnel && !a.bruecke), (a) => pathOf(a.polygon));
  group('wasser', 'fill="#7db4e6"', areas.wasser, (a) => pathOf(a.polygon));
  group('bruecken', 'fill="#ffffff" stroke="#9a9a9a" stroke-width="0.4"', areas.bruecken, (a) => pathOf(a.polygon));
  group('mauern', 'fill="none" stroke="#8a5a2b" stroke-linejoin="round"', areas.mauern, (m) =>
    `<path stroke-width="${f1(Math.max(0.6, m.dickeBl * s))}" d="M${m.linie.map((p) => X(p[0]) + ' ' + Z(p[1])).join('L')}"/>`);
  group('gebaeude', 'fill="#4b4b4f"', buildings.filter((x) => !x._wz), (x) => pathOf(x.polygon));
  group('isolati', 'fill="none" stroke="#e08a1e" stroke-width="0.5" stroke-opacity="0.8"', isolati, (i) => `<path d="${ring(i.huelle)}"/>`);
  group('wahrzeichen-bauten', 'fill="#d62020" stroke="#7a0b0b" stroke-width="0.5"', buildings.filter((x) => x._wz), (x) => pathOf(x.polygon));

  // Raster
  o.push('<g id="raster" stroke="#3a6ea5" stroke-width="0.6" stroke-opacity="0.55" fill="#3a6ea5" font-size="13">');
  for (let gx = Math.ceil(b.x0 / GRID) * GRID; gx <= b.x1; gx += GRID) {
    o.push(`<line x1="${X(gx)}" y1="0" x2="${X(gx)}" y2="${HPX}"/>`);
    o.push(`<text x="${f1(Number(X(gx)) + 3)}" y="14" stroke="none">x ${gx}</text>`);
  }
  for (let gz = Math.ceil(b.z0 / GRID) * GRID; gz <= b.z1; gz += GRID) {
    o.push(`<line x1="0" y1="${Z(gz)}" x2="${WIDTH_PX}" y2="${Z(gz)}"/>`);
    o.push(`<text x="3" y="${f1(Number(Z(gz)) - 3)}" stroke="none">z ${gz}</text>`);
  }
  o.push('</g>');

  // Dom-Komplex
  const dx0 = -216, dx1 = 120, dz0 = -110, dz1 = 110;
  o.push(`<g id="dom"><rect x="${X(dx0)}" y="${Z(dz0)}" width="${f1((dx1 - dx0) * s)}" height="${f1((dz1 - dz0) * s)}" fill="none" stroke="#7b1fa2" stroke-width="1.6" stroke-dasharray="5 3"/>` +
    `<text x="${X(dx0)}" y="${f1(Number(Z(dz0)) - 5)}" font-size="15" font-weight="bold" fill="#7b1fa2" stroke="#fff" stroke-width="3" paint-order="stroke">Dom-Komplex (Ursprung 0,0)</text></g>`);

  // Beschriftung der Wahrzeichen
  o.push('<g id="beschriftung" font-size="13" font-weight="bold" fill="#b00000" stroke="#ffffff" stroke-width="3.2" paint-order="stroke" stroke-linejoin="round">');
  for (const l of landmarks) {
    o.push(`<text x="${f1(Number(X(l.pos[0])) + 6)}" y="${f1(Number(Z(l.pos[1])) - 6)}">${esc(l.label)}</text>`);
    o.push(`<circle cx="${X(l.pos[0])}" cy="${Z(l.pos[1])}" r="3.2" fill="#d62020" stroke="#fff" stroke-width="1"/>`);
  }
  o.push('</g>');

  // Legende
  const lx = 20, ly = HPX - 170;
  const leg = [['#d62020', 'Wahrzeichen (Plan §4)'], ['#4b4b4f', 'Gebäude'], ['#e08a1e', 'Isolato (Hülle)'], ['#7db4e6', 'Wasser'], ['#a9d3a1', 'Grün'], ['#ffffff', 'Straßen/Plätze'], ['#8a5a2b', 'Mauern']];
  o.push(`<g id="legende"><rect x="${lx - 8}" y="${ly - 22}" width="290" height="${leg.length * 20 + 70}" fill="#fff" fill-opacity="0.9" stroke="#888"/>`);
  o.push(`<text x="${lx}" y="${ly - 4}" font-size="13" font-weight="bold">Höhenschichten alle ${BAND_M} m (hell = tief, dunkel = hoch)</text>`);
  leg.forEach(([c, t], i) => {
    o.push(`<rect x="${lx}" y="${ly + 8 + i * 20}" width="22" height="13" fill="${c}" stroke="#888" stroke-width="0.5"/><text x="${lx + 30}" y="${ly + 19 + i * 20}" font-size="13">${esc(t)}</text>`);
  });
  o.push(`<text x="${lx}" y="${ly + 22 + leg.length * 20 + 10}" font-size="12">Gelände ${f1(hmin)}–${f1(hmax)} m ü. NN · Raster ${GRID} Blöcke · 1 Block = 0,5 m</text></g>`);
  o.push('</svg>');
  return o.join('\n') + '\n';
}

module.exports = { renderSvg, WIDTH_PX };
