'use strict';
// R14 Dichtheit (BEGEHBARKEIT.md §3, nur Wahrzeichen): Außenluft darf nur durch deklarierte Öffnungen eindringen.
// Prüfung mit der 18er-Nachbarschaft, damit auch Diagonallücken in dünnen Schichten auffallen.
const { laufe } = require('./begehbarkeit_projekt.js');
const { capped, result } = require('./util.js');

module.exports = function r14(ctx) {
  const typ = ctx.project && ctx.project.type;
  if (ctx.project && typ !== 'wahrzeichen') return result('R14', [], [], { total: 0, skipped: true });
  const pflicht = !!(ctx.project && ctx.project.json && ctx.project.json.begehbarkeit === 'pflicht');
  const r = laufe(ctx, 'r14');
  const errors = [], warnings = [];
  const sink = pflicht ? errors : warnings;
  const kopf = pflicht ? 'R14' : 'R14 (Warnung, begehbarkeit nicht auf "pflicht")';
  let luecken = 0, diag = 0, loch = 0, eintritt = 0;
  const nachTeil = new Map();
  for (const e of r.einheiten) {
    luecken += e.cluster.length; diag += e.lueckenDiagonal; loch += e.lueckenLoch; eintritt += e.eintrittsZellen;
    for (const c of e.cluster) {
      const t = (c.bauteile[0] && c.bauteile[0].part) || '?';
      let a = nachTeil.get(t);
      if (!a) nachTeil.set(t, a = { teil: t, luecken: 0, diagonal: 0, zellen: 0, beispiele: [] });
      a.luecken++; a.zellen += c.zellen; if (c.diagonal) a.diagonal++;
      if (a.beispiele.length < 5) a.beispiele.push(c.beispiel + (c.diagonal ? ' (diagonal)' : ''));
    }
  }
  const liste = [...nachTeil.values()].sort((a, b) => b.luecken - a.luecken);
  for (const a of liste) {
    sink.push(`${kopf} Bauteil ${a.teil}: ${a.luecken} Lücke(n) (${a.diagonal} nur diagonal), ${a.zellen} Zellen, z. B. ${a.beispiele.join(' ')}`);
  }
  const bericht = { modus: pflicht ? 'pflicht' : 'warnung', luecken, lueckenLoch: loch, lueckenDiagonal: diag, eintrittsZellen: eintritt,
    maske: r.einheiten.length ? r.einheiten[0].maske : null,
    leckVolumen: r.einheiten.reduce((s, e) => s + e.leckVolumen, 0),
    nachBauteil: liste.slice(0, 60),
    lueckenListe: r.einheiten.flatMap((e) => e.cluster.slice(0, 2000).map((c) => ({ zellen: c.zellen, diagonal: c.diagonal, beispiel: c.beispiel, bbox: c.bbox, bauteile: c.bauteile }))) };
  warnings.push(`R14 Kennzahl: ${luecken} Lücke(n) in der Hülle (${loch} echte Löcher, ${diag} nur diagonal), ${eintritt} Eintrittszellen`);
  return result('R14', capped(errors), capped(warnings), { total: luecken, bericht });
};
