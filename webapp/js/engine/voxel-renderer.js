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
  let sunLight;
  let siteGroup;

  // Bounding Box aller geladenen V2-Blöcke (setModelBounds); Standardwert bis dahin
  let modelBounds = { minX: -100, maxX: 100, minY: 64, maxY: 200, minZ: -100, maxZ: 100 };
  const PERSPECTIVE_FOV = 45;
  const ORTHO_FRUSTUM = 100;
  
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
    perspectiveCam = new THREE.PerspectiveCamera(PERSPECTIVE_FOV, aspect, 0.5, 2000);
    perspectiveCam.position.set(70, 110, 80);

    const frustumSize = ORTHO_FRUSTUM;
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
      setModelBounds,
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
    sunLight = new THREE.DirectionalLight(0xFFF6E5, 0.95);
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
    scene.add(sunLight.target);

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
    const b = modelBounds;
    const P = (window.SITE_V2 && window.SITE_V2.piazza && window.SITE_V2.piazza.bounds) ||
      { minX: b.minX - 100, maxX: b.maxX + 100, minZ: b.minZ - 100, maxZ: b.maxZ + 100 };

    // 1. Die gepflasterte Piazza del Duomo (Fläche aus SITE_V2.piazza.bounds bei Y=63.9)
    const plazaGeo = new THREE.PlaneGeometry(P.maxX - P.minX, P.maxZ - P.minZ);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xDDD4C5, // Warmes florentinisches Sandsteinpflaster (Pietraforte)
      roughness: 0.85,
      metalness: 0.05
    });
    const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
    plazaMesh.rotation.x = -Math.PI / 2;
    plazaMesh.position.set((P.minX + P.maxX) / 2, 63.9, (P.minZ + P.maxZ) / 2);
    plazaMesh.receiveShadow = true;
    gridHelperGroup.add(plazaMesh);

    // 2. EXAKTES MINECRAFT-BLOCKRASTER (1:1 DECKUNGSGLEICH MIT DEN BLÖCKEN)
    // Quadratisch, Mitte auf einem Vielfachen von 10 und gerade Teilung: Gitterlinien liegen
    // haargenau auf ganzzahligen Koordinaten, ein Block liegt somit EXAKT in einer Gitterzelle.
    // Größe: umfasst die Modell-Bounding-Box mit Rand.
    const snap10 = (v) => Math.round(v / 10) * 10;
    const gx = snap10((b.minX + b.maxX) / 2), gz = snap10((b.minZ + b.maxZ) / 2);
    const span = Math.max(b.maxX - b.minX, b.maxZ - b.minZ) + 40;
    const gridSize = Math.ceil(span / 20) * 20;
    const blockGrid = new THREE.GridHelper(gridSize, gridSize, 0x0055BF, 0x9CB0C4);
    blockGrid.position.set(gx, 63.98, gz);
    if (blockGrid.material) {
      blockGrid.material.transparent = true;
      blockGrid.material.opacity = 0.55;
    }
    gridHelperGroup.add(blockGrid);

    // 3. GROBES 10x10 BLOCKRASTER ZUR SCHNELLEN ORIENTIERUNG
    const majorGrid = new THREE.GridHelper(gridSize, gridSize / 10, 0xD03020, 0x486480);
    majorGrid.position.set(gx, 63.985, gz);
    if (majorGrid.material) {
      majorGrid.material.transparent = true;
      majorGrid.material.opacity = 0.75;
    }
    gridHelperGroup.add(majorGrid);

    // 4. HAUPTACHSEN (X = Rot/Ost-West, Z = Blau/Nord-Süd) durch den Ursprung
    const axisMatX = new THREE.LineBasicMaterial({ color: 0xD02020, linewidth: 2 });
    const axisMatZ = new THREE.LineBasicMaterial({ color: 0x1050D0, linewidth: 2 });
    const xLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(gx - gridSize / 2, 63.99, 0),
      new THREE.Vector3(gx + gridSize / 2, 63.99, 0)
    ]);
    const zLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 63.99, gz - gridSize / 2),
      new THREE.Vector3(0, 63.99, gz + gridSize / 2)
    ]);
    gridHelperGroup.add(new THREE.Line(xLineGeo, axisMatX));
    gridHelperGroup.add(new THREE.Line(zLineGeo, axisMatZ));

    // 5. GOLDENER NULLSTEIN-INDIKATOR (0, 64, 0)
    const originTileGeo = new THREE.PlaneGeometry(1, 1);
    const originTileMat = new THREE.MeshBasicMaterial({ color: 0xFFD700, side: THREE.DoubleSide });
    const originTile = new THREE.Mesh(originTileGeo, originTileMat);
    originTile.rotation.x = -Math.PI / 2;
    originTile.position.set(0.5, 63.992, 0.5);
    gridHelperGroup.add(originTile);

    // 6. 3D-HIMMELSRICHTUNGS-MARKER am Rand der Piazza
    const cx = (P.minX + P.maxX) / 2, cz = (P.minZ + P.maxZ) / 2;
    createDirectionMarker("WESTEN (-X) [Fassade]", P.minX + 40, cz, 0xD02020, gridHelperGroup, 66, 2);
    createDirectionMarker("OSTEN (+X) [Chor]", P.maxX - 40, cz, 0xD02020, gridHelperGroup, 66, 2);
    createDirectionMarker("NORDEN (-Z)", cx, P.minZ + 25, 0x1050D0, gridHelperGroup, 66, 2);
    createDirectionMarker("SÜDEN (+Z) [Campanile]", cx, P.maxZ - 25, 0x1050D0, gridHelperGroup, 66, 2);
  }

  // Lichtrichtung und Schattenbereich an die Modellgröße anpassen
  function fitSunToBounds() {
    if (!sunLight) return;
    const b = modelBounds;
    const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2, cy = (b.minY + b.maxY) / 2;
    const r = Math.hypot(b.maxX - b.minX, b.maxY - b.minY, b.maxZ - b.minZ) / 2;
    sunLight.target.position.set(cx, cy, cz);
    sunLight.position.set(cx + r * 0.7, cy + r * 1.1, cz + r * 0.55);
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = r * 4;
    sunLight.shadow.camera.left = -r;
    sunLight.shadow.camera.right = r;
    sunLight.shadow.camera.top = r;
    sunLight.shadow.camera.bottom = -r;
    sunLight.shadow.camera.updateProjectionMatrix();
  }

  function createDirectionMarker(text, x, z, colorHex, parent, y, scale) {
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
    sprite.position.set(x, y || 66, z);
    const sc = scale || 1;
    sprite.scale.set(16 * sc, 4 * sc, 1);
    (parent || gridHelperGroup).add(sprite);
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
    // Piazza (X -460..330, Z -280..280, Ecke ~540 vom Ursprung) und alle Gebäude (<= ~610) liegen
    // vollständig im flachen Bereich; Bäume stehen erst ab Radius 680.
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

  // Umgebungsbebauung aus SITE_V2 (OpenStreetMap): extrudierte Polygone ab Y 64 mit rotem Dach, dazu Straßenschilder.
  function setupAuthenticFlorencePiazza() {
    if (siteGroup) { scene.remove(siteGroup); disposeGroup(siteGroup); }
    siteGroup = new THREE.Group();
    const site = window.SITE_V2;
    if (!site) { scene.add(siteGroup); return; }

    // Toskanische Fassadenfarben (Ocker/Terra), deterministisch je Gebäude gewählt
    const wallColors = [0xE8BA7E, 0xD48A5E, 0xDDB27A, 0xCFA070, 0xC98B62, 0xE3C08F, 0xD9A16F, 0xBF8A5F];
    const wallMats = wallColors.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }));
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xA33B26, roughness: 0.70 }); // Ziegeldach
    const ROOF_THICKNESS = 1.5;

    (site.buildings || []).forEach((bld, i) => {
      const pts = bld.poly.slice();
      const f = pts[0], l = pts[pts.length - 1];
      if (pts.length > 1 && f[0] === l[0] && f[1] === l[1]) pts.pop();
      if (pts.length < 3) return;
      // Shape in (x, -z): nach rotateX(-90°) landet der Punkt bei (x, z), die Extrusion zeigt nach +Y
      const shape = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], -p[1])));
      const wallGeo = new THREE.ExtrudeGeometry(shape, { depth: bld.h, bevelEnabled: false });
      wallGeo.rotateX(-Math.PI / 2);
      const wall = new THREE.Mesh(wallGeo, wallMats[hashIndex(i, bld.h) % wallMats.length]);
      wall.position.y = 64;
      wall.castShadow = true;
      wall.receiveShadow = true;
      siteGroup.add(wall);

      const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: ROOF_THICKNESS, bevelEnabled: false });
      roofGeo.rotateX(-Math.PI / 2);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 64 + bld.h;
      roof.castShadow = true;
      siteGroup.add(roof);
    });

    // Straßenschilder an den Einmündungen
    (site.landmarks || []).forEach(lm => {
      createDirectionMarker(lm.label || lm.name, lm.x, lm.z, 0x8B4513, siteGroup, 72, 3);
    });

    scene.add(siteGroup);
  }

  // Deterministischer Index je Gebäude
  function hashIndex(i, h) {
    let v = Math.imul(i + 1, 2654435761) ^ Math.imul(h + 7, 40503);
    v ^= v >>> 13;
    return v >>> 0;
  }

  function disposeGroup(group) {
    group.children.forEach(c => {
      if (c.geometry && c.geometry !== boxGeo && c.geometry !== edgesGeo) c.geometry.dispose();
      if (c.dispose) c.dispose();
    });
    group.clear();
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

    // Buntglas: halbtransparent, schreibt keine Tiefe
    if (isGlassType(blockType)) {
      mat.transparent = true;
      mat.opacity = GLASS_OPACITY;
      mat.depthWrite = false;
    }

    materialCache[key] = mat;
    return mat;
  }

  const GLASS_OPACITY = 0.55;
  function isGlassType(type) {
    return type === "water" || (type.length > 14 && type.endsWith("_stained_glass"));
  }

  // --- Verdeckungstest -------------------------------------------------------
  // Gepackter Schlüssel: x, z mit Bias 600 (je 10 Bit), y 9 Bit. Außerhalb des Bereichs: -1 (nie ausgeblendet).
  const KEY_BIAS = 600;
  const KX = 1 << 19, KZ = 1 << 9;
  function packKey(x, y, z) {
    const px = x + KEY_BIAS, pz = z + KEY_BIAS;
    if (px < 1 || px > 1022 || pz < 1 || pz > 1022 || y < 1 || y > 510) return -1;
    return (px << 19) | (pz << 9) | y;
  }

  /**
   * Bereitet eine Blockliste für die Darstellung vor.
   * occupancyList: Blöcke, die als Nachbarn zählen (Standard: blockList selbst).
   * Ein Block entfällt, wenn alle 6 Nachbarn belegt sind und keiner davon Glas ist.
   * Rückgabe: { visible: Block[], total }
   */
  function cullHidden(blockList, occupancyList) {
    const occ = new Set();
    const glass = new Set();
    const src = occupancyList || blockList;
    for (let i = 0; i < src.length; i++) {
      const b = src[i];
      const k = packKey(b.x, b.y, b.z);
      if (k < 0) continue;
      occ.add(k);
      if (isGlassType(b.type)) glass.add(k);
    }
    const hasGlass = glass.size > 0;
    const visible = [];
    for (let i = 0; i < blockList.length; i++) {
      const b = blockList[i];
      const k = packKey(b.x, b.y, b.z);
      if (k < 0 || (hasGlass && glass.has(k))) { visible.push(b); continue; }
      const kx1 = k + KX, kx0 = k - KX, kz1 = k + KZ, kz0 = k - KZ, ky1 = k + 1, ky0 = k - 1;
      if (occ.has(kx1) && occ.has(kx0) && occ.has(kz1) && occ.has(kz0) && occ.has(ky1) && occ.has(ky0)) {
        if (!hasGlass || !(glass.has(kx1) || glass.has(kx0) || glass.has(kz1) || glass.has(kz0) || glass.has(ky1) || glass.has(ky0))) {
          continue;
        }
      }
      visible.push(b);
    }
    return visible;
  }

  // Entfernt Kinder samt GPU-Puffern
  function clearGroup(group) {
    for (let i = 0; i < group.children.length; i++) {
      const c = group.children[i];
      if (c.isInstancedMesh && c.dispose) c.dispose();
    }
    group.clear();
  }

  const renderStats = { rendered: 0, total: 0 };

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
    clearGroup(baseBlocksGroup);
    if (!blockList || blockList.length === 0) return;
    buildBlockGroup(baseBlocksGroup, cullHidden(blockList), false);
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
    clearGroup(baseBlocksGroup);
    clearGroup(previousBlocksGroup);
    clearGroup(currentBlocksGroup);
    currentBaseBlocksCount = -1;

    const t0 = performance.now();
    let rendered = 0;
    const total = allBlocks ? allBlocks.length : 0;
    if (total > 0) {
      const visible = cullHidden(allBlocks);
      rendered = visible.length;
      buildBlockGroup(previousBlocksGroup, visible, false);
    }
    renderStats.rendered = rendered;
    renderStats.total = total;
    renderStats.ms = performance.now() - t0;
    console.log("Gesamtansicht: " + renderStats.ms.toFixed(0) + " ms, " + rendered + " von " + total + " Instanzen gerendert");
    if (controls) {
      moveToPreset("start");
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
    // 1. Frühere Blöcke neu aufbauen (verdeckte Blöcke entfallen)
    clearGroup(previousBlocksGroup);
    const curKeys = new Set();
    const curOutOfRange = new Set();
    if (currentStepBlocks) {
      currentStepBlocks.forEach(b => {
        const k = packKey(b.x, b.y, b.z);
        if (k >= 0) curKeys.add(k); else curOutOfRange.add(`${b.x},${b.y},${b.z}`);
      });
    }

    if (cumulativeBlocks && cumulativeBlocks.length > 0) {
      const prevBlocks = cumulativeBlocks.filter(b => {
        const k = packKey(b.x, b.y, b.z);
        return k >= 0 ? !curKeys.has(k) : !curOutOfRange.has(`${b.x},${b.y},${b.z}`);
      });
      // Die Blöcke des aktuellen Schritts zählen als Nachbarn (sie werden gezeichnet)
      buildBlockGroup(previousBlocksGroup, cullHidden(prevBlocks, cumulativeBlocks), false);
    }

    // 2. Aktuelle Blöcke mit Highlight aufbauen (immer vollständig)
    clearGroup(currentBlocksGroup);
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
    const byType = new Map();
    for (let i = 0; i < blockList.length; i++) {
      const b = blockList[i];
      let l = byType.get(b.type);
      if (!l) { l = []; byType.set(b.type, l); }
      l.push(b);
    }

    // Opake Typen zuerst, Glas danach (eigene InstancedMeshes)
    const opaque = [], glass = [];
    byType.forEach((list, type) => (isGlassType(type) ? glass : opaque).push([type, list]));

    [opaque, glass].forEach((entries, pass) => {
      for (const [type, list] of entries) {
        const mat = getBlockMaterial(type, isCurrent);
        const count = list.length;

        const instancedMesh = new THREE.InstancedMesh(boxGeo, mat, count);
        const isGlass = pass === 1;
        instancedMesh.castShadow = !isGlass;
        instancedMesh.receiveShadow = true;
        if (isGlass) instancedMesh.renderOrder = 1;
        // WICHTIG: Frustum Culling deaktivieren, damit InstancedMesh bei großen Modellen nie clippt!
        instancedMesh.frustumCulled = false;

        // Matrix direkt schreiben: Einheitsmatrix + Verschiebung (Blockmitte bei x+0.5, y+0.5, z+0.5)
        const arr = instancedMesh.instanceMatrix.array;
        for (let i = 0; i < count; i++) {
          const b = list[i];
          const o = i * 16;
          arr[o] = 1; arr[o + 5] = 1; arr[o + 10] = 1; arr[o + 15] = 1;
          arr[o + 12] = b.x + 0.5; arr[o + 13] = b.y + 0.5; arr[o + 14] = b.z + 0.5;

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
    });
  }

  function smoothMoveCamera(targetEye, targetLookAt, immediate = false, targetZoom) {
    if (!controls) return;
    const endZoom = targetZoom !== undefined ? targetZoom : null;
    if (immediate) {
      camera.position.set(...targetEye);
      controls.target.set(...targetLookAt);
      if (endZoom !== null && camera.isOrthographicCamera) {
        camera.zoom = endZoom;
        camera.updateProjectionMatrix();
      }
      controls.update();
      return;
    }
    const startEye = camera.position.clone();
    const startLook = controls.target.clone();
    const startZoom = camera.zoom;
    const endEye = new THREE.Vector3(...targetEye);
    const endLook = new THREE.Vector3(...targetLookAt);

    let progress = 0;
    function stepAnim() {
      progress += 0.08;
      if (progress > 1) progress = 1;
      camera.position.lerpVectors(startEye, endEye, progress);
      controls.target.lerpVectors(startLook, endLook, progress);
      if (endZoom !== null && camera.isOrthographicCamera) {
        camera.zoom = startZoom + (endZoom - startZoom) * progress;
        camera.updateProjectionMatrix();
      }
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
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(PERSPECTIVE_FOV / 2));
    const dist = oldPos.distanceTo(oldTarget);

    if (isOrthographic) {
      // Sichtfeld der Perspektive übernehmen: sichtbare Höhe = 2 * dist * tan(fov/2)
      orthoCam.zoom = ORTHO_FRUSTUM / (2 * dist * tanHalf);
      orthoCam.updateProjectionMatrix();
      camera = orthoCam;
    } else {
      // Abstand aus dem Ortho-Zoom zurückrechnen
      const d = ORTHO_FRUSTUM / (2 * tanHalf * orthoCam.zoom);
      oldPos.copy(oldTarget).add(oldPos.clone().sub(oldTarget).normalize().multiplyScalar(d));
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

  // --- Kamera-Presets aus der Bounding Box aller V2-Blöcke ---------------------
  const PRESET_DIRS = {
    start: [-0.5, 0.5, 0.7],   // von Südwesten: Fassade, Baptisterium und Campanile im Blick
    iso: [0.62, 0.5, 0.62],    // klassische 45°-Ansicht von Südosten
    top: [0, 1, 0.001],        // Draufsicht
    west: [-1, 0.25, 0],
    east: [1, 0.25, 0]
  };

  // Berechnet Auge, Ziel und Ortho-Zoom, sodass die ganze Bounding Box ins Bild passt.
  function computePreset(name) {
    const b = modelBounds;
    const center = new THREE.Vector3((b.minX + b.maxX + 1) / 2, (b.minY + b.maxY + 1) / 2, (b.minZ + b.maxZ + 1) / 2);
    const dir = new THREE.Vector3(...(PRESET_DIRS[name] || PRESET_DIRS.start)).normalize();
    const fwd = dir.clone().negate();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, fwd).normalize();

    const aspect = Math.max(0.2, (containerEl ? containerEl.clientWidth / (containerEl.clientHeight || 1) : 1.5));
    const tanV = Math.tan(THREE.MathUtils.degToRad(PERSPECTIVE_FOV / 2));
    const tanH = tanV * aspect;
    let dist = 1, maxA = 0, maxB = 0;
    const rel = new THREE.Vector3();
    for (let i = 0; i < 8; i++) {
      rel.set(i & 1 ? b.maxX + 1 : b.minX, i & 2 ? b.maxY + 1 : b.minY, i & 4 ? b.maxZ + 1 : b.minZ).sub(center);
      const a = Math.abs(rel.dot(right)), v = Math.abs(rel.dot(up)), t = rel.dot(dir);
      maxA = Math.max(maxA, a); maxB = Math.max(maxB, v);
      dist = Math.max(dist, t + Math.max(a / tanH, v / tanV));
    }
    dist *= 1.06;
    const halfW = ORTHO_FRUSTUM * aspect / 2, halfH = ORTHO_FRUSTUM / 2;
    const zoom = Math.min(halfW / (maxA * 1.06), halfH / (maxB * 1.06));
    const eye = center.clone().add(dir.multiplyScalar(dist));
    return { eye: eye.toArray(), target: center.toArray(), zoom };
  }

  function moveToPreset(name, immediate) {
    if (!controls) return;
    const p = computePreset(name);
    // Perspektive: Zoom bleibt 1; Ortho: Zoom passend zur Bounding Box
    smoothMoveCamera(p.eye, p.target, !!immediate, camera.isOrthographicCamera ? p.zoom : undefined);
  }

  function setModelBounds(bounds) {
    modelBounds = bounds;
    fitSunToBounds();
    setupGroundGrid();
    // Startansicht sofort setzen
    perspectiveCam.far = Math.max(2000, Math.hypot(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ) * 4);
    perspectiveCam.updateProjectionMatrix();
    moveToPreset("start", true);
    if (controls) controls.maxDistance = perspectiveCam.far * 0.6;
  }

  function setCameraView(viewName) {
    if (!controls) return;
    if (PRESET_DIRS[viewName]) moveToPreset(viewName);
  }

  function resetCamera() {
    moveToPreset("start");
  }

  function onWindowResize() {
    if (!containerEl || !renderer) return;
    const width = containerEl.clientWidth;
    const height = containerEl.clientHeight;
    const aspect = width / height;

    perspectiveCam.aspect = aspect;
    perspectiveCam.updateProjectionMatrix();

    const frustumSize = ORTHO_FRUSTUM;
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
    setModelBounds,
    toggleCameraMode,
    setCameraView,
    resetCamera,
    moveCamera: smoothMoveCamera,
    setCameraLock,
    toggleCameraLock,
    isCameraLocked: isCameraLockedStatus
  };
})();
