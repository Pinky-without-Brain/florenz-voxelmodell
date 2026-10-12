/**
 * Projekt-Metadaten: Cathedral of Santa Maria del Fiore (Florenz)
 * Verbindet alle Module und Bautüten.
 */
window.PROJECT_FLORENCE = {
  id: "florence_cathedral",
  title: "Cathedral of Santa Maria del Fiore",
  subtitle: "Il Duomo di Firenze – Meisterbauer-Bauanleitung für Minecraft",
  location: "Florenz (Firenze), Toskana, Italien",
  architects: ["Arnolfo di Cambio", "Giotto di Bondone", "Francesco Talenti", "Filippo Brunelleschi", "Emilio De Fabris"],
  minecraftVersion: "1.18+ (Caves & Cliffs bis heute)",
  dimensions: {
    height: "251 Blöcke (Y=64 bis Y=315)",
    length: "335 Blöcke (X=-170 bis X=+165)",
    width: "197 Blöcke (Z=-98 bis Z=+98)",
    scale: "Monumental-Maßstab 1 : 2,19 (1 Block entspricht 45,7 cm)"
  },
  modules: [
    {
      id: "modul_0",
      number: 0,
      title: "Fundament & Bodenplatte",
      subtitle: "Bautüte 0: Der Grundstein des Giganten",
      icon: "🏛️",
      steps: window.MODULE_0_DATA || [],
      status: "Verfügbar"
    },
    {
      id: "modul_1",
      number: 1,
      title: "Langhaus & Seitenschiffe",
      subtitle: "Bautüte 1: Die kolossalen Hallen",
      icon: "⛪",
      steps: window.MODULE_1_DATA || [],
      status: "Verfügbar"
    },
    {
      id: "modul_2",
      number: 2,
      title: "Die Westfassade",
      subtitle: "Bautüte 2: Das Marmor-Schmuckstück",
      icon: "👑",
      steps: window.MODULE_2_DATA || [],
      status: "Verfügbar"
    },
    {
      id: "modul_3",
      number: 3,
      title: "Vierung & 3 Tribunen",
      subtitle: "Bautüte 3: Das monumentale Kleeblatt",
      icon: "🍀",
      steps: window.MODULE_3_DATA || [],
      status: "Verfügbar"
    },
    {
      id: "modul_4",
      number: 4,
      title: "Achteckiger Tambour",
      subtitle: "Bautüte 4: Die 40-Block-Trommel mit Ochsenaugen",
      icon: "🥁",
      steps: window.MODULE_4_DATA || [],
      status: "Verfügbar"
    },
    {
      id: "modul_5",
      number: 5,
      title: "Brunelleschis Doppelkuppel",
      subtitle: "Bautüte 5: Das größte Meisterwerk der Renaissance",
      icon: "🏛️",
      steps: window.MODULE_5_DATA || [],
      status: "Verfügbar"
    },
    {
      id: "modul_6",
      number: 6,
      title: "Laterne & Goldene Kugel",
      subtitle: "Bautüte 6: Der Gipfel auf Höhe Y=315",
      icon: "☀️",
      steps: window.MODULE_6_DATA || [],
      status: "Verfügbar"
    },
    {
      id: "modul_7",
      number: 7,
      title: "Campanile di Giotto",
      subtitle: "Bautüte 7: Der 185-Block-Glockenturm",
      icon: "🔔",
      steps: window.MODULE_7_DATA || [],
      status: "Verfügbar"
    },
    {
      id: "modul_8",
      number: 8,
      title: "Baptisterium San Giovanni",
      subtitle: "Bautüte 8: Das goldene Oktogon & die Paradiespforte",
      icon: "🚪",
      steps: window.MODULE_8_DATA || [],
      status: "Verfügbar"
    },
    {
      id: "modul_9",
      number: 9,
      title: "Innenraum, Fresko & Krypta",
      subtitle: "Bautüte 9: Vasaris Fresko & Paolo-Uccello-Uhr",
      icon: "🕯️",
      steps: window.MODULE_9_DATA || [],
      status: "Verfügbar"
    }
  ]
};
