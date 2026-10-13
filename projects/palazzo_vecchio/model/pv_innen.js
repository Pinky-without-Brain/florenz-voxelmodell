'use strict';
// Palazzo Vecchio, B2: Innenausbau nach dem Belegungsplan (pv_plan.js): Trennwände mit Türen, Treppen aus Treppenblöcken.
const pv = require('./pv_lib.js');
const { plan, TUERHOEHE } = require('./pv_plan.js');

/** Trennwände (Bauteil innenwaende_a): 2 dick von Platte zu Platte, Türen 4 x 7 bleiben Luft (freigehalten). */
function waende(ctx, S) {
  const P = plan(S.g), TY = pv.TY;
  const w = ctx.part('innenwaende_a');
  let n = 0;
  for (const wand of P.waende) {
    const ge = wand.ge;
    for (let y = ge.stand; y < ge.decke; y++) {
      for (const { r, tuer } of wand.cells) {
        if (tuer && y < ge.stand + TUERHOEHE) continue;
        if (S.put(w, r.x, y, r.z, TY[wand.mat], 'innenwaende_a')) n++;
      }
    }
  }
  return n;
}

/** Eine Treppe als eigenes Bauteil: Unterbau (massiv bis zur Stufe), dann die Treppenblöcke. */
function treppe(ctx, S, id) {
  const L = plan(S.g).treppen.find((t) => t.id === id);
  if (!L) throw new Error(`Treppe ${id} fehlt im Plan`);
  const w = ctx.part(id);
  for (const u of L.unter) S.putForce(w, u.x, u.y, u.z, u.typ, id);
  for (const s of L.stufen) {
    if (!S.putForce(w, s.x, s.y, s.z, s.typ, id)) throw new Error(`Treppe ${id}: Stufe auf belegter Zelle (${s.x},${s.y},${s.z})`);
  }
  return L;
}

/** Wendeltreppe im Turmhohlraum (Bauteil turm_wendeltreppe): Podeste, Stufen, Unterbau, Eingangstür (deklarierte Öffnung). */
function turmtreppe(ctx, S) {
  const P = plan(S.g).turm, TY = pv.TY;
  const w = ctx.part('turm_wendeltreppe');
  for (const u of P.unter) S.putForce(w, u.x, u.y, u.z, u.typ, 'turm_wendeltreppe');
  for (const p of P.podeste) S.putForce(w, p.x, p.y, p.z, p.typ === 'LAMPE' ? TY.licht : p.typ, 'turm_wendeltreppe');
  for (const s of P.stufen) S.putForce(w, s.x, s.y, s.z, s.typ, 'turm_wendeltreppe');
  ctx.oeffnung(P.tuer.map((c) => ({ x: c.x, y: c.y + S.bodenY, z: c.z })), 'tuer');
}

module.exports = { waende, treppe, turmtreppe };
