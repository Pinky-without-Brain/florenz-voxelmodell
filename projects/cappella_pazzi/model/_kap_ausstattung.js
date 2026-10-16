'use strict';
// Ausstattung der Cappella de' Pazzi (Modul 9, Katalog): Pietra-serena-Gliederung, zwölf Apostel-Tondi, vier Evangelisten-Tondi in den
// Pendentifs, Della-Robbia-Kuppel im Portikus, Tondo des Hl. Andreas über dem Portal, Sternenhimmel der Scarsella, Altar, Sitzbank, Licht.
// Alles vereinfacht, die Lage der Tondi ist Stufe C. Ersetzt Zellen der Rohbauteile (Wandflächen) oder setzt in freie Zellen.
const WZ = require('../../../tools/wahrzeichen');

function ausstatten(api) {
  const { D, set, ersetze, get, Y, T, key, FR, hash } = api;
  const K = require('./_kap.js');
  const luftAn = (c, yr) => api.istLuft(c.x, yr, c.z);
  const nachbarLuft = (c, yr) => api.N4.some(([dx, dz]) => api.istLuft(c.x + dx, yr, c.z + dz));
  const nb = (c, dx, dz) => api.zelleBei(c.x + dx, c.z + dz);

  // ------------------------------------------------------------ Pietra-serena-Gliederung: Pilaster und Gesims (Lage 12) an den Saalwänden
  {
    const UK = [152, 157, 161, 165, 170];
    const WK_W = [66, 71, 75, 85, 89, 94];
    const WK_O = [66, 71, 75, 87, 91, 95];
    for (const c of D.cells) {
      const flaecheInnen = (c.zone === 'wand' && c.d8 === 2) || (c.zone === 'portalwand' && c.u >= 148) || (c.zone === 'ostwand' && c.u <= 173.5);
      if (!flaecheInnen) continue;
      for (let yr = 1; yr <= 12; yr++) {
        if (!get(c.x, Y(yr), c.z) || !nachbarLuft(c, yr)) continue;
        const ks = c.zone === 'wand' ? UK.some((u) => Math.abs(c.u - u) < 0.6) : (c.zone === 'portalwand' ? WK_W : WK_O).some((w) => Math.abs(c.w - w) < 0.6);
        if (yr === 12 || ks) ersetze(c.x, Y(yr), c.z, yr === 12 ? T.serena : (yr >= 11 ? T.ornament : T.serena), 'kap_pilaster');
      }
    }
  }

  // ------------------------------------------------------------ Tondi: zwölf Apostel (Luca della Robbia) an den Saalwänden
  const tondoWand = (teil, zone, achse, t, yrM, r, filter) => {
    let n = 0;
    for (const c of D.cells) {
      if (c.zone !== zone || (filter && !filter(c))) continue;
      const ta = achse === 'u' ? c.u : c.w;
      for (let yr = Math.floor(yrM - r); yr <= Math.ceil(yrM + r); yr++) {
        const d = Math.hypot(ta - t, yr - yrM);
        if (d > r) continue;
        const e = get(c.x, Y(yr), c.z);
        if (!e || e.p !== 'kap_aussenwaende' && e.p !== 'kap_pilaster') continue;
        if (!nachbarLuft(c, yr)) continue;
        ersetze(c.x, Y(yr), c.z, d < 0.9 ? T.weiss : d < 1.75 ? FR('blau') : T.weiss, teil);
        n++;
      }
    }
    return n;
  };
  for (const u of [153, 158.3, 163.7, 169]) {
    tondoWand('kap_apostel', 'wand', 'u', u, 8, 2.2, (c) => c.w < 66 && c.d8 === 2);
    tondoWand('kap_apostel', 'wand', 'u', u, 8, 2.2, (c) => c.w > 94 && c.d8 === 2);
  }
  for (const w of [70, 90]) tondoWand('kap_apostel', 'portalwand', 'w', w, 8, 2.2, (c) => c.u >= 148);
  for (const w of [66, 95]) tondoWand('kap_apostel', 'ostwand', 'w', w, 8, 2.2, (c) => c.u <= 173.5);

  // ------------------------------------------------------------ Evangelisten-Tondi in den Pendentifs (vier Ecken des Mittelquadrats)
  for (const [sx, sy, farbe, mitte] of [[-1, -1, 'gelb', T.gold], [1, -1, 'rot', T.weiss], [-1, 1, 'gruen', T.gold], [1, 1, 'orange', T.weiss]]) {
    const u = K.CU + sx * 11.2, w = K.CW + sy * 11.2, ym = 17;
    for (const c of D.cells) {
      if (!c.inCube) continue;
      for (let yr = 13; yr <= 22; yr++) {
        const e = get(c.x, Y(yr), c.z);
        if (!e || e.p !== 'kap_pendentifs') continue;
        const d = Math.hypot(c.u - u, c.w - w, (yr - ym) * 1.0);
        if (d > 3.6) continue;
        const flaeche = api.N4.some(([dx, dz]) => api.istLuft(c.x + dx, yr, c.z + dz)) || api.istLuft(c.x, yr - 1, c.z) || api.istLuft(c.x, yr + 1, c.z);
        if (!flaeche) continue;
        ersetze(c.x, Y(yr), c.z, d < 1.5 ? mitte : d < 2.6 ? FR(farbe) : FR("blau"), 'kap_evangelisten');
      }
    }
  }

  // ------------------------------------------------------------ Portikus: Della-Robbia-Kuppel, Kassettendecke, Tondo des Hl. Andreas über dem Portal
  for (const c of D.cells) {
    if (c.zone !== 'portico') continue;
    const r = Math.hypot(c.u - 142.5, c.w - 80);
    for (const yr of [14, 15, 16, 17]) {
      const e = get(c.x, Y(yr), c.z);
      if (!e || e.p !== 'portikus_decke') continue;
      const innen = api.N4.some(([dx, dz]) => api.istLuft(c.x + dx, yr, c.z + dz)) || api.istLuft(c.x, yr - 1, c.z);
      if (!innen) continue;
      if (r <= 5.4) e.t = r < 1.3 ? T.weiss : r < 2.5 ? FR('blau') : r < 3.5 ? T.weiss : FR('hellblau');       // glasierte Terrakotta
      else e.t = ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1) ? T.serena : T.putz;                           // Kassetten
    }
  }
  for (const c of D.cells) {
    if (c.zone !== 'portalwand' || c.u >= 148.2) continue;
    for (let yr = 10; yr <= 16; yr++) {
      const d = Math.hypot(c.w - 80, yr - 12.6);
      if (d > 2.4) continue;
      const e = get(c.x, Y(yr), c.z);
      if (e) ersetze(c.x, Y(yr), c.z, d < 1 ? T.weiss : d < 1.9 ? FR('blau') : T.weiss, 'portikus_tondo');
    }
  }

  // ------------------------------------------------------------ Scarsella: Sternenhimmel (Konstellationen vom 4. Juli 1442), Altar
  for (const c of D.cells) {
    if (c.zone !== 'sc') continue;
    for (let yr = 8; yr <= 12; yr++) {
      const e = get(c.x, Y(yr), c.z);
      if (e && e.p === 'scarsella_gewoelbe') e.t = hash(c.x, yr, c.z) % 5 === 0 ? T.gold : FR('blau');
    }
    if (c.u >= 182.5 && c.u < 185 && Math.abs(c.w - K.SC.w) < 1.6) set(c.x, Y(1), c.z, T.weiss, 'kap_altar');
  }

  // ------------------------------------------------------------ Steinbank rund um den Saal (Pietra serena, 1 Block hoch), Lücken an Portal und Scarsella
  for (const c of D.cells) {
    if (c.zone !== 'saal' || c.inCube && false) continue;
    if (!luftAn(c, 1) || !luftAn(c, 2) || !luftAn(c, 3)) continue;
    let wand = false;
    for (const [dx, dz] of api.N4) {
      const n = nb(c, dx, dz);
      if (!n) continue;
      if (n.zone === 'wand' || n.zone === 'portalwand' || n.zone === 'ostwand') {
        if (n.zone === 'portalwand' && Math.abs(n.w - K.PORTAL.w) < 8) continue;
        if (n.zone === 'ostwand' && Math.abs(n.w - K.SC.w) < 8) continue;
        wand = true;
      }
    }
    if (wand && set(c.x, Y(1), c.z, T.serena, 'kap_bank')) { /* Bank */ }
  }

  // ------------------------------------------------------------ Licht: Seelaternen im Boden je Raum (höchstens 12 Blöcke Abstand)
  const raeume = { portikus: [], saal: [], scarsella: [] };
  for (const c of D.cells) {
    const raum = c.zone === 'portico' ? 'portikus' : c.zone === 'saal' ? 'saal' : c.zone === 'sc' ? 'scarsella' : null;
    if (!raum) continue;
    if (!luftAn(c, 1) || !luftAn(c, 2) || !luftAn(c, 3)) continue;
    if (api.hat(c.x, Y(1), c.z)) continue;
    raeume[raum].push({ x: c.x, y: Y(1), z: c.z });
  }
  for (const zs of Object.values(raeume)) {
    for (const l of WZ.lichtRaster(zs, { abstand: 12 })) ersetze(l.x, l.y, l.z, T.licht, 'kap_licht');
  }
}

module.exports = { ausstatten };
