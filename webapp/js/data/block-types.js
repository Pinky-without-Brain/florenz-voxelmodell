/**
 * Block Registry: Definition aller verwendeten Minecraft-Blöcke
 * Enthält deutsche Namen, Farbcodes, Materialeigenschaften und Texture-Hinweise.
 * Dieses System ist für zukünftige Bauprojekte vollständig wiederverwendbar!
 */
window.BLOCK_TYPES = {
  gold_block: {
    id: "gold_block",
    name: "Goldblock",
    color: "#FDF55F",
    topColor: "#FFF875",
    sideColor: "#E5C124",
    edgeColor: "#C19C17",
    category: "Edelsteine & Metalle",
    icon: "🟨",
    description: "Der goldene Referenzstein im Zentrum der Kathedrale (0, 64, 0)."
  },
  sea_lantern: {
    id: "sea_lantern",
    name: "Seelaterne",
    color: "#C3E8E5",
    topColor: "#DDF4F2",
    sideColor: "#9FD0CD",
    edgeColor: "#75B4B0",
    category: "Lichtquellen",
    icon: "🕯️",
    description: "Magische Unterwasser-Lichtquelle zur Markierung und Ausleuchtung."
  },
  smooth_stone: {
    id: "smooth_stone",
    name: "Glatter Stein",
    color: "#9E9E9E",
    topColor: "#B5B5B5",
    sideColor: "#8D8D8D",
    edgeColor: "#757575",
    category: "Stein & Fundament",
    icon: "🔘",
    description: "Florentiner Straßenpflaster der Piazza del Duomo."
  },
  stone_bricks: {
    id: "stone_bricks",
    name: "Steinziegel",
    color: "#7E7E7E",
    topColor: "#949494",
    sideColor: "#6E6E6E",
    edgeColor: "#575757",
    category: "Stein & Fundament",
    icon: "🪨",
    description: "Das massive Fundamentmauerwerk für die tragenden Mauern."
  },
  mossy_stone_bricks: {
    id: "mossy_stone_bricks",
    name: "Bemooste Steinziegel",
    color: "#6E7A68",
    topColor: "#82917B",
    sideColor: "#5C6A56",
    edgeColor: "#4A5645",
    category: "Antike & Krypta",
    icon: "🌿",
    description: "Altehrwürdige Mauern der antiken Krypta von Santa Reparata."
  },
  cobblestone: {
    id: "cobblestone",
    name: "Bruchstein",
    color: "#666666",
    topColor: "#787878",
    sideColor: "#555555",
    edgeColor: "#404040",
    category: "Antike & Krypta",
    icon: "🪨",
    description: "Antike Ausgrabungssteine aus dem 4. und 5. Jahrhundert."
  },
  smooth_quartz: {
    id: "smooth_quartz",
    name: "Glatter Quarzblock",
    color: "#EAE7DF",
    topColor: "#F4F2EC",
    sideColor: "#DED9CE",
    edgeColor: "#C9C2B4",
    category: "Toskanischer Marmor (Weiß)",
    icon: "⬜",
    description: "Weißer Carrara-Marmor für Kanten, Säulen, Rippen und Schmuckbänder."
  },
  chiseled_quartz: {
    id: "chiseled_quartz",
    name: "Gemeißelter Quarzblock",
    color: "#DFDDD5",
    topColor: "#EDEBE3",
    sideColor: "#D1CFC5",
    edgeColor: "#B8B5AA",
    category: "Toskanischer Marmor (Weiß)",
    icon: "▫️",
    description: "Reliefstein für Brunelleschis Grabtumba."
  },
  dark_prismarine: {
    id: "dark_prismarine",
    name: "Dunkler Prismarin",
    color: "#2D4C44",
    topColor: "#3B6157",
    sideColor: "#223C35",
    edgeColor: "#172A25",
    category: "Toskanischer Marmor (Grün)",
    icon: "🟩",
    description: "Grüner Serpentinit-Schiefer (Verde di Prato) für geometrische Intarsien."
  },
  polished_granite: {
    id: "polished_granite",
    name: "Polierter Granit",
    color: "#976555",
    topColor: "#A97564",
    sideColor: "#855444",
    edgeColor: "#6B4133",
    category: "Toskanischer Marmor (Rot)",
    icon: "🟫",
    description: "Roter Kalkstein (Rosso di Maremma) für toskanische Marmormuster."
  },
  polished_deepslate: {
    id: "polished_deepslate",
    name: "Polierter Tiefenschiefer",
    color: "#37373C",
    topColor: "#45454C",
    sideColor: "#2C2C31",
    edgeColor: "#1E1E22",
    category: "Kontrast & Pfeiler",
    icon: "⬛",
    description: "Tiefschwarzer Stein für Pfeilersockel und Kontrastlinien."
  },
  terracotta: {
    id: "terracotta",
    name: "Terrakotta",
    color: "#985E43",
    topColor: "#A96B4E",
    sideColor: "#875239",
    edgeColor: "#6E3F2A",
    category: "Ziegel & Dächer",
    icon: "🧱",
    description: "Gebrannter toskanischer Ton für Dächer und Kuppelschalen."
  },
  bricks: {
    id: "bricks",
    name: "Ziegelsteine",
    color: "#964D3F",
    topColor: "#A95849",
    sideColor: "#844235",
    edgeColor: "#6B3328",
    category: "Ziegel & Dächer",
    icon: "🧱",
    description: "Fischgrät-Ziegel für Brunelleschis selbsttragende Kuppel."
  },
  oak_fence: {
    id: "oak_fence",
    name: "Eichenholzzaun",
    color: "#8F7449",
    topColor: "#A08355",
    sideColor: "#7D643D",
    edgeColor: "#624E2E",
    category: "Bauhilfen & Vermessung",
    icon: "🪵",
    description: "Mess- und Visierpfähle der mittelalterlichen Feldmesser."
  },
  calcite: {
    id: "calcite",
    name: "Calcit",
    color: "#DFD9CE",
    topColor: "#ECE6DC",
    sideColor: "#D2CCC1",
    edgeColor: "#B5AFA5",
    category: "Toskanischer Marmor (Weiß)",
    icon: "▫️",
    description: "Feinkörniger weißer Calcit-Marmor für Apostel-Skulpturen und Gesimse."
  },
  red_sandstone: {
    id: "red_sandstone",
    name: "Roter Sandstein",
    color: "#A85324",
    topColor: "#BA602E",
    sideColor: "#96471E",
    edgeColor: "#7B3714",
    category: "Toskanischer Marmor (Rot)",
    icon: "🟫",
    description: "Toskanischer Roter Marmor (Rosso di Maremma) für Dreiecksgiebel und Rauten."
  },
  dark_oak_planks: {
    id: "dark_oak_planks",
    name: "Schwarzeichenholz-Bretter",
    color: "#422A15",
    topColor: "#52361D",
    sideColor: "#35210E",
    edgeColor: "#251608",
    category: "Holz & Portale",
    icon: "🚪",
    description: "Schwere Bronze-beschlagene Domportale aus florentinischer Eiche."
  },
  red_stained_glass: {
    id: "red_stained_glass",
    name: "Rotes Buntglas",
    color: "#A12722",
    topColor: "#BA332D",
    sideColor: "#8B1F1B",
    edgeColor: "#6D1410",
    category: "Buntglasfenster",
    icon: "🪟",
    description: "Leuchtend rotes Glas für die Blütenblätter des Rosenfensters."
  },
  blue_stained_glass: {
    id: "blue_stained_glass",
    name: "Blaues Buntglas",
    color: "#3449A2",
    topColor: "#4259BD",
    sideColor: "#293A85",
    edgeColor: "#1D2B66",
    category: "Buntglasfenster",
    icon: "🪟",
    description: "Tiefblaues Kobaltglas für den Himmelskreis des Rosenfensters."
  },
  yellow_stained_glass: {
    id: "yellow_stained_glass",
    name: "Gelbes Buntglas",
    color: "#E5B92B",
    topColor: "#F4C83E",
    sideColor: "#CCA221",
    edgeColor: "#A37F15",
    category: "Buntglasfenster",
    icon: "🪟",
    description: "Strahlend gelbes Glas für die Sonnenstrahlen der Maßwerkrosette."
  },
  light_blue_stained_glass: {
    id: "light_blue_stained_glass",
    name: "Hellblaues Buntglas",
    color: "#6699D8",
    topColor: "#80B0ED",
    sideColor: "#5182C0",
    edgeColor: "#3D69A3",
    category: "Buntglasfenster",
    icon: "🪟",
    description: "Himmelsblaues Glas für die biblischen Meisterfenster von Donatello."
  },
  orange_stained_glass: {
    id: "orange_stained_glass",
    name: "Oranges Buntglas",
    color: "#E06100",
    topColor: "#F37517",
    sideColor: "#C95300",
    edgeColor: "#A84100",
    category: "Buntglasfenster",
    icon: "🪟",
    description: "Feuriges Orangerot für die Renaissance-Mosaike von Paolo Uccello."
  }
};
