'use strict';
// Modul 3: 1. Obergeschoss (Katalog §4). Wand d <= 3, y_rel 27..51, bündig mit den Pfeilerflächen.
// Entscheidungen: Fenster-Außenmaß 7 breit; Rahmen (1) in der Außenlage d = 1 auf a = +-3 und den Zeilen y 33/44, Lichten
// je 2 breit (a +-1..2), Mittelstütze a = 0 über die volle Dicke, Glas in d = 2 (Katalogmaße a -3..-2 ließen keinen Rahmen zu).
// Lage 50..51 sind Gesims (Pietra serena); die Decke y 51 (d >= 4) gehört Modul 7. Der Durchgang zum Verbindungsbogen
// (Katalog §9) wird nur geschnitten, wenn Modul 8 existiert; das Fenster darüber (Rahmenzeile y 33) gewinnt (K0), der Durchgang ist dort 6 hoch.
const WZ = require('../../../tools/wahrzeichen');
const O = require('../lib/om.js');

const FY0 = 33, FY1 = 44, WAPPEN_Y0 = 46, WAPPEN_Y1 = 47;

module.exports = {
  module: 3,
  build(ctx) {
    const L = O.lade();
    const forte = WZ.typ('pietra_forte'), serena = WZ.typ('pietra_serena'), weiss = WZ.typ('marmor_weiss'), glas = WZ.typ('glas_fenster');
    const m8 = O.hatModul8();
    const wand = L.zellen.filter((c) => c.d <= 3);
    const frei = (c, yr) => O.fensterInhalt(c, yr, FY0, FY1) !== null || O.wappenIdx(c, yr, WAPPEN_Y0, WAPPEN_Y1) >= 0;
    const durchbruch = (c, yr) => m8 && (O.durchgang(c, yr) || O.laibung(c, yr));   // Laibung baut Modul 8 (pontile_tuer)
    const marca = (c, yr) => yr === 27 && c.d === 1;

    // 1. Wand
    const w1 = [];
    for (let yr = 27; yr <= 51; yr++) {
      for (const c of wand) {
        if (yr === 51 && c.d > 3) continue;
        if (frei(c, yr) || durchbruch(c, yr) || marca(c, yr)) continue;
        w1.push({ x: c.x, y: O.Y(yr), z: c.z, yr });
      }
    }
    ctx.part('og1_wand').fill(w1, (x, y) => (y - O.BODEN_Y >= 50 ? serena : forte));

    // 2. Biforien
    const bi = [];
    for (let yr = FY0; yr <= FY1; yr++) {
      for (const c of wand) {
        const t = O.fensterInhalt(c, yr, FY0, FY1);
        if (t === 'weiss' || t === 'glas') bi.push({ x: c.x, y: O.Y(yr), z: c.z, t });
      }
    }
    const biMap = new Map(bi.map((b) => [`${b.x},${b.y},${b.z}`, b.t]));
    ctx.part('og1_biforien').fill(bi, (x, y, z) => (biMap.get(`${x},${y},${z}`) === 'glas' ? glas : weiss));

    // Fensternischen vor dem Glas (Außenlage d = 1): offene Fenster (B3, R14)
    const nischen1 = [];
    for (let yr = FY0; yr <= FY1; yr++) for (const c of wand) if (c.d === 1 && O.fensterInhalt(c, yr, FY0, FY1) === 'luft') nischen1.push({ x: c.x, y: O.Y(yr), z: c.z });
    ctx.oeffnung(nischen1, 'fenster_offen');

    // 3. Wappen (2 x 2, a -1..0, d = 1), Farben abwechselnd rot, weiß, blau, gelb
    const wp = [];
    for (let yr = WAPPEN_Y0; yr <= WAPPEN_Y1; yr++) {
      for (const c of wand) {
        const i = O.wappenIdx(c, yr, WAPPEN_Y0, WAPPEN_Y1);
        if (i >= 0) wp.push({ x: c.x, y: O.Y(yr), z: c.z, i });
      }
    }
    const wpMap = new Map(wp.map((b) => [`${b.x},${b.y},${b.z}`, b.i]));
    ctx.part('og1_wappen').fill(wp, (x, y, z) => WZ.fresko(O.FARBEN[wpMap.get(`${x},${y},${z}`) % 4]));

    // 4. Fußgesims (Marcapiano) auf Lage 27, Außenlage d = 1
    ctx.part('og1_marcapiano').fill(wand.filter((c) => c.d === 1 && !durchbruch(c, 27)).map((c) => ({ x: c.x, y: O.Y(27), z: c.z })), weiss);
  }
};
