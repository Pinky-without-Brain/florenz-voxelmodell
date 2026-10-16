# Bauteilkatalog – Grotta del Buontalenti (V5c)

Maße: [`REFERENZMASSE.md`](REFERENZMASSE.md). Rahmen GB (θ 59,7°), Lagen yr = Y − 76. Bauplan `projects/grotta_buontalenti/model/_gb.js` (ein Plan, Module m0–m3 sind Teillisten). Projekt `type: "wahrzeichen"`, `"begehbarkeit": "pflicht"`. Rollen der Palette; Blockzahlen ±30 % (Richtwert ≈ 3,5 k).

| Modul | Titel | Bauteile (Reihenfolge) | Inhalt, Stufe |
|---|---|---|---|
| 0 | Fundament und Boden | `fundament`, `boden` | Tuff-Sockel, Schachbrettböden je Kammer (Pietra serena/Pflaster, forte/Marmor, Pflaster mit Tropfstein) – B/C |
| 1 | Fassade und Außenwände | `wappen`, `fassade`, `seitenwaende` | `pietra_forte_rustika` mit `antik`-Tropfstein, Eingang 5 × 7 (`tor`), zwei Säulen (`marmor_saeule`), Sturz, Nischen (`relief`), Kranzgesims, Giebelfeld; Wappen `gold`/`fresko` rot – A |
| 2 | Trennwände, Gewölbe, Dach | `trennwand_1`, `trennwand_2`, `kammer_1_gewoelbe`, `kammer_2_gewoelbe`, `kammer_3_gewoelbe`, `dach`, `oculus` | Durchgänge 5 × 7, bemalte Tonnengewölbe (Pergola, Korallen, Himmel), Oculus mit Glas – A/C |
| 3 | Ausstattung | `nischenstatuen`, `gefangene`, `paris_helena`, `venus_brunnen`, `licht` | Blockfiguren, Brunnenbecken mit `wasser`, Seelaternen im Boden – A/C |

Begehbarkeit: Eingang ≥ 2 × 3 (hier 5 × 7), Durchgänge zwischen den Kammern 5 × 7, Gewölbe mit Kopffreiheit ≥ 4, Licht ≤ 12 Blöcke; Dichtheit R14: Hülle aus Wand, Dach und Glas, Nischen als `relief`, Eingang als `tor`. Jeder ausgestaltete Raum ist ein eigenes Bauteil mit Content (was er zeigt, Quelle, „vereinfacht, nicht nach Vorbild“).
