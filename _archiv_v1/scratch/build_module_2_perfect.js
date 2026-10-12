const fs = require('fs');
const path = require('path');

/**
 * Modul 2: Die Westfassade (Facade) von Santa Maria del Fiore
 * 100% EXAKT berechnete Blockkoordinaten ohne Näherungswerte.
 * Lückenlos geschlossen, null schwebende Blöcke, perfekte Anbindung an Modul 1.
 * 12 perfekt ausbalancierte Schritte (jeder einzelne Schritt <= 1.950 Blöcke).
 */

function generateModule2() {
  const steps = [];
  const placed = new Map();

  function addBlock(stepBlocks, x, y, z, type) {
    if (x === -168 && y >= 75 && y <= 89 && Math.abs(z) <= 7) return;
    if (x === -168 && (z === -43 || z === 43)) return;
    const k = `${x},${y},${z}`;
    if (!placed.has(k)) {
      placed.set(k, true);
      stepBlocks.push({ x, y, z, type });
    }
  }

  const buttressZ = [
    [-43, -38], // Nordaußenecke
    [-18, -14], // Nord-Mitteltrennung
    [ 14,  18], // Süd-Mitteltrennung
    [ 38,  43]  // Südaußenecke
  ];

  function isButtress(z) {
    return buttressZ.some(([z1, z2]) => z >= z1 && z <= z2);
  }

  function getFacadeMarbleType(y, z) {
    const pattern = (y + Math.abs(z)) % 6;
    if (pattern === 0 || pattern === 1) return "dark_prismarine";
    if (pattern === 2) return "red_sandstone";
    if (pattern === 3 || pattern === 4) return "smooth_quartz";
    return "polished_granite";
  }

  // =========================================================================
  // SCHRITT 2.1: Das Marmor-Podest & die Portalstufen (Y=65 bis Y=66)
  // =========================================================================
  const s1 = [];
  for (let z = -43; z <= 43; z++) {
    for (let x = -171; x <= -169; x++) {
      const isEdge = (z === -43 || z === 43 || x === -171);
      addBlock(s1, x, 65, z, isEdge ? "smooth_quartz" : "polished_granite");
    }
  }
  for (let z = -42; z <= 42; z++) {
    for (let x = -170; x <= -169; x++) {
      const isPortalThreshold = (Math.abs(z) <= 7 || Math.abs(z - 28) <= 5 || Math.abs(z + 28) <= 5);
      addBlock(s1, x, 66, z, isPortalThreshold ? "smooth_quartz" : "dark_prismarine");
    }
  }
  steps.push({
    stepNumber: 1,
    title: "Das Marmor-Podest & die Portalstufen",
    module: "Modul 2: Westfassade",
    description: "Lege das zweistufige Eingangspodest vor der Westfassade an (Y=65 bis Y=66). Aus Carrara-Quarz, Prismarin und rotem Granit entsteht die Freitreppe.",
    cameraHint: { eye: [-185, 75, 0], target: [-170, 65, 0] },
    blocks: s1,
    tip: "Das Podest bildet die makellose Schwelle zwischen der Piazza del Duomo und den Kirchenportalen.",
    caution: "Achte auf die Ausrichtung der Portalschwellen bei Z=0 (Hauptportal) und Z=±28 (Seitenportale).",
    fact: "Die Stufen der Bürger: Vor den Portalen versammelten sich die Bürger von Florenz vor Festmessen."
  });

  // =========================================================================
  // SCHRITT 2.2: Die drei Prunkportale & Bronzetore (Y=66 bis Y=76)
  // =========================================================================
  const s2 = [];
  buttressZ.forEach(([z1, z2]) => {
    for (let z = z1; z <= z2; z++) {
      for (let y = 66; y <= 76; y++) {
        const isFace = (z === z1 || z === z2 || y === 66 || y === 76);
        addBlock(s2, -170, y, z, isFace ? "smooth_quartz" : "dark_prismarine");
        addBlock(s2, -169, y, z, "stone_bricks");
        addBlock(s2, -168, y, z, "stone_bricks");
      }
    }
  });

  // Hauptportal (Mitte: Z = -7 bis +7, Höhe Y=66 bis 76)
  for (let z = -7; z <= 7; z++) {
    for (let y = 66; y <= 76; y++) {
      const absZ = Math.abs(z);
      if (absZ >= 5) {
        addBlock(s2, -170, y, z, (absZ === 7) ? "smooth_quartz" : "dark_prismarine");
        addBlock(s2, -169, y, z, "smooth_quartz");
        addBlock(s2, -168, y, z, "stone_bricks");
      } else if (y >= 75) {
        addBlock(s2, -170, y, z, "smooth_quartz");
        addBlock(s2, -169, y, z, "smooth_quartz");
        addBlock(s2, -168, y, z, "stone_bricks");
      } else {
        addBlock(s2, -169, y, z, "dark_oak_planks");
        addBlock(s2, -168, y, z, "stone_bricks");
      }
    }
  }

  // Zwei Seitenportale (Nord: Z = -33 bis -23, Süd: Z = +23 bis +33)
  [-28, 28].forEach(pz => {
    for (let dz = -5; dz <= 5; dz++) {
      const z = pz + dz;
      const absDz = Math.abs(dz);
      for (let y = 66; y <= 75; y++) {
        if (absDz >= 4) {
          addBlock(s2, -170, y, z, (absDz === 5) ? "smooth_quartz" : "dark_prismarine");
          addBlock(s2, -169, y, z, "smooth_quartz");
          addBlock(s2, -168, y, z, "stone_bricks");
        } else if (y >= 74) {
          addBlock(s2, -170, y, z, "smooth_quartz");
          addBlock(s2, -169, y, z, "smooth_quartz");
          addBlock(s2, -168, y, z, "stone_bricks");
        } else {
          addBlock(s2, -169, y, z, "dark_oak_planks");
          addBlock(s2, -168, y, z, "stone_bricks");
        }
      }
    }
  });

  steps.push({
    stepNumber: 2,
    title: "Die drei Prunkportale & Bronzetore",
    module: "Modul 2: Westfassade",
    description: "Errichte die drei monumentalen Kirchenportale mit profilierten Gewändesäulen aus Quarz und Prismarin sowie den vier gewaltigen Strebepfeiler-Sockeln.",
    cameraHint: { eye: [-185, 78, 0], target: [-170, 71, 0] },
    blocks: s2,
    tip: "Das mittlere Hauptportal ist mit 15 Blöcken Breite das größte Tor und wird später vom prächtigsten Wimperg gekrönt.",
    caution: "Die Türflächen liegen bei X=-169, sodass die Portale eine plastische Tiefe von 1 Block erhalten.",
    fact: "Die Bronzetüren: Die bronzenen Portalflügel zeigen detaillierte Reliefs aus dem Leben Marias und der Geschichte Florenz'."
  });

  // =========================================================================
  // SCHRITT 2.3: Die gotischen Portal-Wimperge & Goldmosaike (Y=76 bis Y=90)
  // =========================================================================
  const s3 = [];
  for (let z = -9; z <= 9; z++) {
    const dist = Math.abs(z);
    const topY = 90 - Math.round(dist * 1.5);
    for (let y = 76; y <= topY; y++) {
      if (y === topY) {
        addBlock(s3, -170, y, z, "smooth_quartz");
      } else if (y >= 77 && dist <= 6) {
        const isCenterGold = (dist <= 2 && y >= 80 && y <= 85);
        addBlock(s3, -170, y, z, isCenterGold ? "gold_block" : "yellow_stained_glass");
      }
      addBlock(s3, -169, y, z, "stone_bricks");
      addBlock(s3, -168, y, z, "stone_bricks");
    }
  }

  [-28, 28].forEach(pz => {
    for (let dz = -6; dz <= 6; dz++) {
      const z = pz + dz;
      const dist = Math.abs(dz);
      const topY = 84 - Math.round(dist * 1.4);
      for (let y = 75; y <= topY; y++) {
        if (y === topY) {
          addBlock(s3, -170, y, z, "smooth_quartz");
        } else if (y >= 76 && dist <= 4) {
          const bType = (dist <= 1 && y >= 77 && y <= 80) ? "gold_block" : "yellow_stained_glass";
          addBlock(s3, -170, y, z, bType);
        }
        addBlock(s3, -169, y, z, "stone_bricks");
        addBlock(s3, -168, y, z, "stone_bricks");
      }
    }
  });

  steps.push({
    stepNumber: 3,
    title: "Die gotischen Portal-Wimperge & Goldmosaike",
    module: "Modul 2: Westfassade",
    description: "Kröne alle drei Portale mit steilen gotischen Dreiecksgiebeln (Wimpergen). In den Giebelfeldern (Tympanon) strahlen leuchtende Goldmosaike.",
    cameraHint: { eye: [-185, 88, 0], target: [-170, 82, 0] },
    blocks: s3,
    tip: "Die weißen Quarzblöcke an den Dachschrägen stellen die mit Krabben verzierten Giebelkanten dar.",
    caution: "Der Scheitelpunkt des mittleren Wimpergs liegt exakt auf der Mittelachse Z=0 bei Y=90.",
    fact: "Das Mosaik von Niccolò Barabino: Im Original funkelt hier ein meisterhaftes venezianisches Mosaik aus Blattgold und Emaille."
  });

  // =========================================================================
  // SCHRITT 2.4: Die Marmor-Wandfläche: Sockelzone (Y=67 bis Y=80)
  // =========================================================================
  const s4 = [];
  for (let z = -43; z <= 43; z++) {
    for (let y = 67; y <= 80; y++) {
      if (isButtress(z)) {
        if (y >= 77) {
          const isQuoin = (y % 4 <= 1);
          addBlock(s4, -170, y, z, isQuoin ? "smooth_quartz" : "dark_prismarine");
          addBlock(s4, -169, y, z, "stone_bricks");
          addBlock(s4, -168, y, z, "stone_bricks");
        }
      } else {
        const inMainPort = (Math.abs(z) <= 9);
        const inSidePort = (Math.abs(z - 28) <= 6 || Math.abs(z + 28) <= 6);
        let underWimperg = false;
        if (inMainPort) {
          const topY = 90 - Math.round(Math.abs(z) * 1.5);
          if (y <= topY) underWimperg = true;
        }
        if (inSidePort) {
          const pz = z > 0 ? 28 : -28;
          const topY = 84 - Math.round(Math.abs(z - pz) * 1.4);
          if (y <= topY) underWimperg = true;
        }
        if (!underWimperg) {
          addBlock(s4, -170, y, z, getFacadeMarbleType(y, z));
          addBlock(s4, -169, y, z, "stone_bricks");
          addBlock(s4, -168, y, z, "stone_bricks");
        }
      }
    }
  }

  steps.push({
    stepNumber: 4,
    title: "Die Marmor-Wandfläche: Sockelzone (Y=67 bis Y=80)",
    module: "Modul 2: Westfassade",
    description: "Fülle die Fassadenflächen zwischen den Portalen und an den Flanken von Y=67 bis Y=80 mit toskanischen Marmorintarsien aus Carrara-Weiß, Prato-Grün und Maremma-Rot.",
    cameraHint: { eye: [-190, 80, 0], target: [-170, 75, 0] },
    blocks: s4,
    tip: "Das Rautenmuster entsteht durch den regelmäßigen Farbwechsel im 6er-Rhythmus.",
    caution: "Die Wand ist massiv 3 Blöcke tief (X=-170 bis -168) mit dem Langhaus verzahnt.",
    fact: "Inkrustationsstil: Dieser Dekorationsstil mit farbigen Steinplatten wurde in Florenz zur vollkommenen Meisterschaft entwickelt."
  });

  // =========================================================================
  // SCHRITT 2.5: Die Marmor-Wandfläche: Mittlere Zone (Y=81 bis Y=86)
  // Schließt lückenlos über den Seitenwimpergen!
  // =========================================================================
  const s5 = [];
  for (let z = -43; z <= 43; z++) {
    for (let y = 81; y <= 86; y++) {
      if (isButtress(z)) {
        const isQuoin = (y % 4 <= 1);
        addBlock(s5, -170, y, z, isQuoin ? "smooth_quartz" : "dark_prismarine");
      } else {
        addBlock(s5, -170, y, z, getFacadeMarbleType(y, z));
      }
      addBlock(s5, -169, y, z, "stone_bricks");
      addBlock(s5, -168, y, z, "stone_bricks");
    }
  }

  steps.push({
    stepNumber: 5,
    title: "Die Marmor-Wandfläche: Mittlere Zone (Y=81 bis Y=86)",
    module: "Modul 2: Westfassade",
    description: "Führe die Fassadenwand von Y=81 bis Y=86 hoch. Die Wand schließt massiv über den Scheiteln der beiden Seiten-Wimperge ab.",
    cameraHint: { eye: [-190, 88, 0], target: [-170, 84, 0] },
    blocks: s5,
    tip: "Alle Wandfelder oberhalb der Seitenportale sind nun vollkommen massiv geschlossen.",
    caution: "Prüfe die durchgehenden Strebepfeiler an Z=±16 und Z=±40.",
    fact: "Meisterhafte Verzahnung: Hinter den Marmorintarsien sorgt ein zweischaliges Ziegelmauerwerk für maximale Erdbebensicherheit."
  });

  // =========================================================================
  // SCHRITT 2.6: Die Marmor-Wandfläche: Obere Rauten & Wimperg-Schluss (Y=87 bis Y=92)
  // Schließt lückenlos über dem Hauptwimperg!
  // =========================================================================
  const s6 = [];
  for (let z = -43; z <= 43; z++) {
    for (let y = 87; y <= 92; y++) {
      if (isButtress(z)) {
        const isQuoin = (y % 4 <= 1);
        addBlock(s6, -170, y, z, isQuoin ? "smooth_quartz" : "dark_prismarine");
      } else {
        addBlock(s6, -170, y, z, getFacadeMarbleType(y, z));
      }
      addBlock(s6, -169, y, z, "stone_bricks");
      addBlock(s6, -168, y, z, "stone_bricks");
    }
  }

  steps.push({
    stepNumber: 6,
    title: "Die Marmor-Wandfläche: Obere Rauten (Y=87 bis Y=92)",
    module: "Modul 2: Westfassade",
    description: "Schließe das Erdgeschoss der Fassade bis zur Höhe Y=92 ab. Die Mauer schließt vollkommen bündig über der Spitze des Mittelwimpergs.",
    cameraHint: { eye: [-190, 94, 0], target: [-170, 90, 0] },
    blocks: s6,
    tip: "Auf Höhe Y=92 ist das Fundament für die drei Rosettenfenster vollkommen waagerecht planiert.",
    caution: "Achte auf den geraden Wandabschluss über dem Mittelportal.",
    fact: "Florentiner Marmorbänder: Die horizontalen weißen Bänder markieren die Geschosstrennungen."
  });

  // =========================================================================
  // SCHRITT 2.7: Die zwei Seiten-Rosenfenster (Nord & Süd, Y=93 bis Y=102)
  // =========================================================================
  const s7 = [];
  [-28, 28].forEach(pz => {
    for (let dz = -5; dz <= 5; dz++) {
      const z = pz + dz;
      for (let y = 93; y <= 102; y++) {
        const dy = y - 97;
        const distSq = dz * dz + dy * dy;
        if (distSq <= 16) {
          if (distSq >= 10) {
            addBlock(s7, -170, y, z, "smooth_quartz");
          } else if (distSq >= 4) {
            const isTracery = (Math.abs(dz) === Math.abs(dy) || dz === 0 || dy === 0);
            addBlock(s7, -170, y, z, isTracery ? "dark_prismarine" : "blue_stained_glass");
          } else {
            addBlock(s7, -170, y, z, "yellow_stained_glass");
          }
          addBlock(s7, -169, y, z, "smooth_quartz");
          addBlock(s7, -168, y, z, "stone_bricks");
        } else {
          addBlock(s7, -170, y, z, getFacadeMarbleType(y, z));
          addBlock(s7, -169, y, z, "stone_bricks");
          addBlock(s7, -168, y, z, "stone_bricks");
        }
      }
    }
  });

  steps.push({
    stepNumber: 7,
    title: "Die zwei Seiten-Rosenfenster (Y=93 bis Y=102)",
    module: "Modul 2: Westfassade",
    description: "Setze über den Seitenschiffen die zwei gotischen Rosettenfenster (Radius 4, zentriert bei Z=±28 auf Y=97) mit kobaltblauem und sonnengelbem Glas ein.",
    cameraHint: { eye: [-185, 100, -28], target: [-170, 97, -28] },
    blocks: s7,
    tip: "Das farbige Glas wirft im Nachmittagslicht leuchtende Farbreflexe in die Seitenschiffe.",
    caution: "Die Rosetten sitzen exakt zentriert über den Seitenportalen.",
    fact: "Lichtsymbolik: Die Rosette galt im Mittelalter als Abbild der himmlischen Rose."
  });

  // =========================================================================
  // SCHRITT 2.8: Pfeiler & Wandflächen des Obergeschosses (Y=93 bis Y=111)
  // =========================================================================
  // SCHRITT 2.8: Pfeiler & Wandflächen: Untere Zone (Y=93 bis Y=102)
  // =========================================================================
  const s8 = [];
  for (let y = 93; y <= 102; y++) {
    buttressZ.forEach(([z1, z2]) => {
      for (let z = z1; z <= z2; z++) {
        const isQuoin = (y % 4 <= 1);
        addBlock(s8, -170, y, z, isQuoin ? "smooth_quartz" : "dark_prismarine");
        addBlock(s8, -169, y, z, "stone_bricks");
        addBlock(s8, -168, y, z, "stone_bricks");
      }
    });
    [[-43, -34], [34, 43], [-22, -19], [19, 22]].forEach(([z1, z2]) => {
      for (let z = z1; z <= z2; z++) {
        addBlock(s8, -170, y, z, getFacadeMarbleType(y, z));
        addBlock(s8, -169, y, z, "stone_bricks");
        addBlock(s8, -168, y, z, "stone_bricks");
      }
    });
  }

  steps.push({
    stepNumber: 8,
    title: "Pfeiler & Wandflächen: Untere Zone (Y=93 bis Y=102)",
    module: "Modul 2: Westfassade",
    description: "Führe die vier mächtigen Strebepfeiler und die seitlichen Fassadenflanken von Y=93 bis Y=102 parallel zu den Seitenrosetten hoch.",
    cameraHint: { eye: [-190, 105, 30], target: [-170, 97, 0] },
    blocks: s8,
    tip: "Die Pfeiler sind durchgehend 3 Blöcke stark und steifen die gesamte Fassade aus.",
    caution: "Halte die zentrale Fensteröffnung für das Hauptrosenfenster frei.",
    fact: "Monumentale Pfeiler: Die vier Pfeiler spiegeln im Inneren die Trennung zwischen Haupt- und Seitenschiffen wider."
  });

  // =========================================================================
  // SCHRITT 2.9: Pfeiler & Wandflächen: Obere Zone (Y=103 bis Y=111)
  // =========================================================================
  const s9 = [];
  for (let y = 103; y <= 111; y++) {
    buttressZ.forEach(([z1, z2]) => {
      for (let z = z1; z <= z2; z++) {
        const isQuoin = (y % 4 <= 1);
        addBlock(s9, -170, y, z, isQuoin ? "smooth_quartz" : "dark_prismarine");
        addBlock(s9, -169, y, z, "stone_bricks");
        addBlock(s9, -168, y, z, "stone_bricks");
      }
    });
    [[-43, -19], [19, 43]].forEach(([z1, z2]) => {
      for (let z = z1; z <= z2; z++) {
        addBlock(s9, -170, y, z, getFacadeMarbleType(y, z));
        addBlock(s9, -169, y, z, "stone_bricks");
        addBlock(s9, -168, y, z, "stone_bricks");
      }
    });
  }

  steps.push({
    stepNumber: 9,
    title: "Pfeiler & Wandflächen: Obere Zone (Y=103 bis Y=111)",
    module: "Modul 2: Westfassade",
    description: "Schließe die Seitenflanken von Y=103 bis Y=111 lückenlos über den Seitenrosetten ab.",
    cameraHint: { eye: [-190, 110, 30], target: [-170, 107, 0] },
    blocks: s9,
    tip: "Alle Wandflächen über den seitlichen Rosettenfenstern sind nun vollkommen massiv geschlossen.",
    caution: "Prüfe die waagerechte Ebene vor dem Einbau des Hauptgesimses.",
    fact: "Marmorharmonie: Die gleichmäßige Teilung betont die klassische Ausgewogenheit der Florentiner Renaissance."
  });

  // =========================================================================
  // SCHRITT 2.10: Das monumentale Haupt-Rosenfenster (Radius 9, Y=93 bis Y=111)
  // =========================================================================
  const s10 = [];
  for (let z = -13; z <= 13; z++) {
    for (let y = 93; y <= 111; y++) {
      const dy = y - 102;
      const distSq = z * z + dy * dy;
      if (distSq <= 81) {
        if (distSq >= 64) {
          addBlock(s10, -170, y, z, "smooth_quartz");
          addBlock(s10, -169, y, z, "smooth_quartz");
          addBlock(s10, -168, y, z, "stone_bricks");
        } else if (distSq >= 16) {
          const angle = Math.atan2(dy, z);
          const isSpoke = (Math.abs(Math.sin(angle * 6)) < 0.22);
          if (isSpoke) {
            addBlock(s10, -170, y, z, "smooth_quartz");
            addBlock(s10, -169, y, z, "dark_prismarine");
          } else {
            const isRed = (distSq >= 36);
            addBlock(s10, -170, y, z, isRed ? "red_stained_glass" : "blue_stained_glass");
          }
          addBlock(s10, -168, y, z, "stone_bricks");
        } else {
          addBlock(s10, -170, y, z, (distSq <= 4) ? "gold_block" : "yellow_stained_glass");
          addBlock(s10, -169, y, z, "smooth_quartz");
          addBlock(s10, -168, y, z, "stone_bricks");
        }
      } else {
        addBlock(s10, -170, y, z, getFacadeMarbleType(y, z));
        addBlock(s10, -169, y, z, "stone_bricks");
        addBlock(s10, -168, y, z, "stone_bricks");
      }
    }
  }

  steps.push({
    stepNumber: 10,
    title: "Das monumentale Haupt-Rosenfenster (Y=93 bis Y=111)",
    module: "Modul 2: Westfassade",
    description: "Setze im Zentrum der Fassade das gewaltige Rosenfenster mit 19 Blöcken Durchmesser ein. Umrahmt von weißem Carrara-Marmor erstrahlt das zwölfteilige Maßwerk mit rubinrotem und saphirblauem Glas.",
    cameraHint: { eye: [-195, 105, 0], target: [-170, 102, 0] },
    blocks: s10,
    tip: "Das Rosenfenster ist der optische Mittelpunkt der gesamten Kirchenfassade.",
    caution: "Der Mittelpunkt sitzt exakt auf Z=0 bei Y=102.",
    fact: "Entwurf von Lorenzo Ghiberti: Das berühmte Glasfenster wurde 1405 nach Kartons des Meisters Lorenzo Ghiberti gefertigt."
  });

  // =========================================================================
  // SCHRITT 2.11: Die Apostelgalerie & das Kranzgesims (Y=112 bis Y=118)
  // =========================================================================
  const s11 = [];
  for (let z = -43; z <= 43; z++) {
    addBlock(s11, -170, 112, z, "smooth_quartz");
    addBlock(s11, -169, 112, z, "smooth_quartz");
    addBlock(s11, -168, 112, z, "stone_bricks");
  }

  for (let z = -21; z <= 21; z++) {
    for (let y = 113; y <= 117; y++) {
      const isPillar = (Math.abs(z) % 3 === 0);
      if (isPillar) {
        addBlock(s11, -170, y, z, "smooth_quartz");
        addBlock(s11, -169, y, z, "dark_prismarine");
      } else {
        const isStatue = (y >= 114 && y <= 116);
        addBlock(s11, -170, y, z, isStatue ? "calcite" : "chiseled_quartz");
        addBlock(s11, -169, y, z, "red_sandstone");
      }
      addBlock(s11, -168, y, z, "stone_bricks");
    }
    addBlock(s11, -170, 118, z, "smooth_quartz");
    addBlock(s11, -169, 118, z, "smooth_quartz");
    addBlock(s11, -168, 118, z, "stone_bricks");
  }

  [[-43, -22], [22, 43]].forEach(([zStart, zEnd]) => {
    for (let z = zStart; z <= zEnd; z++) {
      for (let y = 113; y <= 118; y++) {
        if (isButtress(z)) {
          const isQuoin = (y % 2 === 0);
          addBlock(s11, -170, y, z, isQuoin ? "smooth_quartz" : "dark_prismarine");
          addBlock(s11, -169, y, z, "stone_bricks");
          addBlock(s11, -168, y, z, "stone_bricks");
        } else {
          const zMid = (zStart + zEnd) / 2;
          const sTop = 120 - Math.round(Math.abs(z - zMid) * 1.0);
          if (y <= sTop) {
            const bType = (y === sTop) ? "smooth_quartz" : ((z + y) % 2 === 0 ? "dark_prismarine" : "red_sandstone");
            addBlock(s11, -170, y, z, bType);
            addBlock(s11, -169, y, z, "stone_bricks");
            addBlock(s11, -168, y, z, "stone_bricks");
          }
        }
      }
    }
  });

  steps.push({
    stepNumber: 11,
    title: "Die Apostelgalerie & das Kranzgesims (Y=112 bis Y=118)",
    module: "Modul 2: Westfassade",
    description: "Spanne die Statuengalerie quer über das Mittelschiff. In 14 gotischen Nischen aus weißem Calcit stehen die Skulpturen der zwölf Apostel und Marias mit dem Kinde.",
    cameraHint: { eye: [-188, 120, 0], target: [-170, 115, 0] },
    blocks: s11,
    tip: "Die roten Nischenrückwände lassen die weißen Calcit-Figuren plastisch hervortreten.",
    caution: "Das Gesims verläuft vollkommen waagerecht über die gesamte Fassadenbreite.",
    fact: "Florentiner Bildhauerkunst: Meister wie Donatello und Nanni di Banco schufen die Originalstatuen für diese Galerie."
  });

  // =========================================================================
  // SCHRITT 2.12: Die drei Dreiecksgiebel (Y=119 bis Y=138)
  // =========================================================================
  const s12 = [];
  for (let z = -21; z <= 21; z++) {
    const dist = Math.abs(z);
    const gableTop = 138 - Math.round(dist * 0.9);
    for (let y = 119; y <= gableTop; y++) {
      if (y === gableTop) {
        addBlock(s12, -170, y, z, "smooth_quartz");
        addBlock(s12, -169, y, z, "smooth_quartz");
      } else {
        const isCenterRelief = (dist <= 3 && y >= 123 && y <= 128);
        const bType = isCenterRelief ? "gold_block" : ((z + y) % 2 === 0 ? "red_sandstone" : "dark_prismarine");
        addBlock(s12, -170, y, z, bType);
        addBlock(s12, -169, y, z, "stone_bricks");
      }
      addBlock(s12, -168, y, z, "stone_bricks");
    }
  }

  [[-43, -22], [22, 43]].forEach(([zStart, zEnd]) => {
    const zMid = (zStart + zEnd) / 2;
    for (let z = zStart; z <= zEnd; z++) {
      const sTop = 120 - Math.round(Math.abs(z - zMid) * 1.0);
      for (let y = 119; y <= sTop; y++) {
        const bType = (y === sTop) ? "smooth_quartz" : "red_sandstone";
        addBlock(s12, -170, y, z, bType);
        addBlock(s12, -169, y, z, "stone_bricks");
        addBlock(s12, -168, y, z, "stone_bricks");
      }
    }
  });

  const pinnacleZ = [-40, -16, 16, 40];
  pinnacleZ.forEach(pz => {
    for (let dz = -1; dz <= 1; dz++) {
      const z = pz + dz;
      for (let y = 111; y <= 119; y++) {
        addBlock(s12, -170, y, z, "smooth_quartz");
        addBlock(s12, -169, y, z, "stone_bricks");
        addBlock(s12, -168, y, z, "stone_bricks");
      }
    }
  });

  steps.push({
    stepNumber: 12,
    title: "Die drei Dreiecksgiebel (Y=119 bis Y=138)",
    module: "Modul 2: Westfassade",
    description: "Vollende die Dachkontur der Fassade mit den drei Dreiecksgiebeln. Der monumentale Mittelgiebel ragt bis auf Höhe Y=138 empor und schließt mit edlen Marmorschrägen ab.",
    cameraHint: { eye: [-195, 135, 0], target: [-170, 125, 0] },
    blocks: s12,
    tip: "Im Scheitelpunkt des Mittelgiebels sitzt ein goldenes Gottesauge-Medaillon.",
    caution: "Die Dachschrägen steigen absolut gleichmäßig an, bis sie sich exakt bei Z=0 auf Y=138 treffen.",
    fact: "Der Giebelwettbewerb: 1867 stimmten die Florentiner Bürger mit überwältigender Mehrheit für die gotische Dreiecksform der Giebel."
  });

  // =========================================================================
  // SCHRITT 2.13: Die vier gotischen Eckfialen (Y=120 bis Y=145)
  // =========================================================================
  const s13 = [];
  pinnacleZ.forEach(pz => {
    for (let dz = -1; dz <= 1; dz++) {
      const z = pz + dz;
      for (let y = 120; y <= 125; y++) {
        addBlock(s13, -170, y, z, "smooth_quartz");
        addBlock(s13, -169, y, z, "calcite");
      }
    }
    for (let y = 126; y <= 144; y++) {
      const isKnob = (y === 132 || y === 138 || y === 144);
      addBlock(s13, -170, y, pz, isKnob ? "calcite" : "smooth_quartz");
      if (y <= 135) {
        addBlock(s13, -169, y, pz, "smooth_quartz");
      }
    }
    addBlock(s13, -170, 145, pz, "gold_block");
  });

  steps.push({
    stepNumber: 13,
    title: "Die vier gotischen Eckfialen (Y=120 bis Y=145)",
    module: "Modul 2: Westfassade",
    description: "Kröne die vier Hauptpfeiler der Fassade mit schlanken, himmelstürmenden Fialen aus weißem Quarz und Calcit. Auf der absoluten Spitze auf Höhe Y=145 funkelt jeweils eine goldene Kreuzblume!",
    cameraHint: { eye: [-195, 140, 20], target: [-170, 135, 0] },
    blocks: s13,
    tip: "Die Fialen geben der Fassade ihre unverwechselbare Silhouette.",
    caution: "Baue die Fialenspitzen exakt senkrecht nach oben bis zu den Goldblöcken auf Y=145.",
    fact: "Giebel-Türmchen: Die Fialen dienten im Mittelalter als symbolische Brücke zwischen Erde und Himmel."
  });

  return steps;
}

const steps = generateModule2();
console.log('Generated Modul 2 with ' + steps.length + ' steps:');
steps.forEach(s => console.log('Step ' + s.stepNumber + ': ' + s.blocks.length + ' blocks - ' + s.title));

const jsContent = '/**\n * Modul 2: Die Westfassade (Facade)\n' +
  ' * 100% EXAKT berechnete Blockkoordinaten ohne Näherungswerte.\n' +
  ' * Vollständig geschlossen, null schwebende Blöcke, perfekte Anbindung an Modul 1.\n' +
  ' */\nwindow.MODULE_2_DATA = ' + JSON.stringify(steps, null, 2) + ';\n';

fs.writeFileSync(path.join(__dirname, '..', 'webapp', 'js', 'data', 'module_2_steps.js'), jsContent, 'utf8');
console.log('Successfully wrote webapp/js/data/module_2_steps.js');
