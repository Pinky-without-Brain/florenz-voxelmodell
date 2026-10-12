/**
 * Projekt-Metadaten: Cathedral of Santa Maria del Fiore (Florenz)
 * Titel, Untertitel und Icons je Modul kommen aus window.MODULE_META_V2 (V2-Loader).
 * Module ohne V2-Daten (z. B. M6, solange es noch entsteht) erscheinen als "in Arbeit".
 */
(function () {
  var meta = window.MODULE_META_V2 || {};
  var MODULE_COUNT = 10;
  // Platzhalter nur für Module, die noch keine V2-Daten haben
  var PLACEHOLDER = { 6: { title: "Laterne & Kugel", subtitle: "Bautüte 6: in Arbeit", icon: "☀️" } };

  var modules = [];
  for (var n = 0; n < MODULE_COUNT; n++) {
    var m = meta[n] || PLACEHOLDER[n] || { title: "Modul " + n, subtitle: "in Arbeit", icon: "🧱" };
    var steps = window["MODULE_" + n + "_DATA"] || [];
    modules.push({
      id: "modul_" + n,
      number: n,
      title: m.title,
      subtitle: m.subtitle,
      icon: m.icon,
      steps: steps,
      status: steps.length > 0 ? "Verfügbar" : "in Arbeit"
    });
  }

  window.PROJECT_FLORENCE = {
    id: "florence_cathedral",
    title: "Cathedral of Santa Maria del Fiore",
    subtitle: "Il Duomo di Firenze – Meisterbauer-Bauanleitung für Minecraft",
    location: "Florenz (Firenze), Toskana, Italien",
    architects: ["Arnolfo di Cambio", "Giotto di Bondone", "Francesco Talenti", "Filippo Brunelleschi", "Emilio De Fabris"],
    minecraftVersion: "1.18+ (Caves & Cliffs bis heute)",
    dimensions: {
      height: "Y 64 bis Y 293 (Kreuz)",
      length: "Fassade X −216 bis Ostapsis X +96",
      width: "Z −96 bis +96",
      scale: "Maßstab 1 : 2 (1 Block = 0,5 m)"
    },
    modules: modules
  };
})();
