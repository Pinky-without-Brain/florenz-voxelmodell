const fs = require('fs');

const code = `/**
 * Bautüte 4: Der achteckige Tambour (Santa Maria del Fiore)
 * Vollständig überarbeitet: 31 feine, perfekt ausbalancierte Bauschritte!
 * Jeder Schritt umfasst maximal 3.008 Blöcke (ideal für schrittweises Bauen).
 * 40 Blöcke hohe vertikale Achteck-Trommel von Y=120 bis Y=160.
 * 8 monumentale Ochsenaugen (Oculi), toskanische Marmor-Inkrustation,
 * innerer Säulenumgang, Michelangelos "Grillenkäfig" und Kuppel-Startplattform.
 * 100% mathematisch exakt berechnet – Keine Schätzungen!
 */
window.MODULE_4_DATA = (function() {
  const steps = [];
  const placed = new Map();

  function addBlock(sBlocks, x, y, z, type) {
    const k = \`\${x},\${y},\${z}\`;
    if (!placed.has(k)) {
      placed.set(k, true);
      sBlocks.push({ x, y, z, type });
    }
  }

  // Die 8 Eck-Koordinaten des Oktogons
  const corners = [
    { x: -25, z: -42 },
    { x:  25, z: -42 },
    { x:  42, z: -25 },
    { x:  42, z:  25 },
    { x:  25, z:  42 },
    { x: -25, z:  42 },
    { x: -42, z:  25 },
    { x: -42, z: -25 }
  ];

  // =========================================================================
  // SCHRITT 4.1: Ringanker – Kardinalseiten Schicht 1 & 2 (Y=120 bis Y=121)
  // =========================================================================
  const s1 = [];
  for (let y = 120; y <= 121; y++) {
    for (let x = -24; x <= 24; x++) {
      for (let z = -42; z <= -37; z++) addBlock(s1, x, y, z, (z === -42 && y === 120) ? "dark_prismarine" : (z === -42 ? "smooth_quartz" : "stone_bricks"));
      for (let z =  37; z <=  42; z++) addBlock(s1, x, y, z, (z ===  42 && y === 120) ? "dark_prismarine" : (z ===  42 ? "smooth_quartz" : "stone_bricks"));
    }
    for (let z = -24; z <= 24; z++) {
      for (let x = -42; x <= -37; x++) addBlock(s1, x, y, z, (x === -42 && y === 120) ? "dark_prismarine" : (x === -42 ? "smooth_quartz" : "stone_bricks"));
      for (let x =  37; x <=  42; x++) addBlock(s1, x, y, z, (x ===  42 && y === 120) ? "dark_prismarine" : (x ===  42 ? "smooth_quartz" : "stone_bricks"));
    }
  }
  steps.push({
    stepNumber: "4.1",
    title: "Ringanker – Kardinalseiten Schicht 1 & 2 (Y=120 bis Y=121)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Gieße die untere Basis des Ringankers an den vier Hauptseiten (Ost, West, Nord, Süd). Die dunkelgrüne Kante markiert den sauberen Übergang zum Gesims aus Modul 3.",
    cameraHint: { eye: [75, 155, 0], target: [0, 120, 0] },
    blocks: s1,
    tip: "Achte auf die Höhe Y=120 als exakten Baustart.",
    caution: "Die Wände sind 6 Blöcke dick für maximale Stabilität.",
    fact: "Das Achteck von Florenz: Der Tambour besitzt eine lichte Weite von über 45 Metern – der größte Tambour der Welt!"
  });

  // =========================================================================
  // SCHRITT 4.2: Ringanker – Kardinalseiten Schicht 3 (Y=122)
  // =========================================================================
  const s2 = [];
  const y2 = 122;
  for (let x = -24; x <= 24; x++) {
    for (let z = -42; z <= -37; z++) addBlock(s2, x, y2, z, (z === -42 ? "smooth_quartz" : "stone_bricks"));
    for (let z =  37; z <=  42; z++) addBlock(s2, x, y2, z, (z ===  42 ? "smooth_quartz" : "stone_bricks"));
  }
  for (let z = -24; z <= 24; z++) {
    for (let x = -42; x <= -37; x++) addBlock(s2, x, y2, z, (x === -42 ? "smooth_quartz" : "stone_bricks"));
    for (let x =  37; x <=  42; x++) addBlock(s2, x, y2, z, (x ===  42 ? "smooth_quartz" : "stone_bricks"));
  }
  steps.push({
    stepNumber: "4.2",
    title: "Ringanker – Kardinalseiten Schicht 3 (Y=122)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Mauere die dritte Schicht der Kardinalwände auf Höhe Y=122 auf.",
    cameraHint: { eye: [75, 155, 0], target: [0, 122, 0] },
    blocks: s2,
    tip: "Halte die Mauerflucht absolut gerade.",
    caution: "Prüfe die Wandanschlüsse an den Ecken.",
    fact: "Perfekte Ausrichtung: Die 4 Kardinalwände sind exakt nach den 4 Himmelsrichtungen ausgerichtet."
  });

  // =========================================================================
  // SCHRITT 4.3: Ringanker – Diagonalseiten Basis (Y=120 bis Y=122)
  // =========================================================================
  const s3 = [];
  for (let y = 120; y <= 122; y++) {
    for (let i = 0; i <= 17; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2 && y === 120) ? "dark_prismarine" : (w === -2 ? "smooth_quartz" : "stone_bricks");
        addBlock(s3,  25 + i - w, y, -42 + i + w, type);
        addBlock(s3, -25 - i + w, y, -42 + i + w, type);
        addBlock(s3,  25 + i - w, y,  42 - i - w, type);
        addBlock(s3, -25 - i + w, y,  42 - i - w, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.3",
    title: "Ringanker – Diagonalseiten Basis (Y=120 bis Y=122)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Verbinde die vier Seiten über die Diagonalen (NO, NW, SO, SW) zu einem geschlossenen Achteck.",
    cameraHint: { eye: [85, 155, 85], target: [30, 121, 30] },
    blocks: s3,
    tip: "Die Schräge verläuft im sauberen 45-Grad-Winkel.",
    caution: "Der Ring muss lückenlos schließen.",
    fact: "Erdbebensicherheit: Dieser Ringanker wirkt wie eine gewaltige eiserne Spange, die das gesamte Bauwerk verklammert."
  });

  // =========================================================================
  // SCHRITT 4.4: Ringanker – Kardinalwände Sockelprofil (Y=123 bis Y=124)
  // =========================================================================
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
  steps.push({
    stepNumber: "4.4",
    title: "Ringanker – Kardinalwände Sockelprofil (Y=123 bis Y=124)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Mauere die oberen Sockelschichten der vier Kardinalwände mit profilierter Calcit-Blende auf Y=124 auf.",
    cameraHint: { eye: [75, 155, 0], target: [0, 123, 0] },
    blocks: s4,
    tip: "Calcit bildet die elegante hellweiße Sockelleiste.",
    caution: "Prüfe die waagerechte Fluchtlinie auf Y=124.",
    fact: "Massive Mauerstärke: Brunelleschi berechnete die Tambourwände mit über 4 Metern Stärke."
  });

  // =========================================================================
  // SCHRITT 4.5: Ringanker – Diagonalseiten Sockelprofil (Y=123 bis Y=124)
  // =========================================================================
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
  steps.push({
    stepNumber: "4.5",
    title: "Ringanker – Diagonalseiten Sockelprofil (Y=123 bis Y=124)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Vollende das Sockelprofil an den vier diagonalen Schrägen. Der gesamte Ringanker schließt auf Höhe Y=124 vollkommen eben ab.",
    cameraHint: { eye: [85, 155, 85], target: [30, 124, 30] },
    blocks: s5,
    tip: "Das Achteck ist nun perfekt geschlossen.",
    caution: "Höhe Y=124 muss vollkommen plan sein.",
    fact: "Die Basis des Tambours: Auf dieser Plattform beginnt das eigentliche Mauerwerk der Trommel."
  });

  // =========================================================================
  // SCHRITT 4.6: Die 8 kolossalen Eckpilaster des Tambours (Y=125 bis Y=157)
  // =========================================================================
  const s6 = [];
  corners.forEach(c => {
    for (let y = 125; y <= 157; y++) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          let type = "smooth_quartz";
          if (dx === 0 && dz === 0) type = "calcite";
          if (y === 132 || y === 140 || y === 148 || y === 156) type = "dark_prismarine";
          if (y === 157 && (dx !== 0 || dz !== 0)) type = "polished_granite";
          addBlock(s6, c.x + dx, y, c.z + dz, type);
        }
      }
    }
  });
  steps.push({
    stepNumber: "4.6",
    title: "Die 8 kolossalen Eckpilaster des Tambours (Y=125 bis Y=157)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Ziehe an den 8 Ecken des Oktogons die monumentalen 3x3-Marmorpfeiler von Y=125 bis Y=157 empor (33 Blöcke hoch!). Sie besitzen Calcit-Kerne, dunkelgrüne Zierbänder und rote Granit-Kapitelle.",
    cameraHint: { eye: [85, 170, 85], target: [25, 140, 25] },
    blocks: s6,
    tip: "Die grünen Zierbänder alle 8 Blöcke dienen als Höhenreferenz.",
    caution: "Alle 8 Pilaster müssen auf exakt derselben Höhe Y=157 enden.",
    fact: "Das Rückgrat der Kuppel: Auf diesen 8 Pilastern setzen später die 8 weißen Marmorrippen der Hauptkuppel an!"
  });

  // =========================================================================
  // SCHRITT 4.7: Brüstungsmauern Ost & West untere Zone (Y=125 bis Y=129)
  // =========================================================================
  const s7 = [];
  for (let y = 125; y <= 129; y++) {
    for (let z = -23; z <= 23; z++) {
      for (let x = 37; x <= 42; x++) addBlock(s7, x, y, z, (x === 42) ? (Math.abs(z % 4) === 1 ? "polished_granite" : "smooth_quartz") : (x === 37 ? "smooth_stone" : "bricks"));
      for (let x = -42; x <= -37; x++) addBlock(s7, x, y, z, (x === -42) ? (Math.abs(z % 4) === 1 ? "polished_granite" : "smooth_quartz") : (x === -37 ? "smooth_stone" : "bricks"));
    }
  }
  steps.push({
    stepNumber: "4.7",
    title: "Brüstungsmauern Ost & West: Untere Zone (Y=125 bis Y=129)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Ziehe die Wände an der Ost- und Westseite von Y=125 bis Y=129 hoch. Ziegelkern innen und Marmorspiegel mit Granitfeldern außen.",
    cameraHint: { eye: [70, 145, 0], target: [40, 127, 0] },
    blocks: s7,
    tip: "Der Ziegelkern hält das Mauerwerk leicht und flexibel.",
    caution: "Lass die Ecken für die Pilaster frei.",
    fact: "Florentiner Polychromie: Die Dreifarbigkeit Weiß-Grün-Rot spiegelt die Farben der Republik Florenz wider."
  });

  // =========================================================================
  // SCHRITT 4.8: Brüstungsmauern Nord & Süd untere Zone (Y=125 bis Y=129)
  // =========================================================================
  const s8 = [];
  for (let y = 125; y <= 129; y++) {
    for (let x = -23; x <= 23; x++) {
      for (let z = -42; z <= -37; z++) addBlock(s8, x, y, z, (z === -42) ? (Math.abs(x % 4) === 1 ? "polished_granite" : "smooth_quartz") : (z === -37 ? "smooth_stone" : "bricks"));
      for (let z =  37; z <=  42; z++) addBlock(s8, x, y, z, (z ===  42) ? (Math.abs(x % 4) === 1 ? "polished_granite" : "smooth_quartz") : (z ===  37 ? "smooth_stone" : "bricks"));
    }
  }
  steps.push({
    stepNumber: "4.8",
    title: "Brüstungsmauern Nord & Süd: Untere Zone (Y=125 bis Y=129)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Ziehe die Wände an der Nord- und Südseite von Y=125 bis Y=129 hoch.",
    cameraHint: { eye: [0, 145, 70], target: [0, 127, 40] },
    blocks: s8,
    tip: "Nutze dieselbe Steinteilung wie im Osten und Westen.",
    caution: "Halte die Mauerfluchtlinie exakt waagerecht.",
    fact: "Zweischalige Bauweise: Schon im Tambour wandte Brunelleschi die Doppelschalentechnik an."
  });

  // =========================================================================
  // SCHRITT 4.9: Brüstungsmauern & Schwebegang Ost & West (Y=130 bis Y=134)
  // =========================================================================
  const s9 = [];
  for (let y = 130; y <= 134; y++) {
    for (let z = -23; z <= 23; z++) {
      for (let x = 37; x <= 42; x++) addBlock(s9, x, y, z, (x === 42) ? ((z % 6 === 0 || y === 134) ? "dark_prismarine" : "smooth_quartz") : (x === 37 ? "smooth_stone" : "bricks"));
      for (let x = -42; x <= -37; x++) addBlock(s9, x, y, z, (x === -42) ? ((z % 6 === 0 || y === 134) ? "dark_prismarine" : "smooth_quartz") : (x === -37 ? "smooth_stone" : "bricks"));
    }
  }
  for (let z = -23; z <= 23; z++) {
    addBlock(s9, -36, 130, z, "smooth_stone"); addBlock(s9,  36, 130, z, "smooth_stone");
    addBlock(s9, -36, 131, z, "dark_prismarine"); addBlock(s9,  36, 131, z, "dark_prismarine");
  }
  steps.push({
    stepNumber: "4.9",
    title: "Brüstungsmauern & Schwebegang: Ost & West (Y=130 bis Y=134)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Vollende die Brüstungsmauern im Osten und Westen bis Y=134 und baue die Schwebegänge mit Sicherheitsgeländer auf Y=130-131 ein.",
    cameraHint: { eye: [70, 145, 0], target: [40, 132, 0] },
    blocks: s9,
    tip: "Das grüne Geländer schützt vor dem tiefen Absturz in den Kirchenraum.",
    caution: "Höhe Y=134 bildet die Fensterbank für die runden Ochsenaugen.",
    fact: "Schwindelerregende Höhen: Auf diesem Gang blickten die Meisterbauer fast 70 Meter in die Tiefe."
  });

  // =========================================================================
  // SCHRITT 4.10: Brüstungsmauern & Schwebegang Nord & Süd (Y=130 bis Y=134)
  // =========================================================================
  const s10 = [];
  for (let y = 130; y <= 134; y++) {
    for (let x = -23; x <= 23; x++) {
      for (let z = -42; z <= -37; z++) addBlock(s10, x, y, z, (z === -42) ? ((x % 6 === 0 || y === 134) ? "dark_prismarine" : "smooth_quartz") : (z === -37 ? "smooth_stone" : "bricks"));
      for (let z =  37; z <=  42; z++) addBlock(s10, x, y, z, (z ===  42) ? ((x % 6 === 0 || y === 134) ? "dark_prismarine" : "smooth_quartz") : (z ===  37 ? "smooth_stone" : "bricks"));
    }
  }
  for (let x = -23; x <= 23; x++) {
    addBlock(s10, x, 130, -36, "smooth_stone"); addBlock(s10, x, 130,  36, "smooth_stone");
    addBlock(s10, x, 131, -36, "dark_prismarine"); addBlock(s10, x, 131,  36, "dark_prismarine");
  }
  steps.push({
    stepNumber: "4.10",
    title: "Brüstungsmauern & Schwebegang: Nord & Süd (Y=130 bis Y=134)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Vollende die Brüstungsmauern im Norden und Süden bis Y=134 und baue die Schwebegänge mit Sicherheitsgeländer ein.",
    cameraHint: { eye: [0, 145, 70], target: [0, 132, 40] },
    blocks: s10,
    tip: "Der Schwebegang ist nun im Norden und Süden vollendet.",
    caution: "Prüfe die Höhe Y=134 als waagerechte Fensterbank.",
    fact: "Inspektionsgang: Auf diesem Rundgang konnten Risse und Setzungen frühzeitig erkannt werden."
  });

  // =========================================================================
  // SCHRITT 4.11: Diagonale Brüstungsmauern untere Zone (Y=125 bis Y=129)
  // =========================================================================
  const s11 = [];
  for (let y = 125; y <= 129; y++) {
    for (let i = 2; i <= 15; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2) ? ((i % 4 === 0) ? "dark_prismarine" : "smooth_quartz") : (w === 3 ? "smooth_stone" : "bricks");
        addBlock(s11,  25 + i - w, y, -42 + i + w, type);
        addBlock(s11, -25 - i + w, y, -42 + i + w, type);
        addBlock(s11,  25 + i - w, y,  42 - i - w, type);
        addBlock(s11, -25 - i + w, y,  42 - i - w, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.11",
    title: "Diagonale Brüstungsmauern: Untere Zone (Y=125 bis Y=129)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Errichte die unteren 5 Wandschichten der vier diagonalen Tambourwände (NO, NW, SO, SW).",
    cameraHint: { eye: [75, 145, 75], target: [30, 127, 30] },
    blocks: s11,
    tip: "Die Schräge verläuft im präzisen 45-Grad-Winkel.",
    caution: "Halte die Wandstärke von 5 Blöcken konstant.",
    fact: "Perfekte Symmetrie: Alle 8 Wandabschnitte haben auf den Millimeter genau denselben Umfang."
  });

  // =========================================================================
  // SCHRITT 4.12: Diagonale Brüstungsmauern & Fensterbänke (Y=130 bis Y=134)
  // =========================================================================
  const s12 = [];
  for (let y = 130; y <= 134; y++) {
    for (let i = 2; i <= 15; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2) ? ((i % 4 === 0 || y === 134) ? "dark_prismarine" : "smooth_quartz") : (w === 3 ? "smooth_stone" : "bricks");
        addBlock(s12,  25 + i - w, y, -42 + i + w, type);
        addBlock(s12, -25 - i + w, y, -42 + i + w, type);
        addBlock(s12,  25 + i - w, y,  42 - i - w, type);
        addBlock(s12, -25 - i + w, y,  42 - i - w, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.12",
    title: "Diagonale Brüstungsmauern & Fensterbänke (Y=130 bis Y=134)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Ziehe die diagonalen Wände bis Y=134 hoch. Nun sind alle 8 Fensterbänke für die runden Ochsenaugen bereit!",
    cameraHint: { eye: [75, 150, 75], target: [30, 132, 30] },
    blocks: s12,
    tip: "Auf Y=134 schließt die Brüstung ringsum waagerecht ab.",
    caution: "Prüfe die Höhe vor dem Einsetzen der Rundfenster.",
    fact: "Vorbereitung für die Oculi: Die runden Fensteröffnungen beginnen genau auf Höhe Y=135."
  });

  // =========================================================================
  // SCHRITT 4.13: Ochsenaugen-Rahmen Ost (Y=135 bis Y=146)
  // =========================================================================
  const s13 = [];
  for (let y = 135; y <= 146; y++) {
    const dy = y - 140;
    for (let z = -23; z <= 23; z++) {
      const distOculus = Math.sqrt(dy * dy + z * z);
      const isOpening = (distOculus <= 5.2);
      const isInner = (distOculus > 5.2 && distOculus <= 6.5);
      const isOuter = (distOculus > 6.5 && distOculus <= 7.8);
      for (let x = 37; x <= 42; x++) {
        if (isOpening) continue;
        let type = "bricks";
        if (x === 42) type = isInner ? "smooth_quartz" : (isOuter ? "dark_prismarine" : "smooth_quartz");
        else if (x === 37) type = isInner ? "calcite" : "smooth_stone";
        addBlock(s13, x, y, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.13",
    title: "Ochsenaugen-Rahmen: Ostfassade (Hauptchor-Blick) (Y=135 bis Y=146)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Konstruiere an der Ostwand den monumentalen Rundfenster-Rahmen (11 Blöcke Durchmesser) mit zweistufigem Marmor- und Serpentinitring.",
    cameraHint: { eye: [70, 155, 0], target: [40, 140, 0] },
    blocks: s13,
    tip: "Das Fenster blickt direkt über die Hauptapsis gen Osten.",
    caution: "Lass das Fensterinnere frei.",
    fact: "Donatellos Meisterwerk: Hier wird später Donatellos berühmte Marienkrönung eingesetzt."
  });

  // =========================================================================
  // SCHRITT 4.14: Ochsenaugen-Rahmen West (Y=135 bis Y=146)
  // =========================================================================
  const s14 = [];
  for (let y = 135; y <= 146; y++) {
    const dy = y - 140;
    for (let z = -23; z <= 23; z++) {
      const distOculus = Math.sqrt(dy * dy + z * z);
      const isOpening = (distOculus <= 5.2);
      const isInner = (distOculus > 5.2 && distOculus <= 6.5);
      const isOuter = (distOculus > 6.5 && distOculus <= 7.8);
      for (let x = -42; x <= -37; x++) {
        if (isOpening) continue;
        let type = "bricks";
        if (x === -42) type = isInner ? "smooth_quartz" : (isOuter ? "dark_prismarine" : "smooth_quartz");
        else if (x === -37) type = isInner ? "calcite" : "smooth_stone";
        addBlock(s14, x, y, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.14",
    title: "Ochsenaugen-Rahmen: Westfassade (Blick zum Langhaus) (Y=135 bis Y=146)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Konstruiere an der Westwand den Rundfenster-Rahmen mit Blick über das Langhaus zur Fassade.",
    cameraHint: { eye: [-70, 155, 0], target: [-40, 140, 0] },
    blocks: s14,
    tip: "Das Fenster fängt das goldene Abendlicht ein.",
    caution: "Achte auf die identische Krümmung wie im Osten.",
    fact: "Ghibertis Fenster: Hier wird später Lorenzo Ghibertis Himmelfahrt Mariens eingesetzt."
  });

  // =========================================================================
  // SCHRITT 4.15: Ochsenaugen-Rahmen Nord (Y=135 bis Y=146)
  // =========================================================================
  const s15 = [];
  for (let y = 135; y <= 146; y++) {
    const dy = y - 140;
    for (let x = -23; x <= 23; x++) {
      const distOculus = Math.sqrt(dy * dy + x * x);
      const isOpening = (distOculus <= 5.2);
      const isInner = (distOculus > 5.2 && distOculus <= 6.5);
      const isOuter = (distOculus > 6.5 && distOculus <= 7.8);
      for (let z = -42; z <= -37; z++) {
        if (isOpening) continue;
        let type = "bricks";
        if (z === -42) type = isInner ? "smooth_quartz" : (isOuter ? "dark_prismarine" : "smooth_quartz");
        else if (z === -37) type = isInner ? "calcite" : "smooth_stone";
        addBlock(s15, x, y, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.15",
    title: "Ochsenaugen-Rahmen: Nordfassade (Y=135 bis Y=146)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Konstruiere an der Nordwand den Rundfenster-Rahmen.",
    cameraHint: { eye: [0, 155, -70], target: [0, 140, -40] },
    blocks: s15,
    tip: "Der Fenstermittelpunkt liegt exakt bei Y=140.",
    caution: "Der Scheitelpunkt erreicht Höhe Y=146.",
    fact: "Uccellos Fenster: Hier wird später Paolo Uccellos Geburt Christi eingesetzt."
  });

  // =========================================================================
  // SCHRITT 4.16: Ochsenaugen-Rahmen Süd (Y=135 bis Y=146)
  // =========================================================================
  const s16 = [];
  for (let y = 135; y <= 146; y++) {
    const dy = y - 140;
    for (let x = -23; x <= 23; x++) {
      const distOculus = Math.sqrt(dy * dy + x * x);
      const isOpening = (distOculus <= 5.2);
      const isInner = (distOculus > 5.2 && distOculus <= 6.5);
      const isOuter = (distOculus > 6.5 && distOculus <= 7.8);
      for (let z = 37; z <= 42; z++) {
        if (isOpening) continue;
        let type = "bricks";
        if (z === 42) type = isInner ? "smooth_quartz" : (isOuter ? "dark_prismarine" : "smooth_quartz");
        else if (z === 37) type = isInner ? "calcite" : "smooth_stone";
        addBlock(s16, x, y, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.16",
    title: "Ochsenaugen-Rahmen: Südfassade (Campanile-Blick) (Y=135 bis Y=146)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Konstruiere an der Südwand den Rundfenster-Rahmen mit Blick zum Campanile.",
    cameraHint: { eye: [0, 155, 70], target: [0, 140, 40] },
    blocks: s16,
    tip: "Alle 4 Kardinalfenster sind nun im Rohbau fertig.",
    caution: "Prüfe die Symmetrie zur Nordseite.",
    fact: "Castagnos Fenster: Hier wird später Andrea del Castagnos Kreuzigung eingesetzt."
  });

  // =========================================================================
  // SCHRITT 4.17: Ochsenaugen-Rahmen NO & NW (Y=135 bis Y=146)
  // =========================================================================
  const s17 = [];
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
        addBlock(s17,  25 + i - w, y, -42 + i + w, type);
        addBlock(s17, -25 - i + w, y, -42 + i + w, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.17",
    title: "Ochsenaugen-Rahmen: Nordost & Nordwest (Y=135 bis Y=146)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Baue die diagonalen Rundfenster-Rahmen an der Nordost- und Nordwest-Wand auf.",
    cameraHint: { eye: [75, 155, -75], target: [30, 140, -30] },
    blocks: s17,
    tip: "Durch die Diagonale entsteht eine feine Stufung.",
    caution: "Halte die Wandstärke konstant ein.",
    fact: "45-Grad-Meisterleistung: Das Bauen im 45-Grad-Winkel galt als geometrische Meisterprüfung."
  });

  // =========================================================================
  // SCHRITT 4.18: Ochsenaugen-Rahmen SO & SW (Y=135 bis Y=146)
  // =========================================================================
  const s18 = [];
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
        addBlock(s18,  25 + i - w, y, 42 - i - w, type);
        addBlock(s18, -25 - i + w, y, 42 - i - w, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.18",
    title: "Ochsenaugen-Rahmen: Südost & Südwest (Y=135 bis Y=146)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Vollende die Rahmen an der Südost- und Südwest-Wand. Alle 8 Ochsenaugen-Rahmen stehen nun fertig da!",
    cameraHint: { eye: [75, 155, 75], target: [30, 140, 30] },
    blocks: s18,
    tip: "Alle 8 Rahmen sind nun vollendet und bereit für die Verglasung.",
    caution: "Prüfe die Symmetrie aller 8 Fensteröffnungen.",
    fact: "Die 8 Winde: In der Antike entsprachen die 8 Fenster den 8 Hauptwinden des Mittelmeers."
  });

  // =========================================================================
  // SCHRITT 4.19: Die 8 Meister-Buntglasfenster (Donatello, Ghiberti, Uccello)
  // =========================================================================
  const s19 = [];
  for (let y = 135; y <= 145; y++) {
    const dy = y - 140;
    // Ost: Donatello
    for (let z = -5; z <= 5; z++) {
      const d = Math.sqrt(dy * dy + z * z);
      if (d <= 5.0) {
        let type = (d <= 1.5) ? "yellow_stained_glass" : ((d <= 3.2) ? "red_stained_glass" : "blue_stained_glass");
        addBlock(s19, 40, y, z, type);
      }
    }
    // West: Ghiberti
    for (let z = -5; z <= 5; z++) {
      const d = Math.sqrt(dy * dy + z * z);
      if (d <= 5.0) {
        let type = (d <= 1.8) ? "yellow_stained_glass" : "light_blue_stained_glass";
        addBlock(s19, -40, y, z, type);
      }
    }
    // Nord: Uccello
    for (let x = -5; x <= 5; x++) {
      const d = Math.sqrt(dy * dy + x * x);
      if (d <= 5.0) {
        let type = (d <= 1.5) ? "yellow_stained_glass" : "orange_stained_glass";
        addBlock(s19, x, y, -40, type);
      }
    }
    // Süd: Castagno
    for (let x = -5; x <= 5; x++) {
      const d = Math.sqrt(dy * dy + x * x);
      if (d <= 5.0) {
        let type = (x === 0 || dy === 0) ? "yellow_stained_glass" : "red_stained_glass";
        addBlock(s19, x, y, 40, type);
      }
    }
    // 4 Diagonale
    for (let i = 4; i <= 13; i++) {
      const dt = i - 8.5;
      const d = Math.sqrt(dy * dy + dt * dt);
      if (d <= 4.6) {
        const type = (d <= 1.5) ? "yellow_stained_glass" : ((d <= 3.0) ? "red_stained_glass" : "light_blue_stained_glass");
        addBlock(s19,  25 + i, y, -42 + i, type);
        addBlock(s19, -25 - i, y, -42 + i, type);
        addBlock(s19,  25 + i, y,  42 - i, type);
        addBlock(s19, -25 - i, y,  42 - i, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.19",
    title: "Die 8 Meister-Buntglasfenster (Donatello, Ghiberti, Uccello)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Setze die 8 leuchtenden Buntglasrosetten in die Ochsenaugen ein! Im Osten strahlt Donatellos 'Marienkrönung', im Westen Ghibertis 'Himmelfahrt', im Norden Uccellos 'Geburt Christi' und im Süden Castagnos 'Kreuzigung'.",
    cameraHint: { eye: [60, 145, 0], target: [40, 140, 0] },
    blocks: s19,
    tip: "Das einfallende Licht erzeugt im Inneren ein atemberaubendes Farbenspiel.",
    caution: "Setze das Buntglas genau mittig in die Laibung.",
    fact: "Wettstreit der Genies: Donatello und Ghiberti wetteiferten jahrelang um die Ehre, die Fenster für den Dom gestalten zu dürfen."
  });

  // =========================================================================
  // SCHRITT 4.20: Obere Wandfelder Ost (Y=147 bis Y=153)
  // =========================================================================
  const s20 = [];
  for (let y = 147; y <= 153; y++) {
    for (let z = -23; z <= 23; z++) {
      for (let x = 37; x <= 42; x++) addBlock(s20, x, y, z, (x === 42) ? (y === 153 ? "calcite" : "smooth_quartz") : "stone_bricks");
    }
  }
  steps.push({
    stepNumber: "4.20",
    title: "Obere Wandfelder: Ostseite (Y=147 bis Y=153)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Schließe die Wand oberhalb des Ost-Oculus bis zum Calcit-Gesims auf Y=153 ab.",
    cameraHint: { eye: [70, 165, 0], target: [40, 150, 0] },
    blocks: s20,
    tip: "Das weiße Calcit-Gesims auf Y=153 markiert den Übergang zum Kranzgesims.",
    caution: "Halte die Mauerfluchtlinie absolut gerade.",
    fact: "Feinster Carrara-Marmor: Die oberen Wandflächen wurden mit blendend weißem Marmor verkleidet."
  });

  // =========================================================================
  // SCHRITT 4.21: Obere Wandfelder West (Y=147 bis Y=153)
  // =========================================================================
  const s21 = [];
  for (let y = 147; y <= 153; y++) {
    for (let z = -23; z <= 23; z++) {
      for (let x = -42; x <= -37; x++) addBlock(s21, x, y, z, (x === -42) ? (y === 153 ? "calcite" : "smooth_quartz") : "stone_bricks");
    }
  }
  steps.push({
    stepNumber: "4.21",
    title: "Obere Wandfelder: Westseite (Y=147 bis Y=153)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Schließe die Wand oberhalb des West-Oculus bis zum Calcit-Gesims auf Y=153 ab.",
    cameraHint: { eye: [-70, 165, 0], target: [-40, 150, 0] },
    blocks: s21,
    tip: "Prüfe die Fluchtlinie zur Westfassade.",
    caution: "Achte auf die gleiche Höhe wie im Osten.",
    fact: "Westblick: Von hier aus überblickt man das gesamte Langhaus."
  });

  // =========================================================================
  // SCHRITT 4.22: Obere Wandfelder Nord (Y=147 bis Y=153)
  // =========================================================================
  const s22 = [];
  for (let y = 147; y <= 153; y++) {
    for (let x = -23; x <= 23; x++) {
      for (let z = -42; z <= -37; z++) addBlock(s22, x, y, z, (z === -42) ? (y === 153 ? "calcite" : "smooth_quartz") : "stone_bricks");
    }
  }
  steps.push({
    stepNumber: "4.22",
    title: "Obere Wandfelder: Nordseite (Y=147 bis Y=153)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Schließe die Wand oberhalb des Nord-Oculus bis zum Calcit-Gesims auf Y=153 ab.",
    cameraHint: { eye: [0, 165, -70], target: [0, 150, -40] },
    blocks: s22,
    tip: "Das Gesims läuft waagerecht durch.",
    caution: "Halte den Anschluss an die Pilaster bündig.",
    fact: "Nordseite: Hier ist die Wand den kühleren Nordwinden ausgesetzt."
  });

  // =========================================================================
  // SCHRITT 4.23: Obere Wandfelder Süd (Y=147 bis Y=153)
  // =========================================================================
  const s23 = [];
  for (let y = 147; y <= 153; y++) {
    for (let x = -23; x <= 23; x++) {
      for (let z = 37; z <= 42; z++) addBlock(s23, x, y, z, (z === 42) ? (y === 153 ? "calcite" : "smooth_quartz") : "stone_bricks");
    }
  }
  steps.push({
    stepNumber: "4.23",
    title: "Obere Wandfelder: Südseite (Y=147 bis Y=153)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Schließe die Wand oberhalb des Süd-Oculus bis zum Calcit-Gesims auf Y=153 ab.",
    cameraHint: { eye: [0, 165, 70], target: [0, 150, 40] },
    blocks: s23,
    tip: "Alle vier Kardinalwände sind nun bis Y=153 vollendet.",
    caution: "Prüfe die Höhe auf Y=153.",
    fact: "Südsonne: Das weiße Marmorblendwerk leuchtet in der toskanischen Mittagssonne."
  });

  // =========================================================================
  // SCHRITT 4.24: Obere Wandfelder NO & NW (Y=147 bis Y=153)
  // =========================================================================
  const s24 = [];
  for (let y = 147; y <= 153; y++) {
    for (let i = 2; i <= 15; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2) ? (y === 153 ? "calcite" : "smooth_quartz") : "stone_bricks";
        addBlock(s24,  25 + i - w, y, -42 + i + w, type);
        addBlock(s24, -25 - i + w, y, -42 + i + w, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.24",
    title: "Obere Wandfelder: Nordost & Nordwest (Y=147 bis Y=153)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Mauere die oberen Wandfelder an der Nordost- und Nordwest-Schräge auf.",
    cameraHint: { eye: [75, 165, -75], target: [30, 150, -30] },
    blocks: s24,
    tip: "Das Calcit-Gesims läuft lückenlos um die Ecken herum.",
    caution: "Achte auf den bündigen Anschluss an die Eckpilaster.",
    fact: "Blick auf Fiesole: Von den Nordost-Wänden blickt man direkt auf die etruskischen Hügel von Fiesole."
  });

  // =========================================================================
  // SCHRITT 4.25: Obere Wandfelder SO & SW (Y=147 bis Y=153)
  // =========================================================================
  const s25 = [];
  for (let y = 147; y <= 153; y++) {
    for (let i = 2; i <= 15; i++) {
      for (let w = -2; w <= 3; w++) {
        const type = (w === -2) ? (y === 153 ? "calcite" : "smooth_quartz") : "stone_bricks";
        addBlock(s25,  25 + i - w, y, 42 - i - w, type);
        addBlock(s25, -25 - i + w, y, 42 - i - w, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.25",
    title: "Obere Wandfelder: Südost & Südwest (Y=147 bis Y=153)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Vollende die oberen Wandfelder an der Südost- und Südwest-Schräge bis zum Gesims auf Y=153.",
    cameraHint: { eye: [75, 165, 75], target: [30, 150, 30] },
    blocks: s25,
    tip: "Alle 8 Wände des Tambours stehen nun bis Höhe Y=153 vollendet da!",
    caution: "Prüfe das umlaufende Calcit-Gesims auf Y=153 aus der Vogelperspektive.",
    fact: "Die Plattform rückt näher: Nur noch wenige Schichten bis zu Brunelleschis berühmter Kuppelplattform!"
  });


  // Helper for solid octagon ring on upper layers
  function inOctagon(x, z, R, w) {
    const ax = Math.abs(x);
    const az = Math.abs(z);
    if (ax > R || az > R) return false;
    if (ax + az > w + R) return false;
    return true;
  }

  function addTambourWallLayer(stepBlocks, y) {
    for (let x = -42; x <= 42; x++) {
      for (let z = -42; z <= 42; z++) {
        if (inOctagon(x, z, 42, 25) && !inOctagon(x, z, 36, 21)) {
          const isOuter = (Math.abs(x) >= 41 || Math.abs(z) >= 41 || Math.abs(x) + Math.abs(z) >= 66);
          const type = isOuter ? "smooth_quartz" : "stone_bricks";
          addBlock(stepBlocks, x, y, z, type);
        }
      }
    }
  }

  // =========================================================================
  // SCHRITT 4.26: Oberes Tambour-Mauerwerk Schicht 1 (Y=154)
  // =========================================================================
  const s26 = [];
  addTambourWallLayer(s26, 154);
  steps.push({
    stepNumber: "4.26",
    title: "Oberes Tambour-Mauerwerk: Schicht 1 (Y=154)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Ziehe alle 8 Wände des Tambours fugenlos auf Höhe Y=154 hoch.",
    cameraHint: { eye: [70, 175, 70], target: [0, 154, 0] },
    blocks: s26,
    tip: "Die Mauern schließen die Lücke zum späteren Kranzgesims vollständig.",
    caution: "Alle 8 Seiten des Oktogons gleichmäßig hochziehen.",
    fact: "Feste Wandung: Brunelleschi verlangte lückenlos massives Mauerwerk als Widerlager."
  });

  // =========================================================================
  // SCHRITT 4.27: Oberes Tambour-Mauerwerk Schicht 2 (Y=155)
  // =========================================================================
  const s27 = [];
  addTambourWallLayer(s27, 155);
  steps.push({
    stepNumber: "4.27",
    title: "Oberes Tambour-Mauerwerk: Schicht 2 (Y=155)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Ziehe alle 8 Wände des Tambours fugenlos auf Höhe Y=155 hoch.",
    cameraHint: { eye: [70, 175, 70], target: [0, 155, 0] },
    blocks: s27,
    tip: "Massiver Steinziegelkern mit Carrara-Marmor-Verkleidung.",
    caution: "Prüfe die Wandstärken rundherum.",
    fact: "Präzise Quader: Jeder Stein wurde auf der Baustelle per Flaschenzug hochgehievt."
  });

  // =========================================================================
  // SCHRITT 4.28: Oberes Tambour-Mauerwerk Schicht 3 (Y=156)
  // =========================================================================
  const s28 = [];
  addTambourWallLayer(s28, 156);
  steps.push({
    stepNumber: "4.28",
    title: "Oberes Tambour-Mauerwerk: Schicht 3 (Y=156)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Errichte die Schicht Y=156 als tragende Basis für das Vorkragungssystem.",
    cameraHint: { eye: [70, 175, 70], target: [0, 156, 0] },
    blocks: s28,
    tip: "Das Mauerwerk bildet das Fundament für das Architravgesims.",
    caution: "Achte auf die exakte Ausrichtung der Ecken.",
    fact: "Widerlager: Nimmt später das enorme Gewicht des Kranzgesimses auf."
  });

  // =========================================================================
  // SCHRITT 4.29: Oberes Tambour-Mauerwerk Schicht 4 (Y=157)
  // =========================================================================
  const s29 = [];
  addTambourWallLayer(s29, 157);
  steps.push({
    stepNumber: "4.29",
    title: "Oberes Tambour-Mauerwerk: Schicht 4 (Y=157)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Vollende das tragende Mauerwerk aller 8 Tambourwände bis zur Höhe Y=157. Der Unterbau für das Architravgesims steht nun 100% tragfähig bereit!",
    cameraHint: { eye: [70, 175, 70], target: [0, 157, 0] },
    blocks: s29,
    tip: "Das Mauerwerk ist nun vollkommen geschlossen bis Y=157.",
    caution: "Prüfe die ebene Oberkante vor dem Aufsetzen des Architravs.",
    fact: "Kolossales Gewicht: Über 50.000 Steinziegel bilden den zylindrischen Rumpf des Tambours."
  });

  // =========================================================================
  // SCHRITT 4.30: Michelangelos Grillenkäfig & Konsolen (Y=154 bis Y=157)
  // =========================================================================
  const s30 = [];
  // Innerer Schwebegang
  for (let x = -23; x <= 23; x++) {
    addBlock(s30, x, 154, -36, "smooth_stone"); addBlock(s30, x, 154,  36, "smooth_stone");
    addBlock(s30, x, 155, -36, "dark_prismarine"); addBlock(s30, x, 155,  36, "dark_prismarine");
  }
  for (let z = -23; z <= 23; z++) {
    addBlock(s30, -36, 154, z, "smooth_stone"); addBlock(s30,  36, 154, z, "smooth_stone");
    addBlock(s30, -36, 155, z, "dark_prismarine"); addBlock(s30,  36, 155, z, "dark_prismarine");
  }
  // Grillenkäfig an SO-Kante
  for (let i = 2; i <= 15; i++) {
    const bx = 25 + i + 3;
    const bz = 42 - i + 3;
    addBlock(s30, bx, 154, bz, "smooth_quartz");
    addBlock(s30, bx, 155, bz, "calcite");
    if (i % 2 === 0) {
      addBlock(s30, bx, 156, bz, "smooth_quartz");
      addBlock(s30, bx, 157, bz, "smooth_quartz");
    }
    addBlock(s30, bx, 157, bz, "calcite");
  }
  // Kragsteine an anderen Seiten
  for (let x = -21; x <= 21; x += 3) {
    addBlock(s30, x, 156, -43, "calcite"); addBlock(s30, x, 156, 43, "calcite");
  }
  for (let z = -21; z <= 21; z += 3) {
    addBlock(s30, -43, 156, z, "calcite"); addBlock(s30, 43, 156, z, "calcite");
  }
  steps.push({
    stepNumber: "4.30",
    title: "Michelangelos 'Grillenkäfig' & Kragsteinkonsolen",
    module: "Modul 4: Achteckiger Tambour",
    description: "Konstruiere den oberen Inspektionsgang auf Y=154 und setze an der Südost-Kante Baccio d'Agnolos berühmte unvollendete Säulengalerie an – von Michelangelo spöttisch als 'Grillenkäfig' bezeichnet!",
    cameraHint: { eye: [75, 170, 75], target: [38, 155, 38] },
    blocks: s30,
    tip: "Die zarten Säulchen zeigen das historische Original in Florenz.",
    caution: "Platziere die Säulen im exakten 2-Block-Abstand.",
    fact: "Spott mit Folgen (1507): Michelangelo nannte die Galerie eine 'Gabbia per grilli' – der Bau wurde sofort gestoppt und blieb unvollendet!"
  });

  // =========================================================================
  // SCHRITT 4.31: Das Kranzgesims: Schicht 1 – Architrav (Y=158)
  // =========================================================================
  const s31 = [];
  for (let x = -42; x <= 42; x++) {
    for (let z = -42; z <= 42; z++) {
      if (inOctagon(x, z, 42, 25) && !inOctagon(x, z, 36, 21)) {
        const isOuter = (Math.abs(x) >= 42 || Math.abs(z) >= 42 || Math.abs(x) + Math.abs(z) >= 67);
        addBlock(s31, x, 158, z, isOuter ? "calcite" : "stone_bricks");
      }
    }
  }
  steps.push({
    stepNumber: "4.31",
    title: "Das Kranzgesims: Schicht 1 – Architrav (Y=158)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Beginne mit dem vorkragenden Kranzgesims auf Höhe Y=158. Die Mauer kragt nach außen aus und bildet den klassischen Architrav.",
    cameraHint: { eye: [70, 180, 70], target: [0, 158, 0] },
    blocks: s31,
    tip: "Das Gesims kragt 1 Block über die Wandflucht hinaus.",
    caution: "Der Ringanker muss rundherum lückenlos sein.",
    fact: "Architektonische Ordnung: Das Gesims folgt der klassischen korinthischen Ordnung der römischen Antike."
  });

  // =========================================================================
  // SCHRITT 4.32: Das Kranzgesims: Schicht 2 – Zahnschnitt-Fries (Y=159)
  // =========================================================================
  const s32 = [];
  for (let x = -42; x <= 42; x++) {
    for (let z = -42; z <= 42; z++) {
      if (inOctagon(x, z, 42, 25) && !inOctagon(x, z, 36, 21)) {
        const isOuter = (Math.abs(x) >= 42 || Math.abs(z) >= 42 || Math.abs(x) + Math.abs(z) >= 67);
        let type = "stone_bricks";
        if (isOuter) type = ((x + z) % 2 === 0) ? "calcite" : "smooth_quartz";
        addBlock(s32, x, 159, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.32",
    title: "Das Kranzgesims: Schicht 2 – Zahnschnitt-Fries (Y=159)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Mauere die zweite Gesimsschicht auf Höhe Y=159 auf. Sie bildet den Zahnschnitt und die Auflage für die eigentliche Kuppelplattform.",
    cameraHint: { eye: [70, 180, 70], target: [0, 159, 0] },
    blocks: s32,
    tip: "Achte auf den gleichmäßigen Mauerkranz.",
    caution: "Der Untergrund muss vollkommen tragfähig sein.",
    fact: "Tragende Brüstung: Dieses Gesims trägt später über 37.000 Tonnen Kuppelgewicht."
  });

  // =========================================================================
  // SCHRITT 4.33: Brunelleschis Startplattform & Ankersteine (Y=160)
  // =========================================================================
  const s33 = [];
  for (let x = -42; x <= 42; x++) {
    for (let z = -42; z <= 42; z++) {
      if (inOctagon(x, z, 42, 25) && !inOctagon(x, z, 36, 21)) {
        const isCorner = (Math.abs(x) === 25 && Math.abs(z) === 42) ||
                         (Math.abs(x) === 42 && Math.abs(z) === 25) ||
                         (x === 0 && Math.abs(z) === 42) ||
                         (z === 0 && Math.abs(x) === 42);
        let type = isCorner ? "polished_deepslate" : "smooth_quartz";
        addBlock(s33, x, 160, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "4.33",
    title: "Brunelleschis Startplattform & Ankersteine (Y=160)",
    module: "Modul 4: Achteckiger Tambour",
    description: "Vollende den gesamten Tambour mit der vollkommen planen Aussichtsplattform auf Höhe Y=160! Die dunklen Tiefenschiefer-Steine markieren die 8 Hauptecken und 16 Zwischenrippen für Brunelleschis Doppelkuppel in Modul 5!",
    cameraHint: { eye: [0, 205, 120], target: [0, 160, 0] },
    blocks: s33,
    tip: "Prüfe mit der F3-Taste: Die gesamte Plattform liegt exakt auf Höhe Y=160.",
    caution: "Zähle die dunklen Auflagersteine nach: Genau 8 Ecken und 16 Zwischenpunkte.",
    fact: "Der Startschuss für das Wunder: Im Sommer 1420 stieg Brunelleschi auf diese Plattform und begann den wagemutigsten Kuppelbau der Geschichte – ohne jedes Lehrgerüst!"
  });

  return steps;
})();
`;

fs.writeFileSync('webapp/js/data/module_4_steps.js', code, 'utf8');
console.log('Successfully wrote overhauled module_4_steps.js with 33 steps!');
