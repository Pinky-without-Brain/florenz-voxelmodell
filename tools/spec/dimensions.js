'use strict';
/**
 * EINZIGE Maßtabelle des Projekts (V2). Maßstab 1:2 – 1 Block = 0,5 m, in ALLEN Achsen.
 *
 * Koordinatensystem (Blöcke):
 *   X = Längsachse der Kathedrale, +X nach Osten (Chor), -X nach Westen (Fassade)
 *   Z = Querachse, +Z nach Süden (Campanile-Seite), -Z nach Norden
 *   Y = Höhe. Oberkante Bodenplatte / Fußboden = Y 64, Laufniveau = Y 65.
 *   Ursprung X=0, Z=0 = Mittelpunkt der Kuppel (Vierung).
 *   Umrechnung Höhe: Y = 64 + 2 * h[m]. Grundriss: Blöcke = 2 * m.
 *
 * Halbmaße ("half") sind symmetrisch um 0: half = 44 bedeutet Blöcke -44..+44 (89 Blöcke).
 * Quellen und Annahmen: siehe 00_Projektplan_und_Konzept/REFERENZMASSE.md
 *
 * Niemand außer dem Design-Verantwortlichen ändert diese Datei.
 */

const SCALE = 2; // Blöcke pro Meter

const LEVELS = {
  cryptFloorY: 57,        // Krypta Santa Reparata, Fußboden (−3,5 m)
  foundationBottomY: 56,  // Unterkante Fundamentplatte
  floorY: 64,             // Oberkante Fußboden/Pflaster (0 m)
  walkY: 65,              // erstes freies Laufniveau
  maxY: 319               // Bauhöhengrenze
};

const CATHEDRAL = {
  facade: {
    westFaceX: -216,      // Außenfläche der Westfassade (OSM: −108 m)
    thickness: 4,         // X −216..−213 (Fassadenmauer inkl. Relief)
    peakY: 164,           // Giebelspitze, 50 m (ANNAHME)
    portals: 3
  },
  nave: {
    interiorWestX: -212,  // Innenseite Westwand
    crossingWestX: -60,   // Ende des Langhauses an den westlichen Vierungspfeilern
    bays: 4,              // vier quadratische Joche
    bayPitch: 38,         // Pfeilerabstand längs (19 m); 4 × 38 = 152 = −212..−60
    centralHalfZ: 19,     // Pfeilerachsen des Mittelschiffs bei Z = ±19 (Mittelschiff 19 m)
    interiorHalfZ: 38,    // Innenseite der Außenwände (38 m Innenbreite)
    exteriorHalfZ: 44,    // Außenflucht inkl. Wandvorlagen (OSM: 44 m)
    aisleVaultY: 110,     // Scheitel Seitenschiffgewölbe, 23 m
    aisleEavesY: 114,     // Traufe Seitenschiffe außen, 25 m
    naveVaultY: 150,      // Scheitel Mittelschiffgewölbe innen, 43 m (Quellen 43–45 m)
    clerestoryTopY: 148,  // Traufe Obergaden, 42 m (ANNAHME; Gewölbescheitel liegt unter dem Dach)
    roofRidgeY: 156       // First Langhausdach, 46 m, flaches toskanisches Dach ~20° (ANNAHME)
  },
  crossing: {
    // Achteck, Seiten parallel zu den Achsen und Diagonalen ("Flats" auf X/Z-Achse)
    innerHalfFlat: 45,    // Innenmaß über die Flächen 45 m → 90 Blöcke
    outerHalfFlat: 54,    // Außenmaß Tambour 54 m (OSM 53,2 m; Lit. 54,8 m)
    wallThickness: 9,     // 4,25–4,5 m
    archTopY: 148         // Oberkante Vierungsbögen = Tambourbasis, 42 m (ANNAHME)
  },
  tribunes: {
    // drei Tribunen (Nord, Ost, Süd): außen ein halbes regelmäßiges Achteck, nach außen gerichtet,
    // mit geradem Anschluss zurück bis zur Vierung. Innen ein halbes Achteck, das die volle
    // Achteckseite der Vierung öffnet (innerApothem ≈ innerHalfFlat · tan 22,5° = 18,6).
    // Zwischen Innen- und Außenkontur liegen die 5 Radialkapellen.
    centerDist: 59,       // Mittelpunkt beider Halbachtecke auf der Achse (OSM-Umriss)
    outerApothem: 37,     // Außenkontur: Seitenwände bei ±37, Scheitel bei 59 + 37 = 96 (OSM N/S 97, O 95)
    innerApothem: 19,     // Innenraum der Tribune, 19 m Spannweite (ANNAHME)
    chapelsPerTribune: 5,
    chapelRoofY: 104,     // Dach der Radialkapellen, 20 m (ANNAHME)
    tribuneRoofY: 130,    // Dach der Tribune, 33 m (ANNAHME)
    deadTribunes: 4       // "tribune morte" an den Diagonalseiten des Tambours
  },
  drum: {
    baseY: 148,           // = crossing.archTopY (ANNAHME)
    springY: 172,         // Kuppelansatz, 54 m (IMSS: ca. 54 m)
    oculi: 8,
    oculusDiameter: 10,   // ca. 5 m (ANNAHME)
    oculusCenterY: 163    // Mitte Ochsenauge; Unterkante 158 liegt über dem Langhausfirst (156)
  },
  dome: {
    springY: 172,
    // Profil "quinto acuto": Rippenbogen-Radius = 4/5 des Durchmessers über die Ecken,
    // Mittelpunkt auf Ansatzhöhe gegenüberliegend. Ergibt Scheitel ≈ 0,742 · D_Ecke über Ansatz.
    profileRadiusFactor: 0.8,
    innerShellBase: 4,    // Dicke Innenschale am Fuß, 2,25 m
    innerShellTop: 3,
    gap: 2,               // Zwischenraum 1,2 m (begehbar, Treppen)
    outerShellBase: 2,    // 0,6–0,8 m, auf Blöcke aufgerundet
    outerShellTop: 1,
    majorRibs: 8,         // weiße Marmorrippen an den Ecken
    minorRibs: 16,        // 2 verborgene Zwischenrippen je Segel
    eyeHalfFlat: 6,       // Öffnung des Auges, Achteck (ANNAHME)
    eyeRingTopY: 246      // Oberkante Schlussring = Laternenbasis, 91 m
    // Hinweis: Mit gleichem Profilfaktor läge der Scheitel der Außenschale bei ~Y 257.
    // Die Außenschale muss daher zum Schlussring hin konvergieren (Profil wird in der M5-Spezifikation festgelegt).
  },
  lantern: {
    baseY: 246,
    templeTopY: 274,      // Gebälk des Laternentempels (ANNAHME)
    coneTopY: 284,
    sphereCenterY: 287,
    sphereRadius: 3,
    crossTopY: 293,       // 114,5 m Gesamthöhe
    halfFlat: 9           // Achteck-Tempel (ANNAHME)
  }
};

const CAMPANILE = {
  centerX: -200,          // OSM: (−100,2 m; +32,4 m)
  centerZ: 65,
  half: 14,               // 29 × 29 Blöcke (14,45 m)
  topY: 233               // 84,7 m
};

const BAPTISTERY = {
  centerX: -307,          // OSM: (−153,6 m; 0,4 m) – liegt auf der Längsachse
  centerZ: 0,
  outerHalfFlat: 33,      // ca. 33–34 m Außenmaß
  innerHalfFlat: 25,      // 25,6 m Innenmaß
  scarsella: { westX: -347, halfZ: 13 }, // rechteckige Apsis im Westen
  atticTopY: 116,         // 26 m (ANNAHME)
  roofApexY: 126,         // 31 m (ANNAHME)
  lanternTopY: 138        // 37 m (Quellen 35–45 m, ANNAHME)
};

// Piazza-Bebauung (nur Renderer-Kulisse, keine Bauschritte). Rechtecke in Blöcken.
const PIAZZA = {
  palazzoCanonici: { x: [-100, -27], z: [119, 145], topY: 112 },
  museoOpera:      { x: [101, 254],  z: [-135, 29], topY: 112 },
  loggiaBigallo:   { x: [-292, -258], z: [71, 87],  topY: 104 }
};

module.exports = { SCALE, LEVELS, CATHEDRAL, CAMPANILE, BAPTISTERY, PIAZZA };
