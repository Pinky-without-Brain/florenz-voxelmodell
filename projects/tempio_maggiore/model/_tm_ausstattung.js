'use strict';
// Ausstattung des Tempio Maggiore (Katalog §3): Aron ha-Kodesh mit Mosaikfeld und Baldachin, Bima mit Pult, Gitter, Ner Tamid,
// Bankreihen im Hauptraum, Oratorium Margulies mit zwei Toraschreinen, Leuchter auf der Emporenbrüstung.
// Alles vereinfacht in vollen Blöcken; Mosaike sind Farbfelder in der Wandlage (nur Typwechsel, das Bauteil der Wand bleibt).
const PAL = require('../../../tools/spec/palette.js');

function ausstatten({ W, D, TM }) {
  const { T, Y, FR, key } = TM;
  const { set, zellen } = W;
  const frei = (c, y) => TM.zustand(c, y) === 'air' && !zellen.has(key(c.x, Y(y), c.z));
  const put = (c, y, t, p) => (frei(c, y) ? set(c.x, Y(y), c.z, t, p) : false);
  const retype = (c, y, t) => { const e = zellen.get(key(c.x, Y(y), c.z)); if (!e || e.p !== 'wandmalerei') return false; e.t = t; return true; };
  const innen = (c) => !c.wand && !c.tower;

  // ---- Apsis: Aron ha-Kodesh am Ostende, Bima davor
  const chor = D.cells.filter((c) => c.raum === 'chor' && innen(c));
  const apsis = chor.filter((c) => c.u > 88);
  const ue = Math.max(...apsis.filter((c) => Math.abs(c.w - 28) < 4.5).map((c) => c.u));
  const ost = apsis.filter((c) => c.u > ue - 1.5);
  const w0 = ost.reduce((s, c) => s + c.w, 0) / ost.length;
  const info = { ue, w0 };
  // Mosaikfeld (Wandlage hinter dem Aron): Goldrahmen, Felder in Blau, Rot, Weiß und Gold
  const wand = D.cells.filter((c) => c.raum === 'chor' && c.wand && c.u > ue - 0.5 && Math.abs(c.w - w0) <= 3.7);
  let mosaik = 0;
  for (const c of wand) for (let y = 3; y <= 13; y++) {
    const rand = Math.abs(c.w - w0) > 3.0 || y === 3 || y === 13;
    const m = (Math.floor(c.w * 1.3) + y) & 3;
    const t = rand ? T.gold : (m === 0 ? FR('blau') : m === 1 ? T.gold : m === 2 ? FR('rot') : FR('weiss'));
    if (retype(c, y, t)) mosaik++;
  }
  info.mosaik = mosaik;
  // Baldachin: zwei Säulen, Sturz, Gesetzestafeln (gold); Ner Tamid unter dem Sturz
  const nische = ost.filter((c) => c.u > ue - 1.4);
  for (const c of nische) {
    const dw = Math.abs(c.w - w0);
    if (dw >= 3.6 && dw <= 5.2) for (let y = 1; y <= 12; y++) put(c, y, T.saeule, 'aron');
    if (dw <= 5.2) put(c, 13, T.orn, 'aron');
    if (dw <= 1.4) for (let y = 14; y <= 16; y++) put(c, y, T.gold, 'aron');
  }
  const mitteC = nische.reduce((b, c) => (!b || Math.hypot(c.u - (ue - 0.6), c.w - w0) < Math.hypot(b.u - (ue - 0.6), b.w - w0) ? c : b), null);
  if (mitteC) { put(mitteC, 12, T.gold, 'ner_tamid'); put(mitteC, 11, T.licht, 'ner_tamid'); }
  // Bima: erhöhte Plattform mit Treppenblöcken an der Westkante und einem Lesepult
  const bimaZellen = chor.filter((c) => c.u >= ue - 8.2 && c.u < ue - 4 && Math.abs(c.w - w0) <= 3.6);
  for (const c of bimaZellen) {
    const kante = c.u < ue - 7.2;
    put(c, 1, kante ? PAL.treppe('holz', 'o') : T.holz, 'bima');
  }
  const pult = bimaZellen.reduce((b, c) => (!b || Math.hypot(c.u - (ue - 5.8), c.w - w0) < Math.hypot(b.u - (ue - 5.8), b.w - w0) ? c : b), null);
  if (pult) put(pult, 2, T.holz, 'bima');
  // Gitter zwischen Hauptraum und Bima, mit 4 Blöcken Durchgang
  for (const c of chor) if (Math.abs(c.u - (ue - 11)) < 0.75 && Math.abs(c.w - w0) >= 2.4) for (let y = 1; y <= 2; y++) put(c, y, T.dunkel, 'gitter');

  // ---- Bankreihen im Westarm (Hauptraum), mittlerer Gang frei
  let baenke = 0;
  for (const c of D.cells) {
    if (c.raum !== 'halle_w' || !innen(c) || TM.galTyp(c) !== null) continue;
    if (c.u < 18 || c.u > 37) continue;
    const reihe = TM.mod(c.u - 19, 3) < 0.9;
    const seite = (c.w >= 22.8 && c.w < 26.8) || (c.w >= 33.8 && c.w < 37.8);
    if (reihe && seite && put(c, 1, T.holz, 'baenke')) baenke++;
  }
  info.baenke = baenke;

  // ---- Oratorium Margulies im Südarm: zwei Toraschreine an der Südwand, Plattform, Bankreihen
  const sued = D.cells.filter((c) => c.raum === 'sued' && innen(c));
  if (sued.length) {
    const wi = Math.max(...sued.map((c) => c.w));
    for (const uc of [50, 63]) {
      for (const c of D.cells) {
        if (c.raum !== 'sued' || !c.wand || c.w <= wi || c.w > wi + 1.6 || Math.abs(c.u - uc) > 2.4) continue;
        for (let y = 3; y <= 10; y++) {
          const rand = Math.abs(c.u - uc) > 1.6 || y === 3 || y === 10;
          retype(c, y, rand ? T.gold : (y >= 8 ? FR('blau') : (y % 2 ? FR('rot') : FR('blau'))));
        }
      }
      for (const c of sued) if (c.w > wi - 2.6 && Math.abs(c.u - uc) <= 2.4) put(c, 1, T.holz, 'oratorium');
    }
    for (const wr of [wi - 6.5, wi - 9.5]) for (const c of sued) {
      if (Math.abs(c.w - wr) < 0.8 && c.u > 44 && c.u < 69 && Math.abs(c.u - 56.5) > 3) put(c, 1, T.holz, 'oratorium');
    }
  }

  // ---- Leuchter (Goldblock) auf der Emporenbrüstung, je dritte Arkade
  let leuchter = 0, n = 0;
  for (const c of D.cells) {
    if (TM.galTyp(c) !== 'bay') continue;
    const d = TM.mod(c.u, 1);
    void d;
    const x = TM.mod((c.raum === 'halle_w' && c.u >= TM.GAL.u && c.u < TM.GAL.u + 1.6) ? c.w - 16 : c.u - 16, TM.GAL.pitch) - 4;
    if (Math.abs(x) < 0.6 && ((n++) % 2 === 0) && put(c, 15, T.gold, 'leuchter')) leuchter++;
  }
  info.leuchter = leuchter;
  W.ausInfo = info;
}

module.exports = { ausstatten };
