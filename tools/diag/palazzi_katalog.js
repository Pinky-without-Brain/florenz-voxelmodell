'use strict';
// Schreibt den Abschnitt "Ausgestaltete Innenräume (V5a)" in 20_Stadtmodell_Florenz/wahrzeichen/<id>/BAUTEIL_KATALOG.md
// (zwischen den Marken V5a-Anfang und V5a-Ende; wiederholbar). Texte und Inhalte stammen aus INHALT in model/_raeume.js,
// Lage und Stufe aus META unten. Aufruf: node tools/diag/palazzi_katalog.js [<projekt-id> ...]
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const A = '<!-- V5a-Anfang -->', E = '<!-- V5a-Ende -->';

const META = {
  bargello: {
    modul: 7, lichtModul: 6, geschosse: 'EG Lage 0..20, 1. OG 20..38, 2. OG 38..54 (Rahmen BA, achsparallel)',
    teilung: 'Neun Trennwandlinien (2 Zellen stark, Türen 3 × 5) teilen den Ring in allen drei Geschossen: Westflügel (Nord- und Südhälfte), Nordflügel in drei Säle, Ostflügel in Nord-, Mittel- und Südraum, Südflügel in drei Räume. Hofgalerie, Portale und die Wendeltreppe bleiben frei.',
    lage: {
      freitreppe: ['Hof, Nordseite, Aufstieg nach Westen (lokal u 83 → 64, w 29..31)', 'Existenz A, Lage und Länge C'],
      verone: ['Hofwand Nord, 1. OG (u 56..64, w 24..32)', 'Existenz A, Lage C'],
      hof_wappen: ['Hofwände des 1. und 2. OG', 'Schmuck B, Farben C'],
      hofbrunnen: ['Hofmitte (u 62,5, w 46)', 'C'],
      michelangelo_saal: ['EG, Westflügel Nord (u 5..35, w 4..50)', 'Inhalt A, Lage C'],
      salone_di_donatello: ['1. OG, Ostflügel Nord (u 94..136, w 9..31)', 'Inhalt A, Lage C'],
      cappella_del_podesta: ['1. OG, Nordflügel West (u 36..66, w 3..18)', 'Inhalt A, Lage C'],
      licht_ausstattung: ['alle ausgestalteten Räume', 'Regel §1.5']
    },
    begehbar: 'Die Freitreppe besteht aus 20 Treppenblöcken (Breite 3, soweit der Hof reicht) auf massivem Unterbau, Kopffreiheit 3; die Verone ist eine offene, überdachte Loggia (deklarierte Öffnung `loggia`), ihr Tor (4 × 6) führt in die Galerie des 1. OG. Ohne die Wendeltreppe ist der ganze 1. OG über die Freitreppe erreichbar (Test).'
  },
  palazzo_strozzi: {
    modul: 6, lichtModul: 5, geschosse: 'EG Lage 0..24, Piano nobile 24..44, 2. OG 44..62 (Rahmen PS, θ −2°)',
    teilung: 'Acht Trennwandlinien (Türen 3 × 5) trennen die vier Eckräume von den Flügeln: Nordwest (mit der Wendeltreppe), Nord, Nordost, West, Ost, Südwest, Süd, Südost in allen Geschossen. Hofgalerie und Portale bleiben frei.',
    lage: {
      ausstellung_nord: ['Piano nobile, Nordflügel (u 34..80, w 3..28)', 'Inhalt B, Lage C'],
      ausstellung_sued: ['Piano nobile, Südflügel (u 34..80, w 62..88)', 'Inhalt B, Lage C'],
      ausstellung_west: ['Piano nobile, Westflügel (u 3..33, w 28..61)', 'Inhalt B, Lage C'],
      ausstellung_ost: ['Piano nobile, Ostflügel (u 81..114, w 28..61)', 'Inhalt B, Lage C'],
      hof_cronaca: ['Hof (u 41..71, w 36..52)', 'Hof A, Ausstattung C'],
      panca_laternen: ['Straßenfassaden außen (Luftraum 2), Laternen an Ecken und Portalen', 'Panca und Laternen A, Lage B'],
      licht_ausstattung: ['alle ausgestalteten Räume', 'Regel §1.5']
    },
    begehbar: 'Die Steinbank liegt eine Lage hoch auf dem Straßenpflaster (kein Konflikt mit dem Stadtgrund), an den drei Portalen ist sie unterbrochen. Der Hof ist jetzt über die Arkaden erreichbar (Arkadenöffnungen gehen durch beide Lagen der Hofwand).'
  },
  palazzo_rucellai: {
    modul: 6, lichtModul: 5, geschosse: 'EG Lage 0..20, Piano nobile 20..37, 2. OG 37..52 (Rahmen PR, θ −13,5°)',
    teilung: 'Vier Trennwandlinien (Türen 3 × 5): zwei Querwände und eine Längswand teilen den Fassadenblock in je drei Vorder- und Hintersäle, eine Wand trennt im Ostflügel das Treppenhaus vom Nordteil. Hofgalerie, Portale und Wendeltreppe bleiben frei.',
    lage: {
      sala_prima: ['Piano nobile, Fassadensaal West (u 4..20, w −20..−3)', 'Inhalt C, Lage C'],
      sala_seconda: ['Piano nobile, Fassadensaal Mitte (u 20..36, w −20..−3)', 'Inhalt C, Lage C'],
      sala_terza: ['Piano nobile, Fassadensaal Ost (u 36..52, w −20..−3)', 'Inhalt C, Lage C'],
      hof_rucellai: ['Hof (u 12..25, w −65..−44)', 'C'],
      licht_ausstattung: ['alle ausgestalteten Räume', 'Regel §1.5']
    },
    begehbar: 'Die drei Fassadensäle bilden eine Enfilade (Türen in den Querwänden); die Kamine stehen neben den Türen der Hinterwand.'
  },
  palazzo_medici_riccardi: {
    modul: 6, lichtModul: 5, geschosse: 'EG Lage 0..22, Piano nobile 22..40, 2. OG 40..56 (Rahmen PM, θ 24°)',
    teilung: 'Zehn Trennwandlinien (Türen 3 × 5): im Via-Cavour-Flügel Nord | Kapelle | Süd, im Südflügel die Galerie (drei Wände), der Nordblock in vier Räume, die Westmasse in zwei Teile. Höfe, Galerien, Portale und Wendeltreppe bleiben frei.',
    lage: {
      cappella_dei_magi: ['Piano nobile, Via-Cavour-Flügel (u −22..−3, w −52..−32)', 'Inhalt A, Lage C'],
      galleria_luca_giordano: ['Piano nobile, Südflügel (u −97..−62, w −16,5..−3)', 'Inhalt A, Lage C'],
      michelozzo_hof: ['Michelozzos Hof (Loch 1: u −53..−34, w −51..−31)', 'Hof A, Ausstattung B'],
      medaillons: ['Hofwände von Loch 1 über den Arkadenpfeilern, Lage 14..20', 'Schmuck B'],
      garten_medici: ['Garten (Loch 2: u −113..−76, w −83..−18)', 'Garten A, Ausstattung C'],
      licht_ausstattung: ['alle ausgestalteten Räume', 'Regel §1.5']
    },
    begehbar: 'Die Türen zum Garten und zu den Lichthöfen gehen jetzt durch beide Lagen der Hofwand; die Luft unter Baumkronen und Statuenarmen im Freien ist als offene Luft (`fenster_offen`) deklariert.'
  },
  ospedale_degli_innocenti: {
    modul: 6, lichtModul: 5, geschosse: 'EG Lage 0..20, 1. OG 20..34 (Rahmen OI, θ 37,2°)',
    teilung: 'Elf Trennwandlinien (Türen 3 × 5): vier Querwände gliedern die Räume hinter der Loggia in fünf Säle (je einer mit Tür in der Loggiawand), Längswände trennen Loggiaflügel, Nord- und Südhalle, drei Wände gliedern die Ostmasse. Über der Loggia laufen die Wände im 1. OG durch (dort liegen Säle).',
    lage: {
      ruota: ['Loggiawand, Nordende (u 11..12, w 8..12)', 'Inhalt A, Lage B'],
      chiostro_uomini: ['Chiostro degli Uomini (Loch 3: u 40..71, w 40..70)', 'Hof A, Ausstattung C'],
      chiostro_donne: ['Chiostro delle Donne (Loch 2: u 31..92, w 109..120)', 'Hof A, Ausstattung C'],
      museo_tafelbilder: ['1. OG über der Loggia (u 0..30, w 29..56)', 'Inhalt B, Lage C'],
      museo_ghirlandaio: ['1. OG über der Loggia (u 0..30, w 57..84)', 'Inhalt A, Lage C'],
      museo_robbia: ['1. OG über der Loggia (u 0..30, w 85..112)', 'Inhalt B, Lage C'],
      licht_ausstattung: ['alle ausgestalteten Räume', 'Regel §1.5']
    },
    begehbar: 'Die Ruota ist eine dichte Fensternische (Rahmen, Speichen, dunkles Glas) in der Rückwand der Loggia, keine Öffnung. Die Höfe sind über die Arkaden und Türen erreichbar.'
  }
};

for (const id of (process.argv.length > 2 ? process.argv.slice(2) : Object.keys(META))) {
  const m = META[id];
  const R = require(path.join(ROOT, 'projects', id, 'model', '_raeume.js'));
  const f = path.join(ROOT, '20_Stadtmodell_Florenz', 'wahrzeichen', id, 'BAUTEIL_KATALOG.md');
  let md = fs.readFileSync(f, 'utf8');
  const zeilen = [
    '## Ausgestaltete Innenräume (V5a)', '',
    `Geschosse: ${m.geschosse}. Bauplan und Raumteilung: \`tools/wahrzeichen/palazzo.js\` (\`cfg.raeume\`), Raumplan und Ausstattung: \`projects/${id}/model/_raeume.js\`, Werkzeug \`tools/wahrzeichen/palazzo_raum.js\`. Modul ${m.modul} (nach dem Licht in Modul ${m.lichtModul}). Alles vereinfacht, nicht nach Vorbild; Stufen: A belegt, B Literatur oder begründet, C Entwurf.`, '',
    `**Raumteilung.** ${m.teilung} Jedes Geschoss bleibt eine zusammenhängende Raumgruppe (Test \`tools/test/palazzi.test.js\`).`, '',
    '| Bauteil | Titel | Lage im Grundriss | Stufe | Inhalt und Quelle |', '|---|---|---|---|---|'
  ];
  for (const t of R.TEILE) {
    const c = R.INHALT.teile[t], l = m.lage[t];
    zeilen.push(`| \`${t}\` | ${c.title} | ${l[0]} | ${l[1]} | ${c.description} ${c.fact} |`);
  }
  zeilen.push('', `**Begehbarkeit und Licht.** ${m.begehbar} Jeder Raum bekommt Seelaternen im Boden (Raster 12, je Raum getrennt); Lichter neben Ausstattungszellen gehören zum Teil \`licht_ausstattung\` im Ausstattungsmodul. R13: 0 nicht erreichbare Komponenten, R14: 0 Lücken.`, '');
  const NL = String.fromCharCode(10);
  const block = A + NL + zeilen.join(NL) + NL + E + NL;
  const von = md.indexOf(A), bis = md.indexOf(E);
  if (von >= 0 && bis > von) {
    let rest = md.slice(bis + E.length);
    if (rest.startsWith(NL)) rest = rest.slice(1);
    md = md.slice(0, von) + block + rest;
  } else md = md.trimEnd() + NL + NL + block;
  // Modultabelle: Zeile für das Ausstattungsmodul ergänzen
  const zeile = '| ' + m.modul + ' | Ausgestaltete Innenräume | ' + R.TEILE.map((t) => '`' + t + '`').join(', ') + ' |';
  if (!md.includes('| ' + m.modul + ' | Ausgestaltete Innenräume |')) {
    const zl = md.split(NL);
    const li = zl.findIndex((l) => l.startsWith('| ' + m.lichtModul + ' | Licht |'));
    if (li < 0) throw new Error(id + ': Lichtzeile der Modultabelle nicht gefunden');
    zl.splice(li + 1, 0, zeile);
    md = zl.join(NL);
  }
  fs.writeFileSync(f, md);
  console.log(`${id}: Katalog ergänzt (${R.TEILE.length} Bauteile)`);
}
