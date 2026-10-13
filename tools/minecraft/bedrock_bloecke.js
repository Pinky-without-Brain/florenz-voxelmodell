'use strict';
// Palette-Typ (tools/spec/palette.js) -> Bedrock-Blockname und Zustände (Minecraft 1.26).
// Namen und Zustände sind an der Weltkopie (Auenland, zuletzt 1.26.21) und am Wiki geprüft.
const nbt = require('./nbt_le.js');
const { TYPES, treppeInfo } = require('../spec/palette.js');

/** Blockzustands-Version (häufigster und einziger Wert in der Weltkopie: 18168865 = 1.21.60.33). */
const BLOCK_VERSION = 18168865;

// Abweichungen der Bedrock-Namen von den Palettentypen (Java-Namen)
const ABWEICHUNG = {
  chiseled_quartz: 'chiseled_quartz_block',
  bricks: 'brick_block',
  terracotta: 'hardened_clay',
  end_stone_bricks: 'end_bricks'
};

// Treppen (B0). Bedrock-Namen: Weltkopie "Auenland" (Palette-Namen geprüft: brick_stairs, dark_oak_stairs,
// dark_prismarine_stairs, mossy_stone_brick_stairs, normal_stone_stairs, quartz_stairs, smooth_quartz_stairs,
// stone_brick_stairs, stone_stairs, tuff_brick_stairs). In Bedrock heißt die Steintreppe "normal_stone_stairs",
// "stone_stairs" ist die Bruchsteintreppe (Java cobblestone_stairs). Nicht in der Weltkopie belegt, nach dem
// Bedrock-Namensschema ergänzt: end_brick_stairs (Java end_stone_brick_stairs; wie end_bricks), polished_*,
// tuff_stairs, cut_copper_stairs, red_sandstone_stairs, smooth_sandstone_stairs, spruce_stairs.
const TREPPEN_NAME = {
  stone_stairs: 'normal_stone_stairs',
  cobblestone_stairs: 'stone_stairs',
  end_stone_brick_stairs: 'end_brick_stairs'
};
// Aufstieg -> weirdo_direction. minecraft.wiki/w/Stairs (Bedrock, Block states): "weirdo_direction: the direction the
// stairs' full-block side faces", 0 = East, 1 = West, 2 = South, 3 = North. Die volle Seite ist die hohe Seite, also der
// Aufstieg. (Java zählt anders, dort steht "facing" für die Blickrichtung.) Stichprobe der Weltkopie: byte upside_down_bit, int weirdo_direction.
const WEIRDO = { o: 0, w: 1, s: 2, n: 3 };

// Zustände je Bedrock-Name: [name, 'byte'|'int'|'string', wert]
const AXIS_Y = [['pillar_axis', 'string', 'y']];
const ZUSTAENDE = {
  quartz_pillar: AXIS_Y,
  smooth_quartz: AXIS_Y,
  oak_log: AXIS_Y,
  oak_leaves: [['persistent_bit', 'byte', 1], ['update_bit', 'byte', 0]],
  water: [['liquid_depth', 'int', 0]],
  bedrock: [['infiniburn_bit', 'byte', 0]]
};

/** Typen, die zusätzlich zur Palette für das Gelände gebraucht werden. */
const EXTRA = ['bedrock'];

/** Alle Typen, die der Export kennt (Luft ist Id 0 und steht nicht hier). */
const ALLE_TYPEN = [...new Set([...TYPES, ...EXTRA])];

function bedrockName(type) {
  if (!ALLE_TYPEN.includes(type)) throw new Error(`Minecraft-Export: unbekannter Blocktyp "${type}"`);
  const tr = treppeInfo(type);
  if (tr) return 'minecraft:' + (TREPPEN_NAME[tr.base] || tr.base);
  return 'minecraft:' + (ABWEICHUNG[type] || type);
}

function statesOf(type) {
  const tr = treppeInfo(type);
  if (tr) return [['upside_down_bit', 'byte', tr.oben ? 1 : 0], ['weirdo_direction', 'int', WEIRDO[tr.dir]]];
  return ZUSTAENDE[bedrockName(type).slice(10)] || [];
}

function entryTag(name, states) {
  const m = new Map();
  for (const [k, t, v] of states) m.set(k, t === 'byte' ? nbt.byte(v) : t === 'int' ? nbt.int(v) : nbt.string(v));
  return nbt.compound([['name', nbt.string(name)], ['states', nbt.compound(m)], ['version', nbt.int(BLOCK_VERSION)]]);
}

const cache = new Map();
/** Palette-Eintrag als LE-NBT-Puffer (Wurzel-Compound ohne Namen). Typ 'air' ist erlaubt. */
function paletteEntry(type) {
  let b = cache.get(type);
  if (!b) {
    b = type === 'air' ? nbt.write('', entryTag('minecraft:air', [])) : nbt.write('', entryTag(bedrockName(type), statesOf(type)));
    cache.set(type, b);
  }
  return b;
}

/** Tabelle für Berichte: [{ type, name, states }] */
function tabelle() {
  return ALLE_TYPEN.map((t) => ({ type: t, name: bedrockName(t), states: statesOf(t) }));
}

module.exports = { WEIRDO, TREPPEN_NAME, BLOCK_VERSION, ABWEICHUNG, ZUSTAENDE, ALLE_TYPEN, bedrockName, statesOf, paletteEntry, tabelle };
