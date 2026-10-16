'use strict';
// Ausstattung von Kirche San Filippo Neri (Modul 9) und Oratorium (Modul 10); Inhalte nach it.wikipedia
// (Complesso di San Firenze, Chiesa di San Filippo Neri), Lage und Maße Stufe C. Alles vereinfacht, in vollen Blöcken.
const { hash } = require('../../../tools/wahrzeichen/palazzo_raum.js');

const TEILE_K = ['k_deckenfresko', 'k_apsisfresko', 'k_hochaltar', 'k_altarbilder', 'k_sakramentskapelle'];
const TEILE_O = ['o_deckenfresko', 'o_wandbilder', 'o_engel'];
const mod = (a, n) => ((a % n) + n) % n;

/** Statue: Sockel 3 × 3 (2 hoch), Körper, Kopf. Gibt die Oberkante zurück. */
function statue(api, x, z, teil, o) {
  const { Y, set } = api;
  let j = 1;
  for (let h = 0; h < 2; h++, j++) for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) set(x + dx, Y(j), z + dz, o.sockel, teil);
  for (let h = 0; h < o.koerper; h++, j++) set(x, Y(j), z, o.typ, teil);
  set(x, Y(j), z, o.kopf || o.typ, teil);
  return j;
}

function kirche(api) {
  const { D, Y, T, FR, K, set, hat, kDecke, zellen, key } = api;
  const ersetze = (x, y, z, t, p) => { const e = zellen.get(key(x, y, z)); return e && !/fenster/.test(e.p) ? api.ersetze(x, y, z, t, p) : false; };
  const gewoelbeZelle = (c) => { const dk = kDecke(c); return dk === null ? null : { x: c.x, y: Y(dk), z: c.z, dk }; };
  const flaeche = (c, fn, teil) => { const g = gewoelbeZelle(c); if (g && zellen.has(key(g.x, g.y, g.z))) { const t = fn(c); if (t) ersetze(g.x, g.y, g.z, t, teil); } };

  // ------------------------------------------------------------ Deckenbild im Kassettengewölbe: Gloria di san Filippo Neri (Sagrestani 1715)
  for (const c of D.kirche) {
    if ((c.zone !== 'nave' && c.zone !== 'presb') || c.d8 <= 2) continue;
    flaeche(c, (q) => {
      const a = q.w - K.kapellen[0][0], b = q.u - K.nc;
      const du = Math.hypot(b / 6, (q.w - 30) / 12);
      if (du < 1) {                                                        // Mittelbild: Himmel, Wolkenkranz, Glorie
        if (du > 0.88) return T.gold;
        if (du < 0.16) return FR('weiss');
        const h = hash(Math.floor(q.u / 2), Math.floor(q.w / 2), 4) % 7;
        return h === 0 ? FR('rot') : h === 1 ? FR('gelb') : h === 2 ? FR('weiss') : h === 3 ? FR('blau') : FR('hellblau');
      }
      const rippe = mod(Math.round(a), 6) === 0 || mod(Math.round(b + 7.5), 5) === 0;
      if (rippe) return T.holz;
      return mod(Math.round(a), 6) === 3 && mod(Math.round(b + 7.5), 5) === 2 ? T.gold : T.putz;      // Kassetten mit goldenen Rosetten
    }, 'k_deckenfresko');
  }

  // ------------------------------------------------------------ Halbkuppel der Apsis: Dreifaltigkeit mit Aposteln und Heiligen (Lapi)
  for (const c of D.kirche) {
    if (c.zone !== 'apsis' || c.d8 <= 2) continue;
    flaeche(c, (q) => {
      const r = Math.hypot(q.u - K.nc, q.w - K.presbEnde) / K.nh;
      if (r < 0.2) return T.gold;                                          // Dreifaltigkeit (Strahlenkranz)
      if (r < 0.34) return FR('weiss');
      const ring = Math.floor((r - 0.34) / 0.22);
      const h = hash(Math.floor(q.u / 1.5), Math.floor(q.w / 1.5), 5) % 6;
      if (ring === 1 || ring === 2) return [FR('rot'), FR('blau'), FR('gelb'), FR('weiss'), FR('braun'), FR('orange')][h];   // Apostel und Heilige
      return ring === 0 ? FR('hellblau') : FR('blau');
    }, 'k_apsisfresko');
  }

  // ------------------------------------------------------------ Hochaltar (Del Rosso), Statuen Carità und Purezza (Fortini)
  {
    const teil = 'k_hochaltar';
    for (const c of D.kirche) {
      if ((c.zone !== 'presb' && c.zone !== 'apsis') || c.d8 <= 2) continue;
      if (c.w >= 62 && c.w < 70 && Math.abs(c.u - K.nc) < 5.5) set(c.x, Y(1), c.z, T.serena, teil);                 // Stufe zum Presbyterium
      if (c.w >= 66 && c.w < 68.5 && Math.abs(c.u - K.nc) < 2.6) set(c.x, Y(2), c.z, T.weiss, teil);                // Altartisch
      if (c.w >= 68.5 && c.w < 70 && Math.abs(c.u - K.nc) < 1.6) set(c.x, Y(2), c.z, T.gold, teil);                  // Tabernakel
    }
    for (const sg of [-1, 1]) {                                            // Statuen an den Seiten des Presbyteriums
      const q = D.R.toWorld(K.nc + sg * 6.2, 64.5);
      statue(api, Math.round(q.x), Math.round(q.z), teil, { sockel: T.serena, typ: T.weiss, koerper: 3, kopf: T.ornament });
    }
  }

  // ------------------------------------------------------------ Sechs Altarbilder in den Kapellen und Seitenaltäre
  {
    const teil = 'k_altarbilder';
    const BILDER = [   // [Seite -1 = Süd, +1 = Nord, Kapelle 0..2, Farben]
      [-1, 0, ['rot', 'weiss', 'braun']], [-1, 1, ['weiss', 'hellblau', 'braun']], [-1, 2, ['hellblau', 'weiss', 'gelb']],
      [1, 0, ['gelb', 'braun', 'schwarz']], [1, 1, ['gruen', 'braun', 'hellblau']], [1, 2, ['weiss', 'rot', 'gelb']]
    ];
    for (const [sg, k, farben] of BILDER) {
      const [a, b] = K.kapellen[k], wc = (a + b) / 2;
      for (const c of D.kirche) {
        const stirn = sg < 0 && k === 2;                                  // südliche Kapelle 3: Durchgang zur Sakramentskapelle, das Bild hängt an der Stirnwand
        if (stirn ? !(c.zone === 'masse' && c.w >= 60 && c.w < 61.5 && c.u >= 77.6 && c.u < 82.2) : (c.zone !== 'kap' || c.d8 !== 2 || Math.abs(c.w - wc) >= 5 || (sg < 0) !== (c.u < K.nc))) continue;
        for (let yr = 3; yr <= 10; yr++) {
          const q = stirn ? (c.u - 77.6) * 2 : c.w - (wc - 5), jj = yr - 3;
          const rahmen = q < 0.8 || q > 8.2 || jj === 0 || jj === 7;
          const t = rahmen ? T.gold : jj >= 5 ? FR(farben[0]) : q < 3.3 ? FR(farben[1]) : q > 6.5 ? FR(farben[2]) : FR(farben[(Math.floor(q) + jj) % 3]);
          ersetze(c.x, Y(yr), c.z, t, teil);
        }
      }
      // Altartisch (eine Lage hoch) vor dem Bild
      for (const c of D.kirche) {
        if (c.zone !== 'kap' || c.d8 <= 2 || Math.abs(c.w - wc) >= 3 || (sg < 0) !== (c.u < K.nc) || (sg < 0 && k === 2)) continue;
        if ((sg < 0 ? c.u - K.u0 : K.u1 - c.u) < 4.6) set(c.x, Y(1), c.z, T.weiss, teil);
      }
    }
  }

  // ------------------------------------------------------------ Sakramentskapelle (Del Rosso 1776): Kuppelfresken (Sabatelli), Altar mit Madonnina (Maratta), Grab Pietro Bini
  {
    const teil = 'k_sakramentskapelle';
    for (const c of D.kirche) {
      if (c.zone !== 'sakr' || c.d8 <= 2) continue;
      const r = Math.hypot(c.u - K.sak.u, c.w - K.sak.w);
      if (r < K.sak.r) flaeche(c, (q) => {
        const rr = Math.hypot(q.u - K.sak.u, q.w - K.sak.w);
        const phi = ((Math.atan2(q.w - K.sak.w, q.u - K.sak.u) * 180 / Math.PI) % 45 + 45) % 45;
        if (rr < 1.4) return T.gold;                                       // Laternenöffnung als Goldstern
        if (phi < 2.2 || phi > 42.8) return T.gold;                        // acht Rippen
        return hash(Math.floor(q.u), Math.floor(q.w), 8) % 5 === 0 ? FR('weiss') : FR(rr > 4.3 ? 'blau' : 'hellblau');
      }, teil);
      // Grabplatte des Priesters Pietro Bini: dunkles Feld im Boden
      if (c.u >= 63 && c.u < 66.5 && c.w >= 56.5 && c.w < 59) ersetze(c.x, Y(0), c.z, T.dunkel, teil);
      // Altar (eine Lage hoch) an der Westwand, darüber das Marienbild (Madonnina) als Farbfeld
      if (c.u < 61.5 && c.w >= 50 && c.w < 56.5) set(c.x, Y(1), c.z, T.weiss, teil);
    }
    for (const c of D.kirche) {
      if (c.zone !== 'sakr' || c.d8 !== 2 || c.u > 62 || c.w < 50.5 || c.w >= 56) continue;
      for (let yr = 3; yr <= 9; yr++) {
        const q = c.w - 50.5, jj = yr - 3;
        ersetze(c.x, Y(yr), c.z, q < 0.7 || q > 4.8 || jj === 0 || jj === 6 ? T.gold : jj >= 4 ? FR('hellblau') : q > 1.8 && q < 3.7 ? FR('weiss') : FR('blau'), teil);
      }
    }
  }
}

function oratorium(api) {
  const { D, Y, T, FR, O, set, zellen, key } = api;
  const ersetze = (x, y, z, t, p) => { const e = zellen.get(key(x, y, z)); return e && !/fenster/.test(e.p) ? api.ersetze(x, y, z, t, p) : false; };
  // ------------------------------------------------------------ Deckenfresko: Mariä Himmelfahrt (Traballesi 1775)
  for (const c of D.orat) {
    if (c.zone !== 'saal' || c.d8 <= 2) continue;
    if (!zellen.has(key(c.x, Y(O.decke), c.z))) continue;
    const dU = c.u - O.mitte, dW = c.w - 34;
    const d = Math.hypot(dU / 11, dW / 17);
    let t;
    if (c.zone === 'vest') t = T.putz;
    else if (d < 1) {
      if (d > 0.9) t = T.gold;
      else if (d < 0.14) t = FR('weiss');                                  // die Jungfrau
      else if (d < 0.3) t = FR('blau');
      else { const h = hash(Math.floor(c.u / 2), Math.floor(c.w / 2), 6) % 6; t = h === 0 ? FR('rot') : h === 1 ? FR('gelb') : h === 2 ? FR('weiss') : FR('hellblau'); }
    } else t = mod(Math.round(c.w), 6) === 0 || mod(Math.round(c.u), 6) === 0 ? T.holz : T.putz;
    ersetze(c.x, Y(O.decke), c.z, t, 'o_deckenfresko');
  }
  // ------------------------------------------------------------ Wandbilder: Geschichten des heiligen Filippo Neri (Ferri) über den Emporen
  for (const c of D.orat) {
    if (c.zone !== 'saal' || c.d8 !== 2) continue;
    const q = (c.u < 8 || c.u > 25) ? c.w : c.u;                           // Tafelraster entlang der Wand
    const k = Math.floor((q - 14) / 9), i = q - 14 - 9 * k;
    if (q < 14 || q > 52 || i < 1.5 || i > 8) continue;
    for (let yr = 10; yr <= 15; yr++) {
      const jj = yr - 10, rahmen = i < 2.5 || i > 7 || jj === 0 || jj === 5;
      const farben = [['rot', 'weiss', 'braun'], ['blau', 'gelb', 'weiss'], ['gruen', 'braun', 'orange'], ['hellblau', 'weiss', 'rot']][mod(k, 4)];
      ersetze(c.x, Y(yr), c.z, rahmen ? T.gold : jj >= 4 ? FR(farben[0]) : FR(farben[(Math.floor(i) + jj) % 3]), 'o_wandbilder');
    }
  }
  // ------------------------------------------------------------ Engel (Filippo Burci) an den Enden der Rückempore
  for (const sg of [-1, 1]) {
    const q = D.R.toWorld(O.mitte + sg * 13.5, 50.8);
    const x = Math.round(q.x), z = Math.round(q.z);
    for (let yr = O.emporeY + 1; yr <= O.emporeY + 4; yr++) set(x, Y(yr), z, yr === O.emporeY + 4 ? T.gold : T.weiss, 'o_engel');
    for (const dz of [-1, 1]) set(x, Y(O.emporeY + 3), z + dz, T.weiss, 'o_engel');                // Flügel
  }
}

/** Content der Ausstattungsteile (Module 9 und 10). */
const VER = 'Vereinfachte Ausstattung, Lage und Größe Stufe C.';
const QK = '(Quelle: it.wikipedia, Chiesa di San Filippo Neri (Firenze))';
const QC = '(Quelle: it.wikipedia, Complesso di San Firenze)';
const INHALT = {
  k_deckenfresko: { title: 'Kassettengewölbe mit Deckenbild', description: 'Das Tonnengewölbe über Mittelschiff und Presbyterium als Kassettendecke mit Holzrippen und goldenen Rosetten; in der Mitte ein ovales Himmelsfeld mit Goldrand und Wolken.', tip: 'Erst die Rippen, dann die Füllung, zuletzt das Mittelbild.', caution: VER + ' Das Bild der Glorie ist nur als Farbfläche angedeutet.', fact: 'Giovanni Camillo Sagrestani malte 1715 die „Gloria di san Filippo Neri“ in das Kassettengewölbe ' + QK + '.' },
  k_apsisfresko: { title: 'Halbkuppel der Apsis', description: 'Die Halbkuppel hinter dem Hochaltar in Blau und Hellblau mit einem goldenen Strahlenkranz in der Mitte und bunten Gestalten für Apostel und Heilige.', tip: 'Von der Mitte zum Rand bauen.', caution: VER + ' Einzelne Figuren sind nicht erkennbar.', fact: 'Niccolò Lapi malte die „Dreifaltigkeit mit Aposteln und florentinischen Heiligen“ in die Halbkuppel der Apsis ' + QK + '.' },
  k_hochaltar: { title: 'Hochaltar und Statuen', description: 'Eine Stufe aus Pietra serena im Presbyterium, der Hochaltar aus weißem Marmor mit goldenem Tabernakel und zwei Statuen auf Sockeln neben dem Presbyterium.', tip: 'Erst die Stufe, dann der Altartisch, zuletzt die Figuren.', caution: VER + ' Die Statuen sind schlichte Blockfiguren; welche Figur an welcher Stelle steht, ist nicht belegt.', fact: 'Zanobi Del Rosso schuf den Hochaltar, Gioacchino Fortini die Apsisarchitektur und die Statuen Carità und Purezza ' + QK + '.' },
  k_altarbilder: { title: 'Seitenaltäre mit sechs Altarbildern', description: 'Sechs Kapellen, je drei nördlich und südlich des Mittelschiffs, mit einem Altartisch aus weißem Marmor und einem Altarbild als goldgerahmtes Farbfeld in der Rückwand.', tip: 'Erst das Bildfeld in der Wand, dann der Altartisch davor.', caution: VER + ' Die Zuordnung der Bilder zu den Kapellen ist Stufe C; belegt sind die sechs Maler und Motive.', fact: 'Altarbilder von Pinzani (Petrus reicht Franziska Romana die Kommunion), Gherardini (Pietà), Puglieschi (Immacolata), Bonechi (Kreuzigung), Redi (Flucht nach Ägypten) und Gabbiani (Messe des heiligen Filippo Neri); zwei Seitenaltäre schuf Antonio Montauti ' + QK + '.' },
  k_sakramentskapelle: { title: 'Sakramentskapelle', description: 'Der Anbau südlich der Kirche mit Kuppel: Blau mit goldenen Rippen und einem Stern in der Mitte, ein Altar an der Westwand mit Madonnenbild und ein dunkler Grabstein im Boden.', tip: 'Von der Mitte der Kuppel nach außen bauen.', caution: VER + ' Die Lage des Anbaus folgt dem OSM-Umriss, Form und Grabstein sind Stufe C.', fact: 'Zanobi Del Rosso baute die Kapelle 1776; sie birgt das Grab des Priesters Pietro Bini, eine Madonnina von Carlo Maratta und Kuppelfresken von Luigi Sabatelli und seinen Söhnen ' + QK + '.' },
  o_deckenfresko: { title: 'Deckenfresko des Oratoriums', description: 'Die flache Decke des Saals als Himmelsfeld mit Goldrand: im Zentrum die weiße Gestalt der Jungfrau auf Blau, ringsum Wolken und Engel in Gelb, Rot und Hellblau, außen Holzrippen.', tip: 'Von der Mitte nach außen bauen.', caution: VER + ' Einzelne Figuren sind nicht erkennbar.', fact: 'Giuliano Traballesi malte 1775 die „Assunzione della Vergine“ an die Decke ' + QC + '.' },
  o_wandbilder: { title: 'Wandbilder der Emporengeschosse', description: 'Goldgerahmte Bildfelder in Rot, Blau, Grün und Hellblau auf beiden Längswänden und der Rückwand über den Emporen.', tip: 'Die Felder ersetzen Wandblöcke; Rahmen zuerst.', caution: VER + ' Die Szenen sind nur als Farbfelder angedeutet.', fact: 'Gesualdo Francesco Ferri malte Geschichten aus dem Leben des heiligen Filippo Neri ' + QK + '.' },
  o_engel: { title: 'Engel an der Empore', description: 'Zwei weiße Engel mit Goldnimbus und Flügeln auf der Brüstung der Rückempore.', tip: 'Je ein Pfeiler aus drei Blöcken, dazu die Flügel.', caution: VER + ' Die genaue Lage ist nicht belegt.', fact: 'Filippo Burci schuf die Engel an den Seiten der Empore ' + QK + '.' }
};

module.exports = { kirche, oratorium, TEILE_K, TEILE_O, INHALT };
