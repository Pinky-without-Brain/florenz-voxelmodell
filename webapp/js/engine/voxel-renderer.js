/**
 * Voxel Renderer: WebGL-3D-Rendering für Minecraft-Modelle im Meisterbauer-Stil
 * Unterstützt isometrische Kamera, Hervorhebung neuer Bauschritte (Glow/Highlight),
 * Ghosting früherer Blöcke, OrbitControls und Koordinaten-Inspektor.
 * Vollständig modular und wiederverwendbar!
 */
window.VoxelRenderer = (function() {
  let scene, camera, renderer, controls;
  let containerEl;
  let isOrthographic = false;
  let perspectiveCam, orthoCam;
  let isCameraLocked = true; // Ansicht bleibt bei Schrittwechsel standardmäßig fest
  
  // Meshes & Groups
  let baseBlocksGroup;
  let previousBlocksGroup;
  let currentBlocksGroup;
  let gridHelperGroup;
  let highlightOutlineMesh;
  
  // Materials Cache
  const materialCache = {};
  let ghostMaterial;
  let highlightMaterial;

  function init(container) {
    containerEl = container;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF0F4F8); // Heller Hintergrund

    // 2. Kameras (Perspektivisch & Orthografisch für Isometrie)
    const aspect = width / height;
    perspectiveCam = new THREE.PerspectiveCamera(45, aspect, 0.5, 2000);
    perspectiveCam.position.set(70, 110, 80);

    const frustumSize = 100;
    orthoCam = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      2000
    );
    orthoCam.position.set(100, 100, 100);

    camera = perspectiveCam;

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Gruppen für Modell
    baseBlocksGroup = new THREE.Group();
    previousBlocksGroup = new THREE.Group();
    currentBlocksGroup = new THREE.Group();
    gridHelperGroup = new THREE.Group();
    scene.add(baseBlocksGroup);
    scene.add(previousBlocksGroup);
    scene.add(currentBlocksGroup);
    scene.add(gridHelperGroup);

    // 5. Toskanische Landschaft & Beleuchtung
    setupLighting();
    setupTuscanLandscape();

    // 6. OrbitControls
    setupControls();

    // 7. Raster & Bodenplatte (100% deckungsgleich mit Minecraft)
    setupGroundGrid();

    // 8. Resize Handler
    window.addEventListener("resize", onWindowResize);

    // 9. Animation Loop
    animate();

    return {
      renderStep,
      toggleCameraMode,
      setCameraView,
      resetCamera,
      setCameraLock: (locked) => { isCameraLocked = locked; },
      toggleCameraLock: () => { isCameraLocked = !isCameraLocked; return isCameraLocked; },
      isCameraLocked: () => isCameraLocked
    };
  }

  function setupLighting() {
    // Warmes toskanisches Umgebungslicht
    const ambientLight = new THREE.AmbientLight(0xFFF3E0, 0.70);
    scene.add(ambientLight);

    // Goldene toskanische Nachmittagssonne
    const sunLight = new THREE.DirectionalLight(0xFFF6E5, 0.95);
    sunLight.position.set(140, 220, 110);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 600;
    const d = 180;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Sanftes Azurblaues Himmels-Aufhelllicht
    const fillLight = new THREE.DirectionalLight(0xB2D8F7, 0.35);
    fillLight.position.set(-120, 90, -120);
    scene.add(fillLight);
  }

  function setupControls() {
    if (typeof THREE.OrbitControls !== "undefined") {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.maxPolarAngle = Math.PI / 2 - 0.02; // Nicht unter die Erde clippen
      controls.target.set(0, 64, 0);
    }
  }

  function setupGroundGrid() {
    gridHelperGroup.clear();

    // 1. Die gepflasterte Piazza del Duomo (Grundebene auf Y=63.92)
    // Weite 640x420 Blöcke deckt von Piazza San Giovanni (-320) bis Museo dell'Opera (+240) ab
    const plazaGeo = new THREE.PlaneGeometry(640, 420);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xDDD4C5, // Warmes florentinisches Sandsteinpflaster (Pietraforte)
      roughness: 0.85,
      metalness: 0.05
    });
    const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
    plazaMesh.rotation.x = -Math.PI / 2;
    plazaMesh.position.set(-40, 63.92, 0);
    plazaMesh.receiveShadow = true;
    gridHelperGroup.add(plazaMesh);

    // 2. EXAKTES MINECRAFT-BLOCKRASTER (1:1 DECKUNGSGLEICH MIT DEN BLÖCKEN)
    // Größe 400x400 mit 400 Unterteilungen = jede Gitterzelle ist EXAKT 1.0 x 1.0 Blöcke groß!
    // Da 400 gerade ist, verlaufen die Gitterlinien haargenau auf den ganzzahligen Koordinaten
    // ... -2, -1, 0, 1, 2 ... Ein Minecraft-Block [X, X+1] liegt somit EXAKT in einer Gitterzelle!
    const blockGrid = new THREE.GridHelper(400, 400, 0x0055BF, 0x9CB0C4);
    blockGrid.position.set(0, 63.98, 0);
    if (blockGrid.material) {
      blockGrid.material.transparent = true;
      blockGrid.material.opacity = 0.55;
    }
    gridHelperGroup.add(blockGrid);

    // 3. GROBES 10x10 BLOCKRASTER ZUR SCHNELLEN ORIENTIERUNG
    // Alle 10 Blöcke eine markantere Linie, damit man nicht jeden Block einzeln zählen muss!
    const majorGrid = new THREE.GridHelper(400, 40, 0xD03020, 0x486480);
    majorGrid.position.set(0, 63.985, 0);
    if (majorGrid.material) {
      majorGrid.material.transparent = true;
      majorGrid.material.opacity = 0.75;
    }
    gridHelperGroup.add(majorGrid);

    // 4. HAUPTACHSEN (X = Rot/Ost-West, Z = Blau/Nord-Süd)
    const axisMatX = new THREE.LineBasicMaterial({ color: 0xD02020, linewidth: 2 });
    const axisMatZ = new THREE.LineBasicMaterial({ color: 0x1050D0, linewidth: 2 });

    const xLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-200, 63.99, 0),
      new THREE.Vector3(200, 63.99, 0)
    ]);
    const zLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 63.99, -200),
      new THREE.Vector3(0, 63.99, 200)
    ]);
    gridHelperGroup.add(new THREE.Line(xLineGeo, axisMatX));
    gridHelperGroup.add(new THREE.Line(zLineGeo, axisMatZ));

    // 5. GOLDENER NULLSTEIN-INDIKATOR (0, 64, 0)
    // Markiert das exakte 1x1 Quadrat von [0, 1] in X und [0, 1] in Z
    const originTileGeo = new THREE.PlaneGeometry(1, 1);
    const originTileMat = new THREE.MeshBasicMaterial({ color: 0xFFD700, side: THREE.DoubleSide });
    const originTile = new THREE.Mesh(originTileGeo, originTileMat);
    originTile.rotation.x = -Math.PI / 2;
    originTile.position.set(0.5, 63.992, 0.5);
    gridHelperGroup.add(originTile);

    // 6. 3D-HIMMELSRICHTUNGS-MARKER
    createDirectionMarker("WESTEN (-X) [Fassade]", -180, 0, 0xD02020);
    createDirectionMarker("OSTEN (+X) [Chor]", 180, 0, 0xD02020);
    createDirectionMarker("NORDEN (-Z)", 0, -120, 0x1050D0);
    createDirectionMarker("SÜDEN (+Z) [Campanile]", 0, 120, 0x1050D0);
  }

  function createDirectionMarker(text, x, z, colorHex) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(255, 255, 255, 0.90)";
    if (ctx.roundRect) {
      ctx.roundRect(4, 4, 248, 56, 10);
    } else {
      ctx.fillRect(4, 4, 248, 56);
    }
    ctx.fill();
    ctx.strokeStyle = typeof colorHex === "number" ? "#" + colorHex.toString(16).padStart(6, "0") : colorHex;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#111111";
    ctx.font = "bold 18px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(x, 66, z);
    sprite.scale.set(16, 4, 1);
    gridHelperGroup.add(sprite);
  }

  function setupTuscanLandscape() {
    // 1. Sanfter toskanischer Dunst (Atmosphärischer Horizontnebel)
    scene.fog = new THREE.FogExp2(0xFBE7D2, 0.00045);

    // 2. Toskanische Himmelskuppel (Sky Dome mit Farbverlauf)
    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 128;
    skyCanvas.height = 512;
    const sCtx = skyCanvas.getContext("2d");
    const skyGrad = sCtx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0.0, "#3E74B8"); // Italienisches Azurblau oben
    skyGrad.addColorStop(0.45, "#7CB2E8"); // Heller Nachmittagshimmel
    skyGrad.addColorStop(0.80, "#FBD4A4"); // Goldene toskanische Horizont-Sonne
    skyGrad.addColorStop(1.0, "#FCE7D2"); // Dunst am Boden
    sCtx.fillStyle = skyGrad;
    sCtx.fillRect(0, 0, 128, 512);

    const skyTex = new THREE.CanvasTexture(skyCanvas);
    const skyGeo = new THREE.SphereGeometry(1500, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // 3. Sanfte toskanische Hügel (WEIT HINTER DER STADT: Radius > 650)
    const terrainGeo = new THREE.PlaneGeometry(2800, 2800, 90, 90);
    terrainGeo.rotateX(-Math.PI / 2);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const dist = Math.sqrt(vx * vx + vz * vz);
      let vy = 63.7;
      if (dist > 650) {
        // Sanfter Hügelanstieg der toskanischen Landschaft (Fiesole & Monte Morello) weit außerhalb der Piazza
        const d = dist - 650;
        vy += d * 0.09 + Math.sin(vx * 0.008) * Math.cos(vz * 0.008) * 36 + Math.sin(vx * 0.018 + vz * 0.014) * 10;
      }
      pos.setY(i, vy);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x769656, // Warmes toskanisches Olivgrün
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // 4. Toskanische Zypressen (AUF DEN ENTFERNTEN HÜGELN: dist > 680)
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.7, 5.0, 6);
    const foliageGeo = new THREE.ConeGeometry(2.0, 16, 7);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x483424, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1B3E1F, roughness: 0.8 }); // Dunkles Zypressengrün

    const cypressGroup = new THREE.Group();
    for (let i = 0; i < 75; i++) {
      const angle = (i / 75) * Math.PI * 2 + (Math.sin(i * 3) * 0.2);
      const dist = 680 + ((i * 47) % 320);
      const tx = Math.cos(angle) * dist;
      const tz = Math.sin(angle) * dist;
      const d = dist - 650;
      const ty = 63.7 + d * 0.09 + Math.sin(tx * 0.008) * Math.cos(tz * 0.008) * 36 + Math.sin(tx * 0.018 + tz * 0.014) * 10;

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2.5;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 10.5;
      foliage.castShadow = true;
      tree.add(foliage);

      tree.position.set(tx, ty, tz);
      const scale = 1.0 + ((i * 17) % 40) / 100;
      tree.scale.set(scale, scale, scale);
      cypressGroup.add(tree);
    }
    scene.add(cypressGroup);

    // 5. HISTORISCHE RENAISSANCE-PALÄSTE DER PIAZZA DEL DUOMO (ORIGINALGETREU PLATZIERT)
    setupAuthenticFlorencePiazza();

    // 6. Fluss Arno (Fiume Arno weit im Süden auf Z = +550)
    const riverGeo = new THREE.PlaneGeometry(1600, 75);
    riverGeo.rotateX(-Math.PI / 2);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x48769E,
      roughness: 0.2,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85
    });
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    riverMesh.position.set(0, 63.5, 550);
    scene.add(riverMesh);
  }

  function setupAuthenticFlorencePiazza() {
    const piazzaGroup = new THREE.Group();

    // Materialpalette für Florentiner Renaissance-Paläste
    const wallOcher = new THREE.MeshStandardMaterial({ color: 0xE8BA7E, roughness: 0.85 }); // Florentiner Pietraforte-Sandstein
    const wallTerra = new THREE.MeshStandardMaterial({ color: 0xD48A5E, roughness: 0.85 }); // Toskanischer Putz
    const wallRustica = new THREE.MeshStandardMaterial({ color: 0xB5A38C, roughness: 0.90 }); // Rustika-Sockel
    const roofTileMat = new THREE.MeshStandardMaterial({ color: 0xB54228, roughness: 0.70 }); // Ziegeldach
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x2A3238, roughness: 0.4, metalness: 0.2 }); // Fensteröffnungen

    // 0. Historisches Platzpflaster der Piazza del Duomo & Piazza San Giovanni
    const piazzaFloorGeo = new THREE.PlaneGeometry(640, 440);
    piazzaFloorGeo.rotateX(-Math.PI / 2);
    const piazzaFloorMat = new THREE.MeshStandardMaterial({
      color: 0xBEB49E, // Authentischer toskanischer Pietraforte-Plattenbelag
      roughness: 0.92,
      metalness: 0.05
    });
    const piazzaFloorMesh = new THREE.Mesh(piazzaFloorGeo, piazzaFloorMat);
    piazzaFloorMesh.position.set(-50, 63.85, 0);
    piazzaFloorMesh.receiveShadow = true;
    piazzaGroup.add(piazzaFloorMesh);

    // Weiße Marmorbänder (Marmortrambahnen / historische Prozessionsachsen)
    const marbleInlayMat = new THREE.MeshStandardMaterial({ color: 0xDFDBD0, roughness: 0.8 });
    const inlays = [
      { x: -168, z: 0, w: 2.5, d: 240 }, // West-Ost-Achse vor der Fassade
      { x: -50, z: -140, w: 320, d: 2.0 }, // Nordachse
      { x: -50, z: 140, w: 320, d: 2.0 },  // Südachse
      { x: -230, z: 0, w: 75, d: 2.0 }     // Baptisteriums-Quere
    ];
    inlays.forEach(inl => {
      const inlayGeo = new THREE.PlaneGeometry(inl.w, inl.d);
      inlayGeo.rotateX(-Math.PI / 2);
      const inlayMesh = new THREE.Mesh(inlayGeo, marbleInlayMat);
      inlayMesh.position.set(inl.x, 63.88, inl.z);
      inlayMesh.receiveShadow = true;
      piazzaGroup.add(inlayMesh);
    });

    function createPalazzo(name, x, z, width, depth, height, styleColor = wallOcher) {
      const pal = new THREE.Group();

      // Sockelgeschoss (Rustika)
      const baseH = 6;
      const baseGeo = new THREE.BoxGeometry(width, baseH, depth);
      const baseMesh = new THREE.Mesh(baseGeo, wallRustica);
      baseMesh.position.y = baseH / 2;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      pal.add(baseMesh);

      // Obergeschosse (Piano Nobile & Mezzanin)
      const upperH = height - baseH;
      const upperGeo = new THREE.BoxGeometry(width * 0.98, upperH, depth * 0.98);
      const upperMesh = new THREE.Mesh(upperGeo, styleColor);
      upperMesh.position.y = baseH + upperH / 2;
      upperMesh.castShadow = true;
      upperMesh.receiveShadow = true;
      pal.add(upperMesh);

      // Fensterreihen (Biforien-Fassade)
      const winRows = Math.floor(upperH / 5.5);
      const winCols = Math.floor(width / 14);
      for (let r = 0; r < winRows; r++) {
        const wy = baseH + 3.0 + r * 5.2;
        for (let c = 0; c < winCols; c++) {
          const wx = -width / 2 + 7 + c * 14;
          const winGeo = new THREE.BoxGeometry(2.4, 3.2, depth + 0.3);
          const winMesh = new THREE.Mesh(winGeo, windowMat);
          winMesh.position.set(wx, wy, 0);
          pal.add(winMesh);
        }
      }

      // Kräftiges Florentiner Kranzgesims (Cornicione)
      const corniceGeo = new THREE.BoxGeometry(width * 1.04, 1.4, depth * 1.04);
      const corniceMesh = new THREE.Mesh(corniceGeo, wallRustica);
      corniceMesh.position.y = height + 0.7;
      corniceMesh.castShadow = true;
      pal.add(corniceMesh);

      // Flaches toskanisches Ziegeldach
      const roofGeo = new THREE.BoxGeometry(width * 0.94, 2.5, depth * 0.94);
      const roofMesh = new THREE.Mesh(roofGeo, roofTileMat);
      roofMesh.position.y = height + 1.4 + 1.25;
      roofMesh.castShadow = true;
      pal.add(roofMesh);

      pal.position.set(x, 63.92, z);
      piazzaGroup.add(pal);
    }

    // 1. Palazzo Arcivescovile (Westlich des Baptisteriums, Piazza San Giovanni)
    // Weit genug westlich (X = -345), damit der Platz vor dem Paradiesportal frei atmen kann!
    createPalazzo("Palazzo Arcivescovile", -345, 0, 46, 100, 26, wallOcher);

    // 2. Loggia del Bigallo & Misericordia di Firenze (Südwest-Ecke, gegenüber Glockenturm)
    createPalazzo("Misericordia & Loggia del Bigallo", -230, 125, 34, 38, 22, wallTerra);

    // 3. Palazzo dei Canonici (Südflanke des Doms mit Brunelleschi- & Arnolfo-Statuen)
    // Sicher auf Z = +190 platziert – volle 84 Blöcke lichte Weite zur Südtribune!
    createPalazzo("Palazzo dei Canonici", -15, 190, 160, 36, 24, wallOcher);

    // 4. Museo dell'Opera del Duomo (Hinter dem Ostchor / Apsis)
    // Auf X = +240 platziert – volle 114 Blöcke lichte Weite zur Chorapsis!
    createPalazzo("Museo dell'Opera del Duomo", 240, 0, 36, 80, 24, wallTerra);

    // 5. Palazzi der Nordseite der Piazza (Palazzo Strozzi-Sacrati / Guadagni dell'Opera)
    // Sicher auf Z = -195 platziert – volle 89 Blöcke lichte Weite zur Nordtribune!
    createPalazzo("Palazzo Guadagni dell'Opera", -45, -195, 230, 36, 25, wallOcher);

    scene.add(piazzaGroup);

    // Historische Straßen- und Platzschilder
    createDirectionMarker("Via de' Calzaiuoli ➔ (Piazza Signoria)", -190, 150, 0x8B4513);
    createDirectionMarker("Via de' Martelli ➔ (Palazzo Medici)", -195, -190, 0x8B4513);
    createDirectionMarker("Via dei Servi ➔ (SS. Annunziata)", 60, -190, 0x8B4513);
    createDirectionMarker("Via del Proconsolo ➔ (Bargello)", 180, 160, 0x8B4513);
    createDirectionMarker("Via de' Cerretani ➔ (SM Novella)", -345, -75, 0x8B4513);
    createDirectionMarker("Piazza San Giovanni", -230, -55, 0xD4AF37);
  }

  function getBlockMaterial(blockType, isCurrentStep = false) {
    const key = `${blockType}_${isCurrentStep ? "active" : "previous"}`;
    if (materialCache[key]) return materialCache[key];

    const def = window.BLOCK_TYPES[blockType] || { color: "#888888" };
    const texture = window.TextureGenerator ? window.TextureGenerator.getThreeTexture(blockType) : null;

    let mat;
    if (isCurrentStep) {
      // Aktueller Schritt: Strahlende Farben & markante Kanten
      mat = new THREE.MeshStandardMaterial({
        map: texture,
        color: def.color,
        roughness: 0.3,
        metalness: blockType === "gold_block" ? 0.7 : 0.1,
        emissive: new THREE.Color(def.color),
        emissiveIntensity: 0.15
      });
    } else {
      // Vorherige Schritte: Normal oder dezent zurückhaltend
      mat = new THREE.MeshStandardMaterial({
        map: texture,
        color: def.color,
        roughness: 0.6,
        metalness: blockType === "gold_block" ? 0.5 : 0.05
      });
    }

    materialCache[key] = mat;
    return mat;
  }

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const edgesGeo = new THREE.EdgesGeometry(boxGeo);
  const activeEdgeMaterial = new THREE.LineBasicMaterial({ color: 0xFFCC00, linewidth: 2 }); // Leuchtendes Goldgelb
  const prevEdgeMaterial = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.25 });

  let showBaseBlocks = true;
  let currentBaseBlocksCount = -1;

  function setBaseBlocks(blockList) {
    const newCount = blockList ? blockList.length : 0;
    if (newCount === currentBaseBlocksCount && baseBlocksGroup.children.length > 0) {
      baseBlocksGroup.visible = showBaseBlocks;
      return;
    }
    currentBaseBlocksCount = newCount;
    baseBlocksGroup.clear();
    if (!blockList || blockList.length === 0) return;
    buildBlockGroup(baseBlocksGroup, blockList, false);
    baseBlocksGroup.visible = showBaseBlocks;
  }

  function setBaseBlocksVisible(visible) {
    showBaseBlocks = visible;
    baseBlocksGroup.visible = visible;
  }

  function toggleBaseBlocks() {
    showBaseBlocks = !showBaseBlocks;
    baseBlocksGroup.visible = showBaseBlocks;
    return showBaseBlocks;
  }

  function isBaseBlocksVisible() {
    return showBaseBlocks;
  }

  function renderOverview(allBlocks) {
    baseBlocksGroup.clear();
    previousBlocksGroup.clear();
    currentBlocksGroup.clear();

    if (allBlocks && allBlocks.length > 0) {
      buildBlockGroup(previousBlocksGroup, allBlocks, false);
    }
    if (controls) {
      smoothMoveCamera([-260, 180, 220], [-40, 100, 0]);
    }
  }

  function setCameraLock(locked) {
    isCameraLocked = locked;
  }

  function toggleCameraLock() {
    isCameraLocked = !isCameraLocked;
    return isCameraLocked;
  }

  function isCameraLockedStatus() {
    return isCameraLocked;
  }

  /**
   * Rendert den aktuellen Bauschritt:
   * - frühere Blöcke: in previousBlocksGroup
   * - neue Blöcke des aktuellen Schritts: in currentBlocksGroup mit leuchtendem Highlight
   * - optional baseBlocks: frühere Module in baseBlocksGroup
   */
  function renderStep(cumulativeBlocks, currentStepBlocks, cameraHint, baseBlocks) {
    // 1. Frühere Blöcke neu aufbauen
    previousBlocksGroup.clear();
    const prevMap = {};
    if (currentStepBlocks) {
      currentStepBlocks.forEach(b => {
        prevMap[`${b.x},${b.y},${b.z}`] = true;
      });
    }

    // Erzeuge Instanzen oder Meshes für frühere Blöcke
    if (cumulativeBlocks && cumulativeBlocks.length > 0) {
      const prevBlocks = cumulativeBlocks.filter(b => !prevMap[`${b.x},${b.y},${b.z}`]);
      buildBlockGroup(previousBlocksGroup, prevBlocks, false);
    }

    // 2. Aktuelle Blöcke mit Highlight aufbauen
    currentBlocksGroup.clear();
    if (currentStepBlocks && currentStepBlocks.length > 0) {
      buildBlockGroup(currentBlocksGroup, currentStepBlocks, true);
    }

    // 3. Basis-Blöcke (bereits fertig gebaute Module)
    if (baseBlocks !== undefined) {
      setBaseBlocks(baseBlocks);
    }

    // 4. Kamera sanft ausrichten NUR WENN Ansicht NICHT gelockt ist!
    if (!isCameraLocked && cameraHint && controls) {
      smoothMoveCamera(cameraHint.eye, cameraHint.target);
    }
  }

  function buildBlockGroup(group, blockList, isCurrent) {
    // Gruppiere nach Block-Typ für effizientes Rendern
    const byType = {};
    blockList.forEach(b => {
      byType[b.type] = byType[b.type] || [];
      byType[b.type].push(b);
    });

    for (const [type, list] of Object.entries(byType)) {
      const mat = getBlockMaterial(type, isCurrent);
      const count = list.length;
      
      const instancedMesh = new THREE.InstancedMesh(boxGeo, mat, count);
      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;
      // WICHTIG: Frustum Culling deaktivieren, damit InstancedMesh bei großen Modellen nie clippt!
      instancedMesh.frustumCulled = false;

      const dummy = new THREE.Object3D();
      for (let i = 0; i < count; i++) {
        const b = list[i];
        // Zentriere Minecraft-Blöcke (Mittelpunkt auf x+0.5, y+0.5, z+0.5)
        dummy.position.set(b.x + 0.5, b.y + 0.5, b.z + 0.5);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        // Bei aktuellem Schritt: leuchtende Kantenkontur hinzufügen
        if (isCurrent && count < 300) {
          const edgeLine = new THREE.LineSegments(edgesGeo, activeEdgeMaterial);
          edgeLine.position.set(b.x + 0.5, b.y + 0.5, b.z + 0.5);
          group.add(edgeLine);
        }
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
      group.add(instancedMesh);
    }
  }

  function smoothMoveCamera(targetEye, targetLookAt, immediate = false) {
    if (!controls) return;
    if (immediate) {
      camera.position.set(...targetEye);
      controls.target.set(...targetLookAt);
      controls.update();
      return;
    }
    const startEye = camera.position.clone();
    const startLook = controls.target.clone();
    const endEye = new THREE.Vector3(...targetEye);
    const endLook = new THREE.Vector3(...targetLookAt);

    let progress = 0;
    function stepAnim() {
      progress += 0.08;
      if (progress > 1) progress = 1;
      camera.position.lerpVectors(startEye, endEye, progress);
      controls.target.lerpVectors(startLook, endLook, progress);
      controls.update();
      if (progress < 1) {
        requestAnimationFrame(stepAnim);
      }
    }
    stepAnim();
  }

  function toggleCameraMode() {
    isOrthographic = !isOrthographic;
    const oldPos = camera.position.clone();
    const oldTarget = controls ? controls.target.clone() : new THREE.Vector3(0, 64, 0);

    if (isOrthographic) {
      camera = orthoCam;
    } else {
      camera = perspectiveCam;
    }

    camera.position.copy(oldPos);
    if (controls) {
      controls.object = camera;
      controls.target.copy(oldTarget);
      controls.update();
    }
    onWindowResize();
    return isOrthographic ? "Isometrisch" : "Perspektivisch";
  }

  function setCameraView(viewName) {
    if (!controls) return;
    switch (viewName) {
      case "iso":
        smoothMoveCamera([80, 115, 80], [0, 64, 0]);
        break;
      case "top":
        smoothMoveCamera([0, 180, 0.1], [0, 64, 0]);
        break;
      case "west":
        smoothMoveCamera([-180, 80, 0], [-100, 64, 0]);
        break;
      case "east":
        smoothMoveCamera([180, 80, 0], [60, 64, 0]);
        break;
    }
  }

  function resetCamera() {
    smoothMoveCamera([70, 110, 80], [0, 64, 0]);
  }

  function onWindowResize() {
    if (!containerEl || !renderer) return;
    const width = containerEl.clientWidth;
    const height = containerEl.clientHeight;
    const aspect = width / height;

    perspectiveCam.aspect = aspect;
    perspectiveCam.updateProjectionMatrix();

    const frustumSize = 100;
    orthoCam.left = (-frustumSize * aspect) / 2;
    orthoCam.right = (frustumSize * aspect) / 2;
    orthoCam.top = frustumSize / 2;
    orthoCam.bottom = -frustumSize / 2;
    orthoCam.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    
    // Sanftes Pulsieren für aktive Teile
    const time = Date.now() * 0.003;
    activeEdgeMaterial.color.setHSL(0.12 + Math.sin(time) * 0.02, 1.0, 0.5 + Math.sin(time * 2) * 0.15);

    renderer.render(scene, camera);
  }

  return {
    init,
    renderStep,
    setBaseBlocks,
    setBaseBlocksVisible,
    toggleBaseBlocks,
    isBaseBlocksVisible,
    renderOverview,
    toggleCameraMode,
    setCameraView,
    resetCamera,
    moveCamera: smoothMoveCamera,
    setCameraLock,
    toggleCameraLock,
    isCameraLocked: isCameraLockedStatus
  };
})();
