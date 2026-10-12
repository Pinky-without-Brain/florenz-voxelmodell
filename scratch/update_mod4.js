const fs = require('fs');
const path = require('path');

// Read existing build_module_4.js
const origPath = path.join('C:', 'Users', 'tomkl', '.gemini', 'antigravity', 'brain', '84a2628a-b771-4a02-be1a-691381559d11', 'scratch', 'build_module_4.js');
let content = fs.readFileSync(origPath, 'utf8');

// Insert the missing upper wall layers before step 4.26
const wallLayersCode = `
  // =========================================================================
  // SCHRITT 4.26: Oberes Tambour-Mauerwerk Schicht 1 & 2 (Y=154 bis Y=155)
  // =========================================================================
  const s26a = [];
  for (let y = 154; y <= 155; y++) {
    for (let x = -24; x <= 24; x++) {
      for (let z = -42; z <= -37; z++) addBlock(s26a, x, y, z, (z === -42) ? "smooth_quartz" : "stone_bricks");
      for (let z =  37; z <=  42; z++) addBlock(s26a, x, y, z, (z ===  42) ? "smooth_quartz" : "stone_bricks");
    }
    for (let z = -24; z <= 24; z++) {
      for (let x = -42; x <= -37; x++) addBlock(s26a, x, y, z, (x === -42) ? "smooth_quartz" : "stone_bricks");
      for (let x =  37; x <=  42; x++) addBlock(s26a, x, y, z, (x ===  42) ? "smooth_quartz" : "stone_bricks");
    }
    for (let i = 0; i <= 17; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2) ? "smooth_quartz" : "stone_bricks";
        addBlock(s26a,  25 + i - w, y, -42 + i + w, type);
        addBlock(s26a, -25 - i + w, y, -42 + i + w, type);
        addBlock(s26a,  25 + i - w, y,  42 - i - w, type);
        addBlock(s26a, -25 - i + w, y,  42 - i - w, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.26",
    title: "Oberes Tambour-Mauerwerk: Schicht 1 & 2 (Y=154 bis Y=155)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Ziehe alle 8 Wände des Tambours fugenlos von Y=154 bis Y=155 hoch.",
    cameraHint: { eye: [70, 175, 70], target: [0, 154, 0] },
    blocks: s26a,
    tip: "Die Mauern schließen die Lücke zum späteren Kranzgesims vollständig.",
    caution: "Alle 8 Seiten des Oktogons gleichmäßig hochziehen.",
    fact: "Feste Wandung: Brunelleschi verlangte lückenlos massives Mauerwerk als Widerlager."
  });

  // =========================================================================
  // SCHRITT 4.27: Oberes Tambour-Mauerwerk Schicht 3 & 4 (Y=156 bis Y=157)
  // =========================================================================
  const s26b = [];
  for (let y = 156; y <= 157; y++) {
    for (let x = -24; x <= 24; x++) {
      for (let z = -42; z <= -37; z++) addBlock(s26b, x, y, z, (z === -42) ? "smooth_quartz" : "stone_bricks");
      for (let z =  37; z <=  42; z++) addBlock(s26b, x, y, z, (z ===  42) ? "smooth_quartz" : "stone_bricks");
    }
    for (let z = -24; z <= 24; z++) {
      for (let x = -42; x <= -37; x++) addBlock(s26b, x, y, z, (x === -42) ? "smooth_quartz" : "stone_bricks");
      for (let x =  37; x <=  42; x++) addBlock(s26b, x, y, z, (x ===  42) ? "smooth_quartz" : "stone_bricks");
    }
    for (let i = 0; i <= 17; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2) ? "smooth_quartz" : "stone_bricks";
        addBlock(s26b,  25 + i - w, y, -42 + i + w, type);
        addBlock(s26b, -25 - i + w, y, -42 + i + w, type);
        addBlock(s26b,  25 + i - w, y,  42 - i - w, type);
        addBlock(s26b, -25 - i + w, y,  42 - i - w, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.27",
    title: "Oberes Tambour-Mauerwerk: Schicht 3 & 4 (Y=156 bis Y=157)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Vollende das tragende Mauerwerk aller 8 Tambourwände bis zur Höhe Y=157. Der Unterbau für das Architravgesims steht nun 100% tragfähig bereit!",
    cameraHint: { eye: [70, 175, 70], target: [0, 156, 0] },
    blocks: s26b,
    tip: "Das Mauerwerk ist nun vollkommen geschlossen bis Y=157.",
    caution: "Prüfe die ebene Oberkante vor dem Aufsetzen des Architravs.",
    fact: "Kolossales Gewicht: Über 50.000 Steinziegel bilden den zylindrischen Rumpf des Tambours."
  });
`;

// Insert before SCHRITT 4.26
content = content.replace(
  '  // =========================================================================\r\n  // SCHRITT 4.26: Michelangelos Grillenkäfig',
  wallLayersCode + '\n  // =========================================================================\r\n  // SCHRITT 4.28: Michelangelos Grillenkäfig'
);
if (!content.includes('SCHRITT 4.28: Michelangelos Grillenkäfig')) {
  // try LF version
  content = content.replace(
    '  // =========================================================================\n  // SCHRITT 4.26: Michelangelos Grillenkäfig',
    wallLayersCode + '\n  // =========================================================================\n  // SCHRITT 4.28: Michelangelos Grillenkäfig'
  );
}

// Renumber remaining steps: 4.26 -> 4.28, 4.27 -> 4.29, 4.28 -> 4.30, 4.29 -> 4.31
content = content.replace('stepNumber: "4.26",', 'stepNumber: "4.28",');
content = content.replace('stepNumber: "4.27",', 'stepNumber: "4.29",');
content = content.replace('stepNumber: "4.28",', 'stepNumber: "4.30",');
content = content.replace('stepNumber: "4.29",', 'stepNumber: "4.31",');
content = content.replace('29 feine', '31 feine');

fs.writeFileSync('scratch/build_module_4_perfect.js', content);
console.log('Successfully wrote scratch/build_module_4_perfect.js');
