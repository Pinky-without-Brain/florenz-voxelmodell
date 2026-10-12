'use strict';
/**
 * Erzeugt die Maßzeichnung (SVG) aus tools/spec/dimensions.js.
 * Alle Maße stammen aus der Maßtabelle; hartkodiert sind nur Layoutwerte.
 * Aufruf: node tools/emit/drawing.js
 */
const fs = require('fs');
const path = require('path');
const D = require('../spec/dimensions.js');
const { SCALE, LEVELS, CATHEDRAL: C, CAMPANILE: K, BAPTISTERY: B, PIAZZA } = D;

// ---------- Layout ----------
const PX = 2;                                  // Pixel pro Block
const MX = 88;                                 // linker Rand
const XMIN = -370, XMAX = 270, ZMIN = -160, ZMAX = 160;
const YMIN = 50;
const YMAX = Math.max(300, LEVELS.maxY + 6);   // Ausschnitt reicht bis über die Bauhöhengrenze
const PLAN_W = (XMAX - XMIN) * PX;
const W = MX + PLAN_W + 30;
const A_TOP = 74;
const B_HEAD = A_TOP + (ZMAX - ZMIN) * PX + 50;
const B_TOP = B_HEAD + 26;
const B_BOT = B_TOP + (YMAX - YMIN) * PX;
const T22 = Math.tan(Math.PI / 8);             // tan 22,5°
const COS22 = Math.cos(Math.PI / 8);

const ax = (X) => MX + (X - XMIN) * PX;
const az = (Z) => A_TOP + (Z - ZMIN) * PX;
const by = (Y) => B_TOP + (YMAX - Y) * PX;

// ---------- Hilfsfunktionen ----------
const fmt = (n) => { const s = String(Math.round(n * 100) / 100); return s === '-0' ? '0' : s; };
const de = (n) => fmt(n).replace('.', ',');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const meterOfY = (Y) => (Y - LEVELS.floorY) / SCALE;
const out = [];
const add = (s) => out.push(s);

function line(x1, y1, x2, y2, stroke, w, dash, extra) {
  add(`<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${stroke}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}${extra || ''}/>`);
}
function rect(x, y, w, h, fill, stroke, sw, dash) {
  add(`<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(h)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
}
function polygon(pts, fill, stroke, sw, dash) {
  add(`<polygon points="${pts.map((p) => fmt(p[0]) + ',' + fmt(p[1])).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linejoin="round"/>`);
}
function polyline(pts, stroke, sw, dash) {
  add(`<polyline points="${pts.map((p) => fmt(p[0]) + ',' + fmt(p[1])).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linejoin="round"/>`);
}
function circle(cx, cy, r, fill, stroke, sw) {
  add(`<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`);
}
// Text; opts: size, anchor, fill, halo, rot, weight
function text(x, y, s, o) {
  o = o || {};
  const tr = o.rot ? ` transform="rotate(${o.rot} ${fmt(x)} ${fmt(y)})"` : '';
  add(`<text x="${fmt(x)}" y="${fmt(y)}" font-size="${o.size || 10}" text-anchor="${o.anchor || 'start'}" fill="${o.fill || '#222'}"${o.weight ? ` font-weight="${o.weight}"` : ''}${o.halo === false ? '' : ' class="h"'}${tr}>${esc(s)}</text>`);
}

// Maßlinie mit Endstrichen. off: Textversatz senkrecht (px), tpos: Position entlang (0..1)
function dim(x1, y1, x2, y2, label, off, tpos, at) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  line(x1, y1, x2, y2, '#c0392b', 1);
  for (const [px, py] of [[x1, y1], [x2, y2]]) {
    line(px - nx * 5, py - ny * 5, px + nx * 5, py + ny * 5, '#c0392b', 1.2);
    line(px - ux * 3 - nx * 3, py - uy * 3 - ny * 3, px + ux * 3 + nx * 3, py + uy * 3 + ny * 3, '#c0392b', 1.2);
  }
  const t = tpos === undefined ? 0.5 : tpos;
  const mx = x1 + dx * t + nx * off, my = y1 + dy * t + ny * off;
  if (at) text(at[0], at[1], label, { size: 9.5, fill: '#c0392b', anchor: at[2], weight: 'bold' });
  else if (Math.abs(dy) > Math.abs(dx)) text(mx, my, label, { size: 9.5, fill: '#c0392b', anchor: 'middle', rot: -90, weight: 'bold' });
  else text(mx, my, label, { size: 9.5, fill: '#c0392b', anchor: 'middle', weight: 'bold' });
}
const dimLabel = (n) => `${fmt(n)} Bl. = ${de(n / SCALE)} m`;

// Achteck mit Apothem a um (cx,cz), Flächen parallel zu den Achsen
function octagon(cx, cz, a) {
  const e = a * T22;
  return [[a, -e], [a, e], [e, a], [-e, a], [-a, e], [-a, -e], [-e, -a], [e, -a]].map((p) => [cx + p[0], cz + p[1]]);
}
const planPts = (pts) => pts.map((p) => [ax(p[0]), az(p[1])]);

// ---------- Kopf ----------
const TITLE = 'Santa Maria del Fiore – Maßzeichnung V2 (1:2, 1 Block = 0,5 m)';
// Platz für Abschnitt C wird erst am Ende bekannt; Kopf wird nachträglich gesetzt.
const body = out;

// ====================================================================
// A) Grundriss
// ====================================================================
text(MX, 24, TITLE, { size: 16, weight: 'bold', halo: false });
text(MX, 46, 'A) Grundriss / Lageplan (Draufsicht, Norden oben) – 2 px pro Block', { size: 12, weight: 'bold', halo: false });

// Raster
for (let X = XMIN; X <= XMAX; X += 10) {
  const major = X % 50 === 0;
  line(ax(X), az(ZMIN), ax(X), az(ZMAX), major ? '#d2d2d2' : '#efefef', major ? 0.8 : 0.5);
}
for (let Z = ZMIN; Z <= ZMAX; Z += 10) {
  const major = Z % 50 === 0;
  line(ax(XMIN), az(Z), ax(XMAX), az(Z), major ? '#d2d2d2' : '#efefef', major ? 0.8 : 0.5);
}
for (let X = XMIN; X <= XMAX; X += 10) if (X % 50 === 0) text(ax(X), A_TOP - 8, 'X ' + X, { size: 8.5, anchor: 'middle', fill: '#666', halo: false });
for (let Z = ZMIN; Z <= ZMAX; Z += 10) if (Z % 50 === 0) text(MX - 6, az(Z) + 3, 'Z ' + Z, { size: 8.5, anchor: 'end', fill: '#666', halo: false });
rect(ax(XMIN), az(ZMIN), PLAN_W, (ZMAX - ZMIN) * PX, 'none', '#888', 1);

// Achsenkreuz
line(ax(XMIN), az(0), ax(XMAX), az(0), '#7a8fb5', 0.8, '8 3 2 3');
line(ax(0), az(ZMIN), ax(0), az(ZMAX), '#7a8fb5', 0.8, '8 3 2 3');
text(ax(XMAX) - 4, az(0) - 4, '+X Osten (Längsachse)', { size: 8.5, anchor: 'end', fill: '#4a5f85' });
text(ax(0) + 4, az(ZMAX) - 4, '+Z Süden', { size: 8.5, fill: '#4a5f85' });
text(ax(0) + 4, az(ZMIN) + 11, '-Z Norden', { size: 8.5, fill: '#4a5f85' });

// Nordpfeil
{
  const nx = ax(-345), ny0 = az(-95), ny1 = az(-130);
  line(nx, ny0, nx, ny1, '#222', 1.5);
  polygon([[nx, ny1 - 4], [nx - 5, ny1 + 8], [nx + 5, ny1 + 8]], '#222', '#222', 1);
  text(nx, ny1 - 8, 'N', { size: 12, anchor: 'middle', weight: 'bold' });
  text(nx, ny0 + 12, 'Norden (-Z)', { size: 8.5, anchor: 'middle' });
}

// Piazza-Gebäude
{
  const names = { palazzoCanonici: 'Palazzo dei Canonici', museoOpera: "Museo dell'Opera", loggiaBigallo: 'Loggia del Bigallo' };
  for (const k of Object.keys(PIAZZA)) {
    const p = PIAZZA[k];
    rect(ax(p.x[0]), az(p.z[0]), (p.x[1] - p.x[0]) * PX, (p.z[1] - p.z[0]) * PX, 'none', '#999', 1, '5 3');
    const cx = ax((p.x[0] + p.x[1]) / 2);
    if (k === 'loggiaBigallo') text(cx, az(p.z[1]) + 11, names[k], { size: 9, anchor: 'middle', fill: '#777' });
    else text(cx, az((p.z[0] + p.z[1]) / 2) + 3, names[k], { size: 9.5, anchor: 'middle', fill: '#777' });
  }
}

// Langhaus
{
  const x0 = C.facade.westFaceX, x1 = C.nave.crossingWestX, hz = C.nave.exteriorHalfZ;
  rect(ax(x0), az(-hz), (x1 - x0) * PX, 2 * hz * PX, '#f3ecdc', '#222', 1.4);
  // Innenseite gestrichelt
  const ih = C.nave.interiorHalfZ;
  line(ax(C.nave.interiorWestX), az(-ih), ax(x1), az(-ih), '#555', 1, '5 3');
  line(ax(C.nave.interiorWestX), az(ih), ax(x1), az(ih), '#555', 1, '5 3');
  line(ax(C.nave.interiorWestX), az(-ih), ax(C.nave.interiorWestX), az(ih), '#555', 1, '5 3');
  // Fassadenmauer
  rect(ax(x0), az(-hz), C.facade.thickness * PX, 2 * hz * PX, '#444', '#222', 1);
  // Pfeilerachsen
  const ch = C.nave.centralHalfZ;
  for (const z of [-ch, ch]) line(ax(C.nave.interiorWestX), az(z), ax(x1), az(z), '#888', 0.9, '9 3 2 3');
  // Pfeiler 5×5
  const xs = [];
  for (let k = 1; k < C.nave.bays; k++) xs.push(C.nave.interiorWestX + k * C.nave.bayPitch);
  xs.push(x1);
  for (const x of xs) for (const z of [-ch, ch]) rect(ax(x - 2.5), az(z - 2.5), 5 * PX, 5 * PX, '#fff', '#222', 1);
  text(ax(-146), az(-30), 'Langhaus', { size: 11, anchor: 'middle', weight: 'bold' });
  text(ax(-146), az(-30) + 12, '(4 Joche zu je ' + C.nave.bayPitch + ' Bl.)', { size: 8.5, anchor: 'middle', fill: '#555' });
  text(ax(x0) - 5, az(-30), 'Westfassade', { size: 8.5, anchor: 'middle', rot: -90 });
}

// Tribunen (Nord, Ost, Süd): lokal (u = Abstand auf der Achse, w = seitlich)
// Innenkontur und Beschriftung werden nach dem Tambour gezeichnet (Zeichenreihenfolge).
const tribLate = [];
{
  const T = C.tribunes, r = T.outerApothem, ri = T.innerApothem, c = T.centerDist;
  const e = r * T22, ei = ri * T22;
  // Seitenwand beginnt innerhalb des Tambours (dort wird sie vom Tambour überdeckt)
  const u0 = C.crossing.outerHalfFlat * (1 + T22) - r - 1;
  const outer = [[u0, -r], [u0, r], [c, r], [c + e, r], [c + r, e], [c + r, -e], [c + e, -r], [c, -r]];
  const u1 = C.crossing.innerHalfFlat;
  const inner = [[u1, ri], [c, ri], [c + ei, ri], [c + ri, ei], [c + ri, -ei], [c + ei, -ri], [c, -ri], [u1, -ri]];
  const dirs = { Nord: (u, w) => [w, -u], Ost: (u, w) => [u, w], Süd: (u, w) => [w, u] };
  for (const n of Object.keys(dirs)) {
    polygon(planPts(outer.map((q) => dirs[n](q[0], q[1]))), '#ecdcc4', '#222', 1.4);
    tribLate.push(() => {
      polyline(planPts(inner.map((q) => dirs[n](q[0], q[1]))), '#222', 1.1, '5 3');
      const lab = dirs[n](c + (n === 'Ost' ? 8 : 2), 0), ring = dirs[n]((c + r + c + ri) / 2, 0);
      if (n === 'Ost') {
        text(ax(lab[0]), az(lab[1]) - 1, 'Tribune', { size: 9, anchor: 'middle', weight: 'bold' });
        text(ax(lab[0]), az(lab[1]) + 9, 'Ost', { size: 9, anchor: 'middle', weight: 'bold' });
      } else text(ax(lab[0]), az(lab[1]) + 3, 'Tribune ' + n, { size: 10, anchor: 'middle', weight: 'bold' });
      text(ax(ring[0]), az(ring[1]) + 3, `${T.chapelsPerTribune} Kapellen`, { size: 7.5, anchor: 'middle', fill: '#555' });
    });
  }
}

// Vierung / Tambour
{
  const o = octagon(0, 0, C.crossing.outerHalfFlat), i = octagon(0, 0, C.crossing.innerHalfFlat);
  polygon(planPts(o), '#e6d6b6', '#222', 1.6);
  polygon(planPts(i), '#fbf7ee', '#222', 1);
  text(ax(0), az(-30), 'Vierung / Tambour', { size: 10, anchor: 'middle', weight: 'bold' });
  text(ax(0), az(-30) + 11, `außen ${C.crossing.outerHalfFlat}, innen ${C.crossing.innerHalfFlat} Bl. (Halbmaß über die Flächen)`, { size: 7.5, anchor: 'middle', fill: '#555' });
}

tribLate.forEach((f) => f());

// Campanile
{
  rect(ax(K.centerX - K.half), az(K.centerZ - K.half), 2 * K.half * PX, 2 * K.half * PX, '#dfe3ec', '#222', 1.4);
  text(ax(K.centerX), az(K.centerZ) + 3, 'Campanile', { size: 10, anchor: 'middle', weight: 'bold' });
}

// Baptisterium
{
  const o = octagon(B.centerX, B.centerZ, B.outerHalfFlat), i = octagon(B.centerX, B.centerZ, B.innerHalfFlat);
  const sx0 = B.scarsella.westX, sx1 = B.centerX - B.outerHalfFlat;
  rect(ax(sx0), az(-B.scarsella.halfZ), (sx1 - sx0) * PX, 2 * B.scarsella.halfZ * PX, '#e3ecdf', '#222', 1.4);
  polygon(planPts(o), '#e3ecdf', '#222', 1.5);
  polygon(planPts(i), '#f6faf4', '#222', 1);
  text(ax(B.centerX), az(B.centerZ) + 3, 'Baptisterium', { size: 10, anchor: 'middle', weight: 'bold' });
  text(ax((sx0 + sx1) / 2), az(-B.scarsella.halfZ) - 4, 'Scarsella', { size: 8.5, anchor: 'middle' });
}

// Bemaßungen
{
  const tE = C.tribunes.centerDist + C.tribunes.outerApothem;
  const fx = C.facade.westFaceX;
  // 1) Gesamtlänge Fassade bis Ostscheitel
  const zl = 105;
  line(ax(fx), az(C.nave.exteriorHalfZ), ax(fx), az(zl) + 5, '#c0392b', 0.6, '2 2');
  line(ax(tE), az(C.tribunes.outerApothem * T22), ax(tE), az(zl) + 5, '#c0392b', 0.6, '2 2');
  dim(ax(fx), az(zl), ax(tE), az(zl), 'Gesamtlänge Fassade bis Ostscheitel: ' + dimLabel(tE - fx), -5);
  // 2) Breite über Tribunen
  const tx = tE + 3;
  const r = C.tribunes.outerApothem, cd = C.tribunes.centerDist;
  line(ax(r * T22), az(-(cd + r)), ax(tx + 3), az(-(cd + r)), '#c0392b', 0.6, '2 2');
  line(ax(r * T22), az(cd + r), ax(tx + 3), az(cd + r), '#c0392b', 0.6, '2 2');
  dim(ax(tx), az(-(cd + r)), ax(tx), az(cd + r), 'Breite über Tribunen: ' + dimLabel(2 * (cd + r)), -12, 0.8);
  // 3) Langhaus-Außenbreite
  const bx = -117;
  dim(ax(bx), az(-C.nave.exteriorHalfZ), ax(bx), az(C.nave.exteriorHalfZ), 'Langhaus außen: ' + dimLabel(2 * C.nave.exteriorHalfZ), 6);
  // 4) Tambour außen (über die Flächen)
  const a = C.crossing.outerHalfFlat;
  dim(ax(-a), az(20), ax(a), az(20), 'Tambour außen: ' + dimLabel(2 * a), -5);
  // 5) Baptisterium-Ostseite bis Fassade
  const be = B.centerX + B.outerHalfFlat;
  dim(ax(be), az(-8), ax(fx), az(-8), dimLabel(fx - be), -5);
  text(ax((be + fx) / 2), az(-8) + 12, 'Baptisterium – Fassade', { size: 8.5, anchor: 'middle', fill: '#c0392b' });
  // 6) Campanile-Nordseite bis Langhaus-Außenflucht
  const cn = K.centerZ - K.half, hz = C.nave.exteriorHalfZ, mx = -175;
  line(ax(K.centerX + K.half), az(cn), ax(mx + 4), az(cn), '#c0392b', 0.6, '2 2');
  dim(ax(mx), az(hz), ax(mx), az(cn), 'Campanile N – Langhaus: ' + dimLabel(cn - hz), 0, 0.5, [ax(mx) + 8, (az(hz) + az(cn)) / 2 + 3, 'start']);
}

// ====================================================================
// B) Längsschnitt
// ====================================================================
text(MX, B_HEAD, 'B) Längsschnitt (Ansicht von Süden, Schnitt in Z = 0) – 2 px pro Block', { size: 12, weight: 'bold', halo: false });

// Raster
for (let Y = YMIN; Y <= YMAX; Y += 10) {
  const major = Y % 50 === 0;
  line(ax(XMIN), by(Y), ax(XMAX), by(Y), major ? '#cfcfcf' : '#efefef', major ? 0.9 : 0.5);
  if (major) text(MX - 6, by(Y) + 3, `Y ${Y} (${de(meterOfY(Y))} m)`, { size: 8.5, anchor: 'end', fill: '#666', halo: false });
}
for (let X = XMIN; X <= XMAX; X += 50) if (X % 50 === 0) {
  line(ax(X), by(YMAX), ax(X), by(YMIN), '#ececec', 0.6);
  text(ax(X), by(YMIN) + 13, 'X ' + X, { size: 8.5, anchor: 'middle', fill: '#666', halo: false });
}
rect(ax(XMIN), by(YMAX), PLAN_W, (YMAX - YMIN) * PX, 'none', '#888', 1);
// Bauhöhengrenze
line(ax(XMIN), by(LEVELS.maxY), ax(XMAX), by(LEVELS.maxY), '#d00', 1.5);
text(ax(XMAX) - 4, by(LEVELS.maxY) - 4, `Bauhöhengrenze (Y ${LEVELS.maxY}, ${de(meterOfY(LEVELS.maxY))} m)`, { size: 9.5, anchor: 'end', fill: '#d00', weight: 'bold' });

// Boden und Fundament
{
  const xa = B.scarsella.westX, xb = C.tribunes.centerDist + C.tribunes.outerApothem;
  rect(ax(xa), by(LEVELS.floorY), (xb - xa) * PX, (LEVELS.floorY - LEVELS.foundationBottomY) * PX, '#bdbdbd', '#777', 1);
  line(ax(xa), by(LEVELS.cryptFloorY), ax(xb), by(LEVELS.cryptFloorY), '#777', 0.8, '4 3');
  text(ax((xa + xb) / 2), by(LEVELS.floorY) + 11, `Fundament Y ${LEVELS.foundationBottomY}..${LEVELS.floorY}, Krypta-Boden Y ${LEVELS.cryptFloorY}`, { size: 8, anchor: 'middle', fill: '#333', halo: false });
  line(ax(XMIN), by(LEVELS.floorY), ax(XMAX), by(LEVELS.floorY), '#222', 1.6);
}

// Baptisterium (Mitte X = centerX)
{
  const o = B.outerHalfFlat, cx = B.centerX;
  polygon([[ax(cx - o), by(LEVELS.floorY)], [ax(cx - o), by(B.atticTopY)], [ax(cx), by(B.roofApexY)], [ax(cx + o), by(B.atticTopY)], [ax(cx + o), by(LEVELS.floorY)]], '#e3ecdf', '#222', 1.3);
  line(ax(cx - o), by(B.atticTopY), ax(cx + o), by(B.atticTopY), '#222', 0.8);
  rect(ax(cx - 3), by(B.lanternTopY), 6 * PX, (B.lanternTopY - B.roofApexY) * PX, '#e3ecdf', '#222', 1.2);
  text(ax(cx), by(LEVELS.floorY) - 24, 'Baptisterium', { size: 10, anchor: 'middle', weight: 'bold' });
  text(ax(cx), by(LEVELS.floorY) - 12, `Mauer ±${B.outerHalfFlat}, Attika Y ${B.atticTopY}`, { size: 8, anchor: 'middle', fill: '#555' });
}

// Campanile (hinter der Schnittebene, heller)
{
  rect(ax(K.centerX - K.half), by(K.topY), 2 * K.half * PX, (K.topY - LEVELS.floorY) * PX, '#eef0f5', '#a9afbd', 1.2, '5 3');
  text(ax(K.centerX), by(K.topY) - 6, 'Campanile (Z +' + K.centerZ + ', hinter der Schnittebene)', { size: 9, anchor: 'middle', fill: '#8a90a0' });
}

// Langhaus
{
  const x0 = C.facade.westFaceX, x1 = C.nave.crossingWestX, n = C.nave;
  rect(ax(x0), by(n.clerestoryTopY), (x1 - x0) * PX, (n.clerestoryTopY - LEVELS.floorY) * PX, '#f3ecdc', '#222', 1.3);
  // Satteldach
  rect(ax(x0), by(n.roofRidgeY), (x1 - x0) * PX, (n.roofRidgeY - n.clerestoryTopY) * PX, '#cdb99a', '#222', 1.1);
  line(ax(x0), by(n.clerestoryTopY), ax(x1), by(n.clerestoryTopY), '#555', 1, '6 3');
  // Seitenschiff-Traufe (hinter der Schnittebene)
  line(ax(x0), by(n.aisleEavesY), ax(x1), by(n.aisleEavesY), '#555', 1, '6 3');
  line(ax(n.interiorWestX), by(n.aisleVaultY), ax(x1), by(n.aisleVaultY), '#888', 0.8, '1 3');
  // Gewölbelinie Mittelschiff
  line(ax(n.interiorWestX), by(n.naveVaultY), ax(x1), by(n.naveVaultY), '#222', 1.3, '1.5 3');
  // Joch-Grenzen
  for (let k = 0; k <= n.bays; k++) {
    const x = n.interiorWestX + k * n.bayPitch;
    line(ax(x), by(LEVELS.floorY), ax(x), by(n.naveVaultY), '#999', 0.6);
  }
  text(ax(-140), by(LEVELS.floorY) - 14, 'Langhaus (' + n.bays + ' Joche)', { size: 10, anchor: 'middle', weight: 'bold' });
  text(ax(-140), by(n.roofRidgeY) - 5, `Satteldach, Traufe Y ${n.clerestoryTopY}, First Y ${n.roofRidgeY}`, { size: 9, anchor: 'middle' });
  text(ax(-140), by(n.aisleEavesY) - 4, `Seitenschiff-Traufe Y ${n.aisleEavesY}`, { size: 8, anchor: 'middle', fill: '#555' });
  text(ax(-140), by(n.naveVaultY) + 15, `Gewölbe Mittelschiff Y ${n.naveVaultY}`, { size: 8, anchor: 'middle', fill: '#555' });
}

// Fassade
{
  const f = C.facade;
  rect(ax(f.westFaceX), by(C.nave.aisleEavesY), f.thickness * PX, (C.nave.aisleEavesY - LEVELS.floorY) * PX, '#555', '#222', 1);
  polygon([[ax(f.westFaceX), by(C.nave.aisleEavesY)], [ax(f.westFaceX + f.thickness), by(C.nave.aisleEavesY)], [ax(f.westFaceX + f.thickness / 2), by(f.peakY)]], '#555', '#222', 1);
  text(ax(f.westFaceX) - 4, by(f.peakY) + 3, `Fassade, Giebel Y ${f.peakY}`, { size: 9, anchor: 'end' });
}

// Tribune Ost
{
  const T = C.tribunes, a = C.crossing.outerHalfFlat, xe = T.centerDist + T.outerApothem, xt = T.centerDist + T.innerApothem;
  polygon([[ax(a), by(LEVELS.floorY)], [ax(a), by(T.tribuneRoofY)], [ax(xt), by(T.tribuneRoofY)], [ax(xt), by(T.chapelRoofY)], [ax(xe), by(T.chapelRoofY)], [ax(xe), by(LEVELS.floorY)]], '#ecdcc4', '#222', 1.3);
  text(ax((a + xt) / 2), by(T.tribuneRoofY) - 4, `Tribunendach Y ${T.tribuneRoofY}`, { size: 8, anchor: 'middle' });
  text(ax((xt + xe) / 2), by(T.chapelRoofY) + 11, `Kapellendach Y ${T.chapelRoofY}`, { size: 8, anchor: 'middle' });
  text(ax((a + xe) / 2), by(LEVELS.floorY) - 14, 'Tribune Ost', { size: 10, anchor: 'middle', weight: 'bold' });
}

// Tambour
{
  const d = C.drum, a = C.crossing.outerHalfFlat, i = C.crossing.innerHalfFlat;
  for (const s of [-1, 1]) line(ax(s * i), by(LEVELS.floorY), ax(s * i), by(d.baseY), '#999', 0.8, '1 3');
  for (const s of [-1, 1]) line(ax(s * a), by(LEVELS.floorY), ax(s * a), by(d.baseY), '#999', 0.8, '1 3');
  rect(ax(-a), by(d.springY), 2 * a * PX, (d.springY - d.baseY) * PX, '#e6d6b6', '#222', 1.4);
  rect(ax(-i), by(d.springY), 2 * i * PX, (d.springY - d.baseY) * PX, '#fbf7ee', '#222', 1, '5 3');
  const cy = by(d.oculusCenterY), xo = (a + i) / 2;
  for (const s of [-1, 1]) circle(ax(s * xo), cy, d.oculusDiameter / 2 * PX, '#fff', '#222', 1);
  text(ax(0), by(d.baseY) - 6, 'Tambour', { size: 10, anchor: 'middle', weight: 'bold' });
}

// Kuppel (Schnitt durch die Eckrippe, quinto acuto)
let apexInner = 0;
{
  const d = C.dome, eyeY = d.eyeRingTopY, N = 80;
  const aIn = C.crossing.innerHalfFlat;
  const radii = [aIn, aIn + d.innerShellBase, aIn + d.innerShellBase + d.gap, aIn + d.innerShellBase + d.gap + d.outerShellBase];
  const cols = ['#5b2c0a', '#8a4b1c', '#8a4b1c', '#5b2c0a'];
  const yAt = (s, R, x) => d.springY + Math.sqrt(Math.max(0, R * R - (x + (R - s)) * (x + (R - s))));
  radii.forEach((a, idx) => {
    const s = a / COS22, R = d.profileRadiusFactor * 2 * s;
    const apex = yAt(s, R, 0);
    if (idx === 0) apexInner = apex;
    // Kappung bei Y > eyeRingTopY: Durchstoßpunkt exakt bestimmen
    let dEnd = 0;
    if (apex > eyeY) dEnd = Math.sqrt(R * R - (eyeY - d.springY) * (eyeY - d.springY)) - (R - s);
    const pts = [];
    for (let k = 0; k <= N; k++) {
      const x = s + (dEnd - s) * (k / N);
      pts.push([x, yAt(s, R, x)]);
    }
    const right = pts.map((p) => [ax(p[0]), by(p[1])]);
    const left = pts.map((p) => [ax(-p[0]), by(p[1])]);
    polyline(left.concat(right.reverse()), cols[idx], idx === 0 || idx === 3 ? 1.5 : 1.1);
  });
  text(ax(C.crossing.outerHalfFlat) + 8, by(215), 'Kurve 3 und 4: Außenschale vorläufig (Profil folgt in M5)', { size: 9, anchor: 'start', fill: '#8a4b1c' });
  // Schlussring
  rect(ax(-(d.eyeHalfFlat + 3)), by(eyeY), 2 * (d.eyeHalfFlat + 3) * PX, 2 * PX, '#fff', '#222', 1.2);
  text(ax(-C.crossing.innerHalfFlat) - 14, by(215), 'Schnitt durch Eckrippe', { size: 9.5, anchor: 'end', weight: 'bold' });
  text(ax(-C.crossing.innerHalfFlat) - 14, by(215) + 11, '(Horizontalmaß über die Ecke)', { size: 9.5, anchor: 'end', weight: 'bold' });
}

// Laterne
{
  const L = C.lantern, h = L.halfFlat;
  rect(ax(-h), by(L.templeTopY), 2 * h * PX, (L.templeTopY - L.baseY) * PX, '#f3ecdc', '#222', 1.3);
  polygon([[ax(-h), by(L.templeTopY)], [ax(h), by(L.templeTopY)], [ax(0), by(L.coneTopY)]], '#cdb99a', '#222', 1.2);
  circle(ax(0), by(L.sphereCenterY), L.sphereRadius * PX, '#e8c860', '#222', 1.2);
  line(ax(0), by(L.sphereCenterY + L.sphereRadius), ax(0), by(L.crossTopY), '#222', 1.6);
  line(ax(-1.5), by(L.crossTopY - 1.5), ax(1.5), by(L.crossTopY - 1.5), '#222', 1.4);
  text(ax(h) + 6, by((L.baseY + L.templeTopY) / 2) + 3, `Laterne (Tempel ±${h})`, { size: 9, anchor: 'start', weight: 'bold' });
}

// Höhenkoten rechts mit Hilfslinien
{
  const kx = 104, items = [
    [LEVELS.floorY, 'floorY (Fußboden)', C.tribunes.centerDist + C.tribunes.outerApothem, -7],
    [C.nave.aisleVaultY, 'aisleVaultY (Seitenschiffgewölbe)', C.nave.crossingWestX, 0],
    [B.lanternTopY, 'Baptisterium lanternTopY', B.centerX, 0],
    [C.drum.baseY, 'drum.baseY (Tambourbasis)', C.crossing.outerHalfFlat, 8],
    [C.nave.naveVaultY, 'naveVaultY (Gewölbe Mittelschiff)', C.nave.crossingWestX, -5],
    [C.drum.springY, 'drum.springY (Kuppelansatz)', C.crossing.outerHalfFlat, 0],
    [K.topY, 'Campanile topY', K.centerX + K.half, 0],
    [C.dome.eyeRingTopY, 'eyeRingTopY (Schlussring)', C.dome.eyeHalfFlat + 3, 0],
    [C.lantern.crossTopY, 'crossTopY (Kreuzspitze)', 1.5, 0]
  ];
  for (const [Y, lab, sx, dy] of items) {
    line(ax(sx), by(Y), ax(kx), by(Y), '#999', 0.7, '2 3');
    polygon([[ax(kx), by(Y)], [ax(kx) + 9, by(Y) - 4.5], [ax(kx) + 9, by(Y) + 4.5]], '#1f6f3f', '#1f6f3f', 1);
    text(ax(kx) + 13, by(Y) + 3 + dy, `Y ${Y} (${de(meterOfY(Y))} m) – ${lab}`, { size: 9, fill: '#1f6f3f' });
  }
}
text(ax(XMAX) - 4, by(YMIN) - 6, 'Kote: Y = ' + LEVELS.floorY + ' + ' + SCALE + '·h[m]', { size: 8.5, anchor: 'end', fill: '#666' });

// ====================================================================
// C) Legende und Tabelle
// ====================================================================
const cy0 = B_BOT + 54;
let cy = cy0;
text(MX, cy, 'C) Legende und Maßtabelle', { size: 12, weight: 'bold', halo: false });
cy += 22;
text(MX, cy, TITLE, { size: 14, weight: 'bold', halo: false });
cy += 18;
text(MX, cy, `Koordinatensystem: X = Längsachse (+X Osten/Chor, -X Westen/Fassade), Z = Querachse (+Z Süden/Campanile-Seite, -Z Norden), Y = Höhe; Ursprung X=0, Z=0 = Kuppelmitte.`, { size: 10, halo: false });
cy += 14;
text(MX, cy, `Fußboden = Y ${LEVELS.floorY} (0 m), Laufniveau = Y ${LEVELS.walkY}; Höhe Y = ${LEVELS.floorY} + ${SCALE}·h[m]; Grundriss: Blöcke = ${SCALE}·m; Maßstab Zeichnung ${PX} px pro Block.`, { size: 10, halo: false });
cy += 24;

// Alle Werte rekursiv
const rows = [];
(function walk(o, p) {
  for (const k of Object.keys(o)) {
    const v = o[k], pp = p ? p + '.' + k : k;
    if (Array.isArray(v)) rows.push([pp, '[' + v.map(fmt).join(', ') + ']', false, null]);
    else if (v && typeof v === 'object') walk(v, pp);
    else rows.push([pp, fmt(v), /Y$/.test(k), v]);
  }
})({ SCALE, LEVELS, CATHEDRAL: C, CAMPANILE: K, BAPTISTERY: B, PIAZZA }, '');
const COLS = 3, perCol = Math.ceil(rows.length / COLS), colW = Math.floor((W - MX - 20) / COLS), rowH = 14;
rows.forEach((r, i) => {
  const col = Math.floor(i / perCol), row = i % perCol;
  const x = MX + col * colW, y = cy + row * rowH;
  text(x, y, r[0], { size: 9.5, halo: false });
  text(x + 230, y, '= ' + r[1] + (r[2] ? ` (${de(meterOfY(r[3]))} m)` : ''), { size: 9.5, halo: false, fill: '#1a4f9c' });
});
cy += perCol * rowH + 18;

// ANNAHME-Pfade aus dem Quelltext
const src = fs.readFileSync(path.join(__dirname, '..', 'spec', 'dimensions.js'), 'utf8').split(/\r?\n/);
const stack = [], assumed = [];
for (const ln of src) {
  let m = ln.match(/^\s*const\s+(\w+)\s*=\s*\{\s*$/);
  if (m) { stack.length = 0; stack[0] = m[1]; continue; }
  m = ln.match(/^(\s*)(\w+):\s*\{\s*(\/\/.*)?$/);
  if (m) { const d = m[1].length / 2; stack[d] = m[2]; stack.length = d + 1; continue; }
  m = ln.match(/^(\s*)(\w+):/);
  if (m && /ANNAHME/.test(ln)) assumed.push(stack.slice(0, m[1].length / 2).concat(m[2]).join('.'));
}
text(MX, cy, 'Mit ANNAHME markierte Werte sind Plausibilitätswerte', { size: 11, weight: 'bold', halo: false });
cy += 16;
{
  let cur = '';
  const lines = [];
  for (const p of assumed) {
    if ((cur + ', ' + p).length > 150 && cur) { lines.push(cur + ','); cur = p; }
    else cur = cur ? cur + ', ' + p : p;
  }
  if (cur) lines.push(cur);
  for (const l of lines) { text(MX, cy, l, { size: 9.5, halo: false }); cy += 13; }
}
cy += 14;
const H = cy;

// ---------- Ausgabe ----------
const head = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="sans-serif">\n<title>${esc(TITLE)}</title>\n<style>.h{paint-order:stroke;stroke:#fff;stroke-width:3px;stroke-linejoin:round}</style>\n<rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>\n`;
const svg = head + body.join('\n') + '\n</svg>\n';
const target = path.join(__dirname, '..', '..', '00_Projektplan_und_Konzept', 'MASSZEICHNUNG.svg');
fs.writeFileSync(target, svg, 'utf8');
console.log('Scheitel-Y Innenschale (Kurve 1): ' + (Math.round(apexInner * 100) / 100));
console.log('Geschrieben: ' + target + ' (' + Buffer.byteLength(svg) + ' Bytes, ' + W + ' x ' + H + ' px)');
console.log('ANNAHME-Pfade: ' + assumed.length);
