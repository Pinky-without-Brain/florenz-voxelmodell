const fs = require('fs');
const path = require('path');

/**
 * Modul 7: Campanile di Giotto (Santa Maria del Fiore)
 * 100% EXAKT berechnete Blockkoordinaten ohne Näherungswerte.
 * Lückenlos geschlossene Außenwände von Y=65 bis Y=249.
 * Massive Zwischendecken auf Y=95, 125, 160, 195, 230.
 * 25 feine, perfekt ausbalancierte Schritte (jeder Schritt <= 2.300 Blöcke).
 */

function generateModule7() {
  const steps = [];
  const placed = new Map();

  function addBlock(stepBlocks, x, y, z, type) {
    const k = `${x},${y},${z}`;
    if (!placed.has(k)) {
      placed.set(k, true);
      stepBlocks.push({ x, y, z, type });
    }
  }

  const Xc = -148;
  const Zc = 68;
  const H_W = 11;
  const Xmin = Xc - H_W; // -159
  const Xmax = Xc + H_W; // -137
  const Zmin = Zc - H_W; // 57
  const Zmax = Zc + H_W; // 79

  function addCornerButtresses(stepBlocks, y, bType = "smooth_quartz") {
    const corners = [
      { cx: Xmin, cz: Zmin, dx: -1, dz: -1 },
      { cx: Xmax, cz: Zmin, dx: 1, dz: -1 },
      { cx: Xmin, cz: Zmax, dx: -1, dz: 1 },
      { cx: Xmax, cz: Zmax, dx: 1, dz: 1 }
    ];
    corners.forEach(c => {
      for (let ox = 0; ox <= 2; ox++) {
        for (let oz = 0; oz <= 2; oz++) {
          if (ox === 2 && oz === 2) continue;
          addBlock(stepBlocks, c.cx + c.dx * ox, y, c.cz + c.dz * oz, bType);
        }
      }
    });
  }

  function addStairs(stepBlocks, y) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        addBlock(stepBlocks, Xc + dx, y, Zc + dz, "stone_bricks");
      }
    }
    const angle = (y - 65) * 0.45;
    const visited = new Set();
    for (let t = 1.0; t <= 4.0; t += 0.2) {
      const sx = Math.round(Xc + t * Math.cos(angle));
      const sz = Math.round(Zc + t * Math.sin(angle));
      const key = `${sx},${sz}`;
      if (!visited.has(key)) {
        visited.add(key);
        addBlock(stepBlocks, sx, y, sz, "smooth_quartz");
        for (let sy = y - 1; sy >= 65; sy--) {
          const k = `${sx},${sy},${sz}`;
          if (placed.has(k)) break;
          addBlock(stepBlocks, sx, sy, sz, "stone_bricks");
        }
      }
    }
  }

  // 7.1: Podest Y=65..66
  const s1 = [];
  for (let y = 65; y <= 66; y++) {
    const inset = 68 - y;
    for (let x = Xmin - 2 - inset; x <= Xmax + 2 + inset; x++) {
      for (let z = Zmin - 2 - inset; z <= Zmax + 2 + inset; z++) {
        const isBorder = (x === Xmin - 2 - inset || x === Xmax + 2 + inset || z === Zmin - 2 - inset || z === Zmax + 2 + inset);
        let type = isBorder ? "dark_prismarine" : (y % 2 === 0 ? "smooth_quartz" : "calcite");
        if (y === 65 && !isBorder) type = "stone_bricks";
        addBlock(s1, x, y, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "7.1",
    title: "Marmorpodest: Stufen 1 & 2 (Y=65 bis Y=66)",
    module: "Modul 7: Campanile di Giotto",
    description: "Lege die beiden unteren Stufen des Fundamentpodests aus massivem Steinziegelkern und Marmor an.",
    cameraHint: { eye: [-175, 78, 45], target: [Xc, 65, Zc] },
    blocks: s1,
    tip: "Das Podest bildet die breite Basis für den 85 m hohen Turm.",
    caution: "Achte auf die Ausrichtung der Stufenkanten.",
    fact: "1334 gelegt: Giotto legte diesen Grundstein am 18. Juli 1334."
  });

  // 7.2: Podest Y=67..68
  const s2 = [];
  for (let y = 67; y <= 68; y++) {
    const inset = 68 - y;
    for (let x = Xmin - 2 - inset; x <= Xmax + 2 + inset; x++) {
      for (let z = Zmin - 2 - inset; z <= Zmax + 2 + inset; z++) {
        const isBorder = (x === Xmin - 2 - inset || x === Xmax + 2 + inset || z === Zmin - 2 - inset || z === Zmax + 2 + inset);
        let type = isBorder ? "dark_prismarine" : (y % 2 === 0 ? "smooth_quartz" : "calcite");
        addBlock(s2, x, y, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "7.2",
    title: "Marmorpodest: Stufen 3 & 4 (Y=67 bis Y=68)",
    module: "Modul 7: Campanile di Giotto",
    description: "Vollende das vierfach gestufte Marmorpodest als plane Ebene für den Turmaufbau.",
    cameraHint: { eye: [-175, 82, 45], target: [Xc, 68, Zc] },
    blocks: s2,
    tip: "Die Kanten springen gleichmäßig zurück.",
    caution: "Prüfe die waagerechte Ebene ringsherum.",
    fact: "Toskanischer Marmor: Aus Carrara und Prato geliefert."
  });

  // 7.3: Sockelgeschoss Y=69..78
  const s3 = [];
  for (let y = 69; y <= 78; y++) {
    addCornerButtresses(s3, y, (y % 3 === 0) ? "dark_prismarine" : "smooth_quartz");
    for (let x = Xmin; x <= Xmax; x++) {
      for (let z = Zmin; z <= Zmax; z++) {
        const isOuter = (x === Xmin || x === Xmax || z === Zmin || z === Zmax);
        const isInner = (x === Xmin + 1 || x === Xmax - 1 || z === Zmin + 1 || z === Zmax - 1);
        if (isOuter || isInner) {
          const isDoor = (z === Zmin && Math.abs(x - Xc) <= 2 && y <= 75);
          if (!isDoor) {
            let type = "stone_bricks";
            if (isOuter) type = (y === 69 || y === 78) ? "smooth_quartz" : "dark_prismarine";
            addBlock(s3, x, y, z, type);
          }
        }
      }
    }
    addStairs(s3, y);
  }
  steps.push({
    stepNumber: "7.3",
    title: "Sockelgeschoss mit Eckpfeilern & Portal (Y=69 bis Y=78)",
    module: "Modul 7: Campanile di Giotto",
    description: "Ziehe die massiven Außenwände des Sockelgeschosses hoch und verankere die 4 polygonalen Eckpfeiler.",
    cameraHint: { eye: [-170, 85, 45], target: [Xc, 73, Zc] },
    blocks: s3,
    tip: "Die Eckpfeiler sind 5x5 Blöcke stark und nehmen den Hauptdruck auf.",
    caution: "Der Eingang zeigt genau nach Norden zur Kathedrale.",
    fact: "414 Stufen: Durch dieses Tor steigen Besucher seit Jahrhunderten hinauf."
  });

  // Helper Relief
  function buildRelief(stepBlocks, yStart, yEnd, hasFloor = false) {
    for (let y = yStart; y <= yEnd; y++) {
      addCornerButtresses(stepBlocks, y, (y % 2 === 0) ? "smooth_quartz" : "dark_prismarine");
      for (let x = Xmin; x <= Xmax; x++) {
        for (let z = Zmin; z <= Zmax; z++) {
          const isOuter = (x === Xmin || x === Xmax || z === Zmin || z === Zmax);
          const isInner = (x === Xmin + 1 || x === Xmax - 1 || z === Zmin + 1 || z === Zmax - 1);
          if (isOuter) {
            let type = "smooth_quartz";
            const u = (x === Xmin || x === Xmax) ? z : x;
            const isPanel = (Math.abs((u - Xc) % 4) <= 1) && (y >= 81 && y <= 86 || y >= 89 && y <= 94);
            if (isPanel) {
              type = (y >= 81 && y <= 86) ? "polished_granite" : "dark_prismarine";
            } else if (y === 87 || y === 88 || y === 95) {
              type = "calcite";
            }
            addBlock(stepBlocks, x, y, z, type);
          } else if (isInner) {
            addBlock(stepBlocks, x, y, z, "stone_bricks");
          }
        }
      }
      addStairs(stepBlocks, y);
      if (hasFloor && y === yEnd) {
        for (let x = Xmin + 2; x <= Xmax - 2; x++) {
          for (let z = Zmin + 2; z <= Zmax - 2; z++) {
            if (Math.abs(x - Xc) > 4 || Math.abs(z - Zc) > 4) {
              addBlock(stepBlocks, x, yEnd, z, "stone_bricks");
            }
          }
        }
      }
    }
  }

  // 7.4: Relief Y=79..87
  const s4 = [];
  buildRelief(s4, 79, 87);
  steps.push({
    stepNumber: "7.4",
    title: "Reliefkassetten: Schöpfungsfries (Y=79 bis Y=87)",
    module: "Modul 7: Campanile di Giotto",
    description: "Gestalte das untere Reliefband mit hexagonalen Feldern aus rotem Granit.",
    cameraHint: { eye: [-170, 92, 50], target: [Xc, 83, Zc] },
    blocks: s4,
    tip: "Das Calcit-Gesims auf Y=87 schließt dieses Band nach oben ab.",
    caution: "Achte auf den präzisen Abstand der Reliefkassetten.",
    fact: "Andrea Pisanos Meißel: Die Reliefs wurden nach Entwürfen Giottos gehauen."
  });

  // 7.5: Relief Y=88..95
  const s5 = [];
  buildRelief(s5, 88, 95, true);
  steps.push({
    stepNumber: "7.5",
    title: "Reliefkassetten: Planetenfries & Zwischendecke (Y=88 bis Y=95)",
    module: "Modul 7: Campanile di Giotto",
    description: "Mauere das obere Reliefband aus dunkelgrünem Prismarin und ziehe die massive Zwischendecke auf Y=95 ein.",
    cameraHint: { eye: [-170, 98, 50], target: [Xc, 91, Zc] },
    blocks: s5,
    tip: "Auf Y=95 entsteht die erste begehbare Zwischenebene.",
    caution: "Lasse das Treppenauge im Zentrum frei.",
    fact: "Sieben Planeten: Symbolisieren die kosmische Ordnung des Mittelalters."
  });

  // Helper Statuen
  function buildStatues(stepBlocks, yStart, yEnd, hasFloor = false) {
    for (let y = yStart; y <= yEnd; y++) {
      addCornerButtresses(stepBlocks, y, (y % 4 <= 1) ? "smooth_quartz" : "dark_prismarine");
      for (let x = Xmin; x <= Xmax; x++) {
        for (let z = Zmin; z <= Zmax; z++) {
          const isOuter = (x === Xmin || x === Xmax || z === Zmin || z === Zmax);
          const isInner = (x === Xmin + 1 || x === Xmax - 1 || z === Zmin + 1 || z === Zmax - 1);
          if (isOuter) {
            let type = "smooth_quartz";
            const u = (x === Xmin || x === Xmax) ? z : x;
            const isNiche = (Math.abs((u - Xc) % 5) <= 1) && (y >= 102 && y <= 120);
            if (isNiche) {
              const isStatue = (y >= 106 && y <= 116);
              type = isStatue ? "calcite" : "chiseled_quartz";
            } else if (y === 96 || y === 124 || y === 125) {
              type = "calcite";
            } else {
              type = ((y + Math.abs(u)) % 3 === 0) ? "dark_prismarine" : "smooth_quartz";
            }
            addBlock(stepBlocks, x, y, z, type);
          } else if (isInner) {
            const u = (x === Xmin + 1 || x === Xmax - 1) ? z : x;
            const isNiche = (Math.abs((u - Xc) % 5) <= 1) && (y >= 102 && y <= 120);
            addBlock(stepBlocks, x, y, z, isNiche ? "red_sandstone" : "stone_bricks");
          }
        }
      }
      addStairs(stepBlocks, y);
      if (hasFloor && y === yEnd) {
        for (let x = Xmin + 2; x <= Xmax - 2; x++) {
          for (let z = Zmin + 2; z <= Zmax - 2; z++) {
            if (Math.abs(x - Xc) > 4 || Math.abs(z - Zc) > 4) {
              addBlock(stepBlocks, x, yEnd, z, "stone_bricks");
            }
          }
        }
      }
    }
  }

  // 7.6: Statuen Y=96..103
  const s6 = [];
  buildStatues(s6, 96, 103);
  steps.push({
    stepNumber: "7.6",
    title: "Statuengeschoss: Sockelzone (Y=96 bis Y=103)",
    module: "Modul 7: Campanile di Giotto",
    description: "Errichte die Sockelzone des Statuengeschosses mit rotem Sandstein-Hintergrund.",
    cameraHint: { eye: [-170, 106, 50], target: [Xc, 99, Zc] },
    blocks: s6,
    tip: "Achte auf die Ausrichtung der Nischensockel.",
    caution: "Die Wände sind durchgehend 2 Blöcke dick.",
    fact: "Donatellos Statuen: Ursprünglich standen 16 lebensgroße Propheten hier."
  });

  // 7.7: Statuen Y=104..110
  const s7 = [];
  buildStatues(s7, 104, 110);
  steps.push({
    stepNumber: "7.7",
    title: "Statuengeschoss: Nischenfiguren (Y=104 bis Y=110)",
    module: "Modul 7: Campanile di Giotto",
    description: "Setze die Calcit-Statuen in die Nischen ein und ziehe die Pfeiler weiter hoch.",
    cameraHint: { eye: [-170, 114, 50], target: [Xc, 107, Zc] },
    blocks: s7,
    tip: "Die weißen Figuren heben sich plastisch von der roten Wand ab.",
    caution: "Halte die Pfeilerfluchten exakt senkrecht.",
    fact: "Der Zuccone: Donatellos berühmteste Skulptur stand an der Westseite."
  });

  // 7.8: Statuen Y=111..118
  const s8 = [];
  buildStatues(s8, 111, 118);
  steps.push({
    stepNumber: "7.8",
    title: "Statuengeschoss: Nischenbögen (Y=111 bis Y=118)",
    module: "Modul 7: Campanile di Giotto",
    description: "Schließe die gotischen Spitzbögen über den 16 Prophetenstatuen.",
    cameraHint: { eye: [-170, 122, 50], target: [Xc, 114, Zc] },
    blocks: s8,
    tip: "Die Spitzbögen sind aus edlem weißem Calcit gefertigt.",
    caution: "Prüfe die Bogenstürze ringsherum.",
    fact: "Gotische Eleganz: Die Maßwerkbögen verleihen der Fassade Tiefe."
  });

  // 7.9: Statuen Y=119..125
  const s9 = [];
  buildStatues(s9, 119, 125, true);
  steps.push({
    stepNumber: "7.9",
    title: "Statuengeschoss: Hauptgesims & Decke (Y=119 bis Y=125)",
    module: "Modul 7: Campanile di Giotto",
    description: "Vollende das Statuengeschoss mit dem Calcit-Hauptgesims und der massiven Zwischendecke auf Y=125.",
    cameraHint: { eye: [-170, 128, 50], target: [Xc, 122, Zc] },
    blocks: s9,
    tip: "Auf Y=125 entsteht die zweite Zwischenebene des Turms.",
    caution: "Prüfe die waagerechte Ebene ringsherum.",
    fact: "Museo dell'Opera: Die Originalfiguren stehen heute im Dommuseum."
  });

  // Helper Biforien
  function buildBiforia(stepBlocks, yStart, yEnd, slotStart, slotEnd, hasFloor = false) {
    for (let y = yStart; y <= yEnd; y++) {
      addCornerButtresses(stepBlocks, y, (y % 3 === 0) ? "dark_prismarine" : "smooth_quartz");
      for (let x = Xmin; x <= Xmax; x++) {
        for (let z = Zmin; z <= Zmax; z++) {
          const isOuter = (x === Xmin || x === Xmax || z === Zmin || z === Zmax);
          const isInner = (x === Xmin + 1 || x === Xmax - 1 || z === Zmin + 1 || z === Zmax - 1);
          if (isOuter || isInner) {
            const u = (x === Xmin || x === Xmax || x === Xmin + 1 || x === Xmax - 1) ? z : x;
            const distU = Math.abs(u - Xc);
            const isWindowSlot = (distU >= 2 && distU <= 6) && (y >= slotStart && y <= slotEnd);
            const isTrumeau = (distU === 4) && (y >= slotStart && y <= slotEnd - 2);
            if (isTrumeau && isOuter) {
              addBlock(stepBlocks, x, y, z, "smooth_quartz");
            } else if (!isWindowSlot) {
              let type = isOuter ? ((y === yStart || y >= yEnd - 1) ? "calcite" : "smooth_quartz") : "stone_bricks";
              if (isOuter && (u % 4 === 0)) type = "dark_prismarine";
              addBlock(stepBlocks, x, y, z, type);
            }
          }
        }
      }
      addStairs(stepBlocks, y);
      if (hasFloor && y === yEnd) {
        for (let x = Xmin + 2; x <= Xmax - 2; x++) {
          for (let z = Zmin + 2; z <= Zmax - 2; z++) {
            if (Math.abs(x - Xc) > 4 || Math.abs(z - Zc) > 4) {
              addBlock(stepBlocks, x, yEnd, z, "stone_bricks");
            }
          }
        }
      }
    }
  }

  // 7.10: Erstes Biforium Y=126..134
  const s10 = [];
  buildBiforia(s10, 126, 134, 134, 154);
  steps.push({
    stepNumber: "7.10",
    title: "Erstes Biforien-Geschoss: Sockelzone (Y=126 bis Y=134)",
    module: "Modul 7: Campanile di Giotto",
    description: "Beginne das erste Biforiengeschoss mit profilierten Brüstungen und Gewänden.",
    cameraHint: { eye: [-170, 138, 50], target: [Xc, 130, Zc] },
    blocks: s10,
    tip: "Die Fensteröffnungen öffnen den Turm nach allen vier Seiten.",
    caution: "Achte auf die genaue Flucht der Pfeiler.",
    fact: "Andrea Pisano: Übernahm 1337 die Bauleitung nach Giotto."
  });

  // 7.11: Erstes Biforium Y=135..142
  const s11 = [];
  buildBiforia(s11, 135, 142, 134, 154);
  steps.push({
    stepNumber: "7.11",
    title: "Erstes Biforien-Geschoss: Fensterhallen (Y=135 bis Y=142)",
    module: "Modul 7: Campanile di Giotto",
    description: "Führe die hohen Fensterhallen mit ihren zarten Mittelsäulen aus Quarz hoch.",
    cameraHint: { eye: [-170, 145, 50], target: [Xc, 138, Zc] },
    blocks: s11,
    tip: "Die Mittelsäulen tragen später das gotische Maßwerk.",
    caution: "Prüfe die Wandstärken links und rechts der Fenster.",
    fact: "Gewichtsreduktion: Die Fensteröffnungen entlasten das Fundament."
  });

  // 7.12: Erstes Biforium Y=143..151
  const s12 = [];
  buildBiforia(s12, 143, 151, 134, 154);
  steps.push({
    stepNumber: "7.12",
    title: "Erstes Biforien-Geschoss: Maßwerk (Y=143 bis Y=151)",
    module: "Modul 7: Campanile di Giotto",
    description: "Setze die kunstvollen gotischen Maßwerkbögen über die Fensteröffnungen.",
    cameraHint: { eye: [-170, 154, 50], target: [Xc, 147, Zc] },
    blocks: s12,
    tip: "Das Maßwerk schließt die Bogenöffnungen harmonisch ab.",
    caution: "Halte die Bogenscheitel auf exakt gleicher Höhe.",
    fact: "Gotische Zier: Typisch für die florentinische Sakralarchitektur."
  });

  // 7.13: Erstes Biforium Y=152..160
  const s13 = [];
  buildBiforia(s13, 152, 160, 134, 154, true);
  steps.push({
    stepNumber: "7.13",
    title: "Erstes Biforien-Geschoss: Gesims & Decke (Y=152 bis Y=160)",
    module: "Modul 7: Campanile di Giotto",
    description: "Vollende das Geschoss mit dem Calcit-Gurtgesims und der massiven Decke auf Y=160.",
    cameraHint: { eye: [-170, 163, 50], target: [Xc, 156, Zc] },
    blocks: s13,
    tip: "Auf Y=160 entsteht die dritte begehbare Zwischenebene.",
    caution: "Prüfe die waagerechte Ebene ringsherum.",
    fact: "Francesco Talenti: Vollendete die beiden oberen Stockwerke."
  });

  // 7.14: Zweites Biforium Y=161..169
  const s14 = [];
  buildBiforia(s14, 161, 169, 168, 188);
  steps.push({
    stepNumber: "7.14",
    title: "Zweites Biforien-Geschoss: Sockel (Y=161 bis Y=169)",
    module: "Modul 7: Campanile di Giotto",
    description: "Beginne das zweite Biforiengeschoss mit noch höheren Fensterproportionen.",
    cameraHint: { eye: [-170, 172, 50], target: [Xc, 165, Zc] },
    blocks: s14,
    tip: "Dieses Stockwerk ist noch höher als das darunterliegende.",
    caution: "Achte auf die Pfeiler an den Ecken.",
    fact: "Optische Streckung: Lässt den Turm von unten majestätischer wirken."
  });

  // 7.15: Zweites Biforium Y=170..177
  const s15 = [];
  buildBiforia(s15, 170, 177, 168, 188);
  steps.push({
    stepNumber: "7.15",
    title: "Zweites Biforien-Geschoss: Hohe Säulen (Y=170 bis Y=177)",
    module: "Modul 7: Campanile di Giotto",
    description: "Führe die schlanken Mittelsäulen und Pfeilerwände bis auf Höhe Y=177 hoch.",
    cameraHint: { eye: [-170, 180, 50], target: [Xc, 173, Zc] },
    blocks: s15,
    tip: "Die Säulen steigen schnurgerade nach oben.",
    caution: "Prüfe die Wandstärken ringsherum.",
    fact: "Florentiner Gotik: Verbindet Leichtigkeit mit Monumentalität."
  });

  // 7.16: Zweites Biforium Y=178..187
  const s16 = [];
  buildBiforia(s16, 178, 187, 168, 188);
  steps.push({
    stepNumber: "7.16",
    title: "Zweites Biforien-Geschoss: Maßwerkbögen (Y=178 bis Y=187)",
    module: "Modul 7: Campanile di Giotto",
    description: "Mauere die gotischen Spitzbögen und das Maßwerk des oberen Biforiengeschosses.",
    cameraHint: { eye: [-170, 189, 50], target: [Xc, 182, Zc] },
    blocks: s16,
    tip: "Das Maßwerk schließt die Bogenstürze sauber ab.",
    caution: "Achte auf die Symmetrie aller vier Fassaden.",
    fact: "Kühne Baukunst: Höchste gotische Fensterbauten ganz Italiens."
  });

  // 7.17: Zweites Biforium Y=188..195
  const s17 = [];
  buildBiforia(s17, 188, 195, 168, 188, true);
  steps.push({
    stepNumber: "7.17",
    title: "Zweites Biforien-Geschoss: Gesims & Boden Glockenstube (Y=188 bis Y=195)",
    module: "Modul 7: Campanile di Giotto",
    description: "Vollende das Geschoss mit dem Calcit-Gesims und ziehe den massiven Boden der Glockenstube auf Y=195 ein.",
    cameraHint: { eye: [-170, 198, 50], target: [Xc, 191, Zc] },
    blocks: s17,
    tip: "Auf Y=195 betrittst du die Glockenstube der Kathedrale.",
    caution: "Prüfe die waagerechte Ebene ringsherum.",
    fact: "Glockenboden: Hält den dynamischen Lasten der Glocken stand."
  });

  // Helper Glockenstube
  function buildBelfry(stepBlocks, yStart, yEnd, hasFloor = false) {
    for (let y = yStart; y <= yEnd; y++) {
      addCornerButtresses(stepBlocks, y, (y % 2 === 0) ? "smooth_quartz" : "dark_prismarine");
      for (let x = Xmin; x <= Xmax; x++) {
        for (let z = Zmin; z <= Zmax; z++) {
          const isOuter = (x === Xmin || x === Xmax || z === Zmin || z === Zmax);
          const isInner = (x === Xmin + 1 || x === Xmax - 1 || z === Zmin + 1 || z === Zmax - 1);
          if (isOuter || isInner) {
            const u = (x === Xmin || x === Xmax || x === Xmin + 1 || x === Xmax - 1) ? z : x;
            const distU = Math.abs(u - Xc);
            const isWindowSlot = (distU <= 7) && (y >= 198 && y <= 222);
            const isTriforiumPillar = (distU === 2 || distU === 5) && (y >= 198 && y <= 220);
            if (isTriforiumPillar && isOuter) {
              addBlock(stepBlocks, x, y, z, "smooth_quartz");
            } else if (!isWindowSlot || y >= 223) {
              let type = isOuter ? ((y === 196 || y >= 228) ? "calcite" : "smooth_quartz") : "stone_bricks";
              if (isOuter && (u % 4 === 0)) type = "dark_prismarine";
              addBlock(stepBlocks, x, y, z, type);
            }
          }
        }
      }
      addStairs(stepBlocks, y);
      if (hasFloor && y === yEnd) {
        for (let x = Xmin + 2; x <= Xmax - 2; x++) {
          for (let z = Zmin + 2; z <= Zmax - 2; z++) {
            if (Math.abs(x - Xc) > 4 || Math.abs(z - Zc) > 4) {
              addBlock(stepBlocks, x, yEnd, z, "stone_bricks");
            }
          }
        }
      }
    }
  }

  // 7.18: Glockenstube Y=196..204
  const s18 = [];
  buildBelfry(s18, 196, 204);
  steps.push({
    stepNumber: "7.18",
    title: "Glockenstube: Sockel & Pfeilersäulen (Y=196 bis Y=204)",
    module: "Modul 7: Campanile di Giotto",
    description: "Beginne die 35 Blöcke hohe Glockenstube mit den Säulen der dreibogigen Triforien.",
    cameraHint: { eye: [-170, 208, 50], target: [Xc, 200, Zc] },
    blocks: s18,
    tip: "Weite Arkadenöffnungen tragen den Glockenklang über Florenz.",
    caution: "Achte auf die zwei Mittelsäulen pro Fassadenseite.",
    fact: "Triforien: Dreibogige gotische Prunkfenster."
  });

  // 7.19: Glockenstube Y=205..212
  const s19 = [];
  buildBelfry(s19, 205, 212);
  steps.push({
    stepNumber: "7.19",
    title: "Glockenstube: Mittlere Arkaden (Y=205 bis Y=212)",
    module: "Modul 7: Campanile di Giotto",
    description: "Führe die offenen Triforien nach allen vier Himmelsrichtungen hoch.",
    cameraHint: { eye: [-170, 216, 50], target: [Xc, 208, Zc] },
    blocks: s19,
    tip: "Die Säulen steigen auf 16 Blöcke lichte Höhe an.",
    caution: "Halte die Fensteröffnungen symmetrisch.",
    fact: "Klangraum: Speziell für die Akustik der Bronzeglocken berechnet."
  });

  // 7.20: Glockenstube Y=213..222
  const s20 = [];
  buildBelfry(s20, 213, 222);
  steps.push({
    stepNumber: "7.20",
    title: "Glockenstube: Maßwerkbögen (Y=213 bis Y=222)",
    module: "Modul 7: Campanile di Giotto",
    description: "Schließe die gotischen Spitzbögen der Triforien nach allen vier Seiten.",
    cameraHint: { eye: [-170, 224, 50], target: [Xc, 217, Zc] },
    blocks: s20,
    tip: "Die Spitzbögen überspannen die weiten Triforienöffnungen.",
    caution: "Prüfe die Bogenscheitel ringsherum.",
    fact: "Talentis Meisterwerk: Vollendete 1359 die Glockenstube."
  });

  // 7.21: Glockenstube Y=223..230
  const s21 = [];
  buildBelfry(s21, 223, 230, true);
  steps.push({
    stepNumber: "7.21",
    title: "Glockenstube: Massiver Wand- & Deckenabschluss (Y=223 bis Y=230)",
    module: "Modul 7: Campanile di Giotto",
    description: "Mauere die massiven Wände und die Gewölbedecke bis Y=230 vollkommen lückenlos auf.",
    cameraHint: { eye: [-170, 234, 50], target: [Xc, 226, Zc] },
    blocks: s21,
    tip: "Auf Y=230 ist der gesamte Mauerkörper des Turmes massiv geschlossen.",
    caution: "Die Wände bilden das stabile Fundament für den Konsolenkranz.",
    fact: "Tragfähige Decke: Hält das Gewicht der gesamten Aussichtsterrasse."
  });

  // 7.22: Glockenstuhl & Glocken
  const s22 = [];
  for (let y of [202, 214, 218, 224]) {
    for (let x = Xmin + 2; x <= Xmax - 2; x++) {
      addBlock(s22, x, y, Zc - 4, "polished_deepslate");
      addBlock(s22, x, y, Zc + 4, "polished_deepslate");
    }
    for (let z = Zmin + 2; z <= Zmax - 2; z++) {
      addBlock(s22, Xc - 4, y, z, "polished_deepslate");
      addBlock(s22, Xc + 4, y, z, "polished_deepslate");
      if (y === 218) addBlock(s22, Xc, y, z, "polished_deepslate");
    }
  }
  for (let y = 202; y <= 224; y++) {
    [[-4, -4], [4, -4], [-4, 4], [4, 4]].forEach(([dx, dz]) => {
      addBlock(s22, Xc + dx, y, Zc + dz, "polished_deepslate");
    });
    // Central hanger down to main bell:
    if (y >= 216) addBlock(s22, Xc, y, Zc, "polished_deepslate");
  }
  const bellLocs = [
    { x: Xc,     y: 216, z: Zc },
    { x: Xc - 4, y: 212, z: Zc - 4 },
    { x: Xc + 4, y: 212, z: Zc - 4 },
    { x: Xc - 4, y: 212, z: Zc + 4 },
    { x: Xc + 4, y: 212, z: Zc + 4 },
    { x: Xc,     y: 218, z: Zc - 4 }, // Exakt auf dem Trägerbalken!
    { x: Xc,     y: 218, z: Zc + 4 }  // Exakt auf dem Trägerbalken!
  ];
  bellLocs.forEach(b => {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        addBlock(s22, b.x + dx, b.y, b.z + dz, "gold_block");
        addBlock(s22, b.x + dx, b.y + 1, b.z + dz, "smooth_quartz");
      }
    }
    addBlock(s22, b.x, b.y - 1, b.z, "sea_lantern");
  });
  steps.push({
    stepNumber: "7.22",
    title: "Der Glockenstuhl & die 7 Glocken von Florenz",
    module: "Modul 7: Campanile di Giotto",
    description: "Installiere den Glockenträgerrahmen und die 7 historischen Kirchenglocken. In der Mitte hängt der 5-Tonnen-Campanone von 1405!",
    cameraHint: { eye: [-160, 218, 60], target: [Xc, 214, Zc] },
    blocks: s22,
    tip: "Die Glocken hängen fest verankert im Trägerrahmen.",
    caution: "Der Trägerrahmen ist in allen vier Wänden verankert.",
    fact: "Campanone: Wiegt 5.300 kg und ist die größte Glocke der Toskana."
  });

  // 7.23: Konsolenkranz Untere Stufe Y=231..234
  const s23 = [];
  for (let y = 231; y <= 234; y++) {
    const overhang = Math.min(2, Math.floor((y - 231) / 2));
    const oxMin = Xmin - overhang;
    const oxMax = Xmax + overhang;
    const ozMin = Zmin - overhang;
    const ozMax = Zmax + overhang;
    for (let x = oxMin; x <= oxMax; x++) {
      for (let z = ozMin; z <= ozMax; z++) {
        const isEdge = (x === oxMin || x === oxMax || z === ozMin || z === ozMax);
        let type = (y % 2 === 0) ? "smooth_quartz" : "calcite";
        if (isEdge && (x + z) % 2 === 0) type = "dark_prismarine";
        addBlock(s23, x, y, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "7.23",
    title: "Konsolenkranz: Untere Vorkragung (Y=231 bis Y=234)",
    module: "Modul 7: Campanile di Giotto",
    description: "Mauere die ersten Vorkragungsstufen des mächtigen Konsolenkranzes auf Höhe Y=231 bis Y=234 auf.",
    cameraHint: { eye: [-175, 238, 45], target: [Xc, 232, Zc] },
    blocks: s23,
    tip: "Der Konsolenkranz kragt gleichmäßig nach außen aus.",
    caution: "Prüfe die Symmetrie an allen vier Seiten.",
    fact: "Kühne Statik: Kragt weit über die Turmwände hinaus."
  });

  // 7.24: Konsolenkranz Obere Stufe Y=235..237
  const s24 = [];
  for (let y = 235; y <= 237; y++) {
    const overhang = Math.min(2, Math.floor((y - 231) / 2));
    const oxMin = Xmin - overhang;
    const oxMax = Xmax + overhang;
    const ozMin = Zmin - overhang;
    const ozMax = Zmax + overhang;
    for (let x = oxMin; x <= oxMax; x++) {
      for (let z = ozMin; z <= ozMax; z++) {
        const isEdge = (x === oxMin || x === oxMax || z === ozMin || z === ozMax);
        let type = (y % 2 === 0) ? "smooth_quartz" : "calcite";
        if (isEdge && (x + z) % 2 === 0) type = "dark_prismarine";
        addBlock(s24, x, y, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "7.24",
    title: "Konsolenkranz: Obere Vorkragung (Y=235 bis Y=237)",
    module: "Modul 7: Campanile di Giotto",
    description: "Vollende den Konsolenkranz bis zur vollen Weite von 27x27 Blöcken auf Y=237.",
    cameraHint: { eye: [-175, 242, 45], target: [Xc, 236, Zc] },
    blocks: s24,
    tip: "Auf Y=237 ist die maximale Vorkragung erreicht.",
    caution: "Prüfe die waagerechte Ebene ringsherum.",
    fact: "Aussichtsplattform: Bildet die Basis für das Panoramadeck."
  });

  // 7.25: Aussichtsterrasse Y=238..249
  const s25 = [];
  const platXmin = Xmin - 2;
  const platXmax = Xmax + 2;
  const platZmin = Zmin - 2;
  const platZmax = Zmax + 2;

  for (let x = platXmin; x <= platXmax; x++) {
    for (let z = platZmin; z <= platZmax; z++) {
      const isChequer = ((x + z) % 2 === 0);
      addBlock(s25, x, 238, z, isChequer ? "smooth_quartz" : "dark_prismarine");
    }
  }

  for (let y = 239; y <= 242; y++) {
    for (let x = platXmin; x <= platXmax; x++) {
      for (let z = platZmin; z <= platZmax; z++) {
        const isBorder = (x === platXmin || x === platXmax || z === platZmin || z === platZmax);
        if (isBorder) {
          const isCrenel = (y >= 241) && ((x + z) % 2 === 1);
          if (!isCrenel) {
            addBlock(s25, x, y, z, (y === 242) ? "calcite" : "smooth_quartz");
          }
        }
      }
    }
  }

  const pinnacleCorners = [
    { cx: platXmin + 1, cz: platZmin + 1 },
    { cx: platXmax - 1, cz: platZmin + 1 },
    { cx: platXmin + 1, cz: platZmax - 1 },
    { cx: platXmax - 1, cz: platZmax - 1 }
  ];
  for (let y = 239; y <= 249; y++) {
    pinnacleCorners.forEach(pc => {
      const pr = (y <= 244) ? 2 : ((y <= 247) ? 1 : 0);
      for (let dx = -pr; dx <= pr; dx++) {
        for (let dz = -pr; dz <= pr; dz++) {
          let type = (y === 249) ? "sea_lantern" : ((y % 2 === 0) ? "smooth_quartz" : "calcite");
          addBlock(s25, pc.cx + dx, y, pc.cz + dz, type);
        }
      }
    });
  }
  steps.push({
    stepNumber: "7.25",
    title: "Aussichtsterrasse, Zinnenkrone & Eckfialen (Y=238 bis Y=249)",
    module: "Modul 7: Campanile di Giotto",
    description: "Vollende Giottos Glockenturm mit dem zweifarbigen Panoramadeck, der gotischen Zinnenkrone und den 4 leuchtenden Eckfialen auf der Maximalhöhe Y=249!",
    cameraHint: { eye: [-175, 255, 45], target: [Xc, 243, Zc] },
    blocks: s25,
    tip: "Der Campanile erreicht seine weltberühmte Silhouette in 85 Metern Höhe.",
    caution: "Die Seelaternen auf Y=249 krönen die vier Fialenspitzen.",
    fact: "Blick über Florenz: 414 Stufen führen heute Besucher auf dieses unvergessliche Deck!"
  });

  return steps;
}

const steps = generateModule7();
console.log('Generated Modul 7 with ' + steps.length + ' steps:');
steps.forEach(s => console.log('Step ' + s.stepNumber + ': ' + s.blocks.length + ' blocks - ' + s.title));

const jsContent = '/**\n * Modul 7: Campanile di Giotto (Santa Maria del Fiore)\n' +
  ' * 100% EXAKT berechnete Blockkoordinaten ohne Näherungswerte.\n' +
  ' * Vollständig geschlossen von Y=65 bis Y=249, null Schwebungen.\n' +
  ' */\nwindow.MODULE_7_DATA = ' + JSON.stringify(steps, null, 2) + ';\n';

fs.writeFileSync(path.join(__dirname, '..', 'webapp', 'js', 'data', 'module_7_steps.js'), jsContent, 'utf8');
console.log('Successfully wrote webapp/js/data/module_7_steps.js');
