'use strict';
// Straßenschilder an Eckhäusern (wie die Marmortafeln in Florenz): Jedes Haus, das an zwei oder mehr benannte Straßen
// oder Plätze grenzt, bekommt je Name ein Wandschild an der Fassade dieser Straße, so nah an der Ecke wie möglich,
// 3,5 m (7 Blöcke) über der Straße. Das Schild sitzt in der Straßenzelle vor einer massiven Wandzelle und zeigt von der
// Wand weg. Der Text (Großbuchstaben, umbrochen auf höchstens 4 Zeilen zu 15 Zeichen) wird mitgeführt; der
// Minecraft-Export schreibt ihn als Block-Entity, der Block selbst ist palette.schild(richtung).

const { schild } = require('../spec/palette.js');

const N4 = [[1, 0, 'o'], [-1, 0, 'w'], [0, 1, 's'], [0, -1, 'n']];
const HOEHE = 7, HOEHE_MIN = 5, HOEHE_MAX = 9, MAX_PRO_HAUS = 3, SUCHE = 4;

/** Text für ein Schild: Großbuchstaben, Wortumbruch auf Zeilen ≤ 15 Zeichen, höchstens 4 Zeilen. */
function schildText(name) {
  const worte = String(name).toUpperCase().split(/\s+/).filter(Boolean);
  const zeilen = [];
  for (const w of worte) {
    const l = zeilen.length ? zeilen[zeilen.length - 1] : null;
    if (l !== null && (l + ' ' + w).length <= 15) zeilen[zeilen.length - 1] = l + ' ' + w;
    else zeilen.push(w);
  }
  return zeilen.slice(0, 4).join('\n');
}

/**
 * schilderFuerHaus({ id, cells, boden }, { umfeld, groundTopY, hat(x,y,z), beanspruche(x,y,z,id), frei?(x,z) })
 * frei(x, z): Spalte gehört keinem Gebäude (sonst kein Schild dort und keine Namenssuche darüber hinaus).
 * -> [{ x, y, z, typ, richtung, name, text }]. hat = Zelle im Grid belegt (Wand), beanspruche reserviert die Schildzelle.
 */
function schilderFuerHaus(plan, env) {
  const S = new Set(plan.cells.map(([x, z]) => x + ',' + z));
  const jeName = new Map(); // name -> [{ cx, cz, ox, oz, richtung }]
  for (const [x, z] of plan.cells) {
    for (const [dx, dz, richtung] of N4) {
      const ox = x + dx, oz = z + dz;
      if (S.has(ox + ',' + oz)) continue;
      if (env.frei && !env.frei(ox, oz)) continue;                         // Nachbarhaus, keine Straße
      // Name der Straße: in der Nachbarzelle oder bis SUCHE Zellen weiter vor der Fassade (Gehweg, Straßenrand)
      let name = null;
      for (let k = 0; k <= SUCHE && !name; k++) {
        const sx = ox + dx * k, sz = oz + dz * k;
        if (k > 0 && env.frei && !env.frei(sx, sz)) break;
        name = env.umfeld.nameBei(sx, sz);
      }
      if (!name) continue;
      if (!jeName.has(name)) jeName.set(name, []);
      jeName.get(name).push({ cx: x, cz: z, ox, oz, richtung });
    }
  }
  if (jeName.size < 2) return [];
  const namen = [...jeName.keys()].sort((a, b) => jeName.get(b).length - jeName.get(a).length || (a < b ? -1 : 1)).slice(0, MAX_PRO_HAUS);
  const out = [];
  for (const name of namen) {
    const eigene = jeName.get(name);
    const andere = namen.filter((n) => n !== name).flatMap((n) => jeName.get(n));
    // Nähe zur Ecke: kleinster Abstand zu einer Randzelle eines anderen Namens
    const ecke = (k) => Math.min(...andere.map((a) => Math.abs(a.ox - k.ox) + Math.abs(a.oz - k.oz)));
    const kand = eigene.map((k) => ({ ...k, d: ecke(k) })).sort((a, b) => a.d - b.d || a.ox - b.ox || a.oz - b.oz).slice(0, 16);
    let gesetzt = null;
    for (const k of kand) {
      const t = env.groundTopY(k.ox, k.oz);
      for (const h of [HOEHE, HOEHE + 1, HOEHE - 1, HOEHE_MAX, HOEHE_MIN]) {
        const y = Math.max(t, plan.boden) + h;
        if (!env.hat(k.cx, y, k.cz) || env.hat(k.ox, y, k.oz)) continue;          // massive Wand dahinter, Luft davor
        if (out.some((o) => o.x === k.ox && o.y === y && o.z === k.oz)) continue;
        if (!env.beanspruche(k.ox, y, k.oz, plan.id)) continue;
        gesetzt = { x: k.ox, y, z: k.oz, typ: schild(k.richtung), richtung: k.richtung, name, text: schildText(name) };
        break;
      }
      if (gesetzt) break;
    }
    if (gesetzt) out.push(gesetzt);
  }
  return out;
}

module.exports = { schilderFuerHaus, schildText };
