'use strict';
// Modul 7: Decken der Obergeschosse, Treppe aus Treppenblöcken und Laternen (Katalog §8, B3).
// K0: Decken lassen die Treppe aus; decke_og2 (Lage 74) nur d >= 4 (der Wandring d <= 3 gehört dem Kranzgesims).
// Treppe (lib/om.js: lane): ein gerader Lauf, 2 breit, entlang der Südwand nach Osten; Lauf 1 in der Mauerstärke vom
// Erdgeschoss zum 1. OG, Lauf 2 im Saal des 1. OG zum 2. OG. Die Stufen sind Treppenblöcke (Pietra serena) auf einer
// Unterfütterung aus Pietra forte; über jeder Stufe bleiben 3 Blöcke Luft.
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const O = require('../lib/om.js');

module.exports = {
  module: 7,
  build(ctx) {
    const L = O.lade();
    const serena = WZ.typ('pietra_serena'), forte = WZ.typ('pietra_forte'), licht = WZ.typ('licht');
    const innen = L.zellen.filter((c) => c.d >= 4);
    const lane = O.lane();
    const inLane = (c) => lane.karte.has(O.K(c.x, c.z));

    // Laternen in den Decken (Lichtraster, Abstand 9, Einbau in die Deckenplatte), nicht über der Treppe
    const stand = (yr) => innen.filter((c) => !inLane(c)).map((c) => [c.x, O.Y(yr), c.z]);
    const l1 = WZ.licht.lichtRaster(stand(27), { abstand: 9, hoehe: 24 });
    const l2 = WZ.licht.lichtRaster(stand(52), { abstand: 9, hoehe: 22 });
    const l1k = new Set(l1.map((q) => O.K(q.x, q.z))), l2k = new Set(l2.map((q) => O.K(q.x, q.z)));

    // 1. Decke Lage 51 (ohne Treppe, ohne Lampenplätze)
    ctx.part('decke_og1').fill(innen.filter((c) => !O.laneZelle(c.x, c.z, 51) && !l1k.has(O.K(c.x, c.z))).map((c) => ({ x: c.x, y: O.Y(51), z: c.z })), serena);
    // 2. Decke Lage 74
    ctx.part('decke_og2').fill(innen.filter((c) => !l2k.has(O.K(c.x, c.z))).map((c) => ({ x: c.x, y: O.Y(74), z: c.z })), serena);

    // 3. Treppe
    const st = [];
    const sttyp = PAL.treppe('pietra_serena', 'o');
    for (const [key, e] of lane.karte) {
      const [x, z] = key.split(',').map(Number);
      for (let yr = 1; yr <= 56; yr++) {
        const r = O.laneZelle(x, z, yr);
        if (r === 'stufe') st.push({ x, y: O.Y(yr), z, m: sttyp });
        else if (r === 'fuellung') st.push({ x, y: O.Y(yr), z, m: forte });
        else if (r === 'lampe') st.push({ x, y: O.Y(yr), z, m: licht });
      }
    }
    const stMap = new Map(st.map((b) => [`${b.x},${b.y},${b.z}`, b.m]));
    ctx.part('treppe').fill(st, (x, y, z) => stMap.get(`${x},${y},${z}`));

    // 4. Laternen der Obergeschosse (anstelle von Deckenplatten)
    ctx.part('laternen_obergeschosse').fill(
      l1.map((q) => ({ x: q.x, y: O.Y(51), z: q.z })).concat(l2.map((q) => ({ x: q.x, y: O.Y(74), z: q.z }))), licht);

    // Dachboden zwischen Decke und Dach: leerer Dachraum ohne Ausstellung, bleibt bewusst geschlossen
    const dachraum = [];
    for (const c of innen) for (let yr = 75; yr <= 77; yr++) dachraum.push({ x: c.x, y: O.Y(yr), z: c.z });
    ctx.unzugaenglich(dachraum, 'Dachboden unter dem flachen Walmdach: leerer Dachraum ohne Bedeutung, im Original nur über Luken erreichbar; bleibt im Modell bewusst geschlossen');
  }
};
