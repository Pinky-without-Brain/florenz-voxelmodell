'use strict';
// Modul 8 – Ausgestaltete Innenräume (Katalog §9): je Raum ein Bauteil. Wandfelder, Böden und Deckenfresken ersetzen
// Zellen der Rohbauteile (dort ausgespart, siehe _raum.js), dazu wenige Möbel (Throne, Bänke, Vestibülpfeiler).
// Vereinfachte Ausstattung, nicht nach Vorbild.
const G = require('./_pi.js');
const RA = require('./_raum.js');

module.exports = {
  module: 8,
  build(ctx) {
    const B = G.belegung(ctx);
    const teile = new Map();
    const teil = (id) => { if (!teile.has(id)) teile.set(id, ctx.part(id)); return teile.get(id); };
    // Reihenfolge der Räume wie im Katalog
    const ordnung = [...RA.RAEUME.map((r) => r.teil), 'appartamenti_reali', 'wappen_portal'];
    const nachTeil = new Map(ordnung.map((t) => [t, []]));
    for (const [k, v] of RA.RESERVIERT) { const [x, y, z] = k.split(',').map(Number); nachTeil.get(v.teil).push({ x, y, z, typ: v.typ }); }
    for (const b of RA.MOEBEL) nachTeil.get(b.teil).push(b);
    for (const t of ordnung) {
      const zellen = nachTeil.get(t);
      if (!zellen.length) continue;
      const w = teil(t);
      zellen.sort((a, b) => a.y - b.y);
      for (const c of zellen) B.set(w, c.x, c.y, c.z, c.typ);
    }
  }
};
