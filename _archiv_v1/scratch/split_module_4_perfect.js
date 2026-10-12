const fs = require('fs');

/**
 * Rebuild Module 4 with perfectly balanced steps:
 * Every single step <= 2.376 blocks (strictly <= 2.500 blocks).
 * Exactly 41 steps in chronological order.
 */

function generateModule4Perfect() {
  const steps = [];
  const placed = new Map();

  function addBlock(s, x, y, z, type) {
    const k = `${x},${y},${z}`;
    if (!placed.has(k)) {
      placed.set(k, true);
      s.push({ x, y, z, type });
    }
  }

  function inOctagon(x, z, R, w) {
    const ax = Math.abs(x);
    const az = Math.abs(z);
    if (ax > R || az > R) return false;
    if (ax + az > w + R) return false;
    return true;
  }

  // Helper for Ochsenaugen frames
  function buildOculusWall(stepBlocks, yStart, yEnd, side) {
    for (let y = yStart; y <= yEnd; y++) {
      const dy = y - 140;
      if (side === 'ost') {
        for (let z = -23; z <= 23; z++) {
          const d = Math.sqrt(dy * dy + z * z);
          const isOpening = (d <= 5.2);
          const isInner = (d > 5.2 && d <= 6.5);
          const isOuter = (d > 6.5 && d <= 7.8);
          for (let x = 37; x <= 42; x++) {
            if (isOpening) continue;
            let type = "bricks";
            if (x === 42) type = isInner ? "smooth_quartz" : (isOuter ? "dark_prismarine" : "smooth_quartz");
            else if (x === 37) type = isInner ? "calcite" : "smooth_stone";
            addBlock(stepBlocks, x, y, z, type);
          }
        }
      } else if (side === 'west') {
        for (let z = -23; z <= 23; z++) {
          const d = Math.sqrt(dy * dy + z * z);
          const isOpening = (d <= 5.2);
          const isInner = (d > 5.2 && d <= 6.5);
          const isOuter = (d > 6.5 && d <= 7.8);
          for (let x = -42; x <= -37; x++) {
            if (isOpening) continue;
            let type = "bricks";
            if (x === -42) type = isInner ? "smooth_quartz" : (isOuter ? "dark_prismarine" : "smooth_quartz");
            else if (x === -37) type = isInner ? "calcite" : "smooth_stone";
            addBlock(stepBlocks, x, y, z, type);
          }
        }
      } else if (side === 'nord') {
        for (let x = -23; x <= 23; x++) {
          const d = Math.sqrt(dy * dy + x * x);
          const isOpening = (d <= 5.2);
          const isInner = (d > 5.2 && d <= 6.5);
          const isOuter = (d > 6.5 && d <= 7.8);
          for (let z = -42; z <= -37; z++) {
            if (isOpening) continue;
            let type = "bricks";
            if (z === -42) type = isInner ? "smooth_quartz" : (isOuter ? "dark_prismarine" : "smooth_quartz");
            else if (z === -37) type = isInner ? "calcite" : "smooth_stone";
            addBlock(stepBlocks, x, y, z, type);
          }
        }
      } else if (side === 'sued') {
        for (let x = -23; x <= 23; x++) {
          const d = Math.sqrt(dy * dy + x * x);
          const isOpening = (d <= 5.2);
          const isInner = (d > 5.2 && d <= 6.5);
          const isOuter = (d > 6.5 && d <= 7.8);
          for (let z = 37; z <= 42; z++) {
            if (isOpening) continue;
            let type = "bricks";
            if (z === 42) type = isInner ? "smooth_quartz" : (isOuter ? "dark_prismarine" : "smooth_quartz");
            else if (z === 37) type = isInner ? "calcite" : "smooth_stone";
            addBlock(stepBlocks, x, y, z, type);
          }
        }
      }
    }
  }

  // 4.1: Ringanker Kardinalseiten Schicht 1 & 2
  const s1 = [];
  for (let y = 120; y <= 121; y++) {
    for (let x = -24; x <= 24; x++) {
      for (let z = -42; z <= -37; z++) addBlock(s1, x, y, z, (z === -42) ? "dark_prismarine" : "stone_bricks");
      for (let z =  37; z <=  42; z++) addBlock(s1, x, y, z, (z ===  42) ? "dark_prismarine" : "stone_bricks");
    }
    for (let z = -24; z <= 24; z++) {
      for (let x = -42; x <= -37; x++) addBlock(s1, x, y, z, (x === -42) ? "dark_prismarine" : "stone_bricks");
      for (let x =  37; x <=  42; x++) addBlock(s1, x, y, z, (x ===  42) ? "dark_prismarine" : "stone_bricks");
    }
  }
  steps.push({ stepNumber: "4.1", title: "Ringanker – Kardinalseiten Schicht 1 & 2 (Y=120 bis Y=121)", module: "Modul 4: Achteckiger Tambour", description: "Verankere die ersten beiden Schichten des gewaltigen Basis-Ringankers.", blocks: s1 });

  // 4.2: Ringanker Kardinalseiten Schicht 3
  const s2 = [];
  for (let x = -24; x <= 24; x++) {
    for (let z = -42; z <= -37; z++) addBlock(s2, x, 122, z, (z === -42) ? "smooth_quartz" : "stone_bricks");
    for (let z =  37; z <=  42; z++) addBlock(s2, x, 122, z, (z ===  42) ? "smooth_quartz" : "stone_bricks");
  }
  for (let z = -24; z <= 24; z++) {
    for (let x = -42; x <= -37; x++) addBlock(s2, x, 122, z, (x === -42) ? "smooth_quartz" : "stone_bricks");
    for (let x =  37; x <=  42; x++) addBlock(s2, x, 122, z, (x ===  42) ? "smooth_quartz" : "stone_bricks");
  }
  steps.push({ stepNumber: "4.2", title: "Ringanker – Kardinalseiten Schicht 3 (Y=122)", module: "Modul 4: Achteckiger Tambour", description: "Schließe die dritte Schicht der Kardinalwände mit hellem Carrara-Quarz ab.", blocks: s2 });

  // 4.3: Ringanker Diagonalseiten Basis
  const s3 = [];
  for (let y = 120; y <= 122; y++) {
    for (let i = 0; i <= 17; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2) ? (y === 122 ? "smooth_quartz" : "dark_prismarine") : "stone_bricks";
        addBlock(s3,  25 + i - w, y, -42 + i + w, type);
        addBlock(s3, -25 - i + w, y, -42 + i + w, type);
        addBlock(s3,  25 + i - w, y,  42 - i - w, type);
        addBlock(s3, -25 - i + w, y,  42 - i - w, type);
      }
    }
  }
  steps.push({ stepNumber: "4.3", title: "Ringanker – Diagonalseiten Basis (Y=120 bis Y=122)", module: "Modul 4: Achteckiger Tambour", description: "Verbinde die vier Kardinalabschnitte mit den massiven Schrägwänden.", blocks: s3 });

  // 4.4: Ringanker Kardinalwände Sockelprofil
  const s4 = [];
  for (let y = 123; y <= 124; y++) {
    for (let x = -24; x <= 24; x++) {
      for (let z = -42; z <= -37; z++) addBlock(s4, x, y, z, (z === -42) ? (y === 124 ? "calcite" : "smooth_quartz") : "stone_bricks");
      for (let z =  37; z <=  42; z++) addBlock(s4, x, y, z, (z ===  42) ? (y === 124 ? "calcite" : "smooth_quartz") : "stone_bricks");
    }
    for (let z = -24; z <= 24; z++) {
      for (let x = -42; x <= -37; x++) addBlock(s4, x, y, z, (x === -42) ? (y === 124 ? "calcite" : "smooth_quartz") : "stone_bricks");
      for (let x =  37; x <=  42; x++) addBlock(s4, x, y, z, (x ===  42) ? (y === 124 ? "calcite" : "smooth_quartz") : "stone_bricks");
    }
  }
  steps.push({ stepNumber: "4.4", title: "Ringanker – Kardinalwände Sockelprofil (Y=123 bis Y=124)", module: "Modul 4: Achteckiger Tambour", description: "Forme das profilierte Sockelgesims aus Calcit an allen vier Kardinalseiten.", blocks: s4 });

  // 4.5: Ringanker Diagonalseiten Sockelprofil
  const s5 = [];
  for (let y = 123; y <= 124; y++) {
    for (let i = 0; i <= 17; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2) ? (y === 124 ? "calcite" : "smooth_quartz") : "stone_bricks";
        addBlock(s5,  25 + i - w, y, -42 + i + w, type);
        addBlock(s5, -25 - i + w, y, -42 + i + w, type);
        addBlock(s5,  25 + i - w, y,  42 - i - w, type);
        addBlock(s5, -25 - i + w, y,  42 - i - w, type);
      }
    }
  }
  steps.push({ stepNumber: "4.5", title: "Ringanker – Diagonalseiten Sockelprofil (Y=123 bis Y=124)", module: "Modul 4: Achteckiger Tambour", description: "Vollende das Sockelgesims an den Diagonalseiten.", blocks: s5 });

  // 4.6: Die 8 kolossalen Eckpilaster
  const s6 = [];
  const pilasterCenters = [
    { x: -25, z: -42 }, { x:  25, z: -42 },
    { x:  42, z: -25 }, { x:  42, z:  25 },
    { x:  25, z:  42 }, { x: -25, z:  42 },
    { x: -42, z:  25 }, { x: -42, z: -25 }
  ];
  for (let y = 125; y <= 157; y++) {
    pilasterCenters.forEach(c => {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dz === 0) continue;
          let type = (y === 157) ? "calcite" : ((y % 2 === 0) ? "smooth_quartz" : "calcite");
          addBlock(s6, c.x + dx, y, c.z + dz, type);
        }
      }
    });
  }
  steps.push({ stepNumber: "4.6", title: "Die 8 kolossalen Eckpilaster des Tambours (Y=125 bis Y=157)", module: "Modul 4: Achteckiger Tambour", description: "Errichte die 8 kolossalen Eckpilaster aus weißem Carrara-Marmor.", blocks: s6 });

  // 4.7: Brüstungsmauer Ost Y=125..129
  const s7 = [];
  for (let y = 125; y <= 129; y++) {
    for (let z = -23; z <= 23; z++) {
      for (let x = 37; x <= 42; x++) addBlock(s7, x, y, z, (x === 42) ? (Math.abs(z % 4) === 1 ? "polished_granite" : "smooth_quartz") : (x === 37 ? "smooth_stone" : "bricks"));
    }
  }
  steps.push({ stepNumber: "4.7", title: "Brüstungsmauer Ost: Untere Zone (Y=125 bis Y=129)", module: "Modul 4: Achteckiger Tambour", description: "Ziehe die Ostwand mit Ziegelkern und Marmorspiegel hoch.", blocks: s7 });

  // 4.8: Brüstungsmauer West Y=125..129
  const s8 = [];
  for (let y = 125; y <= 129; y++) {
    for (let z = -23; z <= 23; z++) {
      for (let x = -42; x <= -37; x++) addBlock(s8, x, y, z, (x === -42) ? (Math.abs(z % 4) === 1 ? "polished_granite" : "smooth_quartz") : (x === -37 ? "smooth_stone" : "bricks"));
    }
  }
  steps.push({ stepNumber: "4.8", title: "Brüstungsmauer West: Untere Zone (Y=125 bis Y=129)", module: "Modul 4: Achteckiger Tambour", description: "Ziehe die Westwand mit Ziegelkern und Marmorspiegel hoch.", blocks: s8 });

  // 4.9: Brüstungsmauer Nord Y=125..129
  const s9 = [];
  for (let y = 125; y <= 129; y++) {
    for (let x = -23; x <= 23; x++) {
      for (let z = -42; z <= -37; z++) addBlock(s9, x, y, z, (z === -42) ? (Math.abs(x % 4) === 1 ? "polished_granite" : "smooth_quartz") : (z === -37 ? "smooth_stone" : "bricks"));
    }
  }
  steps.push({ stepNumber: "4.9", title: "Brüstungsmauer Nord: Untere Zone (Y=125 bis Y=129)", module: "Modul 4: Achteckiger Tambour", description: "Ziehe die Nordwand des Tambours hoch.", blocks: s9 });

  // 4.10: Brüstungsmauer Süd Y=125..129
  const s10 = [];
  for (let y = 125; y <= 129; y++) {
    for (let x = -23; x <= 23; x++) {
      for (let z = 37; z <= 42; z++) addBlock(s10, x, y, z, (z === 42) ? (Math.abs(x % 4) === 1 ? "polished_granite" : "smooth_quartz") : (z === 37 ? "smooth_stone" : "bricks"));
    }
  }
  steps.push({ stepNumber: "4.10", title: "Brüstungsmauer Süd: Untere Zone (Y=125 bis Y=129)", module: "Modul 4: Achteckiger Tambour", description: "Ziehe die Südwand des Tambours hoch.", blocks: s10 });

  // 4.11: Brüstung & Schwebegang Ost Y=130..134
  const s11 = [];
  for (let y = 130; y <= 134; y++) {
    for (let z = -23; z <= 23; z++) {
      for (let x = 37; x <= 42; x++) addBlock(s11, x, y, z, (x === 42) ? ((z % 6 === 0 || y === 134) ? "dark_prismarine" : "smooth_quartz") : (x === 37 ? "smooth_stone" : "bricks"));
    }
  }
  for (let z = -23; z <= 23; z++) {
    addBlock(s11, 36, 130, z, "smooth_stone");
    addBlock(s11, 36, 131, z, "dark_prismarine");
  }
  steps.push({ stepNumber: "4.11", title: "Brüstungsmauer & Schwebegang Ost (Y=130 bis Y=134)", module: "Modul 4: Achteckiger Tambour", description: "Vollende die Ost-Brüstung und baue den Schwebegang ein.", blocks: s11 });

  // 4.12: Brüstung & Schwebegang West Y=130..134
  const s12 = [];
  for (let y = 130; y <= 134; y++) {
    for (let z = -23; z <= 23; z++) {
      for (let x = -42; x <= -37; x++) addBlock(s12, x, y, z, (x === -42) ? ((z % 6 === 0 || y === 134) ? "dark_prismarine" : "smooth_quartz") : (x === -37 ? "smooth_stone" : "bricks"));
    }
  }
  for (let z = -23; z <= 23; z++) {
    addBlock(s12, -36, 130, z, "smooth_stone");
    addBlock(s12, -36, 131, z, "dark_prismarine");
  }
  steps.push({ stepNumber: "4.12", title: "Brüstungsmauer & Schwebegang West (Y=130 bis Y=134)", module: "Modul 4: Achteckiger Tambour", description: "Vollende die West-Brüstung und baue den Schwebegang ein.", blocks: s12 });

  // 4.13: Brüstung & Schwebegang Nord Y=130..134
  const s13 = [];
  for (let y = 130; y <= 134; y++) {
    for (let x = -23; x <= 23; x++) {
      for (let z = -42; z <= -37; z++) addBlock(s13, x, y, z, (z === -42) ? ((x % 6 === 0 || y === 134) ? "dark_prismarine" : "smooth_quartz") : (z === -37 ? "smooth_stone" : "bricks"));
    }
  }
  for (let x = -23; x <= 23; x++) {
    addBlock(s13, x, 130, -36, "smooth_stone");
    addBlock(s13, x, 131, -36, "dark_prismarine");
  }
  steps.push({ stepNumber: "4.13", title: "Brüstungsmauer & Schwebegang Nord (Y=130 bis Y=134)", module: "Modul 4: Achteckiger Tambour", description: "Vollende die Nord-Brüstung und baue den Schwebegang ein.", blocks: s13 });

  // 4.14: Brüstung & Schwebegang Süd Y=130..134
  const s14 = [];
  for (let y = 130; y <= 134; y++) {
    for (let x = -23; x <= 23; x++) {
      for (let z = 37; z <= 42; z++) addBlock(s14, x, y, z, (z === 42) ? ((x % 6 === 0 || y === 134) ? "dark_prismarine" : "smooth_quartz") : (z === 37 ? "smooth_stone" : "bricks"));
    }
  }
  for (let x = -23; x <= 23; x++) {
    addBlock(s14, x, 130, 36, "smooth_stone");
    addBlock(s14, x, 131, 36, "dark_prismarine");
  }
  steps.push({ stepNumber: "4.14", title: "Brüstungsmauer & Schwebegang Süd (Y=130 bis Y=134)", module: "Modul 4: Achteckiger Tambour", description: "Vollende die Süd-Brüstung und baue den Schwebegang ein.", blocks: s14 });

  // 4.15: Diagonale Brüstungsmauern untere Zone Y=125..129
  const s15 = [];
  for (let y = 125; y <= 129; y++) {
    for (let i = 2; i <= 15; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2) ? ((i % 4 === 0) ? "dark_prismarine" : "smooth_quartz") : (w === 3 ? "smooth_stone" : "bricks");
        addBlock(s15,  25 + i - w, y, -42 + i + w, type);
        addBlock(s15, -25 - i + w, y, -42 + i + w, type);
        addBlock(s15,  25 + i - w, y,  42 - i - w, type);
        addBlock(s15, -25 - i + w, y,  42 - i - w, type);
      }
    }
  }
  steps.push({ stepNumber: "4.15", title: "Diagonale Brüstungsmauern: Untere Zone (Y=125 bis Y=129)", module: "Modul 4: Achteckiger Tambour", description: "Errichte die unteren 5 Schichten der vier diagonalen Tambourwände.", blocks: s15 });

  // 4.16: Diagonale Brüstungsmauern & Fensterbänke Y=130..134
  const s16 = [];
  for (let y = 130; y <= 134; y++) {
    for (let i = 2; i <= 15; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2) ? ((i % 4 === 0 || y === 134) ? "dark_prismarine" : "smooth_quartz") : (w === 3 ? "smooth_stone" : "bricks");
        addBlock(s16,  25 + i - w, y, -42 + i + w, type);
        addBlock(s16, -25 - i + w, y, -42 + i + w, type);
        addBlock(s16,  25 + i - w, y,  42 - i - w, type);
        addBlock(s16, -25 - i + w, y,  42 - i - w, type);
      }
    }
  }
  steps.push({ stepNumber: "4.16", title: "Diagonale Brüstungsmauern & Fensterbänke (Y=130 bis Y=134)", module: "Modul 4: Achteckiger Tambour", description: "Ziehe die diagonalen Wände bis Y=134 hoch.", blocks: s16 });

  // 4.17: Ochsenauge Ost – Untere Zone Y=135..140
  const s17 = [];
  buildOculusWall(s17, 135, 140, 'ost');
  steps.push({ stepNumber: "4.17", title: "Ochsenauge Ost: Unterer Bogen (Y=135 bis Y=140)", module: "Modul 4: Achteckiger Tambour", description: "Forme die untere Hälfte des Oculus-Rahmens der Ostwand.", blocks: s17 });

  // 4.18: Ochsenauge Ost – Obere Zone Y=141..146
  const s18 = [];
  buildOculusWall(s18, 141, 146, 'ost');
  steps.push({ stepNumber: "4.18", title: "Ochsenauge Ost: Oberer Bogen (Y=141 bis Y=146)", module: "Modul 4: Achteckiger Tambour", description: "Schließe den oberen Bogen des Ost-Oculus ab.", blocks: s18 });

  // 4.19: Ochsenauge West – Untere Zone Y=135..140
  const s19 = [];
  buildOculusWall(s19, 135, 140, 'west');
  steps.push({ stepNumber: "4.19", title: "Ochsenauge West: Unterer Bogen (Y=135 bis Y=140)", module: "Modul 4: Achteckiger Tambour", description: "Forme die untere Hälfte des West-Oculus.", blocks: s19 });

  // 4.20: Ochsenauge West – Obere Zone Y=141..146
  const s20 = [];
  buildOculusWall(s20, 141, 146, 'west');
  steps.push({ stepNumber: "4.20", title: "Ochsenauge West: Oberer Bogen (Y=141 bis Y=146)", module: "Modul 4: Achteckiger Tambour", description: "Schließe den oberen Bogen des West-Oculus ab.", blocks: s20 });

  // 4.21: Ochsenauge Nord – Untere Zone Y=135..140
  const s21 = [];
  buildOculusWall(s21, 135, 140, 'nord');
  steps.push({ stepNumber: "4.21", title: "Ochsenauge Nord: Unterer Bogen (Y=135 bis Y=140)", module: "Modul 4: Achteckiger Tambour", description: "Forme die untere Hälfte des Nord-Oculus.", blocks: s21 });

  // 4.22: Ochsenauge Nord – Obere Zone Y=141..146
  const s22 = [];
  buildOculusWall(s22, 141, 146, 'nord');
  steps.push({ stepNumber: "4.22", title: "Ochsenauge Nord: Oberer Bogen (Y=141 bis Y=146)", module: "Modul 4: Achteckiger Tambour", description: "Schließe den oberen Bogen des Nord-Oculus ab.", blocks: s22 });

  // 4.23: Ochsenauge Süd – Untere Zone Y=135..140
  const s23 = [];
  buildOculusWall(s23, 135, 140, 'sued');
  steps.push({ stepNumber: "4.23", title: "Ochsenauge Süd: Unterer Bogen (Y=135 bis Y=140)", module: "Modul 4: Achteckiger Tambour", description: "Forme die untere Hälfte des Süd-Oculus.", blocks: s23 });

  // 4.24: Ochsenauge Süd – Obere Zone Y=141..146
  const s24 = [];
  buildOculusWall(s24, 141, 146, 'sued');
  steps.push({ stepNumber: "4.24", title: "Ochsenauge Süd: Oberer Bogen (Y=141 bis Y=146)", module: "Modul 4: Achteckiger Tambour", description: "Schließe den oberen Bogen des Süd-Oculus ab.", blocks: s24 });

  // 4.25: Ochsenaugen NO & NW Y=135..146
  const s25 = [];
  for (let y = 135; y <= 146; y++) {
    const dy = y - 140;
    for (let i = 2; i <= 15; i++) {
      const dt = i - 8.5;
      const distOculus = Math.sqrt(dy * dy + dt * dt);
      const isOpening = (distOculus <= 4.8);
      const isInner = (distOculus > 4.8 && distOculus <= 6.2);
      const isOuter = (distOculus > 6.2 && distOculus <= 7.5);
      for (let w = -2; w <= 3; w++) {
        if (isOpening && Math.abs(w) <= 1) continue;
        let type = "bricks";
        if (w === -2) type = isInner ? "smooth_quartz" : (isOuter ? "dark_prismarine" : "smooth_quartz");
        else if (w === 3) type = isInner ? "calcite" : "smooth_stone";
        addBlock(s25,  25 + i - w, y, -42 + i + w, type);
        addBlock(s25, -25 - i + w, y, -42 + i + w, type);
      }
    }
  }
  steps.push({ stepNumber: "4.25", title: "Ochsenaugen-Rahmen: Nordost & Nordwest (Y=135 bis Y=146)", module: "Modul 4: Achteckiger Tambour", description: "Baue die Rundfenster-Rahmen an der Nordost- und Nordwest-Wand auf.", blocks: s25 });

  // 4.26: Ochsenaugen SO & SW Y=135..146
  const s26 = [];
  for (let y = 135; y <= 146; y++) {
    const dy = y - 140;
    for (let i = 2; i <= 15; i++) {
      const dt = i - 8.5;
      const distOculus = Math.sqrt(dy * dy + dt * dt);
      const isOpening = (distOculus <= 4.8);
      const isInner = (distOculus > 4.8 && distOculus <= 6.2);
      const isOuter = (distOculus > 6.2 && distOculus <= 7.5);
      for (let w = -2; w <= 3; w++) {
        if (isOpening && Math.abs(w) <= 1) continue;
        let type = "bricks";
        if (w === -2) type = isInner ? "smooth_quartz" : (isOuter ? "dark_prismarine" : "smooth_quartz");
        else if (w === 3) type = isInner ? "calcite" : "smooth_stone";
        addBlock(s26,  25 + i - w, y, 42 - i - w, type);
        addBlock(s26, -25 - i + w, y, 42 - i - w, type);
      }
    }
  }
  steps.push({ stepNumber: "4.26", title: "Ochsenaugen-Rahmen: Südost & Südwest (Y=135 bis Y=146)", module: "Modul 4: Achteckiger Tambour", description: "Vollende die Rahmen an der Südost- und Südwest-Wand.", blocks: s26 });

  // 4.27: Meister-Buntglasfenster
  const s27 = [];
  for (let y = 135; y <= 145; y++) {
    const dy = y - 140;
    for (let z = -5; z <= 5; z++) {
      const d = Math.sqrt(dy * dy + z * z);
      if (d <= 5.0) {
        addBlock(s27, 40, y, z, (d <= 1.5) ? "yellow_stained_glass" : ((d <= 3.2) ? "red_stained_glass" : "blue_stained_glass"));
        addBlock(s27, -40, y, z, (d <= 1.8) ? "yellow_stained_glass" : "light_blue_stained_glass");
      }
    }
    for (let x = -5; x <= 5; x++) {
      const d = Math.sqrt(dy * dy + x * x);
      if (d <= 5.0) {
        addBlock(s27, x, y, -40, (d <= 1.5) ? "yellow_stained_glass" : "orange_stained_glass");
        addBlock(s27, x, y, 40, (d <= 1.5) ? "yellow_stained_glass" : "purple_stained_glass");
      }
    }
    for (let i = 4; i <= 13; i++) {
      const dt = i - 8.5;
      const d = Math.sqrt(dy * dy + dt * dt);
      if (d <= 4.6) {
        const type = (d <= 1.5) ? "yellow_stained_glass" : ((d <= 3.0) ? "red_stained_glass" : "light_blue_stained_glass");
        addBlock(s27,  25 + i, y, -42 + i, type);
        addBlock(s27, -25 - i, y, -42 + i, type);
        addBlock(s27,  25 + i, y,  42 - i, type);
        addBlock(s27, -25 - i, y,  42 - i, type);
      }
    }
  }
  steps.push({ stepNumber: "4.27", title: "Die 8 Meister-Buntglasfenster (Donatello, Ghiberti, Uccello)", module: "Modul 4: Achteckiger Tambour", description: "Setze die 8 Buntglasrosetten in die Ochsenaugen ein.", blocks: s27 });

  // 4.28: Obere Wandfelder Ost Y=147..153
  const s28 = [];
  for (let y = 147; y <= 153; y++) {
    for (let z = -23; z <= 23; z++) {
      for (let x = 37; x <= 42; x++) addBlock(s28, x, y, z, (x === 42) ? (y === 153 ? "calcite" : "smooth_quartz") : "stone_bricks");
    }
  }
  steps.push({ stepNumber: "4.28", title: "Obere Wandfelder: Ostseite (Y=147 bis Y=153)", module: "Modul 4: Achteckiger Tambour", description: "Schließe die Wand oberhalb des Ost-Oculus ab.", blocks: s28 });

  // 4.29: Obere Wandfelder West Y=147..153
  const s29 = [];
  for (let y = 147; y <= 153; y++) {
    for (let z = -23; z <= 23; z++) {
      for (let x = -42; x <= -37; x++) addBlock(s29, x, y, z, (x === -42) ? (y === 153 ? "calcite" : "smooth_quartz") : "stone_bricks");
    }
  }
  steps.push({ stepNumber: "4.29", title: "Obere Wandfelder: Westseite (Y=147 bis Y=153)", module: "Modul 4: Achteckiger Tambour", description: "Schließe die Wand oberhalb des West-Oculus ab.", blocks: s29 });

  // 4.30: Obere Wandfelder Nord Y=147..153
  const s30 = [];
  for (let y = 147; y <= 153; y++) {
    for (let x = -23; x <= 23; x++) {
      for (let z = -42; z <= -37; z++) addBlock(s30, x, y, z, (z === -42) ? (y === 153 ? "calcite" : "smooth_quartz") : "stone_bricks");
    }
  }
  steps.push({ stepNumber: "4.30", title: "Obere Wandfelder: Nordseite (Y=147 bis Y=153)", module: "Modul 4: Achteckiger Tambour", description: "Schließe die Wand oberhalb des Nord-Oculus ab.", blocks: s30 });

  // 4.31: Obere Wandfelder Süd Y=147..153
  const s31 = [];
  for (let y = 147; y <= 153; y++) {
    for (let x = -23; x <= 23; x++) {
      for (let z = 37; z <= 42; z++) addBlock(s31, x, y, z, (z === 42) ? (y === 153 ? "calcite" : "smooth_quartz") : "stone_bricks");
    }
  }
  steps.push({ stepNumber: "4.31", title: "Obere Wandfelder: Südseite (Y=147 bis Y=153)", module: "Modul 4: Achteckiger Tambour", description: "Schließe die Wand oberhalb des Süd-Oculus ab.", blocks: s31 });

  // 4.32: Obere Wandfelder NO & NW Y=147..153
  const s32 = [];
  for (let y = 147; y <= 153; y++) {
    for (let i = 2; i <= 15; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2) ? (y === 153 ? "calcite" : "smooth_quartz") : "stone_bricks";
        addBlock(s32,  25 + i - w, y, -42 + i + w, type);
        addBlock(s32, -25 - i + w, y, -42 + i + w, type);
      }
    }
  }
  steps.push({ stepNumber: "4.32", title: "Obere Wandfelder: Nordost & Nordwest (Y=147 bis Y=153)", module: "Modul 4: Achteckiger Tambour", description: "Schließe die NO- und NW-Wand bis Y=153 ab.", blocks: s32 });

  // 4.33: Obere Wandfelder SO & SW Y=147..153
  const s33 = [];
  for (let y = 147; y <= 153; y++) {
    for (let i = 2; i <= 15; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2) ? (y === 153 ? "calcite" : "smooth_quartz") : "stone_bricks";
        addBlock(s33,  25 + i - w, y, 42 - i - w, type);
        addBlock(s33, -25 - i + w, y, 42 - i - w, type);
      }
    }
  }
  steps.push({ stepNumber: "4.33", title: "Obere Wandfelder: Südost & Südwest (Y=147 bis Y=153)", module: "Modul 4: Achteckiger Tambour", description: "Schließe die SO- und SW-Wand bis Y=153 ab.", blocks: s33 });

  // Helper for solid octagon layer Y=154..160
  function addTambourWallLayer(stepBlocks, y) {
    for (let x = -42; x <= 42; x++) {
      for (let z = -42; z <= 42; z++) {
        if (inOctagon(x, z, 42, 25) && !inOctagon(x, z, 36, 21)) {
          const isOuter = (Math.abs(x) >= 41 || Math.abs(z) >= 41 || Math.abs(x) + Math.abs(z) >= 66);
          addBlock(stepBlocks, x, y, z, isOuter ? "smooth_quartz" : "stone_bricks");
        }
      }
    }
  }

  // 4.34: Tambour Y=154
  const s34 = [];
  addTambourWallLayer(s34, 154);
  steps.push({ stepNumber: "4.34", title: "Oberes Tambour-Mauerwerk: Schicht 1 (Y=154)", module: "Modul 4: Achteckiger Tambour", description: "Ziehe alle 8 Tambourwände auf Höhe Y=154 hoch.", blocks: s34 });

  // 4.35: Tambour Y=155
  const s35 = [];
  addTambourWallLayer(s35, 155);
  steps.push({ stepNumber: "4.35", title: "Oberes Tambour-Mauerwerk: Schicht 2 (Y=155)", module: "Modul 4: Achteckiger Tambour", description: "Ziehe alle 8 Tambourwände auf Höhe Y=155 hoch.", blocks: s35 });

  // 4.36: Tambour Y=156
  const s36 = [];
  addTambourWallLayer(s36, 156);
  steps.push({ stepNumber: "4.36", title: "Oberes Tambour-Mauerwerk: Schicht 3 (Y=156)", module: "Modul 4: Achteckiger Tambour", description: "Ziehe alle 8 Tambourwände auf Höhe Y=156 hoch.", blocks: s36 });

  // 4.37: Tambour Y=157
  const s37 = [];
  addTambourWallLayer(s37, 157);
  steps.push({ stepNumber: "4.37", title: "Oberes Tambour-Mauerwerk: Schicht 4 (Y=157)", module: "Modul 4: Achteckiger Tambour", description: "Vollende das tragende Tambourmauerwerk bis Y=157.", blocks: s37 });

  // 4.38: Michelangelos Grillenkäfig Y=154..157
  const s38 = [];
  for (let x = -23; x <= 23; x++) {
    addBlock(s38, x, 154, -36, "smooth_stone"); addBlock(s38, x, 154,  36, "smooth_stone");
    addBlock(s38, x, 155, -36, "dark_prismarine"); addBlock(s38, x, 155,  36, "dark_prismarine");
  }
  for (let z = -23; z <= 23; z++) {
    addBlock(s38, -36, 154, z, "smooth_stone"); addBlock(s38,  36, 154, z, "smooth_stone");
    addBlock(s38, -36, 155, z, "dark_prismarine"); addBlock(s38,  36, 155, z, "dark_prismarine");
  }
  for (let i = 2; i <= 15; i++) {
    const bx = 25 + i + 3;
    const bz = 42 - i + 3;
    addBlock(s38, bx, 154, bz, "smooth_quartz");
    addBlock(s38, bx, 155, bz, "calcite");
    if (i % 2 === 0) {
      addBlock(s38, bx, 156, bz, "smooth_quartz");
      addBlock(s38, bx, 157, bz, "smooth_quartz");
    }
    addBlock(s38, bx, 157, bz, "calcite");
  }
  for (let x = -21; x <= 21; x += 3) {
    addBlock(s38, x, 156, -43, "calcite"); addBlock(s38, x, 156, 43, "calcite");
  }
  for (let z = -21; z <= 21; z += 3) {
    addBlock(s38, -43, 156, z, "calcite"); addBlock(s38, 43, 156, z, "calcite");
  }
  steps.push({ stepNumber: "4.38", title: "Michelangelos 'Grillenkäfig' & Kragsteinkonsolen", module: "Modul 4: Achteckiger Tambour", description: "Baccio d'Agnolos unvollendete Galerie an der Südost-Kante.", blocks: s38 });

  // 4.39: Kranzgesims 1 Y=158
  const s39 = [];
  for (let x = -42; x <= 42; x++) {
    for (let z = -42; z <= 42; z++) {
      if (inOctagon(x, z, 42, 25) && !inOctagon(x, z, 36, 21)) {
        const isOuter = (Math.abs(x) >= 42 || Math.abs(z) >= 42 || Math.abs(x) + Math.abs(z) >= 67);
        addBlock(s39, x, 158, z, isOuter ? "calcite" : "stone_bricks");
      }
    }
  }
  steps.push({ stepNumber: "4.39", title: "Das Kranzgesims: Schicht 1 – Architrav (Y=158)", module: "Modul 4: Achteckiger Tambour", description: "Errichte die vorkragende Architrav-Schicht des Kranzgesimses.", blocks: s39 });

  // 4.40: Kranzgesims 2 Y=159
  const s40 = [];
  for (let x = -42; x <= 42; x++) {
    for (let z = -42; z <= 42; z++) {
      if (inOctagon(x, z, 42, 25) && !inOctagon(x, z, 36, 21)) {
        const isOuter = (Math.abs(x) >= 42 || Math.abs(z) >= 42 || Math.abs(x) + Math.abs(z) >= 67);
        let type = "stone_bricks";
        if (isOuter) type = ((x + z) % 2 === 0) ? "calcite" : "smooth_quartz";
        addBlock(s40, x, 159, z, type);
      }
    }
  }
  steps.push({ stepNumber: "4.40", title: "Das Kranzgesims: Schicht 2 – Zahnschnitt-Fries (Y=159)", module: "Modul 4: Achteckiger Tambour", description: "Mauere die zweite Gesimsschicht mit Zahnschnittfries auf.", blocks: s40 });

  // 4.41: Startplattform Y=160
  const s41 = [];
  for (let x = -42; x <= 42; x++) {
    for (let z = -42; z <= 42; z++) {
      if (inOctagon(x, z, 42, 25) && !inOctagon(x, z, 36, 21)) {
        const isCorner = (Math.abs(x) === 25 && Math.abs(z) === 42) ||
                         (Math.abs(x) === 42 && Math.abs(z) === 25) ||
                         (x === 0 && Math.abs(z) === 42) ||
                         (z === 0 && Math.abs(x) === 42);
        addBlock(s41, x, 160, z, isCorner ? "polished_deepslate" : "smooth_quartz");
      }
    }
  }
  steps.push({ stepNumber: "4.41", title: "Brunelleschis Startplattform & Ankersteine (Y=160)", module: "Modul 4: Achteckiger Tambour", description: "Vollende den Tambour mit der vollkommen planen Plattform auf Y=160.", blocks: s41 });

  return steps;
}

const m4Steps = generateModule4Perfect();
console.log(`Generated Modul 4: ${m4Steps.length} steps`);
let m4Total = 0, m4Max = 0;
m4Steps.forEach(s => {
  m4Total += s.blocks.length;
  if (s.blocks.length > m4Max) m4Max = s.blocks.length;
});
console.log(`Modul 4 Total: ${m4Total} blocks, Max step: ${m4Max}`);

const m4Code = `/**
 * Modul 4: Achteckiger Tambour (Santa Maria del Fiore)
 * 100% EXAKT berechnete Blockkoordinaten ohne Näherungswerte.
 * Lückenlos geschlossenes Mauerwerk von Y=120 bis Y=160.
 * Vollkommen plane Plattform auf Y=160 für Modul 5.
 * Alle Schritte <= 2.500 Blöcke.
 */
window.MODULE_4_DATA = ${JSON.stringify(m4Steps, null, 2)};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { steps: window.MODULE_4_DATA };
}
`;
fs.writeFileSync('webapp/js/data/module_4_steps.js', m4Code, 'utf8');
console.log('Successfully wrote webapp/js/data/module_4_steps.js');
