'use strict';
// Uffizien: gemeinsame Grundlage der Module 0-9.
// Lädt die Masken, legt die Spaltentabelle der Maske M_UF an (Rahmen UF, Zonen, Abstandsfelder) und
// stellt das Belegungsraster der Module 1-7 bereit: je Spalte und Lage (Lage L = Y - bodenY) ein
// Eigentümer (Bauteil) und ein Material. Die Regeln selbst stehen in _plan.js.
//
// Rangfolge nach K0 (PRUEFBERICHT_D1): Details zuerst. Eine Zelle gehört dem Bauteil, das sie zuerst
// beansprucht; _plan.js beansprucht deshalb Öffnungen, Rahmen und Gesimse vor Wänden und Decken.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');

const DIR = path.resolve(__dirname, '..');
const SLOTS = 96;          // Lagen 0..95 (Platte = 0, Tribuna-Laterne bis etwa 80)
const AIR = 0xFFFF;        // Zelle bleibt bewusst leer (Öffnung, Nische, Raum)

let cache = null;

/** Wahrzeichen-Daten und Spaltentabelle (einmal je Prozess). */
function get() {
  if (cache) return cache;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const M = masken.haupt;
  const R = masken.rahmen;
  const cells = M.cells;
  const N = cells.length;
  const bb = M.bbox;
  const X0 = bb.x0, Z0 = bb.z0, NZ = bb.z1 - bb.z0 + 1, NX = bb.x1 - bb.x0 + 1;
  const idx = new Int32Array(NX * NZ).fill(-1);
  const cx = new Int16Array(N), cz = new Int16Array(N);
  const uu = new Float32Array(N), ww = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const x = cells[i][0], z = cells[i][1];
    cx[i] = x; cz[i] = z;
    idx[(x - X0) * NZ + (z - Z0)] = i;
    const l = R.toLocal(x, z);
    uu[i] = l.u; ww[i] = l.w;
  }
  const at = (x, z) => {
    const a = x - X0, b = z - Z0;
    return a < 0 || b < 0 || a >= NX || b >= NZ ? -1 : idx[a * NZ + b];
  };
  const d8 = new Uint8Array(N);
  for (let i = 0; i < N; i++) d8[i] = Math.min(255, M.d8(cx[i], cz[i]));

  cache = { json, masken, M, R, cells, N, X0, Z0, NX, NZ, cx, cz, uu, ww, at, d8,
    BODEN: json.bodenY, SLOTS, AIR };
  return cache;
}

// ------------------------------------------------------------------ Materialien (Rollen -> Palettentypen)
const ROLLEN = ['gold', 'licht', 'pietra_forte_bruch', 'pflaster', 'pietra_serena', 'putz_sand', 'pietra_forte', 'marmor_weiss',
  'marmor_ornament', 'glas_fenster', 'dachziegel', 'holz'];
const TYP = {};
for (const r of ROLLEN) TYP[r] = WZ.typ(r);

/** Stückweise lineare Funktion durch Punkte [[x, y], ...] (aufsteigend in x, außerhalb konstant fortgesetzt). */
function polylinie(pts) {
  return (x) => {
    if (x <= pts[0][0]) {
      const [a, b] = [pts[0], pts[1]];
      return a[1] + ((x - a[0]) * (b[1] - a[1])) / (b[0] - a[0]);
    }
    for (let i = 1; i < pts.length; i++) {
      if (x <= pts[i][0] || i === pts.length - 1) {
        const a = pts[i - 1], b = pts[i];
        return a[1] + ((x - a[0]) * (b[1] - a[1])) / (b[0] - a[0]);
      }
    }
    return 0;
  };
}

module.exports = { get, polylinie, SLOTS, AIR, DIR, ROLLEN, TYP };
