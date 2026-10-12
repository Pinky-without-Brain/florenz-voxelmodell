const fs = require('fs');
const path = require('path');

const modulesToSync = [
  {
    mod: 4,
    file: 'webapp/js/data/module_4_steps.js',
    varName: 'MODULE_4_DATA',
    targetManual: '06_Modul_4_Tambour/BAUANLEITUNG_MODUL_4.md',
    title: 'Modul 4: Der achteckige Tambour',
    icon: '🥁',
    subtitle: 'Die 41 Block hohe achteckige Trommel mit Ochsenaugen & Galerie (Y=120 bis Y=160)'
  },
  {
    mod: 5,
    file: 'webapp/js/data/module_5_steps.js',
    varName: 'MODULE_5_DATA',
    targetManual: '07_Modul_5_Brunelleschis_Kuppel/BAUANLEITUNG_MODUL_5.md',
    title: 'Modul 5: Brunelleschis Doppelkuppel',
    icon: '🏛️',
    subtitle: 'Konzentrische Freitragende Wölbung (senza centine) in 78 Ringen (Y=161 bis Y=250)'
  },
  {
    mod: 6,
    file: 'webapp/js/data/module_6_steps.js',
    varName: 'MODULE_6_DATA',
    targetManual: '08_Modul_6_Laterne_und_Kugel/BAUANLEITUNG_MODUL_6.md',
    title: 'Modul 6: Die Laterne & Goldene Kugel',
    icon: '☀️',
    subtitle: 'Marmortempel, Voluten-Strebepfeiler, Verrocchios Goldkugel & Kreuz (Y=251 bis Y=315)'
  },
  {
    mod: 7,
    file: 'webapp/js/data/module_7_steps.js',
    varName: 'MODULE_7_DATA',
    targetManual: '09_Modul_7_Campanile_di_Giotto/BAUANLEITUNG_MODUL_7.md',
    title: 'Modul 7: Campanile di Giotto',
    icon: '🔔',
    subtitle: 'Der 185 Block hohe toskanische Glockenturm der Renaissance (Y=64 bis Y=249)'
  },
  {
    mod: 8,
    file: 'webapp/js/data/module_8_steps.js',
    varName: 'MODULE_8_DATA',
    targetManual: '10_Modul_8_Baptisterium_San_Giovanni/BAUANLEITUNG_MODUL_8.md',
    title: 'Modul 8: Baptisterium San Giovanni',
    icon: '🚪',
    subtitle: 'Das achteckige Taufhaus mit Paradiespforte und Goldmosaikkuppel (Y=64 bis Y=120)'
  }
];

const forbidden = /l[eé]go/i;

modulesToSync.forEach(m => {
  global.window = {};
  const filePath = path.join(__dirname, '..', m.file);
  const code = fs.readFileSync(filePath, 'utf8');
  eval(code);
  const steps = global.window[m.varName];

  let totalBlocks = 0;
  const bom = {};

  steps.forEach(s => {
    totalBlocks += s.blocks.length;
    s.blocks.forEach(b => {
      bom[b.type] = (bom[b.type] || 0) + 1;
    });
  });

  const sortedBom = Object.entries(bom).sort((a, b) => b[1] - a[1]);

  let md = `# ${m.icon} Schritt-für-Schritt Bauanleitung: ${m.title}\n`;
  md += `## Cathedral of Santa Maria del Fiore (Florenz) • Meisterbauer-Bauanleitung für Minecraft\n\n`;
  md += `> **${m.subtitle}**\n`;
  md += `>\n`;
  md += `> ⚠️ **Wichtiger Hinweis:** Alle Blockangaben und Koordinaten sind **100 % mathematisch exakt berechnet**. Keine Schätzungen oder Annäherungen!\n\n`;
  md += `---\n\n`;
  md += `## 📊 Übersicht Modul ${m.mod}\n\n`;
  md += `- **Gesamtzahl Bauschritte:** **${steps.length} Bauschritte**\n`;
  md += `- **Gesamtzahl Blöcke:** **${totalBlocks.toLocaleString('de-DE')} Blöcke**\n`;
  md += `- **Größter Einzelschritt:** **${Math.max(...steps.map(s => s.blocks.length)).toLocaleString('de-DE')} Blöcke**\n\n`;

  md += `### 📦 Stückliste (Bill of Materials)\n\n`;
  md += `| Block-Typ (Minecraft ID) | Exakte Anzahl | Anteil |\n`;
  md += `| :--- | :--- | :--- |\n`;
  sortedBom.forEach(([type, count]) => {
    const pct = ((count / totalBlocks) * 100).toFixed(1);
    md += `| \`${type}\` | **${count.toLocaleString('de-DE')}x** | ${pct} % |\n`;
  });
  md += `| **GESAMT** | **${totalBlocks.toLocaleString('de-DE')} Blöcke** | 100,0 % |\n\n`;

  md += `---\n\n`;
  md += `## 🧱 Die ${steps.length} Bauschritte im Detail\n\n`;

  steps.forEach((s, idx) => {
    const stepBom = {};
    let minY = Infinity, maxY = -Infinity;
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    s.blocks.forEach(b => {
      stepBom[b.type] = (stepBom[b.type] || 0) + 1;
      if (b.y < minY) minY = b.y;
      if (b.y > maxY) maxY = b.y;
      if (b.x < minX) minX = b.x;
      if (b.x > maxX) maxX = b.x;
      if (b.z < minZ) minZ = b.z;
      if (b.z > maxZ) maxZ = b.z;
    });

    const matSummary = Object.entries(stepBom)
      .map(([type, count]) => `\`${type}\`: ${count}x`)
      .join(', ');

    md += `### Schritt ${s.stepNumber}: ${s.title}\n`;
    md += `- **Neu verbaute Blöcke:** **${s.blocks.length.toLocaleString('de-DE')} Blöcke**\n`;
    md += `- **Höhenbereich:** **Y = ${minY} bis Y = ${maxY}**\n`;
    md += `- **Ausdehnung:** X = [${minX} .. ${maxX}], Z = [${minZ} .. ${maxZ}]\n`;
    md += `- **Benötigte Materialien:** ${matSummary}\n`;
    md += `- **Bauanweisung:** ${s.description}\n`;
    if (s.tip) md += `- 💡 **Meister-Tipp:** ${s.tip}\n`;
    if (s.caution) md += `- ⚠️ **Meisterbauer-Achtung:** ${s.caution}\n`;
    if (s.fact) md += `- 🎨 **Wusstest du schon?** ${s.fact}\n`;
    md += `\n`;
  });

  if (forbidden.test(md)) {
    throw new Error(`Forbidden word detected in generated manual for Modul ${m.mod}!`);
  }

  const outPath = path.join(__dirname, '..', m.targetManual);
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`Synced ${m.targetManual}: ${steps.length} steps, ${totalBlocks} blocks.`);
});

console.log('All requested manuals successfully synchronized!');
