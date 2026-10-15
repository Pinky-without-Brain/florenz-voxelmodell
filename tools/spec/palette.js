'use strict';
/**
 * Erlaubte Blocktypen (V2). Volle Würfelblöcke; ab B0 zusätzlich Treppenblöcke (siehe unten), keine Platten, Zäune.
 * Jeder Typ braucht einen Eintrag in webapp/js/data/block-types.js (deutscher Name, Farben).
 * Rollen beschreiben die Verwendung im Modell; Module wählen Materialien über die Rolle.
 */

const PALETTE = {
  // Toskanischer Marmor – weiß (Carrara)
  smooth_quartz:      { role: 'marmor_weiss',      de: 'Glatter Quarzblock' },
  quartz_bricks:      { role: 'marmor_weiss',      de: 'Quarzziegel' },
  chiseled_quartz:    { role: 'marmor_ornament',   de: 'Gemeißelter Quarzblock' },
  quartz_pillar:      { role: 'marmor_saeule',     de: 'Quarzsäule' },
  calcite:            { role: 'marmor_weiss_alt',  de: 'Calcit' },
  // Toskanischer Marmor – grün (Prato) und rot/rosa (Maremma)
  dark_prismarine:    { role: 'marmor_gruen',      de: 'Dunkler Prismarin' },
  polished_granite:   { role: 'marmor_rot',        de: 'Polierter Granit' },
  red_sandstone:      { role: 'marmor_rot_alt',    de: 'Roter Sandstein' },
  // Tragwerk, Mauerwerk, Fundament
  stone_bricks:       { role: 'mauerwerk',         de: 'Steinziegel' },
  smooth_stone:       { role: 'pietra_serena',     de: 'Glatter Stein' },
  polished_andesite:  { role: 'pietra_forte',      de: 'Polierter Andesit' },
  bricks:             { role: 'ziegel_kuppel',     de: 'Ziegelsteine' },
  terracotta:         { role: 'dachziegel',        de: 'Terrakotta' },
  polished_deepslate: { role: 'kontrast_dunkel',   de: 'Polierter Tiefenschiefer' },
  cobblestone:        { role: 'antik',             de: 'Bruchstein' },
  mossy_stone_bricks: { role: 'antik',             de: 'Bemooste Steinziegel' },
  // Holz, Metall, Licht
  dark_oak_planks:    { role: 'holz',              de: 'Schwarzeichenholz-Bretter' },
  gold_block:         { role: 'gold',              de: 'Goldblock' },
  cut_copper:         { role: 'bronze',            de: 'Geschnittener Kupferblock' },
  sea_lantern:        { role: 'licht',             de: 'Seelaterne' },
  // Glas
  red_stained_glass:        { role: 'glas', de: 'Rotes Buntglas' },
  blue_stained_glass:       { role: 'glas', de: 'Blaues Buntglas' },
  yellow_stained_glass:     { role: 'glas', de: 'Gelbes Buntglas' },
  light_blue_stained_glass: { role: 'glas', de: 'Hellblaues Buntglas' },
  orange_stained_glass:     { role: 'glas', de: 'Oranges Buntglas' },
  white_stained_glass:      { role: 'glas', de: 'Weißes Buntglas' },
  // Freskenfarben (Kuppelinnenseite, Uccello-Uhr) – nur als Oberflächenmaterial
  white_terracotta:      { role: 'fresko', de: 'Weiße Keramik' },
  light_blue_terracotta: { role: 'fresko', de: 'Hellblaue Keramik' },
  blue_terracotta:       { role: 'fresko', de: 'Blaue Keramik' },
  red_terracotta:        { role: 'fresko', de: 'Rote Keramik' },
  yellow_terracotta:     { role: 'fresko', alsoRoles: ['putz_ocker'], de: 'Gelbe Keramik' },
  orange_terracotta:     { role: 'fresko', alsoRoles: ['putz_terrakotta'], de: 'Orange Keramik' },
  green_terracotta:      { role: 'fresko', de: 'Grüne Keramik' },
  brown_terracotta:      { role: 'fresko', de: 'Braune Keramik' },
  black_concrete:        { role: 'fresko', de: 'Schwarzer Beton' },
  // Stadtmodell (V3): Putz, Stein, Holz, Öffnungen, Natur
  smooth_sandstone:      { role: 'putz_gelb',            de: 'Glatter Sandstein' },
  pink_terracotta:       { role: 'putz_rosa',            de: 'Rosa Keramik' },
  end_stone_bricks:      { role: 'putz_sand',            de: 'Endsteinziegel' },
  white_concrete:        { role: 'putz_weiss',           de: 'Weißer Beton' },
  light_gray_concrete:   { role: 'putz_grau',            de: 'Hellgrauer Beton' },
  tuff_bricks:           { role: 'pietra_forte_rustika', de: 'Tuffsteinziegel' },
  tuff:                  { role: 'pietra_forte_bruch',   de: 'Tuffstein' },
  polished_tuff:         { role: 'pflaster',             de: 'Polierter Tuffstein' },
  stone:                 { role: 'gelaende_fels',        de: 'Stein' },
  spruce_planks:         { role: 'holz_sporto',          de: 'Fichtenholz-Bretter' },
  green_concrete:        { role: 'fensterladen',         de: 'Grüner Beton' },
  gray_stained_glass:    { role: 'glas_fenster',         de: 'Graues Buntglas' },
  grass_block:           { role: 'gruen_rasen',          de: 'Grasblock' },
  dirt:                  { role: 'gruen_erde',           de: 'Erde' },
  gravel:                { role: 'gruen_weg',            de: 'Kies' },
  oak_leaves:            { role: 'gruen_baum',           de: 'Eichenlaub' },
  oak_log:               { role: 'gruen_stamm',          de: 'Eichenstamm' },
  water:                 { role: 'wasser',               de: 'Wasser', transparent: true }
};

// ---------------------------------------------------------------- Treppen (B0)
// Treppenblöcke sind Teil der Palette (BEGEHBARKEIT.md §1.3). Die Ausrichtung gehört zum Typ:
//   Typname  <basis>@<richtung>[_oben]   z. B. stone_brick_stairs@n, dark_oak_stairs@s_oben
//   Richtung = Richtung des AUFSTIEGS: n = -z (Norden), o = +x, s = +z, w = -x.
//   "_oben": umgedrehte Treppe (Deckenstufe, z. B. unter Wendeltreppen).
// Alle Treppentypen stehen am Ende der Palette (bestehende Typreihenfolge bleibt), haben die Rolle "treppe"
// und tauchen NICHT in ROLES auf (ROLES bleibt wie in V2). Zuordnung Materialrolle -> Treppe: treppeFuerRolle().
const STAIR_DIRS = ['n', 'o', 's', 'w'];
const STAIR_DIR_DE = { n: 'Norden', o: 'Osten', s: 'Süden', w: 'Westen' };
// [Basisname (Java-Name), Vollblock für Farbe/Textur, Name]
const STAIR_BASES = [
  ['stone_brick_stairs',        'stone_bricks',       'Steinziegeltreppe'],
  ['tuff_brick_stairs',         'tuff_bricks',        'Tuffziegeltreppe'],
  ['polished_tuff_stairs',      'polished_tuff',      'Treppe aus poliertem Tuffstein'],
  ['polished_andesite_stairs',  'polished_andesite',  'Treppe aus poliertem Andesit'],
  // Es gibt keine Treppe aus glattem Stein (smooth_stone); stone_stairs ist die nächste graue Steintreppe
  ['stone_stairs',              'stone',              'Steintreppe'],
  ['smooth_quartz_stairs',      'smooth_quartz',      'Treppe aus glattem Quarz'],
  ['quartz_stairs',             'quartz_bricks',      'Quarztreppe'],
  ['dark_oak_stairs',           'dark_oak_planks',    'Schwarzeichentreppe'],
  ['spruce_stairs',             'spruce_planks',      'Fichtentreppe'],
  ['brick_stairs',              'bricks',             'Ziegeltreppe'],
  ['polished_granite_stairs',   'polished_granite',   'Treppe aus poliertem Granit'],
  ['end_stone_brick_stairs',    'end_stone_bricks',   'Endsteinziegeltreppe'],
  ['cobblestone_stairs',        'cobblestone',        'Bruchsteintreppe'],
  ['mossy_stone_brick_stairs',  'mossy_stone_bricks', 'Treppe aus bemoosten Steinziegeln'],
  ['polished_deepslate_stairs', 'polished_deepslate', 'Treppe aus poliertem Tiefenschiefer'],
  ['cut_copper_stairs',         'cut_copper',         'Treppe aus geschnittenem Kupfer'],
  ['red_sandstone_stairs',      'red_sandstone',      'Treppe aus rotem Sandstein'],
  ['smooth_sandstone_stairs',   'smooth_sandstone',   'Treppe aus glattem Sandstein'],
  ['dark_prismarine_stairs',    'dark_prismarine',    'Treppe aus dunklem Prismarin'],
  ['tuff_stairs',               'tuff',               'Tuffsteintreppe']
];
// Materialrolle -> Treppen-Basisname. Terrakotta/Dachziegel hat keine Treppe: brick_stairs ist der Ersatz (rotbraun).
const TREPPE_FUER_ROLLE = {
  mauerwerk: 'stone_brick_stairs', pietra_forte_rustika: 'tuff_brick_stairs', pflaster: 'polished_tuff_stairs',
  pietra_forte: 'polished_andesite_stairs', pietra_serena: 'stone_stairs', gelaende_fels: 'stone_stairs',
  marmor_weiss: 'smooth_quartz_stairs', marmor_ornament: 'quartz_stairs', marmor_saeule: 'quartz_stairs',
  marmor_weiss_alt: 'quartz_stairs', holz: 'dark_oak_stairs', holz_sporto: 'spruce_stairs',
  ziegel_kuppel: 'brick_stairs', dachziegel: 'brick_stairs', marmor_rot: 'polished_granite_stairs',
  putz_sand: 'end_stone_brick_stairs', antik: 'cobblestone_stairs', kontrast_dunkel: 'polished_deepslate_stairs',
  bronze: 'cut_copper_stairs', marmor_rot_alt: 'red_sandstone_stairs', putz_gelb: 'smooth_sandstone_stairs',
  marmor_gruen: 'dark_prismarine_stairs', pietra_forte_bruch: 'tuff_stairs'
};
const STAIR_INFO = {}; // Typname -> { base, dir, oben, material }
for (const [base, material, name] of STAIR_BASES) {
  for (const oben of [false, true]) {
    for (const dir of STAIR_DIRS) {
      const t = `${base}@${dir}${oben ? '_oben' : ''}`;
      PALETTE[t] = { role: 'treppe', de: `${name}, Aufstieg nach ${STAIR_DIR_DE[dir]}${oben ? ', umgedreht' : ''}`, stair: { base, dir, oben, material } };
      STAIR_INFO[t] = PALETTE[t].stair;
    }
  }
}

// Straßenschilder: Wandschild aus Birke, Typname birch_wall_sign@<richtung>, Richtung = wohin die Schrift zeigt
// (n = -z, o = +x, s = +z, w = -x). Der Text steht nicht im Blocktyp: der Quartiergenerator führt ihn (q.schilder),
// der Minecraft-Export schreibt ihn als Block-Entity.
for (const dir of STAIR_DIRS) {
  PALETTE[`birch_wall_sign@${dir}`] = { role: 'schild', de: `Straßenschild (Wandschild), Schrift nach ${STAIR_DIR_DE[dir]}` };
}
/** Typname des Straßenschilds, das nach richtung (n|o|s|w) zeigt. */
const schild = (richtung) => `birch_wall_sign@${richtung}`;

const TYPES = Object.keys(PALETTE);

/** Ist der Typ ein Treppenblock? */
const isTreppe = (type) => Object.prototype.hasOwnProperty.call(STAIR_INFO, type);
/** { base, dir, oben, material } eines Treppentyps oder null. */
const treppeInfo = (type) => (isTreppe(type) ? STAIR_INFO[type] : null);
/** Treppen-Basisname einer Materialrolle (wirft bei Rollen ohne Treppe). */
function treppeFuerRolle(rolle) {
  const b = TREPPE_FUER_ROLLE[rolle];
  if (!b) throw new Error(`Rolle "${rolle}" hat keine Treppe (erlaubt: ${Object.keys(TREPPE_FUER_ROLLE).join(', ')})`);
  return b;
}
/** Typname der Treppe: treppe(rolle, richtung, oben?) -> "stone_brick_stairs@n"; rolle darf auch ein Basisname sein. */
function treppe(rolle, richtung, oben = false) {
  if (!STAIR_DIRS.includes(richtung)) throw new Error(`Treppenrichtung muss n|o|s|w sein: ${richtung}`);
  const base = STAIR_BASES.some((b) => b[0] === rolle) ? rolle : treppeFuerRolle(rolle);
  return `${base}@${richtung}${oben ? '_oben' : ''}`;
}

/** Alle Rollen eines Typs: Primärrolle zuerst, dann alsoRoles. */
function rolesOf(type) {
  const e = PALETTE[type];
  return e ? [e.role, ...(e.alsoRoles || [])] : [];
}

/** Typen, deren role oder alsoRoles die Rolle enthält (in Palettenreihenfolge). */
function typesForRole(role) {
  return TYPES.filter((t) => rolesOf(t).includes(role));
}

/** Alle verschiedenen Rollen (primär und alsoRoles) in Reihenfolge des ersten Auftretens. */
const ROLES = [];
for (const t of TYPES) if (!isTreppe(t)) for (const r of rolesOf(t)) if (!ROLES.includes(r)) ROLES.push(r);

module.exports = { schild, PALETTE, TYPES, ROLES, rolesOf, typesForRole, STAIR_DIRS, STAIR_DIR_DE, STAIR_BASES, TREPPE_FUER_ROLLE,
  isTreppe, treppeInfo, treppeFuerRolle, treppe };
