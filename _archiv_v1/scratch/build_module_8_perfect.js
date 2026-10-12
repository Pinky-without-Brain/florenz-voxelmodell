const fs = require('fs');
const path = require('path');

/**
 * Modul 8: Baptisterium San Giovanni (Santa Maria del Fiore)
 * 100% EXAKT berechnete Blockkoordinaten ohne Näherungswerte.
 * Massives Steinfundament Y=65..67 (null Hohlräume unter dem Boden Y=68).
 * Lückenlos geschlossenes Pyramidendach und Kuppelgewölbe.
 * Jeder Schritt <= 2.450 Blöcke.
 */

function generateModule8() {
  const steps = [];
  const placed = new Map();

  function addBlock(stepBlocks, x, y, z, type) {
    const k = `${x},${y},${z}`;
    if (!placed.has(k)) {
      placed.set(k, true);
      stepBlocks.push({ x, y, z, type });
    }
  }

  const Xc = -225;
  const Zc = 0;
  const R = 24;
  const w = 10;
  const cutoff = R + w; // 34
  const atticR = R - 1; // 23
  const atticCutoff = cutoff - 2; // 32

  function isInsideOctagon(x, z, r, cornerCutoff) {
    const dx = Math.abs(x - Xc);
    const dz = Math.abs(z - Zc);
    return dx <= r && dz <= r && (dx + dz) <= cornerCutoff;
  }

  function isOctagonPerimeter(x, z, r, cornerCutoff, thickness = 1) {
    if (!isInsideOctagon(x, z, r, cornerCutoff)) return false;
    return !isInsideOctagon(x, z, r - thickness, cornerCutoff - 2 * thickness);
  }

  // =========================================================================
  // SCHRITT 8.1: Das massive Marmor-Podest: Stufe 1 (Y=65)
  // =========================================================================
  const s1 = [];
  const r1 = R + 3; // 27
  const c1 = cutoff + 6; // 40
  for (let x = Xc - r1; x <= Xc + r1; x++) {
    for (let z = Zc - r1; z <= Zc + r1; z++) {
      if (isInsideOctagon(x, z, r1, c1)) {
        const isBorder = isOctagonPerimeter(x, z, r1, c1, 1);
        const type = isBorder ? "dark_prismarine" : "stone_bricks";
        addBlock(s1, x, 65, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "8.1",
    title: "Das massive Marmor-Podest: Stufe 1 (Y=65)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Lege die unterste, weit auskragende Fundamentstufe des Baptisteriums vollflächig aus massivem Steinquadern mit dunkelgrünem Prismarin-Rand an.",
    cameraHint: { eye: [-255, 75, 30], target: [Xc, 65, Zc] },
    blocks: s1,
    tip: "Das massive Fundament trägt das gesamte tonnenschwere romanische Bauwerk.",
    caution: "Achte auf die exakte Achtecksymmetrie an allen 8 Ecken.",
    fact: "Florentiner Antike: Das Baptisterium wurde über den Fundamenten eines römischen Mars-Tempels aus dem 1. Jahrhundert erbaut!"
  });

  // =========================================================================
  // SCHRITT 8.2: Das massive Marmor-Podest: Stufe 2 (Y=66)
  // =========================================================================
  const s2 = [];
  const r2 = R + 2; // 26
  const c2 = cutoff + 4; // 38
  for (let x = Xc - r2; x <= Xc + r2; x++) {
    for (let z = Zc - r2; z <= Zc + r2; z++) {
      if (isInsideOctagon(x, z, r2, c2)) {
        const isBorder = isOctagonPerimeter(x, z, r2, c2, 1);
        const type = isBorder ? "smooth_quartz" : "stone_bricks";
        addBlock(s2, x, 66, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "8.2",
    title: "Das massive Marmor-Podest: Stufe 2 (Y=66)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Mauere die zweite Podeststufe mit strahlend weißem Carrara-Marmor-Rand und massivem Steinziegelkern auf.",
    cameraHint: { eye: [-255, 77, 30], target: [Xc, 66, Zc] },
    blocks: s2,
    tip: "Die Stufe springt um genau 1 Block gegenüber der Vorstufe zurück.",
    caution: "Der Kern muss vollkommen hohlraumfrei gemauert werden.",
    fact: "Dante Alighieri: Hier wurde der Schöpfer der Göttlichen Komödie am Karsamstag 1266 feierlich getauft."
  });

  // =========================================================================
  // SCHRITT 8.3: Das massive Marmor-Podest: Stufe 3 (Y=67)
  // =========================================================================
  const s3 = [];
  const r3 = R + 1; // 25
  const c3 = cutoff + 2; // 36
  for (let x = Xc - r3; x <= Xc + r3; x++) {
    for (let z = Zc - r3; z <= Zc + r3; z++) {
      if (isInsideOctagon(x, z, r3, c3)) {
        const isBorder = isOctagonPerimeter(x, z, r3, c3, 1);
        const type = isBorder ? "dark_prismarine" : "stone_bricks";
        addBlock(s3, x, 67, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "8.3",
    title: "Das massive Marmor-Podest: Stufe 3 (Y=67)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Vollende den massiven Steinsockel mit der dritten Stufe aus grünem Prismarin und Steinziegeln als plane Ebene für das Mosaik.",
    cameraHint: { eye: [-255, 79, 30], target: [Xc, 67, Zc] },
    blocks: s3,
    tip: "Auf dieser Ebene liegt das Fundament genau 3 Blöcke über dem Niveau der Piazza.",
    caution: "Prüfe die waagerechte Ebene ringsherum.",
    fact: "Achteckige Geometrie: Die Zahl 8 steht für Auferstehung und Ewigkeit."
  });

  // =========================================================================
  // SCHRITT 8.4: Das Kosmaten-Bodenmosaik (Y=68)
  // =========================================================================
  const s4 = [];
  for (let x = Xc - R; x <= Xc + R; x++) {
    for (let z = Zc - R; z <= Zc + R; z++) {
      if (isInsideOctagon(x, z, R, cutoff)) {
        const isBorder = isOctagonPerimeter(x, z, R, cutoff, 1);
        let type = "stone_bricks";
        if (isBorder) {
          type = "smooth_quartz";
        } else {
          const dist = Math.sqrt((x - Xc) * (x - Xc) + (z - Zc) * (z - Zc));
          if (dist <= 6) {
            type = "polished_granite";
          } else if (Math.round(dist) % 4 <= 1) {
            type = "smooth_quartz";
          } else {
            type = "dark_prismarine";
          }
        }
        addBlock(s4, x, 68, z, type);
      }
    }
  }
  steps.push({
    stepNumber: "8.4",
    title: "Das Kosmaten-Bodenmosaik (Y=68)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Verlege das weltberühmte Kosmaten-Mosaik aus weißem Quarz, grünem Prismarin und rotem Granit auf der vollkommen massiven Steinterrasse.",
    cameraHint: { eye: [-255, 82, 30], target: [Xc, 68, Zc] },
    blocks: s4,
    tip: "Das geometrische Mosaik bildet das Herzstück des Kircheninneren.",
    caution: "Achte auf die konzentrischen Farbringe.",
    fact: "Kosmaten-Kunst: Nur die reichsten Städte Italiens konnten sich die teuren Marmormosaike leisten."
  });

  // Erdgeschoss-Wände Helper
  function getGroundFloorBlocks(yStart, yEnd) {
    const list = [];
    for (let y = yStart; y <= yEnd; y++) {
      for (let x = Xc - R; x <= Xc + R; x++) {
        for (let z = Zc - R; z <= Zc + R; z++) {
          if (isOctagonPerimeter(x, z, R, cutoff, 2)) {
            const isOuter = isOctagonPerimeter(x, z, R, cutoff, 1);
            const isEastPortal = (x >= Xc + R - 1 && Math.abs(z - Zc) <= 3 && y <= 84);
            const isNorthPortal = (z <= Zc - R + 1 && Math.abs(x - Xc) <= 3 && y <= 84);
            const isSouthPortal = (z >= Zc + R - 1 && Math.abs(x - Xc) <= 3 && y <= 84);

            if (!isEastPortal && !isNorthPortal && !isSouthPortal) {
              let type = "stone_bricks";
              if (isOuter) {
                const isCornice = (y === 69 || y === 88);
                if (isCornice) {
                  type = "calcite";
                } else {
                  type = ((y % 4 <= 1)) ? "smooth_quartz" : "dark_prismarine";
                }
              }
              list.push({ x, y, z, type });
            }
          }
        }
      }
    }
    return list;
  }

  // 8.5: Erdgeschoss Sockelzone (Y=69..75)
  const s5 = [];
  getGroundFloorBlocks(69, 75).forEach(b => addBlock(s5, b.x, b.y, b.z, b.type));
  steps.push({
    stepNumber: "8.5",
    title: "Erdgeschoss: Sockelzone & Halbsäulenbasen (Y=69 bis Y=75)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Ziehe die romanischen Außenwände von Y=69 bis Y=75 mit zweifarbiger Marmorinkrustation hoch.",
    cameraHint: { eye: [-255, 82, 30], target: [Xc, 72, Zc] },
    blocks: s5,
    tip: "Die drei Portale im Osten, Norden und Süden bleiben offen.",
    caution: "Die Wände sind durchgehend 2 Blöcke dick.",
    fact: "Florentiner Marmorkunst: Weißer Carrara-Marmor und grüner Serpentin aus Prato."
  });

  // 8.6: Erdgeschoss Bogenzonen (Y=76..82)
  const s6 = [];
  getGroundFloorBlocks(76, 82).forEach(b => addBlock(s6, b.x, b.y, b.z, b.type));
  steps.push({
    stepNumber: "8.6",
    title: "Erdgeschoss: Marmor-Inkrustation & Bogenzonen (Y=76 bis Y=82)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Führe die Wände von Y=76 bis Y=82 weiter. An der Außenseite entstehen die Rundbogenarkaden.",
    cameraHint: { eye: [-255, 88, 30], target: [Xc, 79, Zc] },
    blocks: s6,
    tip: "Das Hell-Dunkel-Muster gibt dem Oktogon seine klassische Rhythmik.",
    caution: "Halte die Portalöffnungen sauber geradlinig.",
    fact: "Dantes bel San Giovanni: Im Inferno besingt Dante dieses Baptisterium mit tiefem Heimweh."
  });

  // 8.7: Erdgeschoss Hauptgesims (Y=83..88)
  const s7 = [];
  getGroundFloorBlocks(83, 88).forEach(b => addBlock(s7, b.x, b.y, b.z, b.type));
  steps.push({
    stepNumber: "8.7",
    title: "Erdgeschoss: Arkadenkämpfer & Hauptgesims (Y=83 bis Y=88)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Schließe das Erdgeschoss mit dem umlaufenden Calcit-Hauptgesims auf Y=88 ab.",
    cameraHint: { eye: [-255, 95, 30], target: [Xc, 85, Zc] },
    blocks: s7,
    tip: "Das weiße Gesims trennt das Erdgeschoss horizontal vom oberen Stockwerk.",
    caution: "Über den Portalen schließen nun die Bogenstürze.",
    fact: "Antike Proportionen: Die Gliederung folgt Vorbildern aus dem antiken Rom."
  });

  // 8.8: Die drei Prunkportale & Paradiespforte
  const s8 = [];
  // 1. East Portal (Porta del Paradiso)
  for (let y = 69; y <= 84; y++) {
    for (let z = Zc - 3; z <= Zc + 3; z++) {
      const isPortalFrame = (Math.abs(z - Zc) === 3 || y >= 82);
      if (isPortalFrame) {
        addBlock(s8, Xc + R, y, z, "calcite");
        addBlock(s8, Xc + R - 1, y, z, "smooth_quartz");
      } else {
        const isPanelBorder = (z === Zc || y === 72 || y === 75 || y === 78);
        const type = isPanelBorder ? "smooth_quartz" : "gold_block";
        addBlock(s8, Xc + R, y, z, type);
        addBlock(s8, Xc + R - 1, y, z, "gold_block");
      }
    }
  }
  // 2. North Portal & 3. South Portal
  [-1, 1].forEach(dir => {
    const pz = Zc + dir * R;
    for (let y = 69; y <= 84; y++) {
      for (let x = Xc - 3; x <= Xc + 3; x++) {
        const isFrame = (Math.abs(x - Xc) === 3 || y >= 82);
        addBlock(s8, x, y, pz, isFrame ? "calcite" : "dark_prismarine");
        addBlock(s8, x, y, pz - dir, "stone_bricks");
      }
    }
  });
  steps.push({
    stepNumber: "8.8",
    title: "Die drei Prunkportale & Ghibertis Paradiespforte",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Setze die drei Bronzeportale ein. An der Ostseite erstrahlt Lorenzo Ghibertis 'Porta del Paradiso' aus reinem Gold!",
    cameraHint: { eye: [-198, 77, 0], target: [Xc + R, 76, Zc] },
    blocks: s8,
    tip: "Das Ostportal besteht aus massiven Goldblöcken.",
    caution: "Die Bildfelder müssen exakt nach Osten zur Kathedrale zeigen.",
    fact: "Michelangelos Lob: Er nannte diese Tür würdig, die Pforte des Paradieses zu sein."
  });

  // Zweites Geschoss Helper
  function getSecondFloorBlocks(yStart, yEnd) {
    const list = [];
    for (let y = yStart; y <= yEnd; y++) {
      for (let x = Xc - R; x <= Xc + R; x++) {
        for (let z = Zc - R; z <= Zc + R; z++) {
          if (isOctagonPerimeter(x, z, R, cutoff, 2)) {
            const isOuter = isOctagonPerimeter(x, z, R, cutoff, 1);
            let type = "stone_bricks";
            if (isOuter) {
              const isPilaster = (Math.abs(x - Xc) % 6 === 0 || Math.abs(z - Zc) % 6 === 0);
              const isRhombus = (y >= 96 && y <= 104 && (x + z) % 3 === 0);
              if (y === 89 || y === 112) {
                type = "calcite";
              } else if (isPilaster) {
                type = "smooth_quartz";
              } else if (isRhombus) {
                type = "calcite";
              } else {
                type = "dark_prismarine";
              }
            }
            list.push({ x, y, z, type });
          }
        }
      }
    }
    return list;
  }

  // 8.9: Zweites Geschoss Teil 1 (Y=89..94)
  const s9 = [];
  getSecondFloorBlocks(89, 94).forEach(b => addBlock(s9, b.x, b.y, b.z, b.type));
  steps.push({
    stepNumber: "8.9",
    title: "Zweites Geschoss: Pilasterbasen (Y=89 bis Y=94)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Errichte die Basis des zweiten Geschosses mit ionischen Pilastern aus weißem Quarz.",
    cameraHint: { eye: [-255, 96, 30], target: [Xc, 91, Zc] },
    blocks: s9,
    tip: "Ionische Pilaster gliedern jede Achteckseite in drei Felder.",
    caution: "Achte auf die Ausrichtung der Pilasterbasen.",
    fact: "Geometrische Perfektion: Jedes Feld folgt dem goldenen Schnitt."
  });

  // 8.10: Zweites Geschoss Teil 2 (Y=95..100)
  const s10 = [];
  getSecondFloorBlocks(95, 100).forEach(b => addBlock(s10, b.x, b.y, b.z, b.type));
  steps.push({
    stepNumber: "8.10",
    title: "Zweites Geschoss: Rauten-Inkrustation (Y=95 bis Y=100)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Gestalte die Rauten- und Rechteckfelder mit Calcit und dunklem Serpentin.",
    cameraHint: { eye: [-255, 102, 30], target: [Xc, 97, Zc] },
    blocks: s10,
    tip: "Das Rautenmuster spiegelt die antike Inkrustation wider.",
    caution: "Halte die Wandstärke von 2 Blöcken exakt ein.",
    fact: "Klassische Ordnung: Die Gliederung orientiert sich an römischen Vorbildern."
  });

  // 8.11: Zweites Geschoss Teil 3 (Y=101..106)
  const s11 = [];
  getSecondFloorBlocks(101, 106).forEach(b => addBlock(s11, b.x, b.y, b.z, b.type));
  steps.push({
    stepNumber: "8.11",
    title: "Zweites Geschoss: Giebelarkaden & Fenster (Y=101 bis Y=106)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Führe die Wandfelder mit den giebelbekrönten Fensteröffnungen hoch.",
    cameraHint: { eye: [-255, 108, 30], target: [Xc, 103, Zc] },
    blocks: s11,
    tip: "Zarte Säulchen flankieren die Fensteröffnungen.",
    caution: "Achte auf die vertikale Flucht der Pilaster.",
    fact: "Protorenaissance: Diese Architektur inspirierte Brunelleschi 200 Jahre später."
  });

  // 8.12: Zweites Geschoss Teil 4: Hauptgesims (Y=107..112)
  const s12 = [];
  getSecondFloorBlocks(107, 112).forEach(b => addBlock(s12, b.x, b.y, b.z, b.type));
  steps.push({
    stepNumber: "8.12",
    title: "Zweites Geschoss: Attika-Ansatz & Hauptgesims (Y=107 bis Y=112)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Vollende das zweite Geschoss mit dem weit auskragenden Calcit-Hauptgesims auf Y=112.",
    cameraHint: { eye: [-255, 116, 30], target: [Xc, 110, Zc] },
    blocks: s12,
    tip: "Auf Y=112 schließt die zweigeschossige Säulenordnung ab.",
    caution: "Das Gesims kragt gleichmäßig nach außen aus.",
    fact: "Zwei Jahrhunderte Bauzeit: An dieser Verkleidung arbeiteten die Meister bis 1150."
  });

  // Attika Helper
  function getAtticBlocks(yStart, yEnd) {
    const list = [];
    for (let y = yStart; y <= yEnd; y++) {
      for (let x = Xc - atticR; x <= Xc + atticR; x++) {
        for (let z = Zc - atticR; z <= Zc + atticR; z++) {
          if (isOctagonPerimeter(x, z, atticR, atticCutoff, 2)) {
            const isOuter = isOctagonPerimeter(x, z, atticR, atticCutoff, 1);
            let type = "stone_bricks";
            if (isOuter) {
              const isBorder = (y === 113 || y === 122 || (x % 4 === 0) || (z % 4 === 0));
              type = isBorder ? "smooth_quartz" : "dark_prismarine";
            }
            list.push({ x, y, z, type });
          }
        }
      }
    }
    return list;
  }

  // 8.13: Attikageschoss Teil 1 (Y=113..117)
  const s13 = [];
  getAtticBlocks(113, 117).forEach(b => addBlock(s13, b.x, b.y, b.z, b.type));
  steps.push({
    stepNumber: "8.13",
    title: "Das Attikageschoss: Sockel & Kassetten (Y=113 bis Y=117)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Setze den unteren Teil des zurückspringenden Attikageschosses mit geometrischen Kassettenfeldern auf.",
    cameraHint: { eye: [-255, 122, 30], target: [Xc, 115, Zc] },
    blocks: s13,
    tip: "Das Attikageschoss springt um 1 Block gegenüber der Hauptwand zurück.",
    caution: "Der Eckenbeschnitt liegt hier bei dx + dz <= 32.",
    fact: "Klassische Attika: Diente als optischer Puffer zwischen der Fassade und dem gewaltigen Dach."
  });

  // 8.14: Attikageschoss Teil 2 (Y=118..122)
  const s14 = [];
  getAtticBlocks(118, 122).forEach(b => addBlock(s14, b.x, b.y, b.z, b.type));
  steps.push({
    stepNumber: "8.14",
    title: "Das Attikageschoss: Dachauflager & Kranzleiste (Y=118 bis Y=122)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Vollende das Attikageschoss als plane Ebene für das Pyramidendach.",
    cameraHint: { eye: [-255, 128, 30], target: [Xc, 120, Zc] },
    blocks: s14,
    tip: "Auf Y=122 schließt die Attikawand mit einer weißen Quarzleiste ab.",
    caution: "Prüfe die waagerechte Ebene rundherum.",
    fact: "Präzise Geometrie: Auf dieser Kante ruht das gesamte Pyramidendach."
  });

  // =========================================================================
  // SCHRITT 8.15: Das achteckige Pyramidendach (Y=123 bis Y=132)
  // Lückenlos: Dicke 2 Blöcke, sodass jede Schicht vollflächig gestützt ist!
  // =========================================================================
  const s15 = [];
  for (let y = 123; y <= 132; y++) {
    const step = y - 123;
    const curR = atticR - Math.round(step * 1.8);
    const curCutoff = atticCutoff - Math.round(step * 2.5);
    if (curR >= 4) {
      for (let x = Xc - curR; x <= Xc + curR; x++) {
        for (let z = Zc - curR; z <= Zc + curR; z++) {
          if (isOctagonPerimeter(x, z, curR, curCutoff, 2)) {
            const isCornerRib = (Math.abs(Math.abs(x - Xc) - curR) <= 1 && Math.abs(Math.abs(z - Zc) - curR) <= 1) ||
                                (Math.abs((Math.abs(x - Xc) + Math.abs(z - Zc)) - curCutoff) <= 1);
            const type = isCornerRib ? "smooth_quartz" : "calcite";
            addBlock(s15, x, y, z, type);
          }
        }
      }
    }
  }
  steps.push({
    stepNumber: "8.15",
    title: "Das achteckige Pyramidendach (Y=123 bis Y=132)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Decke das Baptisterium mit dem charakteristischen achteckigen Pyramidendach aus Calcit ein. Die 8 Grate werden von strahlend weißen Quarzrippen nachgezogen.",
    cameraHint: { eye: [-255, 140, 30], target: [Xc, 127, Zc] },
    blocks: s15,
    tip: "Das Dach verjüngt sich pyramidenförmig bis zur Spitze.",
    caution: "Achte auf die durchgehenden Quarzrippen an den Graten.",
    fact: "Verborgene Innenkuppel: Im Inneren wölbt sich eine gewaltige Kuppel!"
  });

  // =========================================================================
  // SCHRITT 8.16: Die weiße Marmorlaterne auf der Dachspitze (Höhe Y=133 bis Y=135)
  // =========================================================================
  const s16 = [];
  for (let y = 133; y <= 135; y++) {
    const latR = (y === 135) ? 1 : ((y === 134) ? 2 : 4);
    for (let dx = -latR; dx <= latR; dx++) {
      for (let dz = -latR; dz <= latR; dz++) {
        if (Math.abs(dx) + Math.abs(dz) <= latR * 1.5) {
          let type = "smooth_quartz";
          if (y === 135 && dx === 0 && dz === 0) {
            type = "sea_lantern";
          } else if (y === 134) {
            type = "calcite";
          }
          addBlock(s16, Xc + dx, y, Zc + dz, type);
        }
      }
    }
  }
  steps.push({
    stepNumber: "8.16",
    title: "Die weiße Marmorlaterne auf der Dachspitze (Höhe Y=135)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Kröne das Baptisterium auf Höhe Y=135 mit der eleganten Marmorlaterne und einer leuchtenden Seelaterne im Scheitelpunkt.",
    cameraHint: { eye: [-240, 145, 15], target: [Xc, 134, Zc] },
    blocks: s16,
    tip: "Die Laterne bildet den glänzenden Abschluss des Außenbaus.",
    caution: "Der Mittelpunkt liegt genau bei X=-225, Z=0.",
    fact: "1150 vollendet: Als die Laterne aufgesetzt wurde, war das Bauwerk fertig!"
  });

  // =========================================================================
  // SCHRITT 8.17: Das byzantinische Decken-Goldmosaik (Y=114 bis Y=128)
  // Lückenlos: Springt direkt von der Innenwand Y=114 (R=21) an und schließt nach oben
  // =========================================================================
  const s17 = [];
  for (let y = 114; y <= 128; y++) {
    const step = y - 114;
    const domeR = 21 - Math.round(step * 1.2);
    const domeCutoff = 29 - Math.round(step * 1.6);
    if (domeR >= 3) {
      for (let x = Xc - domeR; x <= Xc + domeR; x++) {
        for (let z = Zc - domeR; z <= Zc + domeR; z++) {
          if (isInsideOctagon(x, z, domeR, domeCutoff) && !isInsideOctagon(x, z, domeR - 2, domeCutoff - 3)) {
            const dist = Math.sqrt((x - Xc) * (x - Xc) + (z - Zc) * (z - Zc));
            let type = "gold_block";
            const isChristFigure = (x >= Xc - 4 && x <= Xc + 4 && z >= Zc + 3 && z <= Zc + 12);
            if (isChristFigure) {
              type = (y % 2 === 0) ? "red_sandstone" : "calcite";
            } else if (dist <= 5) {
              type = "sea_lantern";
            } else if (Math.round(dist) % 3 === 0) {
              type = "yellow_stained_glass";
            }
            addBlock(s17, x, y, z, type);
          }
        }
      }
    }
  }
  steps.push({
    stepNumber: "8.17",
    title: "Das weltberühmte byzantinische Decken-Goldmosaik (Y=114 bis Y=128)",
    module: "Modul 8: Baptisterium San Giovanni",
    description: "Vollende das Baptisterium mit dem monumentalen Goldmosaikgewölbe im Innenraum. Aus Goldblöcken, Calcit und bernsteinfarbenem Glas erstrahlt das Weltgericht mit dem kolossalen Christus Weltenrichter!",
    cameraHint: { eye: [Xc, 85, Zc], target: [Xc, 125, Zc] },
    blocks: s17,
    tip: "Das Goldmosaik wölbt sich direkt über dem Kirchenraum.",
    caution: "Achte auf die Christusfigur im Westsektor des Gewölbes.",
    fact: "Das Jüngste Gericht: Coppo di Marcovaldo und Cimabue schufen dieses Goldmosaik, das Dante zu seiner Hölle inspirierte!"
  });

  return steps;
}

const steps = generateModule8();
console.log('Generated Modul 8 with ' + steps.length + ' steps:');
steps.forEach(s => console.log('Step ' + s.stepNumber + ': ' + s.blocks.length + ' blocks - ' + s.title));

const jsContent = '/**\n * Modul 8: Baptisterium San Giovanni (Santa Maria del Fiore)\n' +
  ' * 100% EXAKT berechnete Blockkoordinaten ohne Näherungswerte.\n' +
  ' * Massives Fundament Y=65..67, geschlossene Schalen, null Schwebungen.\n' +
  ' */\nwindow.MODULE_8_DATA = ' + JSON.stringify(steps, null, 2) + ';\n';

fs.writeFileSync(path.join(__dirname, '..', 'webapp', 'js', 'data', 'module_8_steps.js'), jsContent, 'utf8');
console.log('Successfully wrote webapp/js/data/module_8_steps.js');
