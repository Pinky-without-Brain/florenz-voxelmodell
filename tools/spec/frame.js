'use strict';
/**
 * Gemeinsames Weltkoordinatensystem für Dom und Stadtmodell (V3).
 * Modellkoordinaten = Minecraft-Weltkoordinaten (x, z horizontal, y Höhe), 1 Block = 0,5 m.
 *
 * Herleitung (identisch zu REFERENZMASSE.md und tools/spec/site_osm.json):
 *   1. Lokale Tangentialebene um (LAT0, LON0), äquirektangulär, Erdradius R:
 *        east  = (lon − LON0) · π/180 · R · cos(LAT0)
 *        north = (lat − LAT0) · π/180 · R
 *   2. Verschiebung auf den Flächenschwerpunkt des OSM-Kuppelumrisses (Way 397848200).
 *   3. Drehung um ROT_DEG (Langhausachse = +X), Z nach Süden.
 *   4. Maßstab 2 Blöcke je Meter.
 * Fehler der Näherung über 3 km: < 0,1 m (vernachlässigbar gegenüber 0,5 m Blockraster).
 */
const LAT0 = 43.77310;
const LON0 = 11.25670;
const R = 6371000;
const ORIGIN_EAST_M = 20.43323346619795;   // Kuppelschwerpunkt relativ zu (LAT0, LON0)
const ORIGIN_NORTH_M = 2.0677824097912483;
const ROT_DEG = -1.36;
const SCALE = 2;

const KX = Math.PI / 180 * R * Math.cos(LAT0 * Math.PI / 180);
const KY = Math.PI / 180 * R;
const ANG = ROT_DEG * Math.PI / 180;
const C = Math.cos(ANG), S = Math.sin(ANG);

/** WGS84 → Modell (kontinuierlich, Blöcke). */
function latLonToBlock(lat, lon) {
  const e = (lon - LON0) * KX - ORIGIN_EAST_M;
  const n = (lat - LAT0) * KY - ORIGIN_NORTH_M;
  const u = e * C + n * S;
  const v = -e * S + n * C;
  return { x: SCALE * u, z: -SCALE * v };
}

/** Modell → WGS84. */
function blockToLatLon(x, z) {
  const u = x / SCALE, v = -z / SCALE;
  const e = u * C - v * S + ORIGIN_EAST_M;
  const n = u * S + v * C + ORIGIN_NORTH_M;
  return { lat: LAT0 + n / KY, lon: LON0 + e / KX };
}

module.exports = { LAT0, LON0, R, ORIGIN_EAST_M, ORIGIN_NORTH_M, ROT_DEG, SCALE, latLonToBlock, blockToLatLon };
