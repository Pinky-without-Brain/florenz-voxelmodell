'use strict';
// Ausstattung der Torre degli Alberti (Modul 5): Café delle Colonnine im Erdgeschoss, Albertiketten an den Kapitellen der
// Loggetta, zugemauerte Tür an der Südseite. Inhalte nach it.wikipedia „Torre degli Alberti“; Lage und Farben Stufe C.
const TEILE = ['cafe_tresen', 'cafe_tische', 'colonnine', 'kapitelle', 'porta_murata'];

function ausstatten(api) {
  const { P, D, T, FR, Y } = api;
  const TA = require('./_ta.js');
  const pl = TA.treppenplaetze(D);
  // Bereich um die Treppen und den Eingang bleibt frei (R13)
  const gesperrt = (c) => {
    if (pl.some((p) => Math.abs(c.x - p.x) <= 2 && c.z >= p.z - 2 && c.z <= p.z + 10)) return true;
    return c.e === 3 && false;
  };
  const tuerWeg = (c) => c.u >= 8.5 && c.u <= 16 && c.w > -10;
  const ok = (c) => c.d8 > TA.WAND + 1 && !gesperrt(c) && !tuerWeg(c);

  // ---- Colonnine: vier Säulen im Café (Lage 1..6, tragen die Decke), Weltzellen der Turmmitte
  const im = (x, z) => { const c = D.byKey.get(x + ',' + z); return c && ok(c); };
  for (const [x, z] of [[476, 1140], [478, 1140], [476, 1148], [478, 1148]]) {
    if (!im(x, z)) continue;
    for (let yr = 1; yr <= 6; yr++) P.set(x, Y(yr), z, T.saeule, 'colonnine');
  }
  // ---- Tresen: sieben Blöcke lang, eine Lage hoch, an der Nordwand
  for (let x = 475; x <= 481; x++) if (im(x, 1138)) P.set(x, Y(1), 1138, T.holz, 'cafe_tresen');
  // ---- Tische: 2 × 2, eine Lage hoch
  for (const [x0, z0] of [[477, 1142], [477, 1145], [478, 1143]]) {
    if (x0 === 478) continue;
    for (const dx of [0, 1]) for (const dz of [0, 1]) if (im(x0 + dx, z0 + dz) && !P.hat(x0 + dx, Y(1), z0 + dz)) P.set(x0 + dx, Y(1), z0 + dz, T.holz, 'cafe_tische');
  }
  // ---- Albertiketten: goldene Kettenglieder an den Kapitellen (Lage 33) der Loggetta-Pfeiler
  for (const c of D.alle) {
    const j = TA.loggiaJoch(c);
    if (!j || !j.pfeiler || c.d8 !== 1) continue;
    P.ersetze(c.x, Y(33), c.z, T.gold, 'kapitelle');
  }
  // ---- Zugemauerte Tür (Borgo Santa Croce): Rundbogenumriss in Pietra serena auf der Außenlage, Südkante bei u 19..22
  for (const c of D.alle) {
    if (c.e !== 3 || c.d8 !== 1) continue;
    const du = c.u - 20.5;
    if (Math.abs(du) > 1.8) continue;
    for (let yr = 1; yr <= 5; yr++) {
      const rand = Math.abs(du) > 1.1 || yr === 5 || (yr === 4 && Math.abs(du) > 0.3);
      if (rand) P.ersetze(c.x, Y(yr), c.z, T.serena, 'porta_murata');
    }
  }
}

const VER = 'Vereinfachte Ausstattung, Lage und Farben Stufe C.';
const Q = '(Quelle: it.wikipedia, Torre degli Alberti)';
const INHALT = {
  cafe_tresen: { title: 'Tresen des Cafés', description: 'Ein Holztresen, acht Blöcke lang und eine Lage hoch, im Erdgeschoss des Turms.', tip: 'Einfach aufsetzen, er steht frei.', caution: VER + ' Die Einrichtung des heutigen Lokals ist nicht überliefert.', fact: 'Im Erdgeschoss war das Caffè delle Colonnine, heute ein anderes Lokal ' + Q + '.' },
  cafe_tische: { title: 'Tische des Cafés', description: 'Vier Holztische (2 × 2 Blöcke, eine Lage hoch) im Erdgeschoss.', tip: 'Eine Lage hoch, man kann sie überspringen.', caution: VER, fact: 'Das Erdgeschoss diente als öffentliches Lokal ' + Q + '.' },
  colonnine: { title: 'Colonnine', description: 'Vier schlanke Marmorsäulen (1 × 1, sechs Lagen) tragen die Decke des Erdgeschosses.', tip: 'Von Lage 1 bis 6 stapeln.', caution: VER + ' Zahl und Lage der Säulchen sind nicht überliefert; der Name des Cafés gab den Anlass.', fact: 'Das Café trug den Namen Caffè delle Colonnine ' + Q + '.' },
  kapitelle: { title: 'Kapitelle mit Albertiketten', description: 'Goldene Blöcke an den Kapitellen der Loggetta-Pfeiler erinnern an die Ketten im Wappen der Alberti.', tip: 'Sie ersetzen je einen Pfeilerblock auf Lage 33.', caution: VER + ' Das Wappen ist nicht nachgebildet.', fact: 'Die Kapitelle der Loggetta tragen das Wappen der Alberti mit Ketten ' + Q + '.' },
  porta_murata: { title: 'Zugemauerte Tür', description: 'Ein Rundbogenumriss aus Pietra serena auf der Außenseite zum Borgo Santa Croce; die Tür selbst ist zugemauert.', tip: 'Nur die Umrisslinie wird ersetzt, die Wand dahinter bleibt.', caution: VER + ' Die genaue Lage am Borgo ist Stufe C.', fact: 'Die alte Eingangstür ist auf der Seite des Borgo Santa Croce zugemauert ' + Q + '.' }
};

module.exports = { ausstatten, TEILE, INHALT };
