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
  yellow_terracotta:     { role: 'fresko', de: 'Gelbe Keramik' },
  orange_terracotta:     { role: 'fresko', de: 'Orange Keramik' },
  green_terracotta:      { role: 'fresko', de: 'Grüne Keramik' },
  brown_terracotta:      { role: 'fresko', de: 'Braune Keramik' },
  black_concrete:        { role: 'fresko', de: 'Schwarzer Beton' }
};

module.exports = { PALETTE, TYPES: Object.keys(PALETTE) };
