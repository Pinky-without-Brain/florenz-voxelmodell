'use strict';
// Gemeinsamer Bauplan für angebaute Glockentürme (V5b: San Lorenzo, Santa Maria del Carmine; Muster wie Santa Croce W8):
// rechteckiger Schaft mit 2 Zellen dicken Wänden, Wendeltreppe 5 × 5 in Weltachsen (Mitte automatisch gesucht,
// Kopffreiheit auch über den Eckpodesten), Glockenstube mit Bogenöffnungen, Glocken (bronze) an hölzernen Jochen,
// Abschluss als Stufenpyramide oder Stufenkuppel mit bronzener Spitze, Licht in der Innenschale.
// Der Aufrufer liefert die Plan-Funktionen seines Bauplans (set, frei, oeffnung, unzug, ...).
//
// env: { cells: [{x, z, u, w, d8}], set, frei, istFrei, hat, oeffnung, unzug, Y, T, zellen, teile, key }
//      T: wand, sockel, gesims, dach, spitze, holz, glocke, fenster, licht
// o:   { rect: {u0,u1,w0,w1}, top, glocke0, glocke1, spitze0, abschluss: 'pyramide'|'kuppel', sockel (Lagen), gesimse: [lagen],
//        tueren: [[{x,z}, …]] (Zellen, durch die eine Tür von 4 Lagen führt), schlitze: {periode,a,b,bis},
//        bogen: {anzahl, breite}, kleineGlocken: n, lichtAbstand, rolle }
const P = require('../city/poly.js');
const treppe = require('./treppe.js');

function baueCampanile(env, o) {
  const { cells, set, frei, istFrei, hat, oeffnung, unzug, Y, T, zellen, teile, key } = env;
  const R = o.rect, BU = R.u1 - R.u0, BW = R.w1 - R.w0;
  const info = { glocken: 0, kleine: 0 };
  const byK = new Map(cells.map((c) => [P.ck(c.x, c.z), c]));
  for (const c of cells) {
    c.iu = Math.floor(c.u - R.u0); c.iw = Math.floor(c.w - R.w0);
    c.r = c.d8 - 1;                                   // 0 = Außenlage, 1 = Innenlage der Wand, ≥ 2 Innenraum
  }
  const lang = (c) => ((c.iu <= 1 || c.iu >= BU - 2) ? c.iw + 0.5 : c.iu + 0.5);   // Lage entlang der Seite
  const seitenLaenge = (c) => ((c.iu <= 1 || c.iu >= BU - 2) ? BW : BU);

  // 1. Wendeltreppe 5 × 5 in Weltachsen im Inneren (Mitte: der Turmmitte nächste Zelle mit r ≥ 2 rundum)
  const innen = new Set();
  let sx = 0, sz = 0;
  for (const c of cells) if (c.r >= 2) { innen.add(P.ck(c.x, c.z)); sx += c.x; sz += c.z; }
  if (!innen.size) throw new Error('Campanile: kein Innenraum');
  const mx = sx / innen.size, mz = sz / innen.size;
  let mitte = null, best = Infinity;
  for (const k of innen) {
    const x = P.ckX(k), z = P.ckZ(k);
    let ok = true;
    for (let dx = -2; dx <= 2 && ok; dx++) for (let dz = -2; dz <= 2; dz++) if (!innen.has(P.ck(x + dx, z + dz))) { ok = false; break; }
    const d = Math.hypot(x - mx, z - mz);
    if (ok && d < best) { best = d; mitte = { x, z }; }
  }
  if (!mitte) throw new Error('Campanile: kein Platz für die Wendeltreppe');
  const tr = treppe.wendeltreppe({ mitte, radiusInnen: 0, radiusAussen: 2, yVon: Y(0), yBis: Y(o.glocke0), rolle: o.rolle || 'pietra_serena', drehsinn: 'rechts' });
  for (const l of treppe.treppenloch(tr.lauf, 3)) frei(l.x, l.y, l.z);
  const trKeys = new Set([...tr].map((b) => key(b.x, b.y, b.z)));
  for (const b of tr) if (b.y >= Y(o.glocke0) - 3 && b.y < Y(o.glocke0)) for (let h = 1; h <= 3; h++) if (!trKeys.has(key(b.x, b.y + h, b.z))) frei(b.x, b.y + h, b.z);   // Kopffreiheit über den Podesten unter dem Stubenboden (Kern und Stufen bleiben)
  for (const b of tr) if (b.y > Y(0)) set(b.x, b.y, b.z, b.typ, 'campanile_treppe');
  info.treppe = tr; info.mitte = mitte;

  // 2. Türen (Außenwand durchbrochen, 4 Lagen hoch)
  for (const t of o.tueren || []) for (const z of t) for (let yr = 1; yr <= 4; yr++) oeffnung('tuer', 'campanile_schaft', z.x, Y(yr), z.z);

  // 3. Schaft, Glockenstube, Abschluss
  let rmax = 0;
  for (const c of cells) rmax = Math.max(rmax, c.r);
  const bogen = o.bogen || { anzahl: 1, breite: 4 };
  const a = bogen.breite / 2;
  const sp = o.glocke1 - 2 - Math.ceil(a);                         // Kämpfer der Bogenöffnungen
  const gesims = new Set(o.gesimse || []);
  const H = o.top - o.spitze0 + 1;
  const sKuppel = (yr) => { const f = Math.min(1, (yr - o.spitze0) / H); return (rmax + 1) * (1 - Math.sqrt(Math.max(0, 1 - f * f))); };
  const sPyr = (yr) => (rmax + 1) * Math.min(1, (yr - o.spitze0) / H);
  const sAt = (yr) => Math.floor(o.abschluss === 'kuppel' ? sKuppel(yr) : sPyr(yr));
  const sz0 = o.schlitze;
  for (const c of cells) {
    for (let yr = 1; yr <= o.top; yr++) {
      const y = Y(yr);
      if (istFrei(c.x, y, c.z) || hat(c.x, y, c.z)) continue;
      if (yr >= o.spitze0) {                                       // Abschluss: Ringe der Dicke ≥ 2, Lücken zwischen den Lagen geschlossen
        const s0 = sAt(yr), s1 = Math.max(s0 + 1, sAt(yr + 1));
        const apex = yr >= o.top - 2;
        if ((c.r >= s0 && c.r <= s1) || (c.r > s0 && yr === o.spitze0) || (apex && c.r >= s0)) set(c.x, y, c.z, yr >= o.top - 2 ? T.spitze : T.dach, 'campanile_spitze');
        else if (c.r > s1) unzug('campanile_spitze', 'Hohlraum unter dem Turmhelm über der Glockenstube', c.x, y, c.z);
        continue;
      }
      if (yr >= o.glocke0 && yr <= o.glocke1) {                    // Glockenstube
        if (c.r <= 1) {
          const L = lang(c), n = bogen.anzahl, len = seitenLaenge(c);
          let offen = false;
          for (let k = 0; k < n && !offen; k++) {
            const x = L - len * (k + 0.5) / n;
            if (Math.abs(x) < a && yr >= o.glocke0 + 3 && (yr <= sp || yr <= Math.floor(sp + Math.sqrt(a * a - x * x)))) offen = true;
          }
          if (offen) { oeffnung('fenster_offen', 'glockenstube', c.x, y, c.z); continue; }
          set(c.x, y, c.z, yr === o.glocke1 || yr === o.glocke0 ? T.gesims : T.wand, 'glockenstube');
        } else if (yr === o.glocke0) set(c.x, y, c.z, T.holz, 'glockenstube');
        else if (yr === o.glocke1) set(c.x, y, c.z, T.gesims, 'glockenstube');
        continue;
      }
      if (c.r > 1) { if (yr > o.glocke1) unzug('campanile_spitze', 'Hohlraum über der Glockenstube unter dem Turmhelm', c.x, y, c.z); continue; }
      let t = c.r === 0 && yr <= (o.sockel || 0) ? T.sockel : (gesims.has(yr) ? T.gesims : T.wand);
      if (sz0 && yr % sz0.periode >= sz0.a && yr % sz0.periode <= sz0.b && yr < (sz0.bis || o.glocke0) && Math.abs(lang(c) - seitenLaenge(c) / 2) < 1) t = T.fenster;
      set(c.x, y, c.z, t, 'campanile_schaft');
    }
  }

  // 4. Glocken und Joche: 2 × 2 an der Wand (r = 2, 3), Unterkante 4 Lagen über dem Stubenboden (Kopffreiheit), Joch darüber
  const cu = (R.u0 + R.u1) / 2, cw = (R.w0 + R.w1) / 2;
  const ziele = [[R.u0 + 3, cw], [R.u1 - 3, cw], [cu, R.w0 + 3], [cu, R.w1 - 3]];
  if ((o.kleineGlocken || 0) > 0) ziele.push([R.u1 - 3, R.w1 - 3]);                // fünfter Platz in der Ecke für die kleinen Glocken
  const frei2 = (x, z) => { const c = byK.get(P.ck(x, z)); return c && c.r >= 2 && c.r <= 3 && Math.max(Math.abs(x - mitte.x), Math.abs(z - mitte.z)) >= 3; };
  const yb = Y(o.glocke0) + 4;
  const plaetze = [];
  for (const [zu, zw] of ziele) {
    let bestC = null, bd = Infinity;
    for (const c of cells) {
      if (!(frei2(c.x, c.z) && frei2(c.x + 1, c.z) && frei2(c.x, c.z + 1) && frei2(c.x + 1, c.z + 1))) continue;
      const d = Math.hypot(c.u - zu, c.w - zw);
      if (d < bd) { bd = d; bestC = c; }
    }
    if (bestC) plaetze.push(bestC);
  }
  const nKlein = o.kleineGlocken || 0;
  // Joch: umlaufender Holzbalken in der Innenlage der Stube (r = 2), an den Wänden verankert; die Glocken hängen darunter
  for (const c of cells) if (c.r === 2) {
    set(c.x, yb + 3, c.z, T.holz, 'glockenjoch');
    for (let h = 4; h <= 6; h++) unzug('glockenjoch', 'Oberseite des Glockenjochs (nur zum Läuten, ohne Zugang)', c.x, yb + h, c.z);
  }
  plaetze.forEach((c, i) => {
    const fuss = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([dx, dz]) => byK.get(P.ck(c.x + dx, c.z + dz)));
    const oben = fuss.filter((q) => q.r === 2);
    const klein = i >= plaetze.length - nKlein;
    if (!klein) {
      for (const q of fuss) { set(q.x, yb, q.z, T.glocke, 'glocken'); set(q.x, yb + 1, q.z, T.glocke, 'glocken'); }
      set(oben[0].x, yb + 2, oben[0].z, T.glocke, 'glocken');
      info.glocken++;
    } else {                                                        // kleine Glocke: eine Zelle, 2 Lagen hoch, direkt unter dem Joch
      set(oben[0].x, yb + 1, oben[0].z, T.glocke, 'glocken'); set(oben[0].x, yb + 2, oben[0].z, T.glocke, 'glocken');
      info.glocken++; info.kleine++;
    }
  });

  // 5. Licht in der Innenschale (r = 1), vier Seiten, alle `lichtAbstand` Lagen
  const ab = o.lichtAbstand || 8;
  const lichtZiele = [[R.u0 + 1.5, cw], [R.u1 - 1.5, cw], [cu, R.w0 + 1.5], [cu, R.w1 - 1.5]];
  const lt = [];
  for (const [zu, zw] of lichtZiele) {
    let bc = null, bd = Infinity;
    for (const c of cells) {
      if (c.r !== 1) continue;
      const d = Math.hypot(c.u - zu, c.w - zw);
      if (d < bd) { bd = d; bc = c; }
    }
    if (!bc) continue;
    for (let yr = 5; yr <= o.glocke1 - 3; yr += ab) {
      const k = key(bc.x, Y(yr), bc.z), e = zellen.get(k);
      if (!e || (e.p !== 'campanile_schaft' && e.p !== 'glockenstube')) continue;
      teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = 'campanile_licht'; lt.push(k);
    }
  }
  // Glockenstube: Licht in den Mauerecken (die Seitenmitten sind Bogenöffnungen)
  for (const [zu, zw] of [[R.u0 + 1.5, R.w0 + 1.5], [R.u1 - 1.5, R.w0 + 1.5], [R.u0 + 1.5, R.w1 - 1.5], [R.u1 - 1.5, R.w1 - 1.5]]) {
    let bc = null, bd = Infinity;
    for (const c of cells) {
      if (c.r !== 1) continue;
      const d = Math.hypot(c.u - zu, c.w - zw);
      if (d < bd) { bd = d; bc = c; }
    }
    if (!bc) continue;
    const k = key(bc.x, Y(o.glocke0 + 6), bc.z), e = zellen.get(k);
    if (!e || (e.p !== 'glockenstube')) continue;
    teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = 'campanile_licht'; lt.push(k);
  }
  teile.set('campanile_licht', (teile.get('campanile_licht') || []).concat(lt));
  info.lichter = lt.length;
  info.rmax = rmax;
  return info;
}

module.exports = { baueCampanile };
