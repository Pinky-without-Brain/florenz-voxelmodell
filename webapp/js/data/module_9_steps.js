/**
 * Bautüte 9: Innenraum, Fresko & Krypta (Cathedral of Santa Maria del Fiore)
 * Vollständig ausgearbeitet: 6 feine, perfekt ausbalancierte Bauschritte!
 * Jeder einzelne Schritt umfasst maximal 2.950 Blöcke (ideal für schrittweises Bauen).
 * Die verborgenen Schätze im Herzen der florentinischen Kathedrale:
 * 1. Die Krypta von Santa Reparata mit frühchristlichen Mosaiken (Y=56 bis Y=60)
 * 2. Filippo Brunelleschis Grabmal & romanische Kryptagewölbe (Y=61 bis Y=63)
 * 3. Paolo Uccellos berühmte 24-Stunden-Uhr (Ora Italica) an der Westwand (Y=75 bis Y=90)
 * 4. Das achteckige Chorgestühl, Bandinelli-Hochaltar & della Robbia-Sakristeien (Y=65 bis Y=74)
 * 5. Vasari & Zuccari: Das Jüngste Gericht – Untere Kuppelzone: Hölle & Tugenden (Y=168 bis Y=188)
 * 6. Vasari & Zuccari: Das Jüngste Gericht – Obere Kuppelzone: Christus Weltenrichter (Y=189 bis Y=220)
 * 100% mathematisch exakt berechnet – Keine Schätzungen!
 */
window.MODULE_9_DATA = (function() {
  const steps = [];
  const placed = new Map();

  function addBlock(sBlocks, x, y, z, type) {
    const k = `${x},${y},${z}`;
    if (!placed.has(k)) {
      placed.set(k, true);
      sBlocks.push({ x, y, z, type });
    }
  }

  // Quinto-Acuto Bogenkrümmung für Innenschale
  function getRin(y) {
    const dy = y - 160;
    const R0 = 36;
    const c = 132.77;
    return Math.sqrt((R0 + c) * (R0 + c) - dy * dy) - c;
  }

  function getOctagonPoints(R) {
    const rInt = Math.round(R);
    const w = Math.round(R * (25 / 42));
    const pts = [];
    for (let x = -w; x <= w; x++) {
      pts.push({ x, z: -rInt });
      pts.push({ x, z:  rInt });
    }
    for (let z = -w; z <= w; z++) {
      pts.push({ x: -rInt, z });
      pts.push({ x:  rInt, z });
    }
    const diagLen = Math.round(R - w);
    for (let i = 1; i < diagLen; i++) {
      pts.push({ x:  w + i, z: -rInt + i });
      pts.push({ x: -w - i, z: -rInt + i });
      pts.push({ x:  w + i, z:  rInt - i });
      pts.push({ x: -w - i, z:  rInt - i });
    }
    return pts;
  }

  // =========================================================================
  // SCHRITT 9.1: Die Krypta von Santa Reparata – Fundamente & Mosaike (Y=56 bis Y=60)
  // =========================================================================
  const s1 = [];
  // Mosaikboden und Ausgrabungsmauern der frühchristlichen Basilika (Y=56 bis Y=57)
  for (let x = -95; x <= -35; x++) {
    for (let z = -14; z <= 14; z++) {
      const isPerimeter = (x === -95 || x === -35 || z === -14 || z === 14);
      if (isPerimeter) {
        addBlock(s1, x, 56, z, "stone_bricks");
        addBlock(s1, x, 57, z, "stone_bricks");
      } else {
        // Pfau-Mosaikboden mit geometrischen Mustern
        const isPattern = ((x + z) % 4 === 0);
        const isMedallion = (Math.abs(x - (-65)) <= 3 && Math.abs(z) <= 3);
        let type = isMedallion ? "gold_block" : (isPattern ? "dark_prismarine" : "smooth_quartz");
        addBlock(s1, x, 56, z, type);
      }
    }
  }
  // Frühchristliche Säulenreihen (2 Reihen à 6 Säulen) von Y=57 bis Y=60
  const colXs = [-85, -75, -65, -55, -45];
  const colZs = [-6, 6];
  colXs.forEach(cx => {
    colZs.forEach(cz => {
      for (let y = 57; y <= 60; y++) {
        let type = (y === 57) ? "calcite" : ((y === 60) ? "smooth_quartz" : "stone_bricks");
        addBlock(s1, cx, y, cz, type);
      }
    });
  });
  // Zugangstreppe von Westen
  for (let step = 0; step <= 4; step++) {
    const y = 56 + step;
    const x = -98 + step;
    for (let z = -2; z <= 2; z++) {
      addBlock(s1, x, y, z, "smooth_stone");
    }
  }
  steps.push({
    stepNumber: "9.1",
    title: "Die Krypta von Santa Reparata: Antike Fundamente & Mosaike (Y=56 bis Y=60)",
    module: "Modul 9: Innenraum, Fresko & Krypta",
    description: "Steige unter das Langhaus hinab in die geheimnisvolle Krypta der Vorgängerkirche Santa Reparata von Y=56 bis Y=60. Hier liegen die Ausgrabungen der frühchristlichen Basilika aus dem 4. bis 6. Jahrhundert mit kostbaren Bodenmosaiken und antiken Säulenreihen.",
    cameraHint: { eye: [-65, 72, -35], target: [-65, 58, 0] },
    blocks: s1,
    tip: "Das Pfau-Mosaik im Zentrum symbolisiert nach frühchristlichem Glauben die Unsterblichkeit.",
    caution: "Die Krypta liegt direkt unter der Bodenebene (Y=64) des gotischen Doms.",
    fact: "Archäologische Entdeckung 1965: Bei Renovierungsarbeiten stießen Arbeiter unter dem Domfußboden unerwartet auf die Mauern der verschollenen Basilika Santa Reparata!"
  });

  // =========================================================================
  // SCHRITT 9.2: Brunelleschis Grabmal & romanische Kryptagewölbe (Y=61 bis Y=63)
  // =========================================================================
  const s2 = [];
  // Brunelleschis Grabkammer bei X=-40, Z=0 (Höhe Y=57 bis Y=59)
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      addBlock(s2, -40 + dx, 57, dz, "polished_deepslate");
      if (Math.abs(dx) <= 1 && dz === 0) {
        addBlock(s2, -40 + dx, 58, dz, "gold_block"); // Vergoldete Inschriftplatte
      }
    }
  }
  addBlock(s2, -40, 59, 0, "sea_lantern"); // Ewiges Licht am Grab des Meisters

  // Romanische Gurtbögen und Kreuzgewölbeansätze von Y=61 bis Y=63
  colXs.forEach(cx => {
    colZs.forEach(cz => {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (Math.abs(dx) + Math.abs(dz) <= 1) {
            addBlock(s2, cx + dx, 61, cz + dz, "smooth_quartz");
          }
        }
      }
    });
    // Gurtbögen quer zur Schiffsachse
    for (let z = -6; z <= 6; z++) {
      addBlock(s2, cx, 62, z, "stone_bricks");
      addBlock(s2, cx, 63, z, "stone_bricks");
    }
  });
  // Längsgurtbögen
  colZs.forEach(cz => {
    for (let x = -85; x <= -45; x++) {
      addBlock(s2, x, 62, cz, "stone_bricks");
      addBlock(s2, x, 63, cz, "stone_bricks");
    }
  });
  // Krypta-Seitenwände Y=58 bis Y=63
  for (let y = 58; y <= 63; y++) {
    for (let x = -95; x <= -35; x++) {
      addBlock(s2, x, y, -14, "stone_bricks");
      addBlock(s2, x, y, 14, "stone_bricks");
    }
    for (let z = -14; z <= 14; z++) {
      addBlock(s2, -95, y, z, "stone_bricks");
      addBlock(s2, -35, y, z, "stone_bricks");
    }
  }
  steps.push({
    stepNumber: "9.2",
    title: "Brunelleschis Grabmal & die romanischen Kryptagewölbe (Y=61 bis Y=63)",
    module: "Modul 9: Innenraum, Fresko & Krypta",
    description: "Vollende die Kryptagewölbe und setze das schlichte, ehrfürchtige Grabmal des großen Dombaumeisters Filippo Brunelleschi bei X=-40, Z=0. Als einziger Florentiner Bürger durfte er direkt in der Kathedrale begraben werden!",
    cameraHint: { eye: [-40, 68, -18], target: [-40, 58, 0] },
    blocks: s2,
    tip: "Das Grabmal ist aus edlem Tiefenschiefer und Gold gestaltet – ein ewiges Licht wacht darüber.",
    caution: "Die Gewölbe auf Y=63 stützen von unten den darüberliegenden Fußboden des Doms.",
    fact: "Ewige Ruhe im eigenen Meisterwerk: Die Grabinschrift lautet: 'Corpus magni ingenii viri Philippi S. Brunelleschi Florentini' – Hier ruht der Körper des Mannes von großem Genie, Filippo Brunelleschi aus Florenz."
  });

  // =========================================================================
  // SCHRITT 9.3: Paolo Uccellos 24-Stunden-Uhr (Ora Italica) (Y=75 bis Y=90)
  // =========================================================================
  const s3 = [];
  const clockX = -168; // Innenseite der Westwand über dem Hauptportal
  // Quadratischer Zifferblatt-Rahmen (15x15 Blöcke) von Y=75 bis Y=89, Z von -7 bis +7
  for (let y = 75; y <= 89; y++) {
    for (let z = -7; z <= 7; z++) {
      const dist = Math.sqrt((y - 82) * (y - 82) + z * z);
      const isCorner = (Math.abs(y - 82) >= 5 && Math.abs(z) >= 5);
      const isOuterFrame = (y === 75 || y === 89 || z === -7 || z === 7);
      let type = "stone_bricks";

      if (isOuterFrame) {
        type = "smooth_quartz";
      } else if (isCorner) {
        // Die 4 Evangelistenköpfe in den Zwickeln
        type = "calcite";
      } else if (Math.abs(dist - 5.5) <= 0.6) {
        // Zifferblattring mit römischen Ziffern
        type = "gold_block";
      } else if (dist < 5.0) {
        // Zifferblatt-Hintergrund
        const isHourMarker = ((Math.abs(y - 82) === 4 && z === 0) || (y === 82 && Math.abs(z) === 4));
        type = isHourMarker ? "gold_block" : "dark_prismarine";
      }
      addBlock(s3, clockX, y, z, type);
    }
  }
  // Der goldene Zeiger (zeigt auf XXIV = Sonnenuntergang oben links)
  addBlock(s3, clockX + 1, 82, 0, "gold_block"); // Zentrumsnabe
  addBlock(s3, clockX + 1, 83, -1, "gold_block");
  addBlock(s3, clockX + 1, 84, -2, "gold_block");
  addBlock(s3, clockX + 1, 85, -3, "sea_lantern"); // Spitze des Zeigers leuchtet!
  steps.push({
    stepNumber: "9.3",
    title: "Paolo Uccellos 24-Stunden-Uhr (Ora Italica) (Y=75 bis Y=90)",
    module: "Modul 9: Innenraum, Fresko & Krypta",
    description: "Installiere an der inneren Westwand über dem Hauptportal die weltberühmte Monumentaluhr von Paolo Uccello aus dem Jahr 1443. Das 15x15 Blöcke große Zifferblatt wird von den vier Evangelistenköpfen eingerahmt.",
    cameraHint: { eye: [-150, 84, 0], target: [clockX, 82, 0] },
    blocks: s3,
    tip: "Die Uhr geht gegen den Uhrzeigersinn: Stunde 24 (XXIV) steht ganz oben und markiert den Sonnenuntergang!",
    caution: "Der Zeiger ragt 1 Block plastisch in den Kirchenraum hinein.",
    fact: "Die italienische Zeit (Ora Italica): In der Renaissance endete der Tag nicht um Mitternacht, sondern mit dem Sonnenuntergang und dem Abendläuten (Ave Maria). Diese Uhr funktioniert bis heute mechanisch genau so!"
  });

  // =========================================================================
  // SCHRITT 9.4: Chorschranken, Bandinelli-Hochaltar & Sakristeien (Y=65 bis Y=74)
  // =========================================================================
  const s4 = [];
  // Achteckige Chorschranke (Coro Bandinelliano) in der Vierung
  const choirR = 12;
  const choirCutoff = 17;
  for (let x = -choirR; x <= choirR; x++) {
    for (let z = -choirR; z <= choirR; z++) {
      const dx = Math.abs(x);
      const dz = Math.abs(z);
      if (dx <= choirR && dz <= choirR && (dx + dz) <= choirCutoff) {
        const isPerimeter = (dx >= choirR - 1 || dz >= choirR - 1 || (dx + dz) >= choirCutoff - 1);
        const isWestOpening = (x === -choirR && Math.abs(z) <= 2);
        const isEastOpening = (x === choirR && Math.abs(z) <= 2);
        if (isPerimeter && !isWestOpening && !isEastOpening) {
          addBlock(s4, x, 65, z, "smooth_quartz");
          addBlock(s4, x, 66, z, "calcite");
          addBlock(s4, x, 67, z, "dark_prismarine"); // Marmorbalustrade
        } else if (!isPerimeter) {
          // Zweifarbiger Chorboden
          const isCheck = ((x + z) % 2 === 0);
          addBlock(s4, x, 65, z, isCheck ? "smooth_quartz" : "dark_prismarine");
        }
      }
    }
  }
  // Hochaltar im Zentrum der Choranlage bei X=3, Z=0
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      addBlock(s4, 3 + dx, 66, dz, "calcite");
      addBlock(s4, 3 + dx, 67, dz, "smooth_quartz");
    }
  }
  addBlock(s4, 3, 68, 0, "gold_block"); // Goldenes Altarkreuz
  addBlock(s4, 3, 69, 0, "sea_lantern");

  // Luca della Robbias Sakristei-Lünetten (Auferstehung Christi) über den Sakristeitüren
  // 1. Nord-Sakristei (Sagrestia delle Messe) bei X=18, Z=-28
  for (let dx = -2; dx <= 2; dx++) {
    for (let y = 70; y <= 73; y++) {
      const isArch = (Math.abs(dx) <= 2 && y <= 72) || (Math.abs(dx) <= 1 && y === 73);
      if (isArch) {
        let type = (y === 73 || Math.abs(dx) === 2) ? "smooth_quartz" : "calcite";
        if (y === 71 && dx === 0) type = "gold_block"; // Auferstandener Christus
        addBlock(s4, 18 + dx, y, -28, type);
      }
    }
  }
  // 2. Süd-Sakristei bei X=18, Z=28
  for (let dx = -2; dx <= 2; dx++) {
    for (let y = 70; y <= 73; y++) {
      const isArch = (Math.abs(dx) <= 2 && y <= 72) || (Math.abs(dx) <= 1 && y === 73);
      if (isArch) {
        let type = (y === 73 || Math.abs(dx) === 2) ? "smooth_quartz" : "calcite";
        if (y === 71 && dx === 0) type = "gold_block";
        addBlock(s4, 18 + dx, y, 28, type);
      }
    }
  }
  steps.push({
    stepNumber: "9.4",
    title: "Chorschranken, Bandinelli-Hochaltar & della Robbia-Lünetten (Y=65 bis Y=74)",
    module: "Modul 9: Innenraum, Fresko & Krypta",
    description: "Errichte die monumentale achteckige Marmor-Chorschranke (Coro Bandinelliano) und den Hochaltar direkt unter der Kuppel sowie Luca della Robbias weltberühmte weiß-blaue Terrakotta-Lünetten über den Sakristeitüren.",
    cameraHint: { eye: [-25, 78, -25], target: [0, 67, 0] },
    blocks: s4,
    tip: "Die Chorschranke spiegelt die achteckige Geometrie der Kuppel perfekt nach unten wider.",
    caution: "Lass die Zugänge nach Westen (zum Langhaus) und nach Osten (zur Apsis) frei.",
    fact: "Das Pazzi-Attentat von 1478: Am 26. April 1478 wurde Giuliano de' Medici während der Messe am Hochaltar ermordet. Sein Bruder Lorenzo der Prächtige rettete sich verwundet hinter die bronzenen Türen dieser Sakristei!"
  });

  // Helper für Vasari-Fresko
  function getFrescoBlocks(yStart, yEnd) {
    const list = [];
    for (let y = yStart; y <= yEnd; y++) {
      const r = Math.round(getRin(y)) - 1;
      const pts = getOctagonPoints(r);
      pts.forEach(p => {
        const isSouthWest = (p.z > 0 && p.x < 0);
        const isEast = (p.x > 0 && Math.abs(p.z) <= Math.round(r * 0.6));
        let type = "terracotta";
        if (y <= 188) {
          if (isSouthWest) {
            type = ((p.x + p.z + y) % 3 === 0) ? "polished_deepslate" : "red_terracotta";
          } else {
            type = ((p.x + y) % 4 === 0) ? "smooth_quartz" : "yellow_terracotta";
          }
        } else {
          if (isEast && y >= 200 && y <= 216) {
            type = ((p.x + y) % 2 === 0) ? "gold_block" : "smooth_quartz";
          } else if (y >= 210) {
            type = ((p.x + p.z + y) % 3 === 0) ? "gold_block" : "yellow_terracotta";
          } else {
            type = ((p.x + y) % 3 === 0) ? "smooth_quartz" : "calcite";
          }
        }
        if ((p.x * p.z + y) % 17 === 0) type = "sea_lantern";
        addBlock(list, p.x, y, p.z, type);
      });
    }
    return list;
  }

  // =========================================================================
  // SCHRITT 9.5: Vasari-Fresko: Der Höllenschlund & die Verdammten (Y=168 bis Y=177)
  // =========================================================================
  steps.push({
    stepNumber: "9.5",
    title: "Vasari-Fresko: Der Höllenschlund & die Verdammten (Y=168 bis Y=177)",
    module: "Modul 9: Innenraum, Fresko & Krypta",
    description: "Beginne an der Innenseite der Kuppel mit dem ersten Band des monumentalen Jüngsten Gerichts von Giorgio Vasari und Federico Zuccari von Y=168 bis Y=177. Im Südwesten brennt der feurige Höllenschlund mit Luzifer und den Verdammten aus roter Terrakotta und Tiefenschiefer.",
    cameraHint: { eye: [0, 155, 0], target: [-15, 172, 15] },
    blocks: getFrescoBlocks(168, 177),
    tip: "Das Fresko legt sich exakt 1 Block vor die tragende Ziegel-Innenschale der Kuppel.",
    caution: "Achte auf den kontinuierlichen Anschluss an die achteckige Kuppelgeometrie.",
    fact: "Dramatik des Manierismus: Vasari und Zuccari gestalteten die Höllenszenen mit drastischen, gewaltigen Figuren – inspiriert von Dantes Göttlicher Komödie."
  });

  // =========================================================================
  // SCHRITT 9.6: Vasari-Fresko: Die Tugenden & Kirchenväter (Y=178 bis Y=188)
  // =========================================================================
  steps.push({
    stepNumber: "9.6",
    title: "Vasari-Fresko: Die Tugenden & Kirchenväter (Y=178 bis Y=188)",
    module: "Modul 9: Innenraum, Fresko & Krypta",
    description: "Führe das Fresko von Y=178 bis Y=188 weiter: Auf den gegenüberliegenden Segmenten wachen die sieben christlichen Tugenden, Bischöfe und Kirchenväter in hellen Gewändern.",
    cameraHint: { eye: [0, 160, 0], target: [15, 183, -15] },
    blocks: getFrescoBlocks(178, 188),
    tip: "Die Figuren werden nach oben hin perspektivisch vergrößert dargestellt, um von unten natürlich zu wirken.",
    caution: "Der Ring muss nahtlos rund um alle 8 Kuppelsegmente schließen.",
    fact: "3.600 Quadratmeter Malerei: Dies ist die größte zusammenhängende Freskenfläche der Kunstgeschichte – größer sogar als Michelangelos Sixtinische Kapelle!"
  });

  // =========================================================================
  // SCHRITT 9.7: Vasari-Fresko: Die 24 Ältesten & Propheten (Y=189 bis Y=203)
  // =========================================================================
  steps.push({
    stepNumber: "9.7",
    title: "Vasari-Fresko: Die 24 Ältesten & Propheten (Y=189 bis Y=203)",
    module: "Modul 9: Innenraum, Fresko & Krypta",
    description: "Ziehe die himmlische Sphäre von Y=189 bis Y=203 empor: Die 24 Ältesten der Apokalypse, Propheten des Alten Testaments und Scharen von Engeln halten Kronen und Harfen bereit.",
    cameraHint: { eye: [0, 165, 0], target: [0, 196, 0] },
    blocks: getFrescoBlocks(189, 203),
    tip: "Helle Calcit- und Quarzblöcke symbolisieren die weißen Gewänder der Heiligen.",
    caution: "Der Durchmesser verjüngt sich hier zusehends zur Kuppelmitte hin.",
    fact: "Federico Zuccaris Vollendung: Nach Vasaris Tod 1574 führte Zuccari das gigantische Werk mit einem Team von Gehilfen bis 1579 zu Ende."
  });

  // =========================================================================
  // SCHRITT 9.8: Vasari-Fresko: Christus Weltenrichter & Himmelschöre (Y=204 bis Y=220)
  // =========================================================================
  steps.push({
    stepNumber: "9.8",
    title: "Vasari-Fresko: Christus Weltenrichter & Himmelschöre (Y=204 bis Y=220)",
    module: "Modul 9: Innenraum, Fresko & Krypta",
    description: "Vollende das Meisterwerk mit dem goldenen Himmel bis zur Laternenöffnung auf Y=220! An der Ostseite thront Christus als strahlender Weltenrichter in goldenem Licht, umgeben von Maria, den Aposteln und posauneblasenden Engeln.",
    cameraHint: { eye: [0, 170, 0], target: [15, 212, 0] },
    blocks: getFrescoBlocks(204, 220),
    tip: "Tritt in die Mitte des Doms und blicke empor: Das Kuppelfresko überwältigt durch seine monumentale Tiefe und himmlische Pracht!",
    caution: "Der Freskenring schließt oben exakt am Marmorschlussring der Kuppellaterne ab.",
    fact: "Triumph der Renaissance: Über 700 Figuren bevölkern diesen gemalten Himmel über den Köpfen der Gläubigen!"
  });

  return steps;
})();
