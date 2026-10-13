'use strict';
// R13 Begehbarkeit (BEGEHBARKEIT.md §3): stehbare Innenzellen müssen von außen erreichbar sein.
// Schalter: project.json "begehbarkeit": "pflicht" -> Fehler; sonst nur Warnungen mit Kennzahlen.
const { laufe, prozent } = require('./begehbarkeit_projekt.js');
const { capped, result } = require('./util.js');

const bbox = (b) => `x ${b.x[0]}..${b.x[1]}, y ${b.y[0]}..${b.y[1]}, z ${b.z[0]}..${b.z[1]}`;
const komma = (v) => String(v).replace('.', ',');

module.exports = function r13(ctx) {
  const typ = ctx.project && ctx.project.type;
  if (ctx.project && typ !== 'wahrzeichen' && typ !== 'quartier') return result('R13', [], [], { total: 0, skipped: true });
  const pflicht = !!(ctx.project && ctx.project.json && ctx.project.json.begehbarkeit === 'pflicht');
  const r = laufe(ctx, 'r13');
  const errors = [], warnings = [];
  let innen = 0, erreicht = 0, freiN = 0, freiUn = 0, offen = 0;
  const probleme = [];
  for (const e of r.einheiten) {
    innen += e.innenZellen; erreicht += e.erreichbar; freiN += e.freiZellen; freiUn += e.freiUnerreichbar;
    const echte = e.komponenten.filter((k) => !k.unzugaenglich);
    offen += echte.length;
    if (echte.length) probleme.push({ e, echte });
  }
  const anteil = prozent(erreicht, innen);
  const bericht = {
    modus: pflicht ? 'pflicht' : 'warnung', einheiten: r.einheiten.length, innenZellen: innen, erreichbar: erreicht, anteil,
    nichtErreichbareKomponenten: offen, offeneFlaechenZellen: freiN, offeneFlaechenUnerreichbar: freiUn,
    projekt: r.einheiten.length === 1 ? r.einheiten[0] : undefined,
    haeuser: r.einheiten.length > 1 ? { gesamt: r.einheiten.length, mitProblemen: probleme.length,
      liste: probleme.slice(0, 80).map(({ e, echte }) => ({ id: e.id, label: e.label, innenZellen: e.innenZellen, erreichbar: e.erreichbar,
        anteil: e.anteil, komponenten: echte })) } : undefined
  };
  const sink = pflicht ? errors : warnings;
  const kopf = pflicht ? 'R13' : 'R13 (Warnung, begehbarkeit nicht auf "pflicht")';
  if (r.einheiten.length === 1) {
    const e = r.einheiten[0];
    for (const k of e.komponenten) {
      if (k.unzugaenglich) continue;
      sink.push(`${kopf} nicht erreichbare Komponente: ${k.zellen} Zellen, ${bbox(k.bbox)}, Boden: ${k.bauteile.map((b) => `${b.part} (${b.zellen})`).join(', ') || '?'}, z. B. ${k.beispiele.join(' ')}`);
    }
  } else {
    for (const { e, echte } of probleme) {
      const k = echte[0];
      sink.push(`${kopf} ${e.label}: ${echte.length} nicht erreichbare Komponente(n), größte ${k.zellen} Zellen (${bbox(k.bbox)}), erreichbar ${komma(e.anteil)} %`);
    }
  }
  warnings.push(`R13 Kennzahl: ${komma(anteil)} % der ${innen} Raumzellen erreichbar (${r.einheiten.length} Einheit(en), ${offen} nicht erreichbare Komponenten ab 20 Zellen; unüberdeckte Flächen unerreichbar: ${freiUn} von ${freiN})`);
  return result('R13', capped(errors), capped(warnings), { total: offen, bericht });
};
