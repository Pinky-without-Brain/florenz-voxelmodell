/**
 * Texture Generator: Erzeugt prozedurale Minecraft-Texturen auf 2D-HTML-Canvases.
 * Funktioniert 100% offline, ohne externe Bilddateien und ohne CORS-Sicherheitsprobleme im Browser!
 * Wiederverwendbar für jedes Projekt.
 */
window.TextureGenerator = (function() {
  const cache = {};

  function createVoxelCanvas(blockDef, size = 64) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const texId = blockDef.base || blockDef.id; // Treppen nutzen die Textur ihres Vollblocks
    const baseColor = blockDef.color || "#888888";
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    // Spezialisierte Texturmuster je nach Block-Typ
    switch (texId) {
      case "stone_bricks":
      case "mossy_stone_bricks": {
        // Steinziegel-Fugenmuster (4 Ziegelreihen)
        ctx.strokeStyle = texId === "mossy_stone_bricks" ? "#445533" : "#4A4A4A";
        ctx.lineWidth = 2;
        const rowH = size / 4;
        for (let i = 1; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(0, i * rowH);
          ctx.lineTo(size, i * rowH);
          ctx.stroke();
        }
        // Versetzte vertikale Fugen
        const vOffsets = [0.5, 0.25, 0.75, 0.5];
        for (let r = 0; r < 4; r++) {
          const x = size * vOffsets[r];
          ctx.beginPath();
          ctx.moveTo(x, r * rowH);
          ctx.lineTo(x, (r + 1) * rowH);
          ctx.stroke();
        }
        // Moos-Flecken bei mossy
        if (texId === "mossy_stone_bricks") {
          ctx.fillStyle = "rgba(70, 110, 50, 0.45)";
          ctx.fillRect(4, 4, 18, 12);
          ctx.fillRect(36, 32, 22, 14);
        }
        break;
      }

      case "smooth_quartz":
      case "chiseled_quartz": {
        // Marmor-Äderung / Schattierung
        ctx.strokeStyle = "rgba(190, 180, 165, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.bezierCurveTo(20, 18, 40, 6, 64, 24);
        ctx.moveTo(0, 48);
        ctx.bezierCurveTo(24, 42, 38, 58, 64, 46);
        ctx.stroke();
        if (texId === "chiseled_quartz") {
          ctx.strokeStyle = "rgba(140, 130, 120, 0.6)";
          ctx.strokeRect(8, 8, 48, 48);
          ctx.strokeRect(18, 18, 28, 28);
        }
        break;
      }

      case "dark_prismarine": {
        // Serpentinit-Schuppen / Gitter
        ctx.strokeStyle = "rgba(18, 38, 30, 0.6)";
        ctx.lineWidth = 2;
        const step = size / 4;
        for (let i = 0; i <= size; i += step) {
          ctx.beginPath();
          ctx.moveTo(i, 0); ctx.lineTo(i, size);
          ctx.moveTo(0, i); ctx.lineTo(size, i);
          ctx.stroke();
        }
        break;
      }

      case "polished_granite": {
        // Granit-Sprenkel
        for (let i = 0; i < 40; i++) {
          const x = (i * 19) % size;
          const y = (i * 29) % size;
          ctx.fillStyle = i % 2 === 0 ? "rgba(220, 160, 140, 0.4)" : "rgba(80, 40, 30, 0.3)";
          ctx.fillRect(x, y, 3, 3);
        }
        break;
      }

      case "gold_block": {
        // Goldrahmen & Glanz
        ctx.strokeStyle = "#FFF875";
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, size - 4, size - 4);
        ctx.strokeStyle = "#C19C17";
        ctx.strokeRect(5, 5, size - 10, size - 10);
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillRect(8, 8, 16, 16);
        break;
      }

      case "sea_lantern": {
        // Helles inneres Gitter & Leuchtpunkte
        ctx.strokeStyle = "#E8FAFA";
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, size - 8, size - 8);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(20, 20, 24, 24);
        break;
      }

      case "polished_deepslate": {
        // Tiefe Schieferlinien
        ctx.strokeStyle = "#252528";
        ctx.lineWidth = 2;
        for (let y = 8; y < size; y += 8) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(size, y);
          ctx.stroke();
        }
        break;
      }

      case "terracotta":
      case "bricks": {
        if (texId === "bricks") {
          ctx.strokeStyle = "#5A251D";
          ctx.lineWidth = 1.5;
          const rH = size / 6;
          for (let r = 0; r < 6; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * rH); ctx.lineTo(size, r * rH);
            ctx.stroke();
            const shift = (r % 2) * (size / 4);
            for (let c = 0; c < 4; c++) {
              const x = (c * (size / 2) + shift) % size;
              ctx.beginPath();
              ctx.moveTo(x, r * rH); ctx.lineTo(x, (r + 1) * rH);
              ctx.stroke();
            }
          }
        }
        break;
      }

      case "red_sandstone": {
        // Horizontale Schichtbänder des toskanischen Sandsteins
        ctx.strokeStyle = "rgba(100, 35, 15, 0.45)";
        ctx.lineWidth = 2;
        for (let y = 16; y < size; y += 16) {
          ctx.beginPath();
          ctx.moveTo(0, y); ctx.lineTo(size, y);
          ctx.stroke();
        }
        break;
      }

      case "dark_oak_planks": {
        // Holzbohlen mit Eisenbeschlag
        ctx.strokeStyle = "rgba(20, 10, 5, 0.6)";
        ctx.lineWidth = 2;
        const plankW = size / 4;
        for (let x = 0; x <= size; x += plankW) {
          ctx.beginPath();
          ctx.moveTo(x, 0); ctx.lineTo(x, size);
          ctx.stroke();
        }
        // Kleine Bronzenieten
        ctx.fillStyle = "#A88338";
        for (let x = plankW / 2; x < size; x += plankW) {
          ctx.fillRect(x - 2, 8, 4, 4);
          ctx.fillRect(x - 2, size - 12, 4, 4);
        }
        break;
      }

      case "quartz_bricks": {
        // Helle Marmorquader im Verband (2 Reihen)
        ctx.strokeStyle = "rgba(160, 150, 135, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
        ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size / 2);
        ctx.moveTo(size / 4, size / 2); ctx.lineTo(size / 4, size);
        ctx.moveTo(size * 0.75, size / 2); ctx.lineTo(size * 0.75, size);
        ctx.stroke();
        break;
      }

      case "quartz_pillar": {
        // Längsrillen der Marmorsäule
        ctx.strokeStyle = "rgba(170, 160, 145, 0.6)";
        ctx.lineWidth = 2;
        for (let x = size / 4; x < size; x += size / 4) {
          ctx.beginPath();
          ctx.moveTo(x, 0); ctx.lineTo(x, size);
          ctx.stroke();
        }
        break;
      }

      case "cut_copper": {
        // Vier Kupferplatten mit Fugenkreuz
        ctx.strokeStyle = "rgba(90, 40, 25, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size);
        ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 190, 150, 0.25)";
        ctx.fillRect(4, 4, 10, 10);
        ctx.fillRect(size / 2 + 4, size / 2 + 4, 10, 10);
        break;
      }

      case "calcite": {
        // Strahlendes Kalzit-Kristallmuster
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.strokeRect(6, 6, size - 12, size - 12);
        for (let i = 0; i < 20; i++) {
          const x = (i * 23) % size;
          const y = (i * 17) % size;
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.fillRect(x, y, 2, 2);
        }
        break;
      }

      case "red_stained_glass":
      case "blue_stained_glass":
      case "yellow_stained_glass":
      case "light_blue_stained_glass":
      case "orange_stained_glass":
      case "white_stained_glass":
      case "gray_stained_glass": {
        // Bleiverglasungs-Gitter
        ctx.strokeStyle = "#222222";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(1, 1, size - 2, size - 2);
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(size, size);
        ctx.moveTo(size, 0); ctx.lineTo(0, size);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(size / 4, size / 4, size / 2, size / 2);
        break;
      }
    }

    // Leichte Block-Kantenfase (Bevel Border)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, size, size);

    return canvas;
  }

  function getThreeTexture(blockType) {
    if (cache[blockType]) return cache[blockType];
    const def = window.BLOCK_TYPES[blockType] || { id: blockType, color: "#888888" };
    const canvas = createVoxelCanvas(def, 64);
    
    // Erzeuge Three.js CanvasTexture falls Three.js geladen ist
    if (typeof THREE !== "undefined") {
      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.NearestFilter; // Knackiger Pixel-Look wie Minecraft
      texture.minFilter = THREE.NearestFilter;
      cache[blockType] = texture;
      return texture;
    }
    return null;
  }

  function getDataUrl(blockType) {
    const def = window.BLOCK_TYPES[blockType] || { id: blockType, color: "#888888" };
    const canvas = createVoxelCanvas(def, 64);
    return canvas.toDataURL("image/png");
  }

  return {
    getThreeTexture,
    getDataUrl,
    createVoxelCanvas
  };
})();
