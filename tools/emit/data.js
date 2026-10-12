'use strict';
// Webapp-Datenexport (ARCHITEKTUR §6): Läufe entlang +Z als Int16-LE-Quintupel, Base64.

const fs = require('node:fs');
const path = require('node:path');
const { unpackKey } = require('../geom/grid');

const MAX_RUN = 32767; // größter Int16-Wert

// paletteIndex: Map oder Objekt Typ -> Index
function indexOf(paletteIndex, type) {
  const i = paletteIndex instanceof Map ? paletteIndex.get(type) : paletteIndex[type];
  if (i === undefined) throw new Error(`Typ nicht in der Modul-Palette: ${type}`);
  return i;
}

/**
 * Kodiert Blöcke [{x,y,z,type}] zu Läufen. Rückgabe: { base64, runs, blocks }.
 * Sortierung (y, x, z0); Lauf = aufeinanderfolgende z, gleicher Typ, Länge <= 32767.
 */
function encodeRuns(blocks, paletteIndex) {
  const sorted = blocks.slice().sort((a, b) => (a.y - b.y) || (a.x - b.x) || (a.z - b.z));
  const out = [];
  let cur = null;
  for (const b of sorted) {
    const t = indexOf(paletteIndex, b.type);
    if (cur && cur[0] === b.x && cur[1] === b.y && cur[4] === t &&
        cur[2] + cur[3] === b.z && cur[3] < MAX_RUN) {
      cur[3]++;
    } else {
      cur = [b.x, b.y, b.z, 1, t];
      out.push(cur);
    }
  }
  const buf = Buffer.alloc(out.length * 10);
  out.forEach((r, i) => { for (let k = 0; k < 5; k++) buf.writeInt16LE(r[k], i * 10 + k * 2); });
  return { base64: buf.toString('base64'), runs: out.length, blocks: sorted.length };
}

// Dekodiert Base64 zu Blöcken [{x,y,z,type}] (Reihenfolge wie die Läufe).
function decodeRuns(base64, palette) {
  const buf = Buffer.from(base64, 'base64');
  const blocks = [];
  for (let o = 0; o + 10 <= buf.length; o += 10) {
    const x = buf.readInt16LE(o), y = buf.readInt16LE(o + 2), z0 = buf.readInt16LE(o + 4);
    const len = buf.readInt16LE(o + 6), type = palette[buf.readInt16LE(o + 8)];
    for (let i = 0; i < len; i++) blocks.push({ x, y, z: z0 + i, type });
  }
  return blocks;
}

function emitModuleData({ moduleMeta, steps, grid, outDir }) {
  const N = moduleMeta.module;
  // Schritte -> Blöcke mit Typ, Palette nach erstem Vorkommen
  const palette = [];
  const pIndex = new Map();
  const stepBlocks = steps.map((s) => s.cells.map((key) => {
    const { x, y, z } = unpackKey(key);
    const e = grid.get(x, y, z);
    if (!e) throw new Error(`Zelle (${x},${y},${z}) in Schritt ${s.stepNumber} fehlt im Grid`);
    return { x, y, z, type: e.type };
  }));
  // Erstvorkommen in Bau-Reihenfolge (y, x, z je Schritt)
  stepBlocks.forEach((bl) => {
    bl.slice().sort((a, b) => (a.y - b.y) || (a.x - b.x) || (a.z - b.z)).forEach((b) => {
      if (!pIndex.has(b.type)) { pIndex.set(b.type, palette.length); palette.push(b.type); }
    });
  });

  let totalRuns = 0, totalBlocks = 0;
  const outSteps = steps.map((s, i) => {
    const enc = encodeRuns(stepBlocks[i], pIndex);
    totalRuns += enc.runs; totalBlocks += enc.blocks;
    return {
      stepNumber: s.stepNumber, title: s.title, description: s.description,
      tip: s.tip, caution: s.caution, fact: s.fact, cameraHint: s.cameraHint,
      count: enc.blocks, yRange: s.yRange, runs: enc.base64
    };
  });

  const data = {
    module: N, title: moduleMeta.title, subtitle: moduleMeta.subtitle, icon: moduleMeta.icon,
    palette, steps: outSteps
  };
  const text =
    `// GENERIERT von tools/emit/data.js - nicht von Hand ändern.\n` +
    `// Modul ${N}: ${steps.length} Schritte, ${totalBlocks} Blöcke, ${totalRuns} Läufe.\n` +
    `window.MODULE_DATA_V2 = window.MODULE_DATA_V2 || {};\n` +
    `window.MODULE_DATA_V2[${N}] = ${JSON.stringify(data)};\n`;

  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `module_${N}.js`);
  fs.writeFileSync(file, text, 'utf8');
  return { file, bytes: Buffer.byteLength(text, 'utf8'), runs: totalRuns, blocks: totalBlocks };
}

module.exports = { emitModuleData, encodeRuns, decodeRuns, MAX_RUN };
