'use strict';
// Modul 9: Decken, Salone dei Cinquecento und Innenwände (Katalog §10).
// K2: Der Turm (turm_unterbau) steht in Modul 4; alle Decken sparen das Turmpolygon aus (Hohlraum y_rel 1..143 leer).
// K3: treppen_michelozzo entfällt. K4: Salone nur außerhalb der Außenwandbänder (d8 > t(y)).
const pv = require('./pv_lib.js');
const raeume = require('./pv_raeume.js');

module.exports = {
  module: 9,
  build(ctx) {
    const S = pv.state(ctx);
    const g = S.g, TY = pv.TY;
    const kein = (r) => r.zone !== 'T';

    // Geschossdecken: Zellen mit d8 > t, ohne Turm; die Salone-Außenrechtecke und die Lochbänder (Modul 6) sind schon belegt
    const decke = (id, y, minD, ohneSalone, ge, ohneSaloneBoden) => {
      const w = ctx.part(id);
      const zellen = g.recs.filter((r) => kein(r) && r.d8 > minD && !(ohneSalone && r.sal));
      // Lampen im Fußboden des darüber liegenden Geschosses: nur auf Zellen, die diese Platte wirklich bekommt
      if (ge) S.plan.lichtFuer(ge, zellen.filter((r) => !S.has(r.x, y, r.z) && !S.carve.has(pv.keyOf(r.x, y + S.bodenY, r.z))));
      S.band(w, ohneSaloneBoden ? zellen.filter((r) => !r.salL) : zellen, y, y, (r) => (S.lampe(r.x, y, r.z) ? TY.licht : TY.pietra_serena), id);   // der Salone bekommt seinen Marmorboden als eigenes Bauteil
    };
    decke('decke_eg', 16, 5, false, 'og1', true);
    decke('decke_og1', 33, 4, true, 'og2');
    decke('decke_og2', 49, 4, true, 'dg');
    decke('decke_dach', 56, 3, true);
    // Dachräume zwischen der Dachplatte (y_rel 56) und der Dachhaut der Walmdächer (Module 7): leer, ohne Ausstellung, im Original nur über
    // Luken erreichbar; sie bleiben im Modell bewusst geschlossen (R13: unzugaenglich)
    {
      const cav = [];
      for (const r of g.recs) {
        if (r.zone === 'T') continue;
        let top = -1;
        for (let y = 75; y >= 57; y--) if (S.has(r.x, y, r.z)) { top = y; break; }
        for (let y = 57; y < top; y++) if (!S.has(r.x, y, r.z)) cav.push({ x: r.x, y: y + S.bodenY, z: r.z });
      }
      ctx.unzugaenglich(cav, 'Dachraum zwischen der Dachplatte und der Dachhaut der Walmdächer: leerer Raum ohne Ausstellung, im Original nur über Luken erreichbar; bleibt im Modell bewusst geschlossen');
    }

    // Salone: Außenrechteck 112 x 52, Lichtmaß 104 x 44, Wände 4 dick y_rel 17..56, Rahmenpfeiler Pietra serena im Abstand 8
    const sw = ctx.part('salone_waende');
    const L = pv.SAL_LICHT;
    const ring = g.recs.filter((r) => r.sal && !r.salL);
    S.band(sw, ring, 17, 56, (r, y) => {
      if (r.d8 <= pv.tWall(y)) return null;                              // K4: die Außenwand gewinnt
      return raeume.saloneWand(r, y);                                    // Pilaster, Schlachtbilder, Damast (pv_raeume.js)
    }, 'salone_waende');

    // Salone-Decke: y_rel 53 als Kassettendecke 8 x 8 (Holzbalken, Fresko-Felder, goldene Rosetten, Mittelbild), y_rel 54..56 massiv
    const sd = ctx.part('salone_decke');
    const licht = g.recs.filter((r) => r.salL);
    S.band(sd, licht, 53, 53, (r, y) => {
      if (r.d8 <= 3) return null;
      return raeume.kassette(r);
    }, 'salone_decke');
    S.band(sd, licht, 54, 56, (r, y) => (r.d8 <= 3 ? null : TY.pietra_serena), 'salone_decke');

    // Ausgestaltung des Salone (pv_raeume.js): Marmorboden, Kassettenbalken
    raeume.saloneBoden(ctx, S);
    raeume.saloneKassettenbalken(ctx, S);
    raeume.udienza(ctx, S);
    raeume.saloneStatuen(ctx, S);
    raeume.hofBrunnen(ctx, S);

    // Trennwände mit Türen (Plan: pv_plan.js) und Treppen aus Treppenblöcken (pv_innen.js)
    const innen = require('./pv_innen.js');
    innen.waende(ctx, S);
    for (const id of ['scalone_vasari', 'treppe_og1_og2', 'treppe_og2_dg', 'treppe_ost_eg_og1', 'treppe_ost_og1_og2', 'treppe_ost_og2_dg',
      'treppe_wehrgang_nord', 'treppe_wehrgang_sued']) innen.treppe(ctx, S, id);
    innen.turmtreppe(ctx, S);
    innen.aussentreppen(ctx, S);
    // Dachluken der Wehrgangtreppen (Luft ab der Dachplatte) sind eine deklarierte Tür-Öffnung ins Freie
    ctx.oeffnung(require('./pv_plan.js').plan(g).luken.map((c) => ({ x: c.x, y: c.y + S.bodenY, z: c.z })), 'tuer');

    // Letzte Stufe: Diagonalrisse der einzelligen Schichten schließen (BEGEHBARKEIT.md 1.4)
    const vb = ctx.part('verbindungsbloecke');
    const nv = require('./pv_risse.js').schliesse(S, vb, 'verbindungsbloecke');
    if (process.env.PV_DEBUG) console.error('PV Verbindungsblöcke:', nv);
    if (process.env.PV_DEBUG) console.error('PV Auslassungen je Bauteil (K0):', JSON.stringify(S.skips));
  }
};
