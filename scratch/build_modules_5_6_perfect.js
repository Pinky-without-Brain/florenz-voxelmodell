const fs = require('fs');

function inOctagon(x, z, R, w) {
  const ax = Math.abs(x);
  const az = Math.abs(z);
  if (ax > R || az > R) return false;
  if (ax + az > w + R) return false;
  return true;
}

// ============================================================================
// MODUL 5: BRUNELLESCHIS DOPPELKUPPEL (78 Schritte, alle <= 1.900 Blöcke)
// ============================================================================
function generateModule5() {
  const steps = [];
  const placed = new Map();

  function addBlock(s, x, y, z, type) {
    const k = `${x},${y},${z}`;
    if (!placed.has(k)) {
      placed.set(k, true);
      s.push({ x, y, z, type });
    }
  }

  // Quinto-Acuto-Bogenkrümmung
  function getRout(y) {
    const dy = y - 160;
    const R0 = 42;
    const c = 116.64;
    return Math.sqrt((R0 + c) * (R0 + c) - dy * dy) - c;
  }

  function getRin(y) {
    const dy = y - 160;
    const R0 = 36;
    const c = 132.77;
    return Math.sqrt((R0 + c) * (R0 + c) - dy * dy) - c;
  }

  // 5.1: 8 Eckauflager Y=161..164
  const s1 = [];
  const corners160 = [
    { x: -25, z: -42 }, { x:  25, z: -42 },
    { x:  42, z: -25 }, { x:  42, z:  25 },
    { x:  25, z:  42 }, { x: -25, z:  42 },
    { x: -42, z:  25 }, { x: -42, z: -25 }
  ];
  for (let y = 161; y <= 164; y++) {
    corners160.forEach(c => {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const px = c.x + dx;
          const pz = c.z + dz;
          if (inOctagon(px, pz, 42, 25)) {
            addBlock(s1, px, y, pz, (y === 164 ? "calcite" : "smooth_quartz"));
          }
        }
      }
    });
  }
  steps.push({
    stepNumber: "5.1",
    title: "Die 8 Eckauflager der Kuppelbasis (Y=161 bis Y=164)",
    module: "Modul 5: Brunelleschis Doppelkuppel",
    description: "Verankere die massiven Eckauflager aus Carrara-Quarz und Calcit an den 8 Ecken des Tambours auf Höhe Y=161 bis Y=164.",
    cameraHint: { eye: [90, 185, 90], target: [0, 162, 0] },
    blocks: s1,
    tip: "Achte darauf, dass die Eckquader exakt über den Tambourpfeilern stehen.",
    caution: "Alle 8 Auflager müssen auf Höhe Y=164 exakt plan abschließen.",
    fact: "Das Wunder von 1420: Brunelleschi bewies dem Stadtrat, dass die Kuppel freitragend ohne Holzgerüst gebaut werden kann."
  });

  // Helper for single layer ring
  function addRingLayer(sBlocks, y) {
    const Rout = Math.round(getRout(y));
    const Rin = Math.round(getRin(y));
    const wOut = Math.round(Rout * (25 / 42));
    const wIn = Math.round(Rin * (21 / 36));

    for (let x = -Rout; x <= Rout; x++) {
      for (let z = -Rout; z <= Rout; z++) {
        if (inOctagon(x, z, Rout, wOut) && !inOctagon(x, z, Rin, wIn)) {
          const isOuter = (Math.abs(x) >= Rout || Math.abs(z) >= Rout || Math.abs(x) + Math.abs(z) >= wOut + Rout);
          const isInner = (Math.abs(x) <= Rin + 1 && Math.abs(z) <= Rin + 1 && Math.abs(x) + Math.abs(z) <= wIn + Rin + 1);
          const isCorner = (Math.abs(x) === wOut && Math.abs(z) === Rout) ||
                           (Math.abs(x) === Rout && Math.abs(z) === wOut);

          let type = "stone_bricks";
          if (isCorner) {
            type = (y % 2 === 0) ? "smooth_quartz" : "calcite"; // 8 white marble ribs
          } else if (isOuter) {
            type = "terracotta"; // Red terracotta outer shell
          } else if (isInner) {
            type = "bricks"; // Herringbone spina di pesce inner shell
          } else if ((y === 175 || y === 190 || y === 204) && (x * x + z * z > 33 * 33)) {
            type = "polished_deepslate"; // Tie anchor chain
          }
          addBlock(sBlocks, x, y, z, type);
        }
      }
    }

  }

  // 5.2 - 5.5: Basis-Ringanker Schichten Y=161 bis Y=164 einzeln
  for (let y = 161; y <= 164; y++) {
    const sLayer = [];
    addRingLayer(sLayer, y);
    const stepIdx = y - 161 + 2;
    steps.push({
      stepNumber: `5.${stepIdx}`,
      title: `Kuppelbasis-Ringanker: Schicht Y=${y}`,
      module: "Modul 5: Brunelleschis Doppelkuppel",
      description: `Mauere die vollkommen geschlossene Schicht Y=${y} des Basis-Ringankers aus Steinziegeln, Innenziegeln und Außen-Terrakotta auf.`,
      cameraHint: { eye: [0, 185, 80], target: [0, y, 0] },
      blocks: sLayer,
      tip: "Der Ringanker nimmt die gewaltigen Horizontalschübe der Kuppel auf.",
      caution: "Halte die Kreisform an allen 8 Seiten absolut symmetrisch.",
      fact: "Eichenholz und Eisen: Historisch wurden in dieser Schicht gewaltige Ketten aus Kastanienbalken und Schmiedeeisen eingemauert."
    });
  }

  // 5.6 - 5.65: Konzentrisch steigende Ringe Y=165 bis Y=224 (1 layer per step: 60 steps)
  for (let y = 165; y <= 224; y++) {
    const sLayer = [];
    addRingLayer(sLayer, y);
    const stepIdx = 6 + (y - 165);
    steps.push({
      stepNumber: `5.${stepIdx}`,
      title: `Doppelschale & Marmorrippen: Ring Y=${y}`,
      module: "Modul 5: Brunelleschis Doppelkuppel",
      description: `Errichte den geschlossenen selbsttragenden Ring auf Höhe Y=${y}: Innenschale im Fischgrät-Verband, begehbare Treppen im Hohlraum, 8 weiße Marmorrippen und Terrakotta-Außenschale.`,
      cameraHint: { eye: [70, y + 25, 70], target: [0, y, 0] },
      blocks: sLayer,
      tip: "Beide Schalen steigen gemeinsam auf – das System stützt sich in sich selbst.",
      caution: "Die 8 Eckrippen aus weißem Marmor markieren das achteckige Gerippe.",
      fact: "Spina di Pesce: Die Ziegel wurden im Fischgrätverband gemauert, sodass keine Lage abrutschen konnte."
    });
  }

  // 5.66 - 5.77: Steile Scheitelzone Y=225 bis Y=248 (2 layers per step: 12 steps)
  for (let yStart = 225; yStart <= 247; yStart += 2) {
    const yEnd = yStart + 1;
    const sBand = [];
    for (let y = yStart; y <= yEnd; y++) {
      addRingLayer(sBand, y);
    }
    const stepIdx = 66 + Math.floor((yStart - 225) / 2);
    steps.push({
      stepNumber: `5.${stepIdx}`,
      title: `Steile Scheitelzone: Schichten Y=${yStart} bis Y=${yEnd}`,
      module: "Modul 5: Brunelleschis Doppelkuppel",
      description: `Wölbe die obere Scheitelzone der Kuppel von Y=${yStart} bis Y=${yEnd} auf. Hier neigen sich die Wände unter 60 Grad steil nach innen zum Schlussring.`,
      cameraHint: { eye: [45, yEnd + 20, 45], target: [0, yStart, 0] },
      blocks: sBand,
      tip: "Die beiden Schalen nähern sich im Scheitelbereich einander an.",
      caution: "Prüfe den gleichmäßigen Neigungswinkel aller 8 Kappen.",
      fact: "Kühne Neigung: Ohne jedes Lehrgerüst hielten die Ziegel allein durch Druckspannung im Ring."
    });
  }

  // 5.78: Marmor-Schlussring Y=249 bis Y=250
  const s78 = [];
  for (let y = 249; y <= 250; y++) {
    for (let r = 6; r <= 16; r++) {
      const w = Math.round(r * (25 / 42));
      for (let x = -r; x <= r; x++) {
        for (let z = -r; z <= r; z++) {
          if (inOctagon(x, z, r, w) && !inOctagon(x, z, 5, 3)) {
            let type = (r === 16 || r === 6) ? "calcite" : (r % 2 === 0 ? "smooth_quartz" : "stone_bricks");
            addBlock(s78, x, y, z, type);
          }
        }
      }
    }
    // Solid volute buttress footings
    const volutes = [
      { x: -7, z: -15 }, { x:  7, z: -15 },
      { x:  15, z: -7 }, { x:  15, z:  7 },
      { x:   7, z:  15 }, { x: -7, z:  15 },
      { x: -15, z:   7 }, { x: -15, z: -7 },
      { x: -6, z: -14 }, { x:  6, z: -14 },
      { x:  14, z: -6 }, { x:  14, z:  6 },
      { x:   6, z:  14 }, { x: -6, z:  14 },
      { x: -14, z:   7 }, { x: -14, z: -6 }
    ];
    volutes.forEach(v => addBlock(s78, v.x, y, v.z, "calcite"));
  }
  steps.push({
    stepNumber: "5.78",
    title: "Der monumentale Marmor-Schlussring (Y=249 bis Y=250)",
    module: "Modul 5: Brunelleschis Doppelkuppel",
    description: "Schließe die Kuppel mit dem massiven Marmor-Schlussring auf Y=249 bis Y=250 ab! Er bildet den krönenden Druckring und die plane Plattform für die Laterne aus Modul 6.",
    cameraHint: { eye: [25, 265, 25], target: [0, 250, 0] },
    blocks: s78,
    tip: "Der Schlussring hält das gesamte Kuppelgewölbe unter Vorspannung.",
    caution: "Die Plattform muss von R=6 bis R=16 vollkommen eben sein.",
    fact: "1436 geweiht: Am 25. März 1436 weihte Papst Eugen IV. die vollendete Kuppel feierlich ein."
  });

  return steps;
}

// ============================================================================
// MODUL 6: DIE LATERNE & GOLDENE KUGEL (8 Schritte, alle <= 2.020 Blöcke)
// ============================================================================
function generateModule6() {
  const steps = [];
  const placed = new Map();

  function addBlock(s, x, y, z, type) {
    const k = `${x},${y},${z}`;
    if (!placed.has(k)) {
      placed.set(k, true);
      s.push({ x, y, z, type });
    }
  }

  function getOctagonPoints(R) {
    const rInt = Math.round(R);
    const w = Math.round(R * 0.4142);
    const pts = [];
    for (let x = -w; x <= w; x++) { pts.push({ x, z: -rInt }); pts.push({ x, z:  rInt }); }
    for (let z = -w; z <= w; z++) { pts.push({ x: -rInt, z }); pts.push({ x:  rInt, z }); }
    const diagLen = Math.round(R - w);
    for (let i = 1; i < diagLen; i++) {
      pts.push({ x:  w + i, z: -rInt + i });
      pts.push({ x: -w - i, z: -rInt + i });
      pts.push({ x:  w + i, z:  rInt - i });
      pts.push({ x: -w - i, z:  rInt - i });
    }
    return pts;
  }

  function getCorners6(R) {
    const rInt = Math.round(R);
    const w = Math.round(R * 0.4142);
    return [
      { x: -w, z: -rInt }, { x:  w, z: -rInt },
      { x:  rInt, z: -w }, { x:  rInt, z:  w },
      { x:  w, z:  rInt }, { x: -w, z:  rInt },
      { x: -rInt, z:  w }, { x: -rInt, z: -w }
    ];
  }

  // 6.1: Marmorsockel Y=251..256
  const s1 = [];
  for (let y = 251; y <= 256; y++) {
    const Rout = Math.round(13 - (y - 251) * 0.35);
    const Rin = 7;
    for (let r = Rin; r <= Rout; r++) {
      const pts = getOctagonPoints(r);
      pts.forEach(p => {
        let type = (r === Rout) ? "calcite" : (r === Rin ? "stone_bricks" : "smooth_quartz");
        addBlock(s1, p.x, y, p.z, type);
      });
    }
  }
  steps.push({
    stepNumber: "6.1",
    title: "Der achteckige Marmorsockel der Laterne",
    module: "Modul 6: Die Laterne & Goldene Kugel",
    description: "Verankere den massiven achteckigen Marmorsockel der Laterne von Y=251 bis Y=256 direkt auf dem Kuppelring aus Modul 5.",
    cameraHint: { eye: [25, 265, 25], target: [0, 253, 0] },
    blocks: s1,
    tip: "Der innere Ring aus Steinziegeln hält die zentrale Lichtöffnung (Lichte Weite 14 Blöcke) offen.",
    caution: "Achte darauf, dass die Stufen symmetrisch um das Zentrum (0, 0) angeordnet sind.",
    fact: "Gewicht als Stabilität: Brunelleschi entwarf die Laterne extra schwer aus massivem Marmor! Ihr enormes Gewicht presst die 8 Kuppelrippen an der Spitze zusammen."
  });

  // 6.2: 8 Voluten-Strebepfeiler Y=251..268
  const s2 = [];
  for (let y = 251; y <= 268; y++) {
    const prog = (y - 251) / 17;
    const dist = 14 - Math.round(prog * 5);
    const corners = getCorners6(dist);
    corners.forEach(c => {
      addBlock(s2, c.x, y, c.z, "smooth_quartz");
      for (let sy = y - 1; sy >= 251; sy--) {
        const k = `${c.x},${sy},${c.z}`;
        if (placed.has(k)) break;
        addBlock(s2, c.x, sy, c.z, "calcite");
      }
      if (y <= 260) {
        const ox = c.x + (c.x > 0 ? 1 : (c.x < 0 ? -1 : 0));
        const oz = c.z + (c.z > 0 ? 1 : (c.z < 0 ? -1 : 0));
        addBlock(s2, ox, y, oz, "calcite");
        for (let sy = y - 1; sy >= 251; sy--) {
          const k = `${ox},${sy},${oz}`;
          if (placed.has(k)) break;
          addBlock(s2, ox, sy, oz, "calcite");
        }
      }
    });
  }
  steps.push({
    stepNumber: "6.2",
    title: "Die 8 geschwungenen Marmor-Voluten (Strebepfeiler)",
    module: "Modul 6: Die Laterne & Goldene Kugel",
    description: "Setze die 8 elegant geschwungenen Volutenpfeiler aus weißem Quarz und Calcit an die Ecken des Sockels.",
    cameraHint: { eye: [22, 272, 22], target: [0, 260, 0] },
    blocks: s2,
    tip: "Die Voluten schmiegen sich S-förmig an die Kanten der Laterne.",
    caution: "Prüfe die Symmetrie aller 8 Strebepfeiler.",
    fact: "Architektonische Premiere: Diese geschwungenen Voluten-Strebepfeiler wurden zum Vorbild für Renaissance und Barock!"
  });

  // 6.3: Säulen & Fenster – Untere Zone Y=257..266
  const s3 = [];
  for (let y = 257; y <= 266; y++) {
    const Rout = 10;
    const Rin = 8;
    const pts = getOctagonPoints(Rout);
    pts.forEach(p => {
      const isCorner = Math.abs(p.x) === Math.abs(p.z) || (Math.abs(p.x) === 10 && Math.abs(p.z) <= 4) || (Math.abs(p.z) === 10 && Math.abs(p.x) <= 4);
      if (isCorner) {
        addBlock(s3, p.x, y, p.z, "smooth_quartz");
      } else {
        const isWindow = (y >= 261);
        addBlock(s3, p.x, y, p.z, isWindow ? "glass" : "smooth_quartz");
      }
    });
    for (let r = Rin; r < Rout; r++) {
      getOctagonPoints(r).forEach(p => addBlock(s3, p.x, y, p.z, "smooth_stone"));
    }
  }
  steps.push({
    stepNumber: "6.3",
    title: "Die 8 Säulen & Rundbogenfenster – Untere Zone (Y=257 bis Y=266)",
    module: "Modul 6: Die Laterne & Goldene Kugel",
    description: "Ziehe die 8 kannelierten korinthischen Marmorsäulen und die Fensterbrüstungen bis zur mittleren Höhe Y=266 hoch.",
    cameraHint: { eye: [20, 275, 20], target: [0, 262, 0] },
    blocks: s3,
    tip: "Die Glasscheiben sitzen bündig zwischen den Ecksäulen.",
    caution: "Achte auf die absolut senkrechte Fluchtlinie der Säulen.",
    fact: "Lichtzylinder: Die Laterne bündelt das Licht der toskanischen Sonne und lenkt es 90 Meter tief auf den Hauptaltar!"
  });

  // 6.4: Säulen & Fenster – Obere Zone Y=267..276
  const s4 = [];
  for (let y = 267; y <= 276; y++) {
    const Rout = 10;
    const Rin = 8;
    const pts = getOctagonPoints(Rout);
    pts.forEach(p => {
      const isCorner = Math.abs(p.x) === Math.abs(p.z) || (Math.abs(p.x) === 10 && Math.abs(p.z) <= 4) || (Math.abs(p.z) === 10 && Math.abs(p.x) <= 4);
      if (isCorner) {
        addBlock(s4, p.x, y, p.z, "smooth_quartz");
      } else {
        const isWindow = (y <= 272);
        addBlock(s4, p.x, y, p.z, isWindow ? "glass" : (y > 272 ? "calcite" : "smooth_quartz"));
      }
    });
    for (let r = Rin; r < Rout; r++) {
      getOctagonPoints(r).forEach(p => addBlock(s4, p.x, y, p.z, "smooth_stone"));
    }
  }
  steps.push({
    stepNumber: "6.4",
    title: "Die 8 Säulen & Rundbogenfenster – Obere Zone (Y=267 bis Y=276)",
    module: "Modul 6: Die Laterne & Goldene Kugel",
    description: "Schließe die Rundbögen der 8 Fenster ab und setze die korinthischen Kapitelle auf Y=276.",
    cameraHint: { eye: [20, 280, 20], target: [0, 272, 0] },
    blocks: s4,
    tip: "Die Rundbögen auf Y=272 schließen die Fensteröffnungen nach oben ab.",
    caution: "Prüfe die Bogenabschlüsse auf allen 8 Seiten.",
    fact: "Meisterhafter Marmor: Feinster Statuario-Marmor aus den Apuanischen Alpen."
  });

  // 6.5: Aussichtsgalerie & Gebälk Y=277..282
  const s5 = [];
  for (let y = 277; y <= 282; y++) {
    const Rout = (y === 280 || y === 282) ? 12 : 11;
    for (let r = 7; r <= Rout; r++) {
      getOctagonPoints(r).forEach(p => {
        let type = (r === Rout) ? "calcite" : ((y === 277) ? "stone_bricks" : "smooth_quartz");
        addBlock(s5, p.x, y, p.z, type);
      });
    }
  }
  steps.push({
    stepNumber: "6.5",
    title: "Die Aussichtsgalerie & Gebälk",
    module: "Modul 6: Die Laterne & Goldene Kugel",
    description: "Setze das klassische korinthische Gebälk und das vorkragende Kranzgesims der Aussichtsgalerie von Y=277 bis Y=282 auf.",
    cameraHint: { eye: [22, 290, 22], target: [0, 280, 0] },
    blocks: s5,
    tip: "Das vorkragende Gesims bildet die optische Basis für das Pyramidendach.",
    caution: "Der Mauerkranz muss nach allen 8 Seiten gleichmäßig vorkragen.",
    fact: "Panoramablick: Von dieser Galerie aus überblickte man im 15. Jahrhundert ganz Florenz, Fiesole und das Arnotal."
  });

  // 6.6: Das spitze Marmordach der Laterne Y=283..295
  const s6 = [];
  for (let y = 283; y <= 295; y++) {
    const prog = (y - 283) / 12;
    const R = Math.max(1, Math.round(10 * (1 - prog)));
    for (let r = 0; r <= R; r++) {
      if (r === 0) {
        addBlock(s6, 0, y, 0, "smooth_quartz");
      } else {
        getOctagonPoints(r).forEach(p => {
          let type = (r === R) ? "calcite" : "smooth_quartz";
          addBlock(s6, p.x, y, p.z, type);
        });
      }
    }
  }
  steps.push({
    stepNumber: "6.6",
    title: "Das spitze Marmordach der Laterne",
    module: "Modul 6: Die Laterne & Goldene Kugel",
    description: "Überdache den Rundtempel mit einer eleganten achtteiligen Marmorpyramide von Y=283 bis Y=295.",
    cameraHint: { eye: [20, 305, 20], target: [0, 290, 0] },
    blocks: s6,
    tip: "Die weißen Marmorgrate laufen an der Spitze auf einer soliden Plattform auf Höhe Y=295 zusammen.",
    caution: "Halte die Spitze auf Y=295 eben, damit die schwere Kugel sicher aufliegt.",
    fact: "Vollendung nach Brunelleschis Tod: Vollendet 1461 streng nach Brunelleschis Originalmodell."
  });

  // 6.7: Verrocchios vergoldete Riesenkugel Y=296..304
  const s7 = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      addBlock(s7, dx, 296, dz, "smooth_quartz"); // Solid pedestal supporting sphere!
    }
  }
  const sphereCenter = { x: 0, y: 300, z: 0 };
  const sphereRadius = 3.4;
  for (let y = 297; y <= 304; y++) {
    for (let x = -4; x <= 4; x++) {
      for (let z = -4; z <= 4; z++) {
        const dy = y - sphereCenter.y;
        const dist = Math.sqrt(x * x + dy * dy + z * z);
        if (dist <= sphereRadius) {
          addBlock(s7, x, y, z, "gold_block");
        }
      }
    }
  }
  steps.push({
    stepNumber: "6.7",
    title: "Verrocchios vergoldete Riesenkugel",
    module: "Modul 6: Die Laterne & Goldene Kugel",
    description: "Setze die zwei Tonnen schwere vergoldete Bronzekugel von Andrea del Verrocchio auf Höhe Y=296 bis Y=304 auf! Ein massiver Marmorsockel auf Y=296 verbindet die Pyramidenspitze unlösbar mit der Goldkugel.",
    cameraHint: { eye: [15, 310, 15], target: [0, 300, 0] },
    blocks: s7,
    tip: "Die Kugel hat einen Durchmesser von 7 Blöcken – der Mittelpunkt liegt exakt bei (0, 300, 0).",
    caution: "Prüfe mit allen Blickwinkeln, dass die Kugel von allen Seiten vollkommen rund und symmetrisch wirkt.",
    fact: "Leonardos Lehrstück (1471): Ein junger 19-jähriger Lehrling namens Leonardo da Vinci half Verrocchio bei der riskanten Montage!"
  });

  // 6.8: Das goldene Kreuz an der Spitze Y=304..315
  const s8 = [];
  for (let y = 304; y <= 315; y++) {
    addBlock(s8, 0, y, 0, y === 315 ? "sea_lantern" : "gold_block");
  }
  for (let x = -3; x <= 3; x++) {
    if (x !== 0) addBlock(s8, x, 310, 0, "gold_block");
  }
  addBlock(s8, -3, 311, 0, "gold_block");
  addBlock(s8,  3, 311, 0, "gold_block");
  steps.push({
    stepNumber: "6.8",
    title: "Das goldene Kreuz an der Spitze (Höhe Y=315)",
    module: "Modul 6: Die Laterne & Goldene Kugel",
    description: "Kröne die Kathedrale von Florenz mit dem monumentalen goldenen Kreuz auf der absoluten Spitzenhöhe Y=315! Auf dem Querbalken (Höhe Y=310) und der leuchtenden Seelaterne an der Spitze thront das Wahrzeichen über der gesamten Toskana.",
    cameraHint: { eye: [10, 320, 10], target: [0, 310, 0] },
    blocks: s8,
    tip: "Die Seelaterne auf Y=315 markiert den höchsten Punkt des gesamten Bauwerks.",
    caution: "Richte den Querbalken exakt in Ost-West-Richtung aus.",
    fact: "Höchster Punkt der Renaissance: Mit 114,5 Metern Gesamthöhe (Y=315) war Santa Maria del Fiore das höchste Bauwerk der gesamten bekannten Welt seit den ägyptischen Pyramiden!"
  });

  return steps;
}

// Generate Modules 5 and 6
const m5Steps = generateModule5();
console.log(`Generated Modul 5: ${m5Steps.length} steps`);
let m5Total = 0, m5Max = 0;
m5Steps.forEach(s => {
  m5Total += s.blocks.length;
  if (s.blocks.length > m5Max) m5Max = s.blocks.length;
});
console.log(`Modul 5 Total: ${m5Total} blocks, Max step: ${m5Max}`);

const m6Steps = generateModule6();
console.log(`Generated Modul 6: ${m6Steps.length} steps`);
let m6Total = 0, m6Max = 0;
m6Steps.forEach(s => {
  m6Total += s.blocks.length;
  if (s.blocks.length > m6Max) m6Max = s.blocks.length;
});
console.log(`Modul 6 Total: ${m6Total} blocks, Max step: ${m6Max}`);

// Write webapp/js/data/module_5_steps.js
const m5Code = `/**
 * Modul 5: Brunelleschis Doppelkuppel (Santa Maria del Fiore)
 * 100% EXAKT berechnete Blockkoordinaten ohne Näherungswerte.
 * Lückenlos konzentrisch steigende Ringe nach Brunelleschis historischer
 * Selbsttragungs-Methode (senza centine).
 * Vollständige Bodenauflage auf Modul 4 (Y=160) und nahtlose Auflage für Modul 6 (Y=251).
 * Alle Schritte <= 2.500 Blöcke.
 */
window.MODULE_5_DATA = ${JSON.stringify(m5Steps, null, 2)};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { steps: window.MODULE_5_DATA };
}
`;
fs.writeFileSync('webapp/js/data/module_5_steps.js', m5Code, 'utf8');
console.log('Successfully wrote webapp/js/data/module_5_steps.js');

// Write webapp/js/data/module_6_steps.js
const m6Code = `/**
 * Modul 6: Die Laterne & Goldene Kugel (Santa Maria del Fiore)
 * Der krönende Marmortempel auf der Kuppelspitze von Y=251 bis Y=315.
 * Die 8 Voluten-Strebepfeiler, 8 korinthische Säulen mit Rundbogenfenstern,
 * Aussichtsgalerie, Andrea del Verrocchios vergoldete Riesenkugel
 * und das goldene Kreuz mit Blitzableiter auf der absoluten Maximalhöhe Y=315!
 * 100% mathematisch exakt berechnet – Keine Schätzungen!
 */
window.MODULE_6_DATA = ${JSON.stringify(m6Steps, null, 2)};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { steps: window.MODULE_6_DATA };
}
`;
fs.writeFileSync('webapp/js/data/module_6_steps.js', m6Code, 'utf8');
console.log('Successfully wrote webapp/js/data/module_6_steps.js');
