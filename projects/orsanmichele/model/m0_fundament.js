'use strict';
// Modul 0: Fundament und Boden (Katalog §1). Rollen statt Blocktypen; alle Zellen aus der OSM-Maske M_OM.
const WZ = require('../../../tools/wahrzeichen');
const O = require('../lib/om.js');
const PAL = require('../../../tools/spec/palette.js');

module.exports = {
  module: 0,
  build(ctx) {
    const L = O.lade();
    const pflaster = WZ.typ('pflaster'), serena = WZ.typ('pietra_serena');
    const bruch = WZ.typ('pietra_forte_bruch'), mauer = WZ.typ('mauerwerk');

    // 1. Fundament: Zellen mit groundTopY < 67 (Terrain bis Y 67, Bau ab Y 68)
    const fund = WZ.fundamentZellen(L.H, O.BODEN_Y).map(([x, y, z]) => ({ x, y, z }));
    // (hier liegt das Gelände überall auf Y 67 oder höher: der Bauteil bleibt leer und wird dann nicht registriert)
    if (fund.length) ctx.part('fundament').fill(fund, bruch);

    // 2. Bodenplatte Y 68; Innenraum d >= 7: Raster 3 x 3 abwechselnd Pflaster / Pietra serena
    // (Raster in lokalen Zellen ui, wi; gerade Summe der Rasterindizes = Pflaster)
    const platte = L.zellen.filter((c) => !O.tuerStufe(c)).map((c) => ({ x: c.x, y: O.Y(0), z: c.z, c }));
    ctx.part('bodenplatte').fill(platte, (x, y, z) => {
      const c = O.zelle(x, z);
      if (c.d < 7) return pflaster;
      const iu = Math.floor((c.ui + 99) / 3), iw = Math.floor((c.wi + 99) / 3);
      return (iu + iw) % 2 === 0 ? pflaster : serena;
    });

    // 2b. Eingangsstufen vor Nord- und Osttür (B3): Treppenblöcke aus Pietra serena auf Lage 0, Aufstieg in die Kirche
    const stufen = L.zellen.filter((c) => O.tuerStufe(c)).map((c) => ({ x: c.x, y: O.Y(0), z: c.z, c }));
    ctx.part('eingangsstufen').fill(stufen, (x, y, z) => PAL.treppe('pietra_serena', O.tuerStufe(O.zelle(x, z))));

    // 3. Sockelstufe Lage 1..2: Pfeiler d <= 2 (Pietra serena, 6 breit). Ergänzung gegenüber dem Katalog: der Pfeilerkern
    // (d 3..6) wird mit Mauerwerk unterfüttert, sonst stünde der Pfeiler über einer Höhlung. Der Fuß der Füllwände
    // (Lage 1..2) gehört zu Modul 2 (fuellwand_sockel), die Rücksprünge der Bogenfelder (d <= 2) bleiben offen.
    const sockel = [];
    for (let yr = 1; yr <= 2; yr++) {
      for (const c of L.zellen) {
        const r = O.ring(c);
        if (!r || r.typ === 'feld' || O.laneZelle(c.x, c.z, yr)) continue;
        sockel.push({ x: c.x, y: O.Y(yr), z: c.z });
      }
    }
    ctx.part('sockel_stufe').fill(sockel, (x, y, z) => (O.zelle(x, z).d <= 2 ? serena : mauer));
  }
};
