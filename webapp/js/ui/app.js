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
  let mode = "steps";              // "steps" (Bauanleitung) oder "city" (Stadtmodell)
  let currentProjectId = "duomo";
  let cityState = { promise: null, ready: false, selected: null, timings: null };

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

    // Kamera-Presets und Raster aus der Bounding Box aller geladenen V2-Blöcke
    if (window.VoxelRenderer && window.VoxelRenderer.setModelBounds) {
      const bounds = computeModelBounds(window.PROJECT_FLORENCE);
      if (bounds) window.VoxelRenderer.setModelBounds(bounds);
    }

    // Projekt laden
    loadProject(window.PROJECT_FLORENCE);
    updateCamLockState(true);
    updateBaseButtonState();
    initProjectUi();

    // URL-Parameter prüfen (z.B. ?overview=1 oder ?module=modul_5&step=last)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("overview") === "mesh" && window.VoxelRenderer.setOverviewMesher) {
        window.VoxelRenderer.setOverviewMesher(true);
      }
      if (urlParams.get("mode") === "city") {
        setMode("city");
      } else if (urlParams.get("project") && urlParams.get("project") !== "duomo") {
        selectProject(urlParams.get("project"));
      } else if (urlParams.get("overview") === "1" || urlParams.get("overview") === "mesh") {
        enterOverviewMode();
      } else if (urlParams.get("module")) {
        const targetModId = urlParams.get("module");
        const targetMod = currentProject.modules.find(m => m.id === targetModId);
        if (targetMod && targetMod.steps.length > 0) {
          const atLast = urlParams.get("step") === "last";
          selectModule(targetMod, atLast);
        }
      }
    } catch (e) {
      console.warn("URL param parsing failed:", e);
    }
  }

  // Bounding Box über alle Blöcke aller Module (Zellen inklusive)
  function computeModelBounds(project) {
    let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    project.modules.forEach(mod => mod.steps.forEach(step => {
      const bl = step.blocks || [];
      for (let i = 0; i < bl.length; i++) {
        const b = bl[i];
        if (b.x < minX) minX = b.x; if (b.x > maxX) maxX = b.x;
        if (b.y < minY) minY = b.y; if (b.y > maxY) maxY = b.y;
        if (b.z < minZ) minZ = b.z; if (b.z > maxZ) maxZ = b.z;
      }
    }));
    return minX === Infinity ? null : { minX, maxX, minY, maxY, minZ, maxZ };
  }

  function cacheDom() {
    els.moduleSelect = document.getElementById("moduleSelect");
    els.projectSelect = document.getElementById("projectSelect");
    els.projectTitle = document.getElementById("projectTitle");
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
      if (mode === "city") {
        if (e.key === "Escape") closeBomModal();
        return;
      }
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
    const firstMod = project.modules.find(m => m.steps.length > 0) || project.modules[0];
    selectModule(firstMod, false);
  }

  function populateModuleSelect() {
    if (!els.moduleSelect || !currentProject) return;
    els.moduleSelect.innerHTML = "";
    currentProject.modules.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.icon} Modul ${m.number}: ${m.title} (${m.steps.length > 0 ? m.steps.length + " Schritte" : "in Arbeit"})`;
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
    const hasPrev = (index > 0) || !!findAdjacentModule(-1);
    const hasNext = (index < currentModule.steps.length - 1) || !!findAdjacentModule(1);

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

  // Nächstes (dir = 1) bzw. vorheriges (dir = -1) Modul, das Schritte hat; sonst null
  function findAdjacentModule(dir) {
    const mods = currentProject.modules;
    let i = mods.findIndex(m => m.id === currentModule.id) + dir;
    for (; i >= 0 && i < mods.length; i += dir) {
      if (mods[i].steps && mods[i].steps.length > 0) return mods[i];
    }
    return null;
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

    const tOverview = performance.now();
    const allBlocks = getAllProjectBlocks();
    if (window.VoxelRenderer) {
      window.VoxelRenderer.renderOverview(allBlocks);
    }
    window.__overviewMs = performance.now() - tOverview;
    console.log("Gesamtansicht inkl. Datensammlung: " + window.__overviewMs.toFixed(0) + " ms");

    // Step Info Drawer für Gesamtansicht anpassen
    if (els.stepBadge) els.stepBadge.textContent = "🌟";
    if (els.stepCategory) els.stepCategory.textContent = "Meisterbau Florenz • Gesamtmodell";
    if (els.stepTitle) els.stepTitle.textContent = currentProject && currentProjectId !== "duomo" ? currentProject.title : "Cathedral of Santa Maria del Fiore";
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
      const nextMod = findAdjacentModule(1);
      if (nextMod) selectModule(nextMod, false);
    }
  }

  function prevStep() {
    if (!currentModule) return;
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    } else {
      // Fließender Übergang ins vorherige Modul (am letzten Schritt)!
      const prevMod = findAdjacentModule(-1);
      if (prevMod) selectModule(prevMod, true);
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

  // ======================================================================
  // V3: Projektwahl, Modus-Umschalter, Stadtansicht
  // ======================================================================
  const STATUS_LABEL = { gebaut: "gebaut", in_arbeit: "in Arbeit", geplant: "geplant" };
  const TYPE_LABEL = { wahrzeichen: "Wahrzeichen", quartier: "Quartier", stadtgrund: "Stadtgrund" };
  const hasSteps = (e) => !!(e && e.modules && e.modules.length > 0);

  function initProjectUi() {
    populateProjectSelect();
    // Demo-Eintrag (?demo=1) wird nachgeladen; Auswahl danach aktualisieren
    if (window.ProjectLoader) {
      window.ProjectLoader.loadDemoIfRequested().then(() => {
        populateProjectSelect();
        if (cityState.ready && window.CityMap) window.CityMap.refreshIndex(window.ProjectLoader.index());
      }).catch(() => {});
    }
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", (e) => { fn(e); if (el.blur) el.blur(); });
    };
    bind("btnModeSteps", () => setMode("steps"));
    bind("btnModeCity", () => setMode("city"));
    bind("btnCityOverview", () => window.CityView && window.CityView.overview());
    bind("btnCityHome", () => window.CityView && window.CityView.home());
    bind("btnCityMap", () => {
      const panel = document.getElementById("cityMapPanel");
      const hidden = panel.classList.toggle("hidden-map");
      document.getElementById("btnCityMap").classList.toggle("active", !hidden);
      if (!hidden && window.CityMap) window.CityMap.draw();
    });
    bind("btnMapExpand", () => {
      document.getElementById("cityMapPanel").classList.toggle("expanded");
      setTimeout(() => window.CityMap && window.CityMap.fit(), 30);
    });
    bind("btnOpenSteps", () => { if (cityState.selected) openProjectSteps(cityState.selected); });
    const sight = document.getElementById("citySight");
    if (sight) {
      sight.addEventListener("input", () => {
        document.getElementById("citySightVal").textContent = sight.value;
        if (window.CityView) { window.CityView.cfg.showDist = Number(sight.value); window.CityView.update(); }
      });
    }
    if (els.projectSelect) {
      els.projectSelect.addEventListener("change", () => {
        const id = els.projectSelect.value;
        if (mode === "city") citySelect(id, true); else selectProject(id);
        if (els.projectSelect.blur) els.projectSelect.blur();
      });
    }
  }

  function populateProjectSelect() {
    if (!els.projectSelect || !window.ProjectLoader) return;
    const idx = window.ProjectLoader.index();
    const keep = els.projectSelect.value || currentProjectId;
    els.projectSelect.innerHTML = "";
    // Gebaute Projekte zuerst, danach in Arbeit, dann geplant
    const rank = { gebaut: 0, in_arbeit: 1, geplant: 2 };
    idx.slice().sort((a, b) => (rank[a.status] - rank[b.status]) || 0).forEach(e => {
      const opt = document.createElement("option");
      opt.value = e.id;
      opt.textContent = `${e.title} (${STATUS_LABEL[e.status] || e.status})`;
      if (mode === "steps" && !hasSteps(e)) opt.disabled = true;
      els.projectSelect.appendChild(opt);
    });
    els.projectSelect.value = keep;
  }

  function setMode(next) {
    if (next === mode) return;
    mode = next;
    document.body.classList.toggle("mode-city", mode === "city");
    document.getElementById("btnModeSteps").classList.toggle("active", mode === "steps");
    document.getElementById("btnModeCity").classList.toggle("active", mode === "city");
    populateProjectSelect();
    if (mode === "city") {
      if (window.VoxelRenderer && window.VoxelRenderer.setPaused) window.VoxelRenderer.setPaused(true);
      ensureCity().then(() => {
        window.CityView.setActive(true);
        window.CityView.resize();
        if (window.CityMap) window.CityMap.fit();
        if (cityState.selected) citySelectUi(cityState.selected);
      }).catch(err => { console.error(err); showCityLoading(false); });
    } else {
      if (window.CityView) window.CityView.setActive(false);
      if (window.VoxelRenderer && window.VoxelRenderer.setPaused) window.VoxelRenderer.setPaused(false);
      window.dispatchEvent(new Event("resize"));
      if (els.projectSelect) els.projectSelect.value = currentProjectId;
    }
  }

  function showCityLoading(on) {
    const el = document.getElementById("cityLoading");
    if (el) el.classList.toggle("show", on);
  }

  // Basisdaten laden, Szene bauen, gebaute Projekte als Voxel nachladen
  function ensureCity() {
    if (cityState.promise) return cityState.promise;
    showCityLoading(true);
    const t0 = performance.now();
    cityState.promise = window.ProjectLoader.loadBasis().then(basis => {
      const tLoad = performance.now() - t0;
      const idx = window.ProjectLoader.index();
      const container = document.getElementById("viewportCity");
      window.CityView.init(container, { onPick: (id) => citySelect(id, true), onHover: cityPinHover });
      const tScene = window.CityView.buildScene(basis, idx);
      window.CityMap.init({
        canvas: document.getElementById("cityMapCanvas"), tooltip: document.getElementById("mapTooltip"),
        wrap: document.getElementById("cityMapWrap"), onPick: (id) => citySelect(id, true),
        getCamera: () => window.CityView.cameraState()
      });
      const tMap = window.CityMap.build(basis, idx);
      setInterval(() => { if (mode === "city") window.CityMap.draw(); }, 250);
      cityState.timings = { dataLoadMs: tLoad, scene: tScene, mapMs: tMap, sceneReadyMs: performance.now() - t0 };
      cityState.ready = true;
      window.__cityTimings = cityState.timings;
      showCityLoading(false);
      console.log("Stadt: Szene bereit nach " + cityState.timings.sceneReadyMs.toFixed(0) + " ms (Daten " + tLoad.toFixed(0) + ")");
      // gebaute Projekte als Voxel nachladen (Dom)
      const tv = performance.now();
      return Promise.all(idx.filter(e => e.status === "gebaut" && hasSteps(e)).map(e => window.CityView.loadVoxels(e.id))).then(() => {
        cityState.timings.voxelsMs = performance.now() - tv;
        cityState.timings.readyMs = performance.now() - t0;
        window.__cityTimings = cityState.timings;
        startCityStats();
      });
    });
    return cityState.promise;
  }

  function startCityStats() {
    const el = document.getElementById("cityStats");
    setInterval(() => {
      if (mode !== "city" || !el) return;
      const s = window.CityView.stats();
      el.textContent = `${s.buildings} Gebäude · ${s.chunksVisible} Chunks sichtbar (${s.chunksMeshed} im Speicher) · ${s.fps ? s.fps.toFixed(0) : "-"} fps`;
    }, 700);
  }

  function cityPinHover(id, ev) {
    const tip = document.getElementById("pinTooltip");
    if (!tip) return;
    const e = id && window.ProjectLoader.entry(id);
    if (!e) { tip.style.display = "none"; return; }
    const r = document.querySelector(".main-stage").getBoundingClientRect();
    tip.innerHTML = `<strong>${e.title}</strong><br>${TYPE_LABEL[e.type] || e.type} · ${STATUS_LABEL[e.status] || e.status}`;
    tip.style.display = "block";
    tip.style.left = Math.min(r.width - 200, ev.clientX - r.left + 14) + "px";
    tip.style.top = Math.max(4, ev.clientY - r.top - 40) + "px";
  }

  function citySelect(id, fly) {
    const e = window.ProjectLoader.entry(id);
    if (!e) return;
    cityState.selected = id;
    if (els.projectSelect) els.projectSelect.value = id;
    citySelectUi(id);
    if (!cityState.ready) return;
    window.CityView.setSelected(id);
    window.CityMap.select(id);
    if (fly) window.CityView.flyToProject(e);
    if (hasSteps(e) && !window.CityView.isVoxelLoaded(id)) {
      window.CityView.loadVoxels(id).then(() => window.CityView.update()).catch(err => console.warn(err));
    }
  }

  function citySelectUi(id) {
    const e = window.ProjectLoader.entry(id);
    if (!e) return;
    document.getElementById("cityInfoTitle").textContent = e.title;
    const color = (window.CityView && window.CityView.STATUS_COLORS[e.status]) || "#999";
    document.getElementById("cityInfoMeta").innerHTML =
      `<span class="status-dot" style="background:${color}"></span>${TYPE_LABEL[e.type] || e.type} · ${STATUS_LABEL[e.status] || e.status}`;
    const body = document.getElementById("cityInfoBody");
    const mods = document.getElementById("cityInfoModules");
    if (hasSteps(e)) {
      const total = e.modules.reduce((a, m) => a + m.blocks, 0);
      const steps = e.modules.reduce((a, m) => a + m.steps, 0);
      body.textContent = `${e.modules.length} Module, ${steps} Bauschritte, ${total.toLocaleString("de-DE")} Blöcke. Ersetzt ${e.gebaeude.length} Gebäude der Stadtkarte.`;
      mods.innerHTML = e.modules.map(m => `<div><span>Modul ${m.n}: ${m.title}</span><span>${m.steps} Schritte</span></div>`).join("");
    } else {
      body.textContent = e.status === "in_arbeit"
        ? "Dieses Projekt ist in Arbeit, Bauschritte folgen."
        : "Noch nicht gebaut. In der Stadtkarte steht das Gebäude als einfacher Baukörper aus OpenStreetMap.";
      mods.innerHTML = "";
    }
    document.getElementById("btnOpenSteps").hidden = !hasSteps(e);
  }

  // Bauanleitung eines Projekts (Schritt-Ansicht) öffnen
  function openProjectSteps(id) {
    setMode("steps");
    selectProject(id);
  }

  // Projekt für die Schritt-Ansicht wählen (project-aware): Dom aus den V2-Daten, andere per V3-Loader
  function selectProject(id) {
    const e = window.ProjectLoader && window.ProjectLoader.entry(id);
    if (!e || !hasSteps(e)) return Promise.resolve(false);
    if (id === currentProjectId && currentProject) return Promise.resolve(true);
    return window.ProjectLoader.loadProject(id).then(project => {
      if (isInOverviewMode) exitOverviewMode(false);
      currentProjectId = id;
      const isDuomo = id === "duomo";
      if (window.VoxelRenderer) {
        window.VoxelRenderer.setContext({ site: isDuomo, groundY: isDuomo ? 64 : Math.max(0, (e.bounds ? e.bounds.y0 : 64)) });
        const bounds = computeModelBounds(project);
        if (bounds) window.VoxelRenderer.setModelBounds(bounds);
      }
      if (els.projectTitle) els.projectTitle.textContent = isDuomo ? "Cathedral of Santa Maria del Fiore" : project.title;
      if (els.projectSelect) els.projectSelect.value = id;
      loadProject(project);
      return true;
    }).catch(err => { console.error(err); return false; });
  }

  function getMode() { return mode; }

  return {
    init,
    goToStep,
    nextStep,
    prevStep,
    loadProject,
    selectModule,
    enterOverviewMode,
    exitOverviewMode,
    setMode,
    getMode,
    selectProject,
    citySelect
  };
})();

// Automatisch nach DOM-Laden starten
document.addEventListener("DOMContentLoaded", () => {
  window.App.init();
});
