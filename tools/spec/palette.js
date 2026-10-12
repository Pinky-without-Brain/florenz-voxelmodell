'use strict';
/**
 * Erlaubte Blocktypen (V2). Nur volle Würfelblöcke – keine Stufen, Platten, Zäune.
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

const TYPES = Object.keys(PALETTE);

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
for (const t of TYPES) for (const r of rolesOf(t)) if (!ROLES.includes(r)) ROLES.push(r);

module.exports = { PALETTE, TYPES, ROLES, rolesOf, typesForRole };
