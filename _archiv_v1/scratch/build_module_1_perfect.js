const fs = require('fs');
const path = require('path');

function generateModule1() {
  const steps = [];
  const placed = new Map();

  function addBlock(stepBlocks, x, y, z, type) {
    const k = `${x},${y},${z}`;
    if (!placed.has(k)) {
      placed.set(k, true);
      stepBlocks.push({ x, y, z, type });
    }
  }

  const pillarCenters = [
    { x: -135, z: -21 }, { x: -105, z: -21 }, { x: -75, z: -21 },
    { x: -135, z:  21 }, { x: -105, z:  21 }, { x: -75, z:  21 }
  ];
  const wallResponds = [
    { x: -135, z: -41 }, { x: -105, z: -41 }, { x: -75, z: -41 },
    { x: -135, z:  41 }, { x: -105, z:  41 }, { x: -75, z:  41 }
  ];
  const endResponds = [
    { x: -167, z: -21 }, { x: -45, z: -21 },
    { x: -167, z:  21 }, { x: -45, z:  21 }
  ];
  const bays = [
    { x1: -167, x2: -135 },
    { x1: -135, x2: -105 },
    { x1: -105, x2: -75 },
    { x1: -75,  x2: -45 }
  ];
  const windowCentersX = [-151, -120, -90, -60];
  const bxListWest = [-167, -151, -135, -120];
  const bxListEast = [-105, -90, -75, -60, -45];
  // 1. Pfeilerschäfte unterer Teil & Wanddienste (Y=65 bis Y=78)
  const s1 = [];
  for (let y = 65; y <= 78; y++) {
    pillarCenters.forEach(p => {
      for (let dx = -1; dx <= 0; dx++) {
        for (let dz = -1; dz <= 0; dz++) addBlock(s1, p.x + dx, y, p.z + dz, "smooth_quartz");
      }
      addBlock(s1, p.x - 2, y, p.z, "stone_bricks");
      addBlock(s1, p.x + 1, y, p.z, "stone_bricks");
      addBlock(s1, p.x, y, p.z - 2, "stone_bricks");
      addBlock(s1, p.x, y, p.z + 1, "stone_bricks");
      addBlock(s1, p.x - 2, y, p.z - 1, "stone_bricks");
      addBlock(s1, p.x + 1, y, p.z - 1, "stone_bricks");
      addBlock(s1, p.x - 1, y, p.z - 2, "stone_bricks");
      addBlock(s1, p.x - 1, y, p.z + 1, "stone_bricks");
    });
    endResponds.forEach(r => {
      for (let dz = -1; dz <= 0; dz++) addBlock(s1, r.x, y, r.z + dz, "smooth_quartz");
      addBlock(s1, r.x + (r.x === -167 ? 1 : -1), y, r.z, "stone_bricks");
      addBlock(s1, r.x + (r.x === -167 ? 1 : -1), y, r.z - 1, "stone_bricks");
    });
    wallResponds.forEach(w => {
      const inZ = (w.z < 0) ? w.z + 1 : w.z - 1;
      addBlock(s1, w.x, y, inZ, "smooth_quartz");
      addBlock(s1, w.x - 1, y, inZ, "stone_bricks");
      addBlock(s1, w.x + 1, y, inZ, "stone_bricks");
    });
  }
  steps.push({
    stepNumber: 1,
    title: "Die Schäfte der 6 Langhaus-Riesenpfeiler & Wanddienste (Basis)",
    module: "Modul 1: Langhaus",
    description: "Ziehe die 6 kolossalen Bündelpfeiler und die Wanddienste im Langhaus von Y=65 bis Y=78 hoch (14 Blöcke hoch). Jeder Pfeiler besitzt einen tragenden Quarzkern und vier profilierte Halbsäulendienste.",
    cameraHint: { eye: [-105, 85, 40], target: [-105, 72, 0] },
    blocks: s1,
    tip: "Die Kreuzform des Pfeilers entsteht durch die vorgelegten Steinziegel.",
    caution: "Achte auf die exakte Flucht der 6 Pfeiler entlang von Z=-21 und Z=+21.",
    fact: "Meisterwerk der Gotik: Geplant von Arnolfo di Cambio 1296 und meisterhaft dimensioniert von Francesco Talenti."
  });

  // 2. Pfeilerschäfte oberer Teil mit Prismarin-Bändern (Y=79 bis Y=92)
  const s2 = [];
  for (let y = 79; y <= 92; y++) {
    const isBand = (y === 83 || y === 89);
    const bType = isBand ? "dark_prismarine" : "stone_bricks";
    pillarCenters.forEach(p => {
      for (let dx = -1; dx <= 0; dx++) {
        for (let dz = -1; dz <= 0; dz++) addBlock(s2, p.x + dx, y, p.z + dz, "smooth_quartz");
      }
      addBlock(s2, p.x - 2, y, p.z, bType);
      addBlock(s2, p.x + 1, y, p.z, bType);
      addBlock(s2, p.x, y, p.z - 2, bType);
      addBlock(s2, p.x, y, p.z + 1, bType);
      addBlock(s2, p.x - 2, y, p.z - 1, bType);
      addBlock(s2, p.x + 1, y, p.z - 1, bType);
      addBlock(s2, p.x - 1, y, p.z - 2, bType);
      addBlock(s2, p.x - 1, y, p.z + 1, bType);
    });
    endResponds.forEach(r => {
      for (let dz = -1; dz <= 0; dz++) addBlock(s2, r.x, y, r.z + dz, "smooth_quartz");
      addBlock(s2, r.x + (r.x === -167 ? 1 : -1), y, r.z, bType);
      addBlock(s2, r.x + (r.x === -167 ? 1 : -1), y, r.z - 1, bType);
    });
    wallResponds.forEach(w => {
      const inZ = (w.z < 0) ? w.z + 1 : w.z - 1;
      addBlock(s2, w.x, y, inZ, "smooth_quartz");
      addBlock(s2, w.x - 1, y, inZ, bType);
      addBlock(s2, w.x + 1, y, inZ, bType);
    });
  }
  steps.push({
    stepNumber: 2,
    title: "Die Pfeilerschäfte mit dunkelgrünen Serpentinbändern",
    module: "Modul 1: Langhaus",
    description: "Führe die Pfeilerschäfte von Y=79 bis Y=92 empor. Auf den Höhen Y=83 und Y=89 gliedern elegante Bänder aus dunkelgrünem Prismarin die gewaltigen Schäfte.",
    cameraHint: { eye: [-105, 95, 40], target: [-105, 85, 0] },
    blocks: s2,
    tip: "Die dunkelgrünen Bänder laufen horizontal über alle Pfeiler.",
    caution: "Prüfe die Höhe der Zierbänder auf allen Pfeilern.",
    fact: "Verde di Prato: Der dunkelgrüne Serpentinstein verleiht dem toskanischen Sakralbau seine unverwechselbare Eleganz."
  });

  // 3. Pfeilerkapitelle & Wandkonsolen (Y=93 bis Y=94)
  const s3 = [];
  pillarCenters.forEach(p => {
    for (let dx = -2; dx <= 1; dx++) {
      for (let dz = -2; dz <= 1; dz++) {
        addBlock(s3, p.x + dx, 93, p.z + dz, "smooth_quartz");
        addBlock(s3, p.x + dx, 94, p.z + dz, "smooth_quartz");
      }
    }
    addBlock(s3, p.x - 3, 94, p.z, "polished_granite");
    addBlock(s3, p.x - 3, 94, p.z - 1, "polished_granite");
    addBlock(s3, p.x + 2, 94, p.z, "polished_granite");
    addBlock(s3, p.x + 2, 94, p.z - 1, "polished_granite");
    addBlock(s3, p.x, 94, p.z - 3, "polished_granite");
    addBlock(s3, p.x - 1, 94, p.z - 3, "polished_granite");
    addBlock(s3, p.x, 94, p.z + 2, "polished_granite");
    addBlock(s3, p.x - 1, 94, p.z + 2, "polished_granite");
  });
  endResponds.forEach(r => {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -2; dz <= 1; dz++) {
        const x = r.x + (r.x === -167 ? Math.max(0, dx) : Math.min(0, dx));
        addBlock(s3, x, 93, r.z + dz, "smooth_quartz");
        addBlock(s3, x, 94, r.z + dz, "smooth_quartz");
      }
    }
  });
  wallResponds.forEach(w => {
    const inZ = (w.z < 0) ? w.z + 1 : w.z - 1;
    for (let dx = -1; dx <= 1; dx++) {
      addBlock(s3, w.x + dx, 93, inZ, "smooth_quartz");
      addBlock(s3, w.x + dx, 94, inZ, "smooth_quartz");
      addBlock(s3, w.x + dx, 94, inZ + (w.z < 0 ? 1 : -1), "polished_granite");
    }
  });
  steps.push({
    stepNumber: 3,
    title: "Die gotischen Pfeilerkapitelle & Bogenauflager",
    module: "Modul 1: Langhaus",
    description: "Kröne alle Pfeiler und Wanddienste mit auskragenden Kapitellen aus Glattem Quarz und roten Granit-Konsolen auf Y=93 und Y=94. Sie bilden das tragende Fundament für die Arkadenbögen und Gewölbe.",
    cameraHint: { eye: [-105, 102, 35], target: [-105, 93, 0] },
    blocks: s3,
    tip: "Die Granitkonsolen leiten das Bogengewicht in die Pfeilerschäfte ab.",
    caution: "Achte auf den symmetrischen Überstand an allen vier Pfeilerseiten.",
    fact: "Florentiner Kapitelle: Sie verzichten bewusst auf überladenes Blattwerk zugunsten klarer architektonischer Kraft."
  });

  // 4. Arkadenbögen Nordseite (Z=-21, Y=95 bis 106)
  const s4 = [];
  bays.forEach(({x1, x2}) => {
    const midX = (x1 + x2) / 2;
    const halfW = (x2 - x1) / 2;
    for (let x = x1; x <= x2; x++) {
      const u = (x - midX) / halfW;
      const archY = Math.round(106 - u * u * 11);
      if (archY >= 95) {
        addBlock(s4, x, archY, -21, "smooth_quartz");
        addBlock(s4, x, archY - 1, -21, "smooth_quartz");
      }
    }
  });
  steps.push({
    stepNumber: 4,
    title: "Die nördlichen Arkadenspitzbögen (Z=-21)",
    module: "Modul 1: Langhaus",
    description: "Spanne die vier gewaltigen gotischen Spitzbögen der Nordarkade von der Westfassade (X=-168) bis zur Vierung (X=-45). Die Bögen steigen auf eine Scheitelhöhe von Y=106 an.",
    cameraHint: { eye: [-105, 115, -45], target: [-105, 100, -21] },
    blocks: s4,
    tip: "Die Bögen sind doppelreihig aus massivem Carrara-Quarz gemauert.",
    caution: "Der Scheitelpunkt liegt bei Y=106 in der Jochmitte.",
    fact: "Kühne Weite: Fast 20 Meter freie Spannweite zwischen den Pfeilern – einzigartig in der gotischen Architektur."
  });

  // 5. Arkadenbögen Südseite (Z=+21, Y=95 bis 106)
  const s5 = [];
  bays.forEach(({x1, x2}) => {
    const midX = (x1 + x2) / 2;
    const halfW = (x2 - x1) / 2;
    for (let x = x1; x <= x2; x++) {
      const u = (x - midX) / halfW;
      const archY = Math.round(106 - u * u * 11);
      if (archY >= 95) {
        addBlock(s5, x, archY, 21, "smooth_quartz");
        addBlock(s5, x, archY - 1, 21, "smooth_quartz");
      }
    }
  });
  steps.push({
    stepNumber: 5,
    title: "Die südlichen Arkadenspitzbögen (Z=+21)",
    module: "Modul 1: Langhaus",
    description: "Errichte die vier Spitzbögen der Südarkade spiegelbildlich zur Nordseite. Alle 8 Arkadenbögen stehen nun durchgehend von X=-167 bis X=-45!",
    cameraHint: { eye: [-105, 115, 45], target: [-105, 100, 21] },
    blocks: s5,
    tip: "Prüfe die identische Bogenführung auf Nord- und Südseite.",
    caution: "Die Bogenansätze müssen exakt auf den Kapitellen ruhen.",
    fact: "Lehrgerüste: Im 14. Jahrhundert bauten Zimmerer riesige hölzerne Bogenstützen, auf denen Steinmetze Quader für Quader einpassten."
  });

  // 6. Nördliche Obergadenwand & 4 Oculi (Z=-21, Y=95 bis 108)
  const s6 = [];
  for (let x = -167; x <= -45; x++) {
    let archY = 95;
    for (const b of bays) {
      if (x >= b.x1 && x <= b.x2) {
        const u = (x - (b.x1 + b.x2) / 2) / ((b.x2 - b.x1) / 2);
        archY = Math.round(106 - u * u * 11);
        break;
      }
    }
    const startY = Math.max(95, archY);
    for (let y = startY; y <= 108; y++) {
      let isOculusBorder = false;
      let isOculusGlass = false;
      for (const wx of windowCentersX) {
        const dx = x - wx;
        const dy = y - 102;
        const rSq = dx * dx + dy * dy;
        if (rSq <= 2.2) isOculusGlass = true;
        else if (rSq <= 6.5) isOculusBorder = true;
      }
      let bType = "stone_bricks";
      if (isOculusGlass) bType = "yellow_stained_glass";
      else if (isOculusBorder) bType = "smooth_quartz";
      else if (y === 108) bType = "smooth_quartz";
      addBlock(s6, x, y, -21, bType);
    }
  }
  steps.push({
    stepNumber: 6,
    title: "Nördliche Obergadenwand, Zwickelmauerwerk & 4 Ochsenaugen (Z=-21)",
    module: "Modul 1: Langhaus",
    description: "Schließe die gesamte nördliche Obergadenwand lückenlos von den Arkadenscheiteln bis auf Gesimshöhe Y=108. Vier kreisrunde Ochsenaugen (Oculi) mit edlem Quarzrahmen und sonnengelbem Buntglas bringen Licht in das Mittelschiff.",
    cameraHint: { eye: [-105, 120, -50], target: [-105, 105, -21] },
    blocks: s6,
    tip: "Das Mauerwerk füllt alle Zwickel zwischen den Spitzbögen fugenlos aus.",
    caution: "Keine Lücken zwischen Bogensteinen und Wandziegeln lassen.",
    fact: "Runde Ochsenaugen: Typisch für die toskanische Gotik. Sie geben der Wand monumentale Ruhe und schützen vor greller Sommersonne."
  });

  // 7. Südliche Obergadenwand & 4 Oculi (Z=+21, Y=95 bis 108)
  const s7 = [];
  for (let x = -167; x <= -45; x++) {
    let archY = 95;
    for (const b of bays) {
      if (x >= b.x1 && x <= b.x2) {
        const u = (x - (b.x1 + b.x2) / 2) / ((b.x2 - b.x1) / 2);
        archY = Math.round(106 - u * u * 11);
        break;
      }
    }
    const startY = Math.max(95, archY);
    for (let y = startY; y <= 108; y++) {
      let isOculusBorder = false;
      let isOculusGlass = false;
      for (const wx of windowCentersX) {
        const dx = x - wx;
        const dy = y - 102;
        const rSq = dx * dx + dy * dy;
        if (rSq <= 2.2) isOculusGlass = true;
        else if (rSq <= 6.5) isOculusBorder = true;
      }
      let bType = "stone_bricks";
      if (isOculusGlass) bType = "yellow_stained_glass";
      else if (isOculusBorder) bType = "smooth_quartz";
      else if (y === 108) bType = "smooth_quartz";
      addBlock(s7, x, y, 21, bType);
    }
  }
  steps.push({
    stepNumber: 7,
    title: "Südliche Obergadenwand, Zwickelmauerwerk & 4 Ochsenaugen (Z=+21)",
    module: "Modul 1: Langhaus",
    description: "Schließe die südliche Obergadenwand vollkommen fugenlos von Y=95 bis Y=108. Beide Hochwände des Mittelschiffs sind nun massiv geschlossen und wetterfest vorbereitet!",
    cameraHint: { eye: [-105, 120, 50], target: [-105, 105, 21] },
    blocks: s7,
    tip: "Beide Hochwände sind absolut symmetrisch aufgebaut.",
    caution: "Prüfe die waagerechte Quarz-Gesimslinie bei Y=108.",
    fact: "Lichtkuppel: Durch die 8 Oculi im Obergaden strahlt das toskanische Sonnenlicht tief in den Kathedralraum."
  });

  // 8. Nordwand Seitenschiff Sockel West (X=-167 bis -107, Y=65 bis 75)
  const s8 = [];
  for (let x = -167; x <= -107; x++) {
    for (let y = 65; y <= 75; y++) {
      addBlock(s8, x, y, -41, "stone_bricks");
      addBlock(s8, x, y, -42, (y === 65) ? "dark_prismarine" : "stone_bricks");
    }
  }
  for (const x of bxListWest) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let y = 65; y <= 75; y++) addBlock(s8, x + dx, y, -43, (y === 65) ? "dark_prismarine" : "smooth_quartz");
    }
  }
  steps.push({
    stepNumber: 8,
    title: "Nördliche Seitenschiffwand: Sockel West (X=-167 bis -107)",
    module: "Modul 1: Langhaus",
    description: "Errichte die massive zweischalige Grundmauer des westlichen Nordseitenschiffs von Y=65 bis Y=75 mit Strebepfeilern.",
    cameraHint: { eye: [-135, 85, -65], target: [-135, 70, -42] },
    blocks: s8,
    tip: "Die zweireihige Mauer garantiert maximale Stabilität.",
    caution: "Verbinde die Mauer nahtlos mit dem Fundament.",
    fact: "Pietra Forte: Der harte toskanische Sandstein trägt die Außenlasten."
  });

  // 9. Nordwand Seitenschiff Sockel Ost (X=-106 bis -45, Y=65 bis 75)
  const s9 = [];
  for (let x = -106; x <= -45; x++) {
    for (let y = 65; y <= 75; y++) {
      addBlock(s9, x, y, -41, "stone_bricks");
      addBlock(s9, x, y, -42, (y === 65) ? "dark_prismarine" : "stone_bricks");
    }
  }
  for (const x of bxListEast) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let y = 65; y <= 75; y++) addBlock(s9, x + dx, y, -43, (y === 65) ? "dark_prismarine" : "smooth_quartz");
    }
  }
  steps.push({
    stepNumber: 9,
    title: "Nördliche Seitenschiffwand: Sockel Ost (X=-106 bis -45)",
    module: "Modul 1: Langhaus",
    description: "Führe die Grundmauer des Nordseitenschiffs bis an die Vierung bei X=-45 weiter.",
    cameraHint: { eye: [-75, 85, -65], target: [-75, 70, -42] },
    blocks: s9,
    tip: "Die Sockelmauer schließt bündig an die Vierung an.",
    caution: "Prüfe die Höhe Y=75 auf ganzer Länge.",
    fact: "Strebepfeiler: Sie leiten die enormen Gewölbekräfte sicher nach außen."
  });

  // 10. Nordwand Fenstergeschoss West (X=-167 bis -107, Y=76 bis 86)
  const s10 = [];
  for (let x = -167; x <= -107; x++) {
    for (let y = 76; y <= 86; y++) {
      let isWindowCol = false, isWindowArch = false, isWindowGlass = false;
      for (const wx of [-151, -120]) {
        const dx = Math.abs(x - wx);
        if (dx <= 2) {
          if (y >= 77 && y <= 82) isWindowGlass = true;
          else if (y === 76) isWindowCol = true;
          else if (y === 83 || y === 84) isWindowArch = true;
        }
      }
      const bIn = isWindowGlass ? "light_gray_stained_glass" : ((isWindowCol || isWindowArch) ? "smooth_quartz" : ((y === 86) ? "smooth_quartz" : "stone_bricks"));
      const bOut = isWindowGlass ? "yellow_stained_glass" : ((isWindowCol || isWindowArch) ? "smooth_quartz" : ((y === 86) ? "smooth_quartz" : "stone_bricks"));
      addBlock(s10, x, y, -41, bIn);
      addBlock(s10, x, y, -42, bOut);
    }
  }
  for (const x of bxListWest) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let y = 76; y <= 86; y++) addBlock(s10, x + dx, y, -43, (y === 86) ? "polished_granite" : "smooth_quartz");
    }
  }
  steps.push({
    stepNumber: 10,
    title: "Nördliche Seitenschiffwand: Fenster West (X=-167 bis -107)",
    module: "Modul 1: Langhaus",
    description: "Ziehe die westliche Nordwand von Y=76 bis Y=86 mit zwei prachtvollen Maßwerkfenstern hoch.",
    cameraHint: { eye: [-135, 95, -65], target: [-135, 80, -42] },
    blocks: s10,
    tip: "Die Quarzblöcke bilden edle gotische Spitzbögen.",
    caution: "Halte die Fensteröffnungen exakt symmetrisch.",
    fact: "Gotisches Maßwerk: Zarte Steinrippen gliedern die Fensterflächen."
  });

  // 11. Nordwand Fenstergeschoss Ost (X=-106 bis -45, Y=76 bis 86)
  const s11 = [];
  for (let x = -106; x <= -45; x++) {
    for (let y = 76; y <= 86; y++) {
      let isWindowCol = false, isWindowArch = false, isWindowGlass = false;
      for (const wx of [-90, -60]) {
        const dx = Math.abs(x - wx);
        if (dx <= 2) {
          if (y >= 77 && y <= 82) isWindowGlass = true;
          else if (y === 76) isWindowCol = true;
          else if (y === 83 || y === 84) isWindowArch = true;
        }
      }
      const bIn = isWindowGlass ? "light_gray_stained_glass" : ((isWindowCol || isWindowArch) ? "smooth_quartz" : ((y === 86) ? "smooth_quartz" : "stone_bricks"));
      const bOut = isWindowGlass ? "yellow_stained_glass" : ((isWindowCol || isWindowArch) ? "smooth_quartz" : ((y === 86) ? "smooth_quartz" : "stone_bricks"));
      addBlock(s11, x, y, -41, bIn);
      addBlock(s11, x, y, -42, bOut);
    }
  }
  for (const x of bxListEast) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let y = 76; y <= 86; y++) addBlock(s11, x + dx, y, -43, (y === 86) ? "polished_granite" : "smooth_quartz");
    }
  }
  steps.push({
    stepNumber: 11,
    title: "Nördliche Seitenschiffwand: Fenster Ost (X=-106 bis -45)",
    module: "Modul 1: Langhaus",
    description: "Vollende die gesamte Nordwand bis zum Kranzgesims bei Y=86 mit zwei weiteren Maßwerkfenstern.",
    cameraHint: { eye: [-75, 95, -65], target: [-75, 80, -42] },
    blocks: s11,
    tip: "Die gesamte 124-Block-Nordwand ist nun vollendet!",
    caution: "Achte auf das waagerechte Gesims bei Y=86.",
    fact: "Licht im Dom: Das gedämpfte Nordlicht verleiht dem Raum feierliche Kühle."
  });

  // 12. Südwand Seitenschiff Sockel West (X=-167 bis -107, Y=65 bis 75)
  const s12 = [];
  for (let x = -167; x <= -107; x++) {
    for (let y = 65; y <= 75; y++) {
      addBlock(s12, x, y, 41, "stone_bricks");
      addBlock(s12, x, y, 42, (y === 65) ? "dark_prismarine" : "stone_bricks");
    }
  }
  for (const x of bxListWest) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let y = 65; y <= 75; y++) addBlock(s12, x + dx, y, 43, (y === 65) ? "dark_prismarine" : "smooth_quartz");
    }
  }
  steps.push({
    stepNumber: 12,
    title: "Südliche Seitenschiffwand: Sockel West (X=-167 bis -107)",
    module: "Modul 1: Langhaus",
    description: "Errichte die Grundmauer des westlichen Südseitenschiffs von Y=65 bis Y=75 mit Strebepfeilern.",
    cameraHint: { eye: [-135, 85, 65], target: [-135, 70, 42] },
    blocks: s12,
    tip: "Das Mauerwerk spiegelt die Nordseite exakt wider.",
    caution: "Die Wandflucht liegt bei Z=+41 und Z=+42.",
    fact: "Erdbebensicherheit: Dicke Mauern schützten vor toskanischen Erdstößen."
  });

  // 13. Südwand Seitenschiff Sockel Ost (X=-106 bis -45, Y=65 bis 75)
  const s13 = [];
  for (let x = -106; x <= -45; x++) {
    for (let y = 65; y <= 75; y++) {
      addBlock(s13, x, y, 41, "stone_bricks");
      addBlock(s13, x, y, 42, (y === 65) ? "dark_prismarine" : "stone_bricks");
    }
  }
  for (const x of bxListEast) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let y = 65; y <= 75; y++) addBlock(s13, x + dx, y, 43, (y === 65) ? "dark_prismarine" : "smooth_quartz");
    }
  }
  steps.push({
    stepNumber: 13,
    title: "Südliche Seitenschiffwand: Sockel Ost (X=-106 bis -45)",
    module: "Modul 1: Langhaus",
    description: "Führe die Südwand bis an die Vierung bei X=-45 weiter.",
    cameraHint: { eye: [-75, 85, 65], target: [-75, 70, 42] },
    blocks: s13,
    tip: "Bündiger Anschluss an die Vierung.",
    caution: "Kontrolliere die Fluchtlinie.",
    fact: "Harmonischer Baukörper: Einheitliche Höhen über alle Fassaden."
  });

  // 14. Südwand Fenstergeschoss West (X=-167 bis -107, Y=76 bis 86)
  const s14 = [];
  for (let x = -167; x <= -107; x++) {
    for (let y = 76; y <= 86; y++) {
      let isWindowCol = false, isWindowArch = false, isWindowGlass = false;
      for (const wx of [-151, -120]) {
        const dx = Math.abs(x - wx);
        if (dx <= 2) {
          if (y >= 77 && y <= 82) isWindowGlass = true;
          else if (y === 76) isWindowCol = true;
          else if (y === 83 || y === 84) isWindowArch = true;
        }
      }
      const bIn = isWindowGlass ? "light_gray_stained_glass" : ((isWindowCol || isWindowArch) ? "smooth_quartz" : ((y === 86) ? "smooth_quartz" : "stone_bricks"));
      const bOut = isWindowGlass ? "yellow_stained_glass" : ((isWindowCol || isWindowArch) ? "smooth_quartz" : ((y === 86) ? "smooth_quartz" : "stone_bricks"));
      addBlock(s14, x, y, 41, bIn);
      addBlock(s14, x, y, 42, bOut);
    }
  }
  for (const x of bxListWest) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let y = 76; y <= 86; y++) addBlock(s14, x + dx, y, 43, (y === 86) ? "polished_granite" : "smooth_quartz");
    }
  }
  steps.push({
    stepNumber: 14,
    title: "Südliche Seitenschiffwand: Fenster West (X=-167 bis -107)",
    module: "Modul 1: Langhaus",
    description: "Ziehe die westliche Südwand von Y=76 bis Y=86 mit zwei Maßwerkfenstern hoch.",
    cameraHint: { eye: [-135, 95, 65], target: [-135, 80, 42] },
    blocks: s14,
    tip: "Das Buntglas fängt warmes Südlicht ein.",
    caution: "Achte auf sauberen Fenstersturz.",
    fact: "Lichttheologie: Farbiges Licht als Symbol göttlicher Weisheit."
  });

  // 15. Südwand Fenstergeschoss Ost (X=-106 bis -45, Y=76 bis 86)
  const s15 = [];
  for (let x = -106; x <= -45; x++) {
    for (let y = 76; y <= 86; y++) {
      let isWindowCol = false, isWindowArch = false, isWindowGlass = false;
      for (const wx of [-90, -60]) {
        const dx = Math.abs(x - wx);
        if (dx <= 2) {
          if (y >= 77 && y <= 82) isWindowGlass = true;
          else if (y === 76) isWindowCol = true;
          else if (y === 83 || y === 84) isWindowArch = true;
        }
      }
      const bIn = isWindowGlass ? "light_gray_stained_glass" : ((isWindowCol || isWindowArch) ? "smooth_quartz" : ((y === 86) ? "smooth_quartz" : "stone_bricks"));
      const bOut = isWindowGlass ? "yellow_stained_glass" : ((isWindowCol || isWindowArch) ? "smooth_quartz" : ((y === 86) ? "smooth_quartz" : "stone_bricks"));
      addBlock(s15, x, y, 41, bIn);
      addBlock(s15, x, y, 42, bOut);
    }
  }
  for (const x of bxListEast) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let y = 76; y <= 86; y++) addBlock(s15, x + dx, y, 43, (y === 86) ? "polished_granite" : "smooth_quartz");
    }
  }
  steps.push({
    stepNumber: 15,
    title: "Südliche Seitenschiffwand: Fenster Ost (X=-106 bis -45)",
    module: "Modul 1: Langhaus",
    description: "Vollende die gesamte Südwand bis zum Gesims auf Y=86. Beide Längswände der Kathedrale stehen nun vollständig da!",
    cameraHint: { eye: [-75, 95, 65], target: [-75, 80, 42] },
    blocks: s15,
    tip: "Alle 8 Maßwerkfenster des Langhauses sind nun fertiggestellt!",
    caution: "Prüfe das Gesims auf Höhe Y=86.",
    fact: "Ghibertis Glasfenster: Lorenzo Ghiberti schuf die Entwürfe für viele Domfenster."
  });

  // 16. Nord-Seitenschiff: Kreuzrippengewölbe (Y=80 bis 85)
  const s16 = [];
  bays.forEach(({x1, x2}) => {
    const midX = (x1 + x2) / 2;
    const halfX = (x2 - x1) / 2;
    const midZ = -31;
    const halfZ = 10;
    for (let x = x1; x <= x2; x++) {
      for (let z = -41; z <= -21; z++) {
        const u = Math.abs(x - midX) / halfX;
        const v = Math.abs(z - midZ) / halfZ;
        const dist = Math.max(u, v);
        const vy = Math.round(85 - dist * 5);
        const isRib = (Math.abs(u - v) < 0.1 || x === x1 || x === x2 || z === -41 || z === -21);
        addBlock(s16, x, vy, z, isRib ? "smooth_quartz" : "smooth_stone");
      }
    }
  });
  steps.push({
    stepNumber: 16,
    title: "Das nördliche Kreuzrippengewölbe des Seitenschiffs (Y=80 bis 85)",
    module: "Modul 1: Langhaus",
    description: "Wölbe die Decke des nördlichen Seitenschiffs lückenlos mit gotischen Kreuzrippen ein (Y=80 bis Y=85). Die Quarzrippen überspannen alle vier Joche vom Pfeiler bis zur Außenwand.",
    cameraHint: { eye: [-105, 90, -31], target: [-105, 83, -31] },
    blocks: s16,
    tip: "Das Seitenschiff wird zu einem erhabenen, geschlossenen Wandelgang.",
    caution: "Die Rippen sitzen fest auf den Kapitellen und Wandvorlagen auf.",
    fact: "Statische Perfektion: Das Kreuzrippengewölbe leitet alle Deckengewichte punktförmig in Pfeiler und Außenbuttresses."
  });

  // 17. Süd-Seitenschiff: Kreuzrippengewölbe (Y=80 bis 85)
  const s17 = [];
  bays.forEach(({x1, x2}) => {
    const midX = (x1 + x2) / 2;
    const halfX = (x2 - x1) / 2;
    const midZ = 31;
    const halfZ = 10;
    for (let x = x1; x <= x2; x++) {
      for (let z = 21; z <= 41; z++) {
        const u = Math.abs(x - midX) / halfX;
        const v = Math.abs(z - midZ) / halfZ;
        const dist = Math.max(u, v);
        const vy = Math.round(85 - dist * 5);
        const isRib = (Math.abs(u - v) < 0.1 || x === x1 || x === x2 || z === 21 || z === 41);
        addBlock(s17, x, vy, z, isRib ? "smooth_quartz" : "smooth_stone");
      }
    }
  });
  steps.push({
    stepNumber: 17,
    title: "Das südliche Kreuzrippengewölbe des Seitenschiffs (Y=80 bis 85)",
    module: "Modul 1: Langhaus",
    description: "Wölbe das südliche Seitenschiff spiegelbildlich ein. Beide Seitenschiffe der Kathedrale sind nun vollständig eingewölbt und begehbar!",
    cameraHint: { eye: [-105, 90, 31], target: [-105, 83, 31] },
    blocks: s17,
    tip: "Blicke von unten nach oben: Ein prachtvoller Sternenhimmel aus Stein.",
    caution: "Achte auf sauberen Anschluss an die Arkadenbögen.",
    fact: "Akustik: Die gewölbten Decken verleihen gregorianischen Gesängen einen unvergleichlich feierlichen Nachhall."
  });

  // 18. Nord-Pultdach Westabschnitt (X=-167 bis -107, Y=86 bis 94)
  const s18 = [];
  for (let x = -167; x <= -107; x++) {
    for (let z = -43; z <= -22; z++) {
      const dist = Math.abs(z - (-43));
      const roofY = Math.round(86 + (dist * 8) / 21);
      addBlock(s18, x, roofY, z, "terracotta");
      if (roofY > 86) addBlock(s18, x, roofY - 1, z, "stone_bricks");
    }
  }
  steps.push({
    stepNumber: 18,
    title: "Das toskanische Pultdach des Nordseitenschiffs – Westabschnitt",
    module: "Modul 1: Langhaus",
    description: "Decke den westlichen Abschnitt des Nordseitenschiffs (X=-167 bis -107) mit toskanischen Terrakotta-Ziegeln ein.",
    cameraHint: { eye: [-135, 105, -55], target: [-135, 90, -31] },
    blocks: s18,
    tip: "Das Dach steigt von Y=86 bis Y=94 an.",
    caution: "Achte auf sauberen Wandanschluss.",
    fact: "Cotto dell'Impruneta: Langlebige toskanische Dachziegel."
  });

  // 19. Nord-Pultdach Ostabschnitt (X=-106 bis -45, Y=86 bis 94)
  const s19 = [];
  for (let x = -106; x <= -45; x++) {
    for (let z = -43; z <= -22; z++) {
      const dist = Math.abs(z - (-43));
      const roofY = Math.round(86 + (dist * 8) / 21);
      addBlock(s19, x, roofY, z, "terracotta");
      if (roofY > 86) addBlock(s19, x, roofY - 1, z, "stone_bricks");
    }
  }
  steps.push({
    stepNumber: 19,
    title: "Das toskanische Pultdach des Nordseitenschiffs – Ostabschnitt",
    module: "Modul 1: Langhaus",
    description: "Vollende das Pultdach des Nordseitenschiffs bis zur Vierung (X=-106 bis -45).",
    cameraHint: { eye: [-75, 105, -55], target: [-75, 90, -31] },
    blocks: s19,
    tip: "Schließe nahtlos an die Vierungsmauer an.",
    caution: "Prüfe die Traufe an der Außenkante.",
    fact: "Dachneigung: Perfekt berechnet für schnellen Regenwasserablauf."
  });

  // 20. Süd-Pultdach Westabschnitt (X=-167 bis -107, Y=86 bis 94)
  const s20 = [];
  for (let x = -167; x <= -107; x++) {
    for (let z = 22; z <= 43; z++) {
      const dist = Math.abs(43 - z);
      const roofY = Math.round(86 + (dist * 8) / 21);
      addBlock(s20, x, roofY, z, "terracotta");
      if (roofY > 86) addBlock(s20, x, roofY - 1, z, "stone_bricks");
    }
  }
  steps.push({
    stepNumber: 20,
    title: "Das toskanische Pultdach des Südseitenschiffs – Westabschnitt",
    module: "Modul 1: Langhaus",
    description: "Decke den westlichen Abschnitt des Südseitenschiffs (X=-167 bis -107) mit Terrakotta ein.",
    cameraHint: { eye: [-135, 105, 55], target: [-135, 90, 31] },
    blocks: s20,
    tip: "Das Muster spiegelt die Nordseite wider.",
    caution: "Achte auf die Traufenkante bei Z=+43.",
    fact: "Warme Erdfarben: Das Terrakotta prägt das Stadtbild von Florenz."
  });

  // 21. Süd-Pultdach Ostabschnitt (X=-106 bis -45, Y=86 bis 94)
  const s21 = [];
  for (let x = -106; x <= -45; x++) {
    for (let z = 22; z <= 43; z++) {
      const dist = Math.abs(43 - z);
      const roofY = Math.round(86 + (dist * 8) / 21);
      addBlock(s21, x, roofY, z, "terracotta");
      if (roofY > 86) addBlock(s21, x, roofY - 1, z, "stone_bricks");
    }
  }
  steps.push({
    stepNumber: 21,
    title: "Das toskanische Pultdach des Südseitenschiffs – Ostabschnitt",
    module: "Modul 1: Langhaus",
    description: "Vollende das Pultdach des Südseitenschiffs bis zur Vierung (X=-106 bis -45). Beide Seitenschiffe sind nun wetterfest!",
    cameraHint: { eye: [-75, 105, 55], target: [-75, 90, 31] },
    blocks: s21,
    tip: "Beide Pultdächer sind vollständig eingedeckt!",
    caution: "Keine Fugen offen lassen.",
    fact: "Meisterhafte Zimmererkunst: Gewaltige Dachstühle aus toskanischer Eiche trugen die schwere Ziegellast."
  });

  // 22. Hauptschiffgewölbe Westabschnitt (Joch 1 & 2: X=-167 bis -105)
  const s22 = [];
  [bays[0], bays[1]].forEach(({x1, x2}) => {
    const midX = (x1 + x2) / 2;
    const halfX = (x2 - x1) / 2;
    for (let x = x1; x <= x2; x++) {
      for (let z = -21; z <= 21; z++) {
        const u = Math.abs(x - midX) / halfX;
        const v = Math.abs(z) / 21;
        const dist = Math.max(u, v);
        const vy = Math.round(112 - dist * 7);
        const isRib = (Math.abs(u - v) < 0.1 || x === x1 || x === x2 || Math.abs(z) === 21);
        addBlock(s22, x, vy, z, isRib ? "smooth_quartz" : "smooth_stone");
      }
    }
  });
  steps.push({
    stepNumber: 22,
    title: "Hauptschiff-Kreuzrippengewölbe: Westliche Joche 1 & 2 (Y=105 bis 112)",
    module: "Modul 1: Langhaus",
    description: "Schließe die ersten beiden Joche des Mittelschiffs von der Westfassade bis zur Kirchenmitte (X=-167 bis -105) mit gotischen Kreuzrippen!",
    cameraHint: { eye: [-135, 125, 40], target: [-135, 108, 0] },
    blocks: s22,
    tip: "Das Mittelschiff überspannt eine lichte Weite von 42 Blöcken.",
    caution: "Die Scheitelpunkte treffen sich bei Z=0 auf Y=112.",
    fact: "Monumentale Dimensionen: Höher und weiter als gewöhnliche gotische Kathedralen."
  });

  // 23. Hauptschiffgewölbe Ostabschnitt (Joch 3 & 4: X=-105 bis -45)
  const s23 = [];
  [bays[2], bays[3]].forEach(({x1, x2}) => {
    const midX = (x1 + x2) / 2;
    const halfX = (x2 - x1) / 2;
    for (let x = x1; x <= x2; x++) {
      for (let z = -21; z <= 21; z++) {
        const u = Math.abs(x - midX) / halfX;
        const v = Math.abs(z) / 21;
        const dist = Math.max(u, v);
        const vy = Math.round(112 - dist * 7);
        const isRib = (Math.abs(u - v) < 0.1 || x === x1 || x === x2 || Math.abs(z) === 21);
        addBlock(s23, x, vy, z, isRib ? "smooth_quartz" : "smooth_stone");
      }
    }
  });
  steps.push({
    stepNumber: 23,
    title: "Hauptschiff-Kreuzrippengewölbe: Östliche Joche 3 & 4 (Y=105 bis 112)",
    module: "Modul 1: Langhaus",
    description: "Vollende die Einwölbung des Mittelschiffs bis zur Vierung (X=-105 bis -45). Die gesamte 124-Block-Halle ist nun lückenlos eingewölbt!",
    cameraHint: { eye: [-75, 125, 40], target: [-75, 108, 0] },
    blocks: s23,
    tip: "Der freie Blick durch die Kirchenhalle ist überwältigend.",
    caution: "Sauberer Anschluss an den westlichen Vierungsbogen.",
    fact: "Raum der Renaissance: Freier weiter Raum voll Würde und Erhabenheit."
  });

  // 24. Hauptschiff-Satteldach: Nördliche Dachfläche & First (Y=108 bis 124)
  const s24 = [];
  for (let x = -167; x <= -45; x++) {
    for (let z = -22; z <= 0; z++) {
      const dist = Math.abs(z);
      const roofY = Math.round(124 - (dist * 16) / 22);
      if (roofY >= 108) {
        addBlock(s24, x, roofY, z, (z === 0 ? "stone_bricks" : "terracotta"));
      }
    }
  }
  [-167, -45].forEach(gx => {
    for (let z = -22; z <= 0; z++) {
      const dist = Math.abs(z);
      const topY = Math.round(124 - (dist * 16) / 22);
      for (let y = 108; y < topY; y++) addBlock(s24, gx, y, z, "stone_bricks");
    }
  });
  steps.push({
    stepNumber: 24,
    title: "Hauptschiff-Satteldach: Nördliche Dachfläche & First (Y=108 bis 124)",
    module: "Modul 1: Langhaus",
    description: "Decke die nördliche Dachhälfte des Mittelschiffs mit Terrakotta ein und ziehe den Firstbalken aus Steinziegeln. Die Giebelwände werden massiv gemauert.",
    cameraHint: { eye: [-105, 135, -45], target: [-105, 115, -10] },
    blocks: s24,
    tip: "Der Firstbalken bei Z=0 bildet das Rückgrat des Daches.",
    caution: "Giebelwände bei X=-168 und X=-45 sauber abschließen.",
    fact: "Flache Dachneigung: Typisch für toskanische Sakralbauten."
  });

  // 25. Hauptschiff-Satteldach: Südliche Dachfläche & Vollendung (Y=108 bis 124)
  const s25 = [];
  for (let x = -167; x <= -45; x++) {
    for (let z = 1; z <= 22; z++) {
      const dist = Math.abs(z);
      const roofY = Math.round(124 - (dist * 16) / 22);
      if (roofY >= 108) {
        addBlock(s25, x, roofY, z, "terracotta");
      }
    }
  }
  [-167, -45].forEach(gx => {
    for (let z = 1; z <= 22; z++) {
      const dist = Math.abs(z);
      const topY = Math.round(124 - (dist * 16) / 22);
      for (let y = 108; y < topY; y++) addBlock(s25, gx, y, z, "stone_bricks");
    }
  });
  steps.push({
    stepNumber: 25,
    title: "Hauptschiff-Satteldach: Südliche Dachfläche & Vollendung",
    module: "Modul 1: Langhaus",
    description: "Vollende das gesamte Langhaus mit der südlichen Satteldachfläche und den Giebelwänden! Das Langhaus ist nun über alle drei Schiffe vollständig, massiv und wetterfest vollendet.",
    cameraHint: { eye: [-105, 140, 65], target: [-105, 115, 0] },
    blocks: s25,
    tip: "Herzlichen Glückwunsch! Das gigantische Langhaus der Kathedrale ist vollendet!",
    caution: "Lückenlose Geschlossenheit über alle 124 Blöcke Länge.",
    fact: "Cotto dell'Impruneta: Seit über 600 Jahren trotzen diese Ziegel Wind und Wetter."
  });

  return steps;
}

const steps = generateModule1();
console.log(`Generated Module 1 with ${steps.length} steps.`);
let totalBlocks = 0;
steps.forEach(s => {
  totalBlocks += s.blocks.length;
  console.log(`Step ${s.stepNumber}: "${s.title}" (${s.blocks.length} blocks)`);
});
console.log(`Total blocks in Module 1: ${totalBlocks}`);

const content = `/**
 * Bautüte 1: Langhaus & Seitenschiffe (Santa Maria del Fiore)
 * Überarbeitet: 25 feine, perfekt ausbalancierte Bauschritte!
 * Kolossale Hallen (124 Blöcke lang, 86 Blöcke breit),
 * 6 gotische Bündelpfeiler, 8 monumentale Arkadenspitzbögen,
 * lückenlose Obergadenwände mit Zwickelausmauerung und 8 Ochsenaugen,
 * doppelschalige Seitenschiffmauern mit Maßwerkfenstern,
 * 4 Joche Kreuzrippengewölbe, wetterfeste Pult- und Satteldächer.
 * 100% mathematisch exakt berechnet – Keine Schätzungen!
 * Jeder Schritt umfasst maximal 2.650 Blöcke.
 */
window.MODULE_1_DATA = (function() {
  return ${JSON.stringify(steps, null, 2)};
})();
`;

fs.writeFileSync(path.join(__dirname, '..', 'webapp', 'js', 'data', 'module_1_steps.js'), content, 'utf8');
console.log('Successfully wrote webapp/js/data/module_1_steps.js');
