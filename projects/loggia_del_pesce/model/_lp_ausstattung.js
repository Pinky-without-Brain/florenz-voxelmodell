'use strict';
// Schmuck und Ausstattung der Loggia del Pesce (Modul 2 und 5): Tondi mit Fischen in den Zwickeln, Eckwappen, Kartusche,
// Inschriftentafel, steinerne Marktbänke. Inhalte nach it.wikipedia „Loggia del Pesce“; Lage und Farben Stufe C.
const TEILE = ['stemmen', 'kartusche', 'inschrift', 'marktbaenke'];
const TEILE_ZWICKEL = ['tondi'];

function ausstatten(api) {
  const { P, D, T, FR, Y, hash } = api;
  const LP = require('./_lp.js');
  const { B, N_BOEGEN, L_LANG, W_QUER, KAEMPFER } = LP;
  // ---- Tondi mit Fischen: je Langseite acht in den Zwickeln über den Pfeilern (3 × 3, Rand Terrakotta, Mitte als Fisch)
  for (const c of D.alle) {
    if (c.zone !== 'lang' || c.d8 !== 1) continue;
    for (let k = 1; k < N_BOEGEN; k++) {
      const du = c.u - k * B;
      if (Math.abs(du) > 1.6) continue;
      for (let yr = 7; yr <= 9; yr++) {
        const dj = yr - 8;
        const rand = Math.abs(du) > 1.1 || Math.abs(dj) > 0;
        const fisch = Math.abs(dj) === 0 && Math.abs(du) <= 0.6;
        P.ersetze(c.x, Y(yr), c.z, fisch ? T.weiss : rand ? T.terrakotta : T.terrakotta, 'tondi');
      }
    }
  }
  // ---- Eckwappen (vier Stück): Schild 3 × 4 an den Ecken der Langseiten, Lage 5..8
  const ecken = [[1.6, 'lang'], [L_LANG - 1.6, 'lang']];
  for (const c of D.alle) {
    if (c.zone !== 'lang' || c.d8 !== 1) continue;
    for (const [ue] of ecken) {
      const du = c.u - ue;
      if (Math.abs(du) > 1.6) continue;
      for (let yr = 5; yr <= 9; yr++) {
        const jj = yr - 5, rand = Math.abs(du) > 1.0 || jj === 0 || jj === 4;
        P.ersetze(c.x, Y(yr), c.z, rand ? T.gold : (jj === 2 && Math.abs(du) < 0.6 ? FR('weiss') : FR('rot')), 'stemmen');
      }
    }
  }
  // ---- Kartusche mit der großherzoglichen Widmung: Mitte der Nordlangseite über dem fünften Bogen
  for (const c of D.alle) {
    if (c.zone !== 'lang' || c.d8 !== 1 || c.w > W_QUER / 2) continue;
    const du = c.u - L_LANG / 2;
    if (Math.abs(du) > 3.2) continue;
    for (let yr = 8; yr <= 9; yr++) P.ersetze(c.x, Y(yr), c.z, Math.abs(du) > 2.4 || yr === 8 && Math.abs(du) > 2.2 ? T.gold : FR('weiss'), 'kartusche');
  }
  // ---- Inschriftentafel (MDLXVIII): Südseite, Außenfläche der Ostschmalseite über dem Bogen
  for (const c of D.alle) {
    if (c.zone !== 'kurz' || c.d8 !== 1 || c.u < L_LANG / 2) continue;
    const dw = c.w - W_QUER / 2;
    if (Math.abs(dw) > 3) continue;
    for (let yr = 8; yr <= 9; yr++) P.ersetze(c.x, Y(yr), c.z, Math.abs(dw) > 2.2 ? T.gold : FR('weiss'), 'inschrift');
  }
  // ---- Marktbänke: drei steinerne Verkaufstische (eine Lage hoch) in der Mittelachse
  for (const k of [2, 4, 6]) {
    const uc = (k + 0.5) * B;
    for (const c of D.alle) {
      if (c.zone !== 'halle' || Math.abs(c.u - uc) > 1.5 || Math.abs(c.w - W_QUER / 2) > 0.8) continue;
      P.set(c.x, Y(1), c.z, T.weiss, 'marktbaenke');
    }
  }
}

const VER = 'Vereinfachte Ausstattung, Lage und Farben Stufe C.';
const Q = '(Quelle: it.wikipedia, Loggia del Pesce)';
const INHALT = {
  tondi: { title: 'Tondi mit Fischen', description: 'Je Langseite acht runde Felder in den Zwickeln über den Pfeilern: Rand in Terrakotta, in der Mitte ein weißer Block für den Fisch.', tip: 'Die Felder ersetzen Wandblöcke über den Pfeilern.', caution: VER + ' Der Fisch ist ein einzelner Block.', fact: 'In den Zwickeln der Bögen saßen sechzehn Tondi mit Fischen; zwölf gingen bei den Abbrucharbeiten verloren, weil sie aus Kalk modelliert waren, die vier an den Enden kopieren die von 1669 ' + Q + '.' },
  stemmen: { title: 'Eckwappen', description: 'Vier Wappenschilde als goldgerahmte Farbfelder an den Ecken der Langseiten, mit Rot und einem weißen Mittelfeld.', tip: 'Die Felder ersetzen Wandblöcke über den Eckpfeilern.', caution: VER + ' Das Wappen ist nicht nachgebildet, die Farben sind frei.', fact: 'Vier Eckwappen schmücken die Loggia ' + Q + '.' },
  kartusche: { title: 'Kartusche', description: 'Eine goldgerahmte weiße Tafel in der Mitte der Nordlangseite über dem fünften Bogen.', tip: 'Zwei Lagen hoch und sechs Blöcke breit.', caution: VER + ' Der Text der Widmung ist nicht dargestellt.', fact: 'Eine zentrale Kartusche nennt den Auftrag des Großherzogs ' + Q + '.' },
  inschrift: { title: 'Inschriftentafel', description: 'Eine weiße, goldgerahmte Tafel über dem Bogen der östlichen Schmalseite.', tip: 'Zwei Lagen hoch und sechs Blöcke breit.', caution: VER + ' Die Lage der Tafel ist Stufe C.', fact: 'Die Tafel nennt die Jahreszahl MDLXVIII und erinnert an den Bau für den Fischmarkt, der zuvor an der Ponte Vecchio lag ' + Q + '.' },
  marktbaenke: { title: 'Marktbänke', description: 'Drei steinerne Verkaufstische aus weißem Marmor (3 × 1 Blöcke, eine Lage hoch) in der Mittelachse der Halle.', tip: 'Einfach aufsetzen, sie stehen frei.', caution: VER + ' Die Tische sind nicht überliefert.', fact: 'Die Loggia wurde für den Fischmarkt gebaut ' + Q + '.' }
};

module.exports = { ausstatten, TEILE, TEILE_ZWICKEL, INHALT };
