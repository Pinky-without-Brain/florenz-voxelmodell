'use strict';
// Ausstattung des Forte di Belvedere (Modul 7): Medici-Wappen über dem Tor, Uhr an der Nordfassade der Palazzina, Brunnenkranz des
// Schachtbrunnens in der Halle der Palazzina. Inhalte nach it.wikipedia „Forte Belvedere“; Lage und Farben Stufe C.
const TEILE = ['torwappen', 'uhr', 'pozzo'];

function ausstatten(api) {
  const { P, D, T, FR, Y } = api;
  const PZ = require('./_fb_pal.js');
  // ---- Medici-Wappen: Schild (5 × 2) auf der Außenlage der Brüstung über dem Tor, Lage 6..7 (goldener Rand, rote Kugeln)
  const tor = D.tor;
  for (const c of D.alle) {
    if (c.zone !== 'wall' || c.d8 !== 2 || Math.abs(c.x - tor.x0) > 2 || !tor.zellen.has(c.x + ',' + c.z)) continue;
    for (let yr = 6; yr <= 7; yr++) {
      const rand = Math.abs(c.x - tor.x0) === 2 || yr === 7;
      P.ersetze(c.x, Y(yr), c.z, rand ? T.gold : (Math.abs(c.x - tor.x0) % 2 === 0 ? FR('rot') : FR('weiss')), 'torwappen');
    }
  }
  // ---- Uhr: Zifferblatt (Durchmesser 5) auf der Nordfassade der Palazzina, Außenlage, Mitte u 17
  for (const c of D.alle) {
    if (!c.pal || c.dP !== 1) continue;
    const e = D.palMaske.naechsteKante(c.x, c.z);
    if (e !== 7) continue;
    const ue = D.palMaske.kanten()[e].rahmen.toLocal(c.x, c.z).u;
    for (let yr = 11; yr <= 15; yr++) {
      const d = Math.hypot(ue - 17, yr - 13);
      if (d > 2.6) continue;
      P.ersetze(c.x, Y(yr), c.z, d > 1.9 ? T.gold : (Math.abs(ue - 17) < 0.5 || Math.abs(yr - 13) < 0.5 ? T.kontrast : T.weiss), 'uhr');
    }
  }
  // ---- Schachtbrunnen: Kranz 3 × 3 (eine Lage hoch) mit Bronzedeckel in der Mitte der Halle
  const hall = D.alle.filter((c) => c.pal && PZ.raumId(c) === 'H' && c.dP > 6).sort((a, b) => Math.hypot(a.pu - 34, a.pw - 38) - Math.hypot(b.pu - 34, b.pw - 38))[0];
  for (const c of D.alle) {
    if (!c.pal || Math.abs(c.x - hall.x) > 1 || Math.abs(c.z - hall.z) > 1 || P.hat(c.x, Y(1), c.z)) continue;
    P.set(c.x, Y(1), c.z, c.x === hall.x && c.z === hall.z ? T.bronze : T.forte, 'pozzo');
  }
}

const VER = 'Vereinfachte Ausstattung, Lage und Farben Stufe C.';
const Q = '(Quelle: it.wikipedia, Forte Belvedere)';
const INHALT = {
  torwappen: { title: 'Wappen der Medici über dem Tor', description: 'Ein goldgerahmtes Schild (5 × 2 Blöcke) in der Brüstung über dem Tor, mit roten und weißen Feldern.', tip: 'Die Felder ersetzen Brüstungsblöcke auf Lage 6 und 7.', caution: VER + ' Die Kugeln des Medici-Wappens sind nicht nachgebildet, nur die Farben deuten sie an.', fact: 'Das Portal auf der Ostseite zwischen zwei Bastionen der Kurtine trägt ein Wappen der Medici ' + Q + '.' },
  uhr: { title: 'Uhr der Palazzina', description: 'Ein rundes Zifferblatt (5 Blöcke) mit goldenem Rand und dunklen Zeigerachsen an der Nordfassade der Palazzina.', tip: 'Die Felder ersetzen Wandblöcke der Außenlage.', caution: VER + ' Die Zeigerstellung ist nicht dargestellt.', fact: 'Die Uhr an der Nordfassade der Palazzina ist ein Zusatz des 18. Jahrhunderts ' + Q + '.' },
  pozzo: { title: 'Schachtbrunnen', description: 'Ein Kranz aus Pietra forte (3 × 3 Blöcke, eine Lage hoch) mit einem Bronzedeckel in der Mitte der Halle der Palazzina.', tip: 'Eine Lage hoch, man kann darüber steigen.', caution: VER + ' Die Lage im Haus und die Tiefe des Schachts sind nicht überliefert; die Schatzkammer darunter ist nicht gebaut.', fact: 'Von der Palazzina aus führt ein in den Fels gegrabener Brunnenschacht zu einer Schatzkammer ' + Q + '.' }
};

module.exports = { ausstatten, TEILE, INHALT };
