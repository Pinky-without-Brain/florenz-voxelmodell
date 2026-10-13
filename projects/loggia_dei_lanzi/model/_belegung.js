'use strict';
// Belegungsregister je Bau (Ersatz für Abfragen an ctx.grid, ARCHITEKTUR §3): Jedes Modul trägt seine Zellen über
// setL/put ein, spätere Bauteile fragen frei()/belegt() am Register und sparen belegte Zellen aus (K0: zuerst gebaut gewinnt).
// luft() reserviert Zellen, die leer bleiben müssen (Türen, Treppenraum).
const { packKey } = require('../../../tools/geom/grid.js');

const REG = new WeakMap();

function belegung(ctx) {
  let b = REG.get(ctx.grid);
  if (b) return b;
  const typ = new Map();                       // Schlüssel -> Typ (null = reservierte Luft)
  const BODEN_Y = require('./_gemeinsam.js').BODEN_Y;
  const key = (x, y, z) => packKey(x, y, z);
  b = {
    typ,
    belegt: (x, y, z) => typ.has(key(x, y, z)),
    fest: (x, y, z) => typ.get(key(x, y, z)) != null,
    frei: (c, L) => !typ.has(key(c.x, BODEN_Y + L, c.z)),
    freiXYZ: (x, y, z) => !typ.has(key(x, y, z)),
    put(w, x, y, z, t) { w.set(x, y, z, t); typ.set(key(x, y, z), t); },
    setL(w, c, L, t) { w.set(c.x, BODEN_Y + L, c.z, t); typ.set(key(c.x, BODEN_Y + L, c.z), t); },
    luft(x, y, z) { typ.set(key(x, y, z), null); }
  };
  REG.set(ctx.grid, b);
  return b;
}

module.exports = { belegung };
