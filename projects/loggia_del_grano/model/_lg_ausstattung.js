'use strict';
// Ausstattung der Loggia del Grano (Modul 6): Wappen an der Rückwand der Halle, Gedenktafeln, Getreidebänke und Staio in der Halle,
// Bühne und Sitzreihen des Theaters im Obergeschoss. Inhalte nach it.wikipedia „Loggia del Grano“; Lage und Farben Stufe C.
const TEILE = ['wappen', 'tafeln', 'getreidebaenke', 'staio', 'buehne', 'sitzreihen'];

function ausstatten(api) {
  const { P, D, T, FR, Y } = api;
  const LG = require('./_lg.js');
  const tr = LG.treppenplan();
  const frei = (c, zs) => c.d8 > LG.WAND + 1 && !zs.has(c.x + ',' + c.z);
  const sperreHalle = new Set([...tr.a.zs, ...tr.b.zs]);

  // ---- Wappen: fünf Schilde (3 × 4) auf der inneren Lage der Rückwand, Lage 3..6
  const farben = [['rot', 'weiss'], ['weiss', 'rot'], ['weiss', 'rot'], ['gelb', 'braun'], ['rot', 'schwarz']];
  for (const c of D.alle) {
    if (c.e !== 3 || c.d8 !== LG.WAND) continue;
    farben.forEach(([f1, f2], i) => {
      const du = c.ue - (6.5 + 6.5 * i);
      if (Math.abs(du) > 1.6) return;
      for (let yr = 3; yr <= 6; yr++) {
        const rand = Math.abs(du) > 1.1 || yr === 3 || yr === 6;
        P.ersetze(c.x, Y(yr), c.z, rand ? T.gold : (yr === 4 ? FR(f1) : FR(f2)), 'wappen');
      }
    });
  }
  // ---- Gedenktafeln: zwei Marmortafeln (4 × 2) zwischen den Schilden, Lage 8..9
  for (const c of D.alle) {
    if (c.e !== 3 || c.d8 !== LG.WAND) continue;
    for (const ue of [13, 26]) {
      if (Math.abs(c.ue - ue) > 2) continue;
      for (let yr = 8; yr <= 9; yr++) P.ersetze(c.x, Y(yr), c.z, Math.abs(c.ue - ue) > 1.5 ? T.gold : T.weiss, 'tafeln');
    }
  }
  // ---- Getreidebänke: drei Verkaufstische (4 × 1) in der Halle, eine Lage hoch; Staio (Messgefäß, 2 × 2) in der Mitte
  for (const [u, w] of [[10, 9], [28, 9], [28, 19]]) {
    for (const c of D.alle) {
      if (!frei(c, sperreHalle) || Math.abs(c.u - u) > 2 || Math.abs(c.w - w) > 0.55 || P.hat(c.x, Y(1), c.z)) continue;
      P.set(c.x, Y(1), c.z, T.holz, 'getreidebaenke');
    }
  }
  const kand = D.alle.filter((c) => frei(c, sperreHalle)).sort((p, q) => Math.hypot(p.u - 19, p.w - 14) - Math.hypot(q.u - 19, q.w - 14));
  const m = kand[0];
  for (const c of D.alle) {
    if (!frei(c, sperreHalle) || Math.abs(c.x - m.x) > 1 || Math.abs(c.z - m.z) > 1 || P.hat(c.x, Y(1), c.z)) continue;
    P.set(c.x, Y(1), c.z, T.bronze, 'staio');
  }
  // ---- Theater im Obergeschoss: Bühne (eine Lage hoch) an der Rückwand, Sitzreihen davor
  for (const c of D.alle) {
    if (!frei(c, tr.b.zs) || c.w < 20.5 || P.hat(c.x, Y(LG.F_OG + 1), c.z)) continue;
    P.set(c.x, Y(LG.F_OG + 1), c.z, T.holz, 'buehne');
  }
  for (const w of [5, 8, 11, 14]) {
    for (const c of D.alle) {
      if (!frei(c, tr.b.zs) || Math.abs(c.w - w) > 0.55 || c.u < 8 || c.u > 30 || Math.abs(c.u - 19) < 1.6 || P.hat(c.x, Y(LG.F_OG + 1), c.z)) continue;
      P.set(c.x, Y(LG.F_OG + 1), c.z, T.holz, 'sitzreihen');
    }
  }
}

const VER = 'Vereinfachte Ausstattung, Lage und Farben Stufe C.';
const Q = '(Quelle: it.wikipedia, Loggia del Grano)';
const INHALT = {
  wappen: { title: 'Wappen der Rückwand', description: 'Fünf goldgerahmte Schilde (3 × 4 Blöcke) in der Rückwand der Halle: Popolo, Stadt, Parte Guelfa, Staio und die Türme der Capitani di Torre.', tip: 'Die Felder ersetzen Wandblöcke der inneren Lage.', caution: VER + ' Die Wappenbilder sind nicht nachgebildet, nur die Farbwahl deutet sie an.', fact: 'An der Rückwand des Loggiatos hängen die Wappen des Popolo, der Stadt und der Parte Guelfa sowie das Zeichen des Staio und zwei Türme der Capitani di Torre ' + Q + '.' },
  tafeln: { title: 'Gedenktafeln', description: 'Zwei weiße Marmortafeln mit Goldrand (4 × 2 Blöcke) zwischen den Schilden.', tip: 'Zwei Lagen hoch.', caution: VER + ' Der Text ist nicht dargestellt.', fact: 'Zwei Gedenktafeln zeigen die Wappen der Capitani di Torre sowie Lilie, Volkskreuz, Guelfenadler und Staio ' + Q + '.' },
  getreidebaenke: { title: 'Getreidebänke', description: 'Drei Verkaufstische aus Holz (4 × 1 Blöcke, eine Lage hoch) in der Halle.', tip: 'Einfach aufsetzen, sie stehen frei.', caution: VER + ' Die Einrichtung des Marktes ist nicht überliefert.', fact: 'Die Loggia war ein Getreidemarkt und Speicher ' + Q + '.' },
  staio: { title: 'Staio', description: 'Ein Messgefäß aus Bronze (3 × 3 Blöcke, eine Lage hoch) in der Mitte der Halle erinnert an das Getreidemaß der Stadt.', tip: 'Eine Lage hoch, man steigt darüber.', caution: VER + ' Das Gefäß ist als Block dargestellt; seine Lage ist erfunden.', fact: 'Der Staio steht als Zeichen in den Wappen der Rückwand ' + Q + '.' },
  buehne: { title: 'Bühne', description: 'Im Obergeschoss steht an der Rückwand eine Holzbühne (eine Lage hoch).', tip: 'Eine Lage hoch, begehbar.', caution: VER + ' Eine Bühnenmaschinerie ist nicht dargestellt.', fact: 'Das 1868 aufgestockte Obergeschoss diente als Teatro della Loggia, später Teatro Salvini ' + Q + '.' },
  sitzreihen: { title: 'Sitzreihen', description: 'Vier Reihen Holzbänke (eine Lage hoch) mit einem Mittelgang im Obergeschoss.', tip: 'Zwischen den Reihen sind Gänge frei.', caution: VER + ' Die Zahl der Reihen ist Stufe C.', fact: 'Das Obergeschoss war ein Theater, später ein Kino (Ex-Cinema Capitol) ' + Q + '.' }
};

module.exports = { ausstatten, TEILE, INHALT };
