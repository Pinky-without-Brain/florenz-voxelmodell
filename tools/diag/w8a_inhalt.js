'use strict';
// Schreibt content/modul_0..6.json der Palazzi der Welle 8a (palazzo_guadagni, palazzo_lenzi, palazzo_mozzi,
// palazzo_corsini_parione). Module 0..5 (Rohbau) aus den Angaben unten, Modul 6 (Ausstattung) aus INHALT in projects/<id>/model/_raeume.js.
// Aufruf: node tools/diag/w8a_inhalt.js [<projekt-id> ...]
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const DATEN = require('./w8a_inhalt_daten.js');

const T = (title, description, tip, caution, fact) => ({ title, description, tip, caution, fact });

function module(id, D, R) {
  const y0 = D.bodenY, yT = D.bodenY + D.traufe;
  const Q = `(Quelle: ${D.quelle})`;
  const f = (k) => `${D.fakt[k]} ${Q}.`.replace('.. ', '. ').replace(/\.\s*\(Quelle/, ' (Quelle');
  const m = {};
  m[0] = { title: 'Fundament, Boden und Hof', subtitle: `Bautüte 0: Fundament, Boden auf Y ${y0}, Hof und Treppe`, icon: '🧱', parts: {
    fundament: T('Fundament', `Wo das Gelände unter dem Palast tiefer liegt als Y ${y0 - 1}, füllst du mit Bruchstein bis Y ${y0 - 1} auf; höher liegendes Gelände wurde bis Y ${y0 - 1} abgetragen.`, 'Arbeite Spalte für Spalte.', `Wo das Gelände Y ${y0 - 1} schon erreicht, bleibt die Spalte leer.`, f('fundament')),
    boden: T('Boden', `Auf Y ${y0} legst du den Boden des Erdgeschosses im Schachmuster aus Terrakotta und hellem Marmor${D.loggiaBoden ? '; unter den Hofarkaden liegt Pietra serena' : ''}.`, 'Ein Feld ist drei Blöcke groß.', 'Die Lichtfelder setzt erst Bautüte 5.', f('boden')),
    hof: T('Hof', D.hofText, 'Nur der Boden, kein Dach.', 'Hier entsteht nichts in die Höhe.', f('hof')),
    treppe: T('Wendeltreppe', `Eine Wendeltreppe aus Pietra serena um einen Kern von 3 × 3 Blöcken führt vom Erdgeschoss bis ins oberste Geschoss (Y ${yT}).`, 'Pro Viertelumlauf steigt sie drei Blöcke, in den Ecken liegen Podeste.', 'Über Stufen und Podesten bleiben drei Blöcke frei.', f('treppe'))
  } };
  m[1] = { title: 'Fassaden', subtitle: `Bautüte 1: ${D.fassadeTitel}`, icon: '🏰', parts: {
    aussenwand: T('Außenwände', D.aussenText, D.aussenTip, 'Fenster und Portale bleiben beim Bauen frei.', f('aussenwand')),
    fenster: T('Fenster', D.fensterText, 'Die Fenster sitzen im gleichen Raster in allen Geschossen.', 'Die Fenster sind mit Glas gefüllt.', f('fenster')),
    kranzgesims: T('Kranzgesims', D.kranzText, 'Das Gesims springt nicht vor, es besteht aus der obersten Wandlage.', 'Bis hierher reicht die Traufe, darüber beginnt das Dach.', f('kranzgesims'))
  } };
  m[2] = { title: 'Hof', subtitle: 'Bautüte 2: Hofarkaden, Hofwände und Innenwände', icon: '🏛️', parts: {
    hofarkaden: T('Hofarkaden', D.arkadenText, 'Die Säulen stehen in gleichem Abstand am Hofrand.', 'Die Bögen bleiben offen.', f('hofarkaden')),
    hofwaende: T('Hofwände', `Über den Arkaden steigen die Hofwände bis Y ${yT}, verputzt, mit Gesimsen auf Höhe der Geschossböden.`, 'Gesimse aus Pietra serena.', 'Fenster frei lassen.', f('hofwaende')),
    hoffenster: T('Hoffenster', 'Zum Hof öffnen sich die Obergeschosse mit Fenstern im gleichen Raster wie außen.', 'Je Joch ein Fenster.', 'Glas in die ganze Wandtiefe.', f('hoffenster')),
    innenwaende: T('Innenwände', 'Zwischen Galerie und Räumen steht im Erdgeschoss eine Innenwand mit Türen von 3 Blöcken Breite.', 'Türen in der Mitte jeder Hofseite.', 'Türen frei lassen.', f('innenwaende')),
    trennwaende: T('Trennwände', D.trennText, 'Türen beim Bauen frei lassen.', 'Die Wände stehen auf dem Boden des Erdgeschosses.', 'Die Raumaufteilung ist Stufe C; belegt sind nur die Räume selbst.')
  } };
  m[3] = { title: 'Böden und Decke', subtitle: 'Bautüte 3: Geschossböden, oberste Decke und Obergeschosswände', icon: '🪵', parts: {
    geschossboeden: T('Geschossböden', 'Auf jedem Geschoss legst du einen Boden aus Holz und Terrakotta im Schachmuster; im Bereich der Treppen bleibt ein Loch.', 'Treppenlöcher frei lassen.', 'Die Böden tragen die Wände der Obergeschosse.', f('geschossboeden')),
    decke: T('Oberste Decke', `Die oberste Decke aus Putz schließt das Haus bei Y ${yT} nach oben ab.`, 'Ein Block stark.', 'Darüber liegt der Dachraum (ohne Zugang).', f('decke')),
    innenwaende_og: T('Innenwände der Obergeschosse', 'In den Obergeschossen setzt sich die Innenwand um den Hof fort, mit Türen von 3 Blöcken Breite.', 'Türen über den Türen des Erdgeschosses.', 'Türen frei lassen.', f('innenwaende_og')),
    trennwaende_og: T('Trennwände der Obergeschosse', 'Auf den Geschossböden teilen Trennwände die Obergeschosse in Säle; jede Wand hat eine Tür von 3 Blöcken Breite und 5 Höhe.', 'Erst den Boden, dann die Wand darauf.', 'Türen frei lassen.', 'Das Hauptgeschoss (piano nobile) liegt in Florentiner Palazzi eine Treppe über der Straße.')
  } };
  m[4] = { title: 'Dach', subtitle: `Bautüte 4: ${D.dachTitel}`, icon: '🏠', parts: Object.assign({
    dach: T(D.dachTeilTitel, D.dachText, 'Von der Außenkante und der Hofkante steigt das Dach lagenweise an.', 'Der Dachraum hat keinen Zugang.', f('dach'))
  }, D.dachExtra || {}) };
  m[5] = { title: 'Licht', subtitle: 'Bautüte 5: Seelaternen im Boden', icon: '💡', parts: {
    licht: T('Licht', 'Seelaternen im Boden jedes Raums, höchstens 12 Blöcke voneinander entfernt.', 'Sie ersetzen einzelne Bodenblöcke.', 'Nicht in Türöffnungen setzen.', 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.')
  } };
  for (const n of Object.keys(m)) for (const k of D.ohne || []) delete m[n].parts[k];   // Bauteile, die der Bauplan dieses Projekts nicht erzeugt
  if (D.modul2) Object.assign(m[2], D.modul2);                       // Titel/Untertitel, wenn das Modul keinen Hof enthält
  if (D.modul0) Object.assign(m[0], D.modul0);
  const mod6 = D.ausstattungModul || 6;
  const teile = {};
  for (const t of R.TEILE) {
    const c = R.INHALT.teile[t];
    if (!c) throw new Error(`${id}: Content für ${t} fehlt`);
    teile[t] = { title: c.title, description: c.description, tip: c.tip, caution: c.caution, fact: c.fact };
  }
  const extra = Object.keys(R.INHALT.teile).filter((t) => !R.TEILE.includes(t));
  if (extra.length) throw new Error(`${id}: Content ohne Bauteil: ${extra.join(', ')}`);
  m[mod6] = { title: R.INHALT.titel, subtitle: `Bautüte ${mod6}: ${R.INHALT.untertitel}`, icon: R.INHALT.icon, parts: teile };
  return m;
}

for (const id of (process.argv.length > 2 ? process.argv.slice(2) : Object.keys(DATEN))) {
  const D = DATEN[id];
  const R = require(path.join(ROOT, 'projects', id, 'model', '_raeume.js'));
  const dir = path.join(ROOT, 'projects', id, 'content');
  fs.mkdirSync(dir, { recursive: true });
  const m = module(id, D, R);
  for (const [n, j] of Object.entries(m)) {
    const out = { module: +n, title: j.title, subtitle: j.subtitle, icon: j.icon, parts: j.parts };
    fs.writeFileSync(path.join(dir, `modul_${n}.json`), JSON.stringify(out, null, 2));
  }
  console.log(`${id}: ${Object.keys(m).length} Module geschrieben`);
}
