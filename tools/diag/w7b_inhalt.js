'use strict';
// Schreibt content/modul_0..N.json der Wahrzeichen der Welle 7b (loggia_dei_servi, palazzo_nonfinito, sant_apollonia):
// Standardmodule 0..5 des Palazzo-Bauplans aus den Angaben SPEC unten, Ausstattungsmodul aus INHALT in model/_raeume.js,
// ergänzt um Trennwände (modul_2/modul_3). Nur Bauteile, die der Bauplan wirklich belegt, bekommen einen Eintrag.
// Aufruf: node tools/diag/w7b_inhalt.js [<projekt-id> ...]
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');

const SPEC = require('./w7b_texte.js');

const MODULE = {
  0: { titel: 'Fundament, Boden und Hof', icon: '🧱', teile: ['fundament', 'boden', 'hof', 'treppe'] },
  1: { titel: 'Fassaden', icon: '🏛️', teile: ['aussenwand', 'portikus', 'fenster', 'kranzgesims'] },
  2: { titel: 'Hof und Innenwände', icon: '🏛️', teile: ['hofarkaden', 'hofwaende', 'hoffenster', 'innenwaende', 'loggiawand', 'trennwaende'] },
  3: { titel: 'Böden und Decke', icon: '🪵', teile: ['geschossboeden', 'decke', 'innenwaende_og', 'trennwaende_og'] },
  4: { titel: 'Dach', icon: '🏠', teile: ['dach'] },
  5: { titel: 'Licht', icon: '✨', teile: ['licht'] }
};

function standard(S, id) {
  const y = S.bodenY, ge = S.geschosse.reduce((a, h) => { a.push(a[a.length - 1] + h); return a; }, [0]);
  const Y = (l) => `Y ${y + l}`;
  const gesimse = ge.slice(1, -1).map((l) => `Y ${y + l}`).join(', ');
  const T = {
    fundament: { title: 'Fundament', description: `Wo das Gelände unter dem Bau tiefer liegt als Y ${y - 1}, füllst du mit Bruchstein bis Y ${y - 1} auf; höher liegendes Gelände wurde bis Y ${y - 1} abgetragen.`, tip: 'Arbeite Spalte für Spalte.', caution: `Wo das Gelände Y ${y - 1} schon erreicht, bleibt die Spalte leer.` },
    boden: { title: 'Boden', description: `Auf Y ${y} legst du den Boden des Erdgeschosses im Schachmuster aus Terrakotta und hellem Marmor${S.bodenZusatz || ''}.`, tip: 'Ein Feld ist drei Blöcke groß.', caution: 'Die Lichtfelder setzt erst Bautüte 5.' },
    hof: { title: S.hofTitel || 'Höfe', description: `${S.hofText || 'Die Höfe bleiben offen'}; ihr Boden aus Pflaster liegt auf Y ${y}.`, tip: 'Nur der Boden, kein Dach.', caution: 'Hier entsteht nichts in die Höhe.' },
    treppe: { title: 'Wendeltreppe', description: `Eine Wendeltreppe aus Pietra serena um einen Kern von 3 × 3 Blöcken führt ${S.treppeOrt} vom Erdgeschoss bis ins oberste Geschoss (${Y(ge[ge.length - 1])}).`, tip: 'Pro Viertelumlauf steigt sie drei Blöcke, in den Ecken liegen Podeste.', caution: 'Über Stufen und Podesten bleiben drei Blöcke frei.' },
    aussenwand: { title: 'Außenwände', description: `Die Außenwand umläuft den Block bis ${Y(ge[ge.length - 1])}: ${S.aussenText} Gesimse trennen die Geschosse (${gesimse}).`, tip: 'Zwei Blöcke dick: außen Putz oder Stein, innen Putz.', caution: 'Lass Portale und Tore frei.' },
    portikus: { title: 'Portikus', description: S.portikusText, tip: 'Die Säulen stehen im gleichen Abstand, die Bögen bleiben bis zum Boden offen.', caution: S.portikusCaution },
    fenster: { title: 'Fenster', description: S.fensterText, tip: 'Die Fenster folgen einem festen Raster entlang jeder Wand.', caution: 'Glas in die ganze Wandtiefe setzen.' },
    kranzgesims: { title: 'Kranzgesims', description: `Oben schließt das Kranzgesims die Fassade ab (${Y(ge[ge.length - 1] - 1)} bis ${Y(ge[ge.length - 1])}).`, tip: 'Zwei Lagen auf der ganzen Länge.', caution: 'Es gehört zur Außenwand, nicht zum Dach.' },
    hofarkaden: { title: 'Hofarkaden', description: S.hofarkadenText, tip: 'Die Säulen stehen in gleichem Abstand am Hofrand.', caution: 'Die Bögen bleiben offen.' },
    hofwaende: { title: 'Hofwände', description: S.hofwaendeText || `Die Wände um die Höfe steigen bis ${Y(ge[ge.length - 1])}, verputzt, mit Gesimsen auf Höhe der Geschossböden.`, tip: 'Gesimse aus Pietra serena.', caution: 'Türen und Fenster frei lassen.' },
    hoffenster: { title: 'Hoffenster', description: 'Zu den Höfen öffnen sich die Obergeschosse mit Fenstern im gleichen Raster wie außen.', tip: 'Je Joch ein Fenster.', caution: 'Glas in die ganze Wandtiefe.' },
    innenwaende: { title: 'Innenwände', description: S.innenwaendeText || 'Zwischen Galerie und Räumen steht im Erdgeschoss eine Innenwand mit Türen.', tip: 'Türen in regelmäßigem Abstand.', caution: 'Türen frei lassen.' },
    loggiawand: { title: 'Rückwand der Loggia', description: S.loggiawandText, tip: 'Die Türen sind 3 Blöcke breit und 7 hoch.', caution: 'Türen frei lassen.' },
    trennwaende: { title: 'Trennwände', description: S.trennText, tip: 'Türen beim Bauen frei lassen.', caution: 'Die Wände stehen auf dem Boden des Erdgeschosses.' },
    geschossboeden: { title: 'Geschossböden', description: `Böden aus Holz und Terrakotta im Schachmuster auf ${ge.slice(1, -1).map((l) => Y(l)).join(' und ')}${S.treppenloch === false ? '' : '; ein Treppenloch für die Wendeltreppe'}.`, tip: 'Das Treppenloch bleibt frei.', caution: 'Erst die Böden, dann die Wände der Obergeschosse.' },
    decke: { title: 'Oberste Decke', description: `Die oberste Decke auf ${Y(ge[ge.length - 1])} schließt das Haus; darüber liegt das Dach.`, tip: 'Eine Lage Putz.', caution: 'Die Decke gehört nicht zum Dach.' },
    innenwaende_og: { title: 'Innenwände der Obergeschosse', description: 'Die Innenwände setzen sich in den Obergeschossen fort, mit Türen.', tip: 'Erst der Boden, dann die Wand.', caution: 'Türen frei lassen.' },
    trennwaende_og: { title: 'Trennwände der Obergeschosse', description: S.trennOgText, tip: 'Erst der Boden, dann die Wand darauf.', caution: 'Türen frei lassen.' },
    dach: { title: S.dachFlach ? 'Flachdach' : 'Walmdach', description: S.dachText, tip: 'Von außen nach innen bauen.', caution: 'Der Dachraum darunter ist unzugänglich.' },
    licht: { title: 'Licht', description: 'Seelaternen im Boden jedes Raums, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.' }
  };
  const FAKT = Object.assign({
    trennwaende: 'Die Raumaufteilung ist Stufe C; belegt sind nur die Räume selbst.',
    trennwaende_og: 'Die Raumaufteilung ist Stufe C; belegt sind nur die Räume selbst.',
    licht: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.',
    treppe: 'Eine Wendeltreppe ist die einfachste Treppe, die alle Geschosse auf kleiner Fläche verbindet; sie ist hier eine Annahme (Stufe C).',
    fundament: 'Die Geländehöhen stammen aus dem Höhenmodell der Stadt (Stufe B).',
    boden: 'Das Schachmuster ist eine Gestaltungsannahme (Stufe C).',
    decke: 'Die Geschosshöhen folgen der OSM-Gebäudehöhe, die Aufteilung ist Stufe C.',
    kranzgesims: 'Ein Kranzgesims schließt florentiner Fassaden nach oben ab.',
    licht2: ''
  }, S.fakten || {});
  const out = {};
  for (const n of Object.keys(MODULE)) {
    const parts = {};
    for (const t of MODULE[n].teile) {
      if (!S.teile.has(t)) continue;
      const base = T[t];
      if (!base) throw new Error(`${id}: kein Text für ${t}`);
      parts[t] = Object.assign({}, base, (S.ueberschreibe || {})[t] || {}, { fact: FAKT[t] || 'Maße und Raumaufteilung sind Stufe C, Umriss und Höhe folgen OpenStreetMap.' });
    }
    out[n] = { module: +n, title: MODULE[n].titel, subtitle: `Bautüte ${n}: ${S.untertitel[n]}`, icon: MODULE[n].icon, parts };
  }
  return out;
}

const TRENN = {
  2: ['trennwaende'],
  3: ['trennwaende_og']
};

for (const id of (process.argv.length > 2 ? process.argv.slice(2) : Object.keys(SPEC))) {
  const S = SPEC[id];
  const R = require(path.join(ROOT, 'projects', id, 'model', '_raeume.js'));
  const dir = path.join(ROOT, 'projects', id, 'content');
  fs.mkdirSync(dir, { recursive: true });
  S.teile = new Set(require(path.join(ROOT, 'projects', id, 'model', '_' + S.kuerzel + '.js')).plan().teile.keys());
  const std = standard(S, id);
  for (const n of Object.keys(std)) {
    const j = std[n];
    if (!Object.keys(j.parts).length) continue;
    fs.writeFileSync(path.join(dir, `modul_${n}.json`), JSON.stringify(j, null, 2));
  }
  const nAus = S.ausstattungModul;
  const teile = {};
  for (const t of R.TEILE) {
    const c = R.INHALT.teile[t];
    if (!c) throw new Error(`${id}: Content für ${t} fehlt`);
    teile[t] = { title: c.title, description: c.description, tip: c.tip, caution: c.caution, fact: c.fact };
  }
  const extra = Object.keys(R.INHALT.teile).filter((t) => !R.TEILE.includes(t));
  if (extra.length) throw new Error(`${id}: Content ohne Bauteil: ${extra.join(', ')}`);
  fs.writeFileSync(path.join(dir, `modul_${nAus}.json`), JSON.stringify({ module: nAus, title: R.INHALT.titel, subtitle: `Bautüte ${nAus}: ${R.INHALT.untertitel}`, icon: R.INHALT.icon, parts: teile }, null, 2));
  void TRENN;
  console.log(`${id}: modul_0..${nAus} geschrieben`);
}
