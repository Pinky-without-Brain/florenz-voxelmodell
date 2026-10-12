/**
 * Step Analyzer: Präzisions-Berechnungs-Engine
 * Berechnet für jeden Schritt exakt die benötigten Blockmengen, Gesamtmengen,
 * Bounding-Boxen und Teilelisten. Keine Schätzungen, 100% mathematische Exaktheit!
 * Wiederverwendbar für beliebige zukünftige Minecraft-Bauprojekte.
 */
window.StepAnalyzer = (function() {

  /**
   * Analysiert einen einzelnen Bauschritt und ermittelt die exakte Teileliste.
   * @param {Object} step - Der Bauschritt mit Array von {x, y, z, type}
   * @returns {Object} Analyse-Ergebnis mit partsCount, totalBlocks, boundingBox
   */
  function analyzeStep(step) {
    if (!step || !step.blocks) {
      return { parts: {}, totalBlocks: 0, bounds: null };
    }

    const parts = {};
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < step.blocks.length; i++) {
      const b = step.blocks[i];
      // Exakte Zählung jedes einzelnen Blocktyps
      parts[b.type] = (parts[b.type] || 0) + 1;

      // Bounding Box ermitteln
      if (b.x < minX) minX = b.x;
      if (b.x > maxX) maxX = b.x;
      if (b.y < minY) minY = b.y;
      if (b.y > maxY) maxY = b.y;
      if (b.z < minZ) minZ = b.z;
      if (b.z > maxZ) maxZ = b.z;
    }

    const totalBlocks = step.blocks.length;
    const bounds = totalBlocks > 0 ? { minX, maxX, minY, maxY, minZ, maxZ } : null;

    return {
      parts,
      totalBlocks,
      bounds
    };
  }

  /**
   * Berechnet kumulative Statistiken über eine Serie von Bauschritten hinweg.
   * @param {Array} steps - Liste aller Schritte
   * @param {number} upToStepIndex - Index des aktuellen Schritts (0-basiert)
   */
  function analyzeCumulative(steps, upToStepIndex) {
    const cumulativeParts = {};
    let cumulativeTotal = 0;
    const allBlocks = [];

    const maxIdx = Math.min(upToStepIndex, steps.length - 1);
    for (let i = 0; i <= maxIdx; i++) {
      const st = steps[i];
      if (!st || !st.blocks) continue;

      for (let j = 0; j < st.blocks.length; j++) {
        const b = st.blocks[j];
        cumulativeParts[b.type] = (cumulativeParts[b.type] || 0) + 1;
        cumulativeTotal++;
        allBlocks.push(b);
      }
    }

    return {
      cumulativeParts,
      cumulativeTotal,
      allBlocks
    };
  }

  /**
   * Erzeugt eine druckfertige Stückliste (Bill of Materials) für ein ganzes Modul
   */
  function generateModuleBOM(module) {
    const bom = {};
    let grandTotal = 0;

    if (!module || !module.steps) return { bom, grandTotal };

    module.steps.forEach(st => {
      const res = analyzeStep(st);
      for (const [type, count] of Object.entries(res.parts)) {
        bom[type] = (bom[type] || 0) + count;
        grandTotal += count;
      }
    });

    return { bom, grandTotal };
  }

  /**
   * Formatiert eine Teileliste als HTML für die Teilebox
   */
  function formatPartsHtml(parts) {
    const entries = Object.entries(parts);
    if (entries.length === 0) return "<div class='no-parts'>Keine neuen Teile</div>";

    let html = "";
    entries.forEach(([type, count]) => {
      const def = window.BLOCK_TYPES[type] || {
        name: type,
        icon: "🧱",
        color: "#888888"
      };
      const previewImg = window.TextureGenerator ? window.TextureGenerator.getDataUrl(type) : null;

      html += `
        <div class="part-item" data-type="${type}">
          <div class="part-preview-wrap">
            ${previewImg ? `<img src="${previewImg}" class="part-img" alt="${def.name}">` : `<span class="part-icon">${def.icon}</span>`}
          </div>
          <div class="part-details">
            <span class="part-multiplier">${count}x</span>
            <span class="part-name">${def.name}</span>
          </div>
        </div>
      `;
    });
    return html;
  }

  return {
    analyzeStep,
    analyzeCumulative,
    generateModuleBOM,
    formatPartsHtml
  };
})();
