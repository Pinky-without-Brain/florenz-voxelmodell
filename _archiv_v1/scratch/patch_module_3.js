const fs = require('fs');

let code = fs.readFileSync('scratch/build_module_3_perfect.js', 'utf8');

// Replace Step 2 with 2a (Y=65..70) and 2b (Y=71..75)
const oldS2 = `  // 2. Osttribune: Seitenwände des Chores (X=45 bis 120, Y=65 bis 75)
  const s2a = [];
  for (let y = 65; y <= 75; y++) {
    for (let x = 45; x <= 120; x++) {
      addBlock(s2a, x, y, -35, "stone_bricks");
      addBlock(s2a, x, y, -34, "stone_bricks");
      addBlock(s2a, x, y,  34, "stone_bricks");
      addBlock(s2a, x, y,  35, "stone_bricks");
    }
  }
  [{x: 120, z: -35}, {x: 120, z: 35}].forEach(b => {
    for (let y = 65; y <= 75; y++) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) addBlock(s2a, b.x + dx, y, b.z + dz, (y === 65) ? "dark_prismarine" : "smooth_quartz");
      }
    }
  });
  steps.push({
    stepNumber: 2,
    title: "Osttribune: Grundmauern der Chor-Seitenwände (Y=65 bis 75)",
    module: "Modul 3: Vierung & Tribunen",
    description: "Ziehe die massiven doppelreihigen Seitenwände des Hauptchors von X=45 bis X=120 fugenlos hoch.",
    cameraHint: { eye: [90, 85, 55], target: [80, 70, 0] },
    blocks: s2a,
    tip: "Die Seitenwände schließen bündig an die Ostpfeiler der Vierung an.",
    caution: "Prüfe den Abstand von Z=-35 bis Z=+35.",
    fact: "Florentiner Pietra Forte: Extrem widerstandsfähiger Sandstein aus lokalen Steinbrüchen."
  });`;

const newS2 = `  // 2. Osttribune: Seitenwände des Chores Sockel (Y=65 bis 70)
  const s2a = [];
  for (let y = 65; y <= 70; y++) {
    for (let x = 45; x <= 120; x++) {
      addBlock(s2a, x, y, -35, "stone_bricks");
      addBlock(s2a, x, y, -34, "stone_bricks");
      addBlock(s2a, x, y,  34, "stone_bricks");
      addBlock(s2a, x, y,  35, "stone_bricks");
    }
  }
  [{x: 120, z: -35}, {x: 120, z: 35}].forEach(b => {
    for (let y = 65; y <= 70; y++) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) addBlock(s2a, b.x + dx, y, b.z + dz, (y === 65) ? "dark_prismarine" : "smooth_quartz");
      }
    }
  });
  steps.push({
    stepNumber: 2,
    title: "Osttribune: Grundmauern der Chor-Seitenwände (Y=65 bis 70)",
    module: "Modul 3: Vierung & Tribunen",
    description: "Ziehe die massiven doppelreihigen Seitenwände des Hauptchors von X=45 bis X=120 bis Y=70 hoch.",
    cameraHint: { eye: [90, 85, 55], target: [80, 70, 0] },
    blocks: s2a,
    tip: "Die Seitenwände schließen bündig an die Ostpfeiler der Vierung an.",
    caution: "Prüfe den Abstand von Z=-35 bis Z=+35.",
    fact: "Florentiner Pietra Forte: Extrem widerstandsfähiger Sandstein aus lokalen Steinbrüchen."
  });

  // 3. Osttribune: Seitenwände des Chores oberer Sockel (Y=71 bis 75)
  const s2a2 = [];
  for (let y = 71; y <= 75; y++) {
    for (let x = 45; x <= 120; x++) {
      addBlock(s2a2, x, y, -35, "stone_bricks");
      addBlock(s2a2, x, y, -34, "stone_bricks");
      addBlock(s2a2, x, y,  34, "stone_bricks");
      addBlock(s2a2, x, y,  35, "stone_bricks");
    }
  }
  [{x: 120, z: -35}, {x: 120, z: 35}].forEach(b => {
    for (let y = 71; y <= 75; y++) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) addBlock(s2a2, b.x + dx, y, b.z + dz, "smooth_quartz");
      }
    }
  });
  steps.push({
    stepNumber: 3,
    title: "Osttribune: Grundmauern der Chor-Seitenwände (Y=71 bis 75)",
    module: "Modul 3: Vierung & Tribunen",
    description: "Führe die Seitenwände des Hauptchores bis zur Sockelhöhe Y=75 empor.",
    cameraHint: { eye: [90, 85, 55], target: [80, 72, 0] },
    blocks: s2a2,
    tip: "Die Sockelhöhe Y=75 ist nun auf beiden Chorseiten erreicht.",
    caution: "Prüfe die Wandflucht.",
    fact: "Solide Mauern: Doppelschaliges Quadermauerwerk garantiert ewige Haltbarkeit."
  });`;

code = code.replace(oldS2, newS2);

// Replace Step 12 and 13 with 4 separate single-wall steps
const oldS10 = `  // 12. Vierungs-Zwickelmauern: West- & Ostwand (Y=100 bis 119)
  const s10a = [];
  for (let t = -42; t <= 42; t++) {
    const archH = Math.round(20 * (1 - (t * t) / (42 * 42)));
    const yTop = 95 + archH;
    for (let y = yTop + 1; y <= 119; y++) {
      addBlock(s10a, -43, y, t, "stone_bricks");
      addBlock(s10a, -44, y, t, "stone_bricks");
      addBlock(s10a,  43, y, t, "stone_bricks");
      addBlock(s10a,  44, y, t, "stone_bricks");
    }
  }
  steps.push({
    stepNumber: 12,
    title: "Vierungs-Zwickelmauern: West- & Ostwand (Y=100 bis 119)",
    module: "Modul 3: Vierung & Tribunen",
    description: "Mauere die Zwickel über den westlichen und östlichen Vierungsbögen bis zur ebenen Gesimshöhe Y=119 massiv mit Steinziegeln auf.",
    cameraHint: { eye: [75, 130, 40], target: [0, 112, 0] },
    blocks: s10a,
    tip: "Das Mauerwerk bildet ein vollkommen geschlossenes Auflager bei Y=119.",
    caution: "Keine Fugen zwischen Bogen und Oberkante offen lassen.",
    fact: "Schubableitung: Wandelt den Bogenschub in senkrechte Pfeilerlast um."
  });

  // 13. Vierungs-Zwickelmauern: Nord- & Südwand (Y=100 bis 119)
  const s10b = [];
  for (let t = -42; t <= 42; t++) {
    const archH = Math.round(20 * (1 - (t * t) / (42 * 42)));
    const yTop = 95 + archH;
    for (let y = yTop + 1; y <= 119; y++) {
      addBlock(s10b, t, y, -43, "stone_bricks");
      addBlock(s10b, t, y, -44, "stone_bricks");
      addBlock(s10b, t, y,  43, "stone_bricks");
      addBlock(s10b, t, y,  44, "stone_bricks");
    }
  }
  steps.push({
    stepNumber: 13,
    title: "Vierungs-Zwickelmauern: Nord- & Südwand (Y=100 bis 119)",
    module: "Modul 3: Vierung & Tribunen",
    description: "Mauere die Zwickel über den nördlichen und südlichen Vierungsbögen bis zur ebenen Gesimshöhe Y=119 auf. Alle vier Vierungswände sind nun vollkommen geschlossen!",
    cameraHint: { eye: [40, 130, 75], target: [0, 112, 0] },
    blocks: s10b,
    tip: "Alle vier Vierungswände bilden nun eine ebene waagerechte Plattform.",
    caution: "Kontrolliere die Höhe Y=119 an allen vier Seiten.",
    fact: "Perfekte Waagerechte: Brunelleschi forderte eine absolut waagerechte Ebene als Basis für seinen Tambour."
  });`;

const newS10 = `  // 13. Vierungs-Zwickelmauer: Westwand (Y=100 bis 119)
  const s10w = [];
  for (let t = -42; t <= 42; t++) {
    const archH = Math.round(20 * (1 - (t * t) / (42 * 42)));
    const yTop = 95 + archH;
    for (let y = yTop + 1; y <= 119; y++) {
      addBlock(s10w, -43, y, t, "stone_bricks");
      addBlock(s10w, -44, y, t, "stone_bricks");
    }
  }
  steps.push({
    stepNumber: 13,
    title: "Vierungs-Zwickelmauer: Westwand (Y=100 bis 119)",
    module: "Modul 3: Vierung & Tribunen",
    description: "Mauere den Zwickel über dem westlichen Vierungsbogen bis zur Gesimshöhe Y=119 auf.",
    cameraHint: { eye: [-60, 130, 0], target: [-43, 112, 0] },
    blocks: s10w,
    tip: "Schließt nahtlos an das Langhaus an.",
    caution: "Höhe Y=119 eben halten.",
    fact: "Tragende Westwand: Verbindung zwischen Langhaus und Vierung."
  });

  // 14. Vierungs-Zwickelmauer: Ostwand (Y=100 bis 119)
  const s10e = [];
  for (let t = -42; t <= 42; t++) {
    const archH = Math.round(20 * (1 - (t * t) / (42 * 42)));
    const yTop = 95 + archH;
    for (let y = yTop + 1; y <= 119; y++) {
      addBlock(s10e, 43, y, t, "stone_bricks");
      addBlock(s10e, 44, y, t, "stone_bricks");
    }
  }
  steps.push({
    stepNumber: 14,
    title: "Vierungs-Zwickelmauer: Ostwand (Y=100 bis 119)",
    module: "Modul 3: Vierung & Tribunen",
    description: "Mauere den Zwickel über dem östlichen Vierungsbogen bis zur Gesimshöhe Y=119 auf.",
    cameraHint: { eye: [60, 130, 0], target: [43, 112, 0] },
    blocks: s10e,
    tip: "Schließt nahtlos an den Chor an.",
    caution: "Höhe Y=119 eben halten.",
    fact: "Tragende Ostwand: Trägt den Tambour über der Choröffnung."
  });

  // 15. Vierungs-Zwickelmauer: Nordwand (Y=100 bis 119)
  const s10n = [];
  for (let t = -42; t <= 42; t++) {
    const archH = Math.round(20 * (1 - (t * t) / (42 * 42)));
    const yTop = 95 + archH;
    for (let y = yTop + 1; y <= 119; y++) {
      addBlock(s10n, t, y, -43, "stone_bricks");
      addBlock(s10n, t, y, -44, "stone_bricks");
    }
  }
  steps.push({
    stepNumber: 15,
    title: "Vierungs-Zwickelmauer: Nordwand (Y=100 bis 119)",
    module: "Modul 3: Vierung & Tribunen",
    description: "Mauere den Zwickel über dem nördlichen Vierungsbogen bis zur Gesimshöhe Y=119 auf.",
    cameraHint: { eye: [0, 130, -60], target: [0, 112, -43] },
    blocks: s10n,
    tip: "Schließt an die Nordtribune an.",
    caution: "Höhe Y=119 eben halten.",
    fact: "Tragende Nordwand: Trägt den Tambour im Norden."
  });

  // 16. Vierungs-Zwickelmauer: Südwand (Y=100 bis 119)
  const s10s = [];
  for (let t = -42; t <= 42; t++) {
    const archH = Math.round(20 * (1 - (t * t) / (42 * 42)));
    const yTop = 95 + archH;
    for (let y = yTop + 1; y <= 119; y++) {
      addBlock(s10s, t, y, 43, "stone_bricks");
      addBlock(s10s, t, y, 44, "stone_bricks");
    }
  }
  steps.push({
    stepNumber: 16,
    title: "Vierungs-Zwickelmauer: Südwand (Y=100 bis 119)",
    module: "Modul 3: Vierung & Tribunen",
    description: "Mauere den Zwickel über dem südlichen Vierungsbogen bis zur Gesimshöhe Y=119 auf. Alle vier Hochwände stehen nun vollendet da!",
    cameraHint: { eye: [0, 130, 60], target: [0, 112, 43] },
    blocks: s10s,
    tip: "Alle vier Wände bilden ein ebenes Auflager bei Y=119.",
    caution: "Kontrolliere die Höhe Y=119 an allen 4 Seiten.",
    fact: "Perfekte Basis für den Tambour."
  });`;

code = code.replace(oldS10, newS10);

// Renumber steps sequentially
let stepNum = 1;
code = code.replace(/stepNumber:\s*\d+/g, () => `stepNumber: ${stepNum++}`);

fs.writeFileSync('scratch/build_module_3_perfect.js', code);
console.log('Successfully patched scratch/build_module_3_perfect.js');
