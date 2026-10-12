/**
 * App Controller: Verbindet Daten, 3D-Renderer, Bauanleitungs-UI und Tastatursteuerung.
 * Wiederverwendbar für jedes beliebige Bauprojekt!
 */
window.App = (function() {
  let currentProject = null;
  let currentModule = null;
  let currentStepIndex = 0;
  let isAutoPlaying = false;
  let autoPlayTimer = null;
  let showBaseModules = true;
  let isInOverviewMode = false;

  // UI-Elemente
  const els = {};

  function init() {
    cacheDom();
    setupEventListeners();

    // 3D-Renderer starten
    const viewport = document.getElementById("viewport3d");
    if (window.VoxelRenderer && viewport) {
      window.VoxelRenderer.init(viewport);
    }

    // Projekt laden
    loadProject(window.PROJECT_FLORENCE);
    updateCamLockState(true);
    updateBaseButtonState();

    // URL-Parameter prüfen (z.B. ?overview=1 oder ?module=modul_5&step=last)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("overview") === "1") {
        enterOverviewMode();
      } else if (urlParams.get("module")) {
        const targetModId = urlParams.get("module");
        const targetMod = currentProject.modules.find(m => m.id === targetModId);
        if (targetMod) {
          const atLast = urlParams.get("step") === "last";
          selectModule(targetMod, atLast);
        }
      }
    } catch (e) {
      console.warn("URL param parsing failed:", e);
    }
  }

  function cacheDom() {
    els.moduleSelect = document.getElementById("moduleSelect");
    els.stepSlider = document.getElementById("stepSlider");
    els.stepProgressText = document.getElementById("stepProgressText");
    els.btnPrev = document.getElementById("btnPrev");
    els.btnNext = document.getElementById("btnNext");
    els.btnToggleBase = document.getElementById("btnToggleBase");
    els.btnOverview = document.getElementById("btnOverview");
    els.btnCamLock = document.getElementById("btnCamLock");
    els.btnCamMode = document.getElementById("btnCamMode");
    els.btnCamIso = document.getElementById("btnCamIso");
    els.btnCamTop = document.getElementById("btnCamTop");
    els.btnCamReset = document.getElementById("btnCamReset");
    els.btnBom = document.getElementById("btnBom");
    els.bomModal = document.getElementById("bomModal");
    els.bomModalClose = document.getElementById("bomModalClose");
    els.bomModalBody = document.getElementById("bomModalBody");

    // Teilebox & Step-Karte
    els.partsList = document.getElementById("partsList");
    els.partsTotalCount = document.getElementById("partsTotalCount");
    els.stepBadge = document.getElementById("stepBadge");
    els.stepTitle = document.getElementById("stepTitle");
    els.stepCategory = document.getElementById("stepCategory");
    els.stepDesc = document.getElementById("stepDesc");
    els.stepTip = document.getElementById("stepTip");
    els.stepCaution = document.getElementById("stepCaution");
    els.stepFact = document.getElementById("stepFact");
  }

  function setupEventListeners() {
    if (els.btnPrev) els.btnPrev.addEventListener("click", prevStep);
    if (els.btnNext) els.btnNext.addEventListener("click", nextStep);

    if (els.stepSlider) {
      els.stepSlider.addEventListener("input", (e) => {
        goToStep(parseInt(e.target.value, 10));
      });
      els.stepSlider.addEventListener("change", () => {
        if (els.stepSlider.blur) els.stepSlider.blur();
      });
      els.stepSlider.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          e.stopPropagation();
          if (els.stepSlider.blur) els.stepSlider.blur();
          if (e.key === "ArrowRight") nextStep(); else prevStep();
        }
      });
    }

    if (els.moduleSelect) {
      els.moduleSelect.addEventListener("change", (e) => {
        const modId = e.target.value;
        if (currentModule && currentModule.id === modId) return;
        const mod = currentProject.modules.find(m => m.id === modId);
        if (mod) selectModule(mod, false);
        if (els.moduleSelect.blur) els.moduleSelect.blur();
      });
      els.moduleSelect.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          e.stopPropagation();
          if (els.moduleSelect.blur) els.moduleSelect.blur();
          if (e.key === "ArrowRight") nextStep(); else prevStep();
        }
      });
    }

    // Basis-Module Umschalter (Ein- / Ausblenden vorheriger Module)
    if (els.btnToggleBase) {
      els.btnToggleBase.addEventListener("click", () => {
        showBaseModules = !showBaseModules;
        updateBaseButtonState();
        if (isInOverviewMode) {
          exitOverviewMode();
        } else {
          goToStep(currentStepIndex);
        }
        if (els.btnToggleBase.blur) els.btnToggleBase.blur();
      });
    }

    // Gesamtansicht Umschalter
    if (els.btnOverview) {
      els.btnOverview.addEventListener("click", () => {
        if (isInOverviewMode) {
          exitOverviewMode();
        } else {
          enterOverviewMode();
        }
        if (els.btnOverview.blur) els.btnOverview.blur();
      });
    }

    // Kamera-Knöpfe
    if (els.btnCamLock) {
      els.btnCamLock.addEventListener("click", () => {
        const isLocked = window.VoxelRenderer.toggleCameraLock();
        updateCamLockState(isLocked);
        if (els.btnCamLock.blur) els.btnCamLock.blur();
      });
    }

    if (els.btnCamMode) {
      els.btnCamMode.addEventListener("click", () => {
        const modeName = window.VoxelRenderer.toggleCameraMode();
        els.btnCamMode.innerHTML = `📐 ${modeName}`;
        if (els.btnCamMode.blur) els.btnCamMode.blur();
      });
    }
    if (els.btnCamIso) {
      els.btnCamIso.addEventListener("click", () => {
        window.VoxelRenderer.setCameraView("iso");
        if (els.btnCamIso.blur) els.btnCamIso.blur();
      });
    }
    if (els.btnCamTop) {
      els.btnCamTop.addEventListener("click", () => {
        window.VoxelRenderer.setCameraView("top");
        if (els.btnCamTop.blur) els.btnCamTop.blur();
      });
    }
    if (els.btnCamReset) {
      els.btnCamReset.addEventListener("click", () => {
        window.VoxelRenderer.resetCamera();
        if (els.btnCamReset.blur) els.btnCamReset.blur();
      });
    }

    // BOM Modal
    if (els.btnBom) els.btnBom.addEventListener("click", openBomModal);
    if (els.bomModalClose) els.bomModalClose.addEventListener("click", closeBomModal);
    if (els.bomModal) {
      els.bomModal.addEventListener("click", (e) => {
        if (e.target === els.bomModal) closeBomModal();
      });
    }

    // Tastaturbedienung mit Capture Phase (verhindert Fokussprünge und Dropdown-Fehlleitungen)
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        e.stopPropagation();
        if (document.activeElement && document.activeElement.blur) {
          document.activeElement.blur();
        }
        nextStep();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        e.stopPropagation();
        if (document.activeElement && document.activeElement.blur) {
          document.activeElement.blur();
        }
        prevStep();
      } else if (e.key === "i" || e.key === "I") {
        if (els.btnCamMode) els.btnCamMode.click();
      } else if (e.key === "Escape") {
        closeBomModal();
      }
    }, { capture: true });
  }

  function loadProject(project) {
    currentProject = project;
    populateModuleSelect();
    // Erstes verfügbares Modul wählen
    const firstMod = project.modules[0];
    selectModule(firstMod, false);
  }

  function populateModuleSelect() {
    if (!els.moduleSelect || !currentProject) return;
    els.moduleSelect.innerHTML = "";
    currentProject.modules.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.icon} Modul ${m.number}: ${m.title} (${m.steps.length > 0 ? m.steps.length + " Schritte" : m.status})`;
      if (m.steps.length === 0) opt.disabled = true;
      els.moduleSelect.appendChild(opt);
    });
  }

  function selectModule(module, startAtLastStep = false) {
    if (isInOverviewMode) exitOverviewMode(false);
    currentModule = module;
    if (els.moduleSelect) {
      els.moduleSelect.value = module.id;
      if (els.moduleSelect.blur) els.moduleSelect.blur();
    }
    const maxStep = Math.max(0, module.steps.length - 1);
    if (els.stepSlider) {
      els.stepSlider.max = maxStep;
    }
    const targetStep = startAtLastStep ? maxStep : 0;
    currentStepIndex = targetStep;
    if (els.stepSlider) {
      els.stepSlider.value = targetStep;
    }
    goToStep(targetStep);
  }

  function goToStep(index) {
    if (!currentModule || !currentModule.steps || currentModule.steps.length === 0) return;
    if (index < 0) index = 0;
    if (index >= currentModule.steps.length) index = currentModule.steps.length - 1;

    if (isInOverviewMode) {
      exitOverviewMode(false);
    }

    currentStepIndex = index;
    const step = currentModule.steps[index];

    // 1. Exakte mathematische Analyse
    const stepAnalysis = window.StepAnalyzer.analyzeStep(step);
    const cumulativeAnalysis = window.StepAnalyzer.analyzeCumulative(currentModule.steps, index);

    // 2. Teilebox aktualisieren (100% EXAKT!)
    if (els.partsList) {
      els.partsList.innerHTML = window.StepAnalyzer.formatPartsHtml(stepAnalysis.parts);
    }
    if (els.partsTotalCount) {
      els.partsTotalCount.textContent = `${stepAnalysis.totalBlocks} Blöcke neu`;
    }

    // 3. Step-Karte (Schrittnummer & Inhalte)
    if (els.stepBadge) els.stepBadge.textContent = step.stepNumber;
    if (els.stepTitle) els.stepTitle.textContent = step.title;
    if (els.stepCategory) els.stepCategory.textContent = step.module;
    if (els.stepDesc) els.stepDesc.textContent = step.description;

    // Tipps & Fakten
    if (els.stepTip) {
      els.stepTip.innerHTML = `<strong>💡 Filippos Meister-Tipp:</strong> ${step.tip}`;
    }
    if (els.stepCaution) {
      els.stepCaution.innerHTML = `<strong>⚠️ Meisterbauer-Achtung:</strong> ${step.caution}`;
    }
    if (els.stepFact) {
      els.stepFact.innerHTML = `<strong>🎨 Wusstest du schon?</strong> ${step.fact}`;
    }

    // 4. Slider & Buttons aktualisieren (Modulübergreifend)
    if (els.stepSlider) els.stepSlider.value = index;
    if (els.stepProgressText) {
      els.stepProgressText.textContent = `Schritt ${index + 1} von ${currentModule.steps.length} • Gesamt verbaut: ${cumulativeAnalysis.cumulativeTotal} Blöcke`;
    }

    // Prüfen ob vorherige/nächste Module existieren
    const curModIdx = currentProject.modules.findIndex(m => m.id === currentModule.id);
    const hasPrev = (index > 0) || (curModIdx > 0 && currentProject.modules[curModIdx - 1].steps.length > 0);
    const hasNext = (index < currentModule.steps.length - 1) || (curModIdx < currentProject.modules.length - 1 && currentProject.modules[curModIdx + 1].steps.length > 0);

    if (els.btnPrev) els.btnPrev.disabled = !hasPrev;
    if (els.btnNext) els.btnNext.disabled = !hasNext;

    // 5. 3D-Renderer aktualisieren mit Basis-Blöcken vorheriger Module
    const baseBlocks = showBaseModules ? getBaseModuleBlocks() : [];
    if (window.VoxelRenderer) {
      window.VoxelRenderer.renderStep(
        cumulativeAnalysis.allBlocks,
        step.blocks,
        step.cameraHint,
        baseBlocks
      );
    }
  }

  function getBaseModuleBlocks() {
    if (!currentProject || !currentModule) return [];
    const curModIdx = currentProject.modules.findIndex(m => m.id === currentModule.id);
    if (curModIdx <= 0) return [];

    const blocks = [];
    for (let i = 0; i < curModIdx; i++) {
      const mod = currentProject.modules[i];
      if (mod && mod.steps) {
        mod.steps.forEach(step => {
          if (step.blocks) {
            blocks.push(...step.blocks);
          }
        });
      }
    }
    return blocks;
  }

  function getAllProjectBlocks() {
    if (!currentProject) return [];
    const blocks = [];
    currentProject.modules.forEach(mod => {
      if (mod && mod.steps) {
        mod.steps.forEach(step => {
          if (step.blocks) {
            blocks.push(...step.blocks);
          }
        });
      }
    });
    return blocks;
  }

  function updateBaseButtonState() {
    if (!els.btnToggleBase) return;
    els.btnToggleBase.innerHTML = showBaseModules ? "🏛️ Basis-Module: AN" : "🏛️ Basis-Module: AUS";
    if (showBaseModules) {
      els.btnToggleBase.classList.add("active");
    } else {
      els.btnToggleBase.classList.remove("active");
    }
  }

  function updateCamLockState(isLocked) {
    if (!els.btnCamLock) return;
    els.btnCamLock.innerHTML = isLocked ? "🔒 Ansicht fest" : "🔓 Auto-Kamera";
    if (isLocked) {
      els.btnCamLock.classList.add("active");
    } else {
      els.btnCamLock.classList.remove("active");
    }
  }

  function enterOverviewMode() {
    isInOverviewMode = true;
    if (els.btnOverview) {
      els.btnOverview.innerHTML = "◀ Zurück zur Anleitung";
      els.btnOverview.classList.add("active");
    }

    const allBlocks = getAllProjectBlocks();
    if (window.VoxelRenderer) {
      window.VoxelRenderer.renderOverview(allBlocks);
    }

    // Step Info Drawer für Gesamtansicht anpassen
    if (els.stepBadge) els.stepBadge.textContent = "🌟";
    if (els.stepCategory) els.stepCategory.textContent = "Meisterbau Florenz • Gesamtmodell";
    if (els.stepTitle) els.stepTitle.textContent = "Cathedral of Santa Maria del Fiore";
    if (els.stepDesc) {
      els.stepDesc.innerHTML = `Hier siehst du die gesamte Kathedrale mit allen bisher vollendeten Modulen im Zusammenspiel! 
      Vom kolossalen Fundament über das gotische Hauptschiff mit seinen Hallen bis zur prachtvollen Marmorfassade. 
      Insgesamt sind bisher <strong>${allBlocks.length.toLocaleString('de-DE')} Blöcke</strong> verbaut.`;
    }
    if (els.stepTip) {
      els.stepTip.innerHTML = `<strong>💡 Meisterbauer-Ansicht:</strong> Du kannst mit der Maus frei um das gesamte Bauwerk kreisen, hineinzoomen und die Details aus jedem Winkel bestaunen!`;
    }
    if (els.stepCaution) {
      els.stepCaution.innerHTML = `<strong>⚠️ Nächste Schritte:</strong> Klicke auf 'Zurück zur Anleitung' oder bewege die Schritt-Tasten, um an einem einzelnen Modul weiterzubauen.`;
    }
    if (els.stepFact) {
      els.stepFact.innerHTML = `<strong>🎨 Meisterwerk der Welt:</strong> Die Kathedrale Santa Maria del Fiore ist mit über 150 Metern Länge eine der größten Kirchen der Welt und das Herz der Renaissance-Metropole Florenz.`;
    }

    if (els.partsTotalCount) {
      els.partsTotalCount.textContent = `${allBlocks.length.toLocaleString('de-DE')} Blöcke gesamt`;
    }
    if (els.partsList) {
      const typeCounts = {};
      allBlocks.forEach(b => {
        typeCounts[b.type] = (typeCounts[b.type] || 0) + 1;
      });
      els.partsList.innerHTML = window.StepAnalyzer.formatPartsHtml(typeCounts);
    }
    if (els.stepProgressText) {
      els.stepProgressText.textContent = `Gesamtmodell: ${allBlocks.length.toLocaleString('de-DE')} Blöcke platziert`;
    }
  }

  function exitOverviewMode(reRender = true) {
    isInOverviewMode = false;
    if (els.btnOverview) {
      els.btnOverview.innerHTML = "🌟 Gesamtansicht";
      els.btnOverview.classList.remove("active");
    }
    if (reRender) {
      goToStep(currentStepIndex);
    }
  }

  function nextStep() {
    if (!currentModule) return;
    if (currentStepIndex < currentModule.steps.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      // Fließender Übergang ins nächste Modul!
      const curModIdx = currentProject.modules.findIndex(m => m.id === currentModule.id);
      if (curModIdx >= 0 && curModIdx < currentProject.modules.length - 1) {
        const nextMod = currentProject.modules[curModIdx + 1];
        if (nextMod && nextMod.steps && nextMod.steps.length > 0) {
          selectModule(nextMod, false);
        }
      }
    }
  }

  function prevStep() {
    if (!currentModule) return;
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    } else {
      // Fließender Übergang ins vorherige Modul (am letzten Schritt)!
      const curModIdx = currentProject.modules.findIndex(m => m.id === currentModule.id);
      if (curModIdx > 0) {
        const prevMod = currentProject.modules[curModIdx - 1];
        if (prevMod && prevMod.steps && prevMod.steps.length > 0) {
          selectModule(prevMod, true);
        }
      }
    }
  }

  function openBomModal() {
    if (!currentModule || !els.bomModal) return;
    const { bom, grandTotal } = window.StepAnalyzer.generateModuleBOM(currentModule);

    let rowsHtml = "";
    for (const [type, count] of Object.entries(bom)) {
      const def = window.BLOCK_TYPES[type] || { name: type, icon: "🧱" };
      rowsHtml += `
        <tr>
          <td><span style="font-size: 18px; margin-right: 8px;">${def.icon}</span><strong>${def.name}</strong></td>
          <td class="bom-count">${count}x</td>
          <td style="color: #666;">${def.description || ""}</td>
        </tr>
      `;
    }

    els.bomModalBody.innerHTML = `
      <p style="margin-bottom: 16px; font-weight: 600; color: #333;">
        Gesamte Materialliste für <strong>${currentModule.title}</strong>: 
        <span style="color: var(--brand-red); font-size: 16px; font-weight: 800;">${grandTotal} Blöcke insgesamt</span>
      </p>
      <table class="bom-table">
        <thead>
          <tr>
            <th>Block-Typ</th>
            <th>Exakte Anzahl</th>
            <th>Verwendung</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
    els.bomModal.classList.add("open");
  }

  function closeBomModal() {
    if (els.bomModal) els.bomModal.classList.remove("open");
  }

  return {
    init,
    goToStep,
    nextStep,
    prevStep,
    loadProject,
    selectModule,
    enterOverviewMode,
    exitOverviewMode
  };
})();

// Automatisch nach DOM-Laden starten
document.addEventListener("DOMContentLoaded", () => {
  window.App.init();
});
