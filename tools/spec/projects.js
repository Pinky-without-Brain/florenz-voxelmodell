'use strict';
/**
 * Projekt-Registry (V3, ARCHITEKTUR §10).
 * Registriert sind nur Projekte mit Sonderpfaden (hier der Dom). Neue Projekte brauchen keinen
 * Eintrag: Ein Ordner `projects/<id>/` mit `project.json` wird von tools/projects.js automatisch ergänzt.
 * Alle Pfade sind relativ zum Repository-Wurzelverzeichnis.
 */
module.exports = { PROJECTS: [
  { id: 'duomo', title: 'Santa Maria del Fiore', type: 'wahrzeichen',
    modelDir: 'tools/model', contentDir: 'content/steps_de', interfaces: 'tools/spec/interfaces.js',
    ground: 'tools/spec/ground_duomo.js', webDataDir: 'webapp/js/data/v2', docs: 'legacy-duomo',
    json: { begehbarkeit: 'pflicht' } }
] };
