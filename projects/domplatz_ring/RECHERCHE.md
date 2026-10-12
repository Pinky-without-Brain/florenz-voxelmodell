# Recherche Hausakten Domplatz-Ring (V3 C2a)

Quellen: italienische Wikipedia (Artikel zu den Gebäuden), Wikidata, Webseiten der Opera del Duomo. Nur Befunde, die gefunden wurden; Annahmen stehen in der `notiz` jeder Akte. Basis-URL Wikipedia: https://it.wikipedia.org/wiki/

## Verfeinerte Akten
| id | Name | Typ | Geschosse | Achsen | Quelle | Sicherheit |
|---|---|---|---|---|---|---|
| w114220146 | Palazzo dei Canonici | palazzo_ottocento | 4 | 9 | Palazzo_dei_Canonici_(Firenze) | 0,7 |
| w166821304 | Loggia del Bigallo | loggia | 2 | 3 | Loggia_del_Bigallo | 0,85 |
| w266213439 | San Michele Visdomini | chiesa_minore | 2 | 1 | San_Michele_Visdomini | 0,5 |
| w306381525 | Casa Ghiberti | palazzo_cinquecento | 4 | 5 | Casa_Ghiberti | 0,8 |
| w306381526 | Torre dei Marignolli | casa_torre | 4 | 3 | Torre_dei_Marignolli | 0,65 |
| w307153247 | Osservatorio Ximeniano | palazzo_cinquecento | 5 | 9 | Osservatorio_Ximeniano | 0,35 |
| w307153311 | Torre in via de' Cerretani | casa_torre | 4 | 2 | typologie | 0,3 |
| w307544507 | Torre dei Pierozzi | casa_torre | 5 | 3 | Torre_dei_Pierozzi | 0,65 |
| w307544508 | Bottega dell'Opera del Duomo | zweckbau | 1 | 3 | firenzemadeintuscany.com (Bottega) | 0,4 |
| w307544517 | Casa de' Biffi | palazzo_cinquecento | 4 | 4 | Casa_de'_Biffi | 0,55 |
| w307544521 | Palazzo Pasqui | palazzo_ottocento | 5 | 11 | Palazzo_Pasqui | 0,65 |
| w307544522 | Palazzo Incontri | palazzo_cinquecento | 3 | 9 | Palazzo_Incontri | 0,8 |
| w307544530 | Palazzo Naldini | palazzo_cinquecento | 3 | 4 | Palazzo_Naldini | 0,7 |
| w307544531 | Studio Fiorentino | palazzo_ottocento | 3 | 6 | Studio_Fiorentino | 0,45 |
| w307544533 | Palazzetto del Bianco | palazzo_cinquecento | 3 | 3 | Palazzetto_Del_Bianco | 0,5 |
| w307544540 | Torre dei Visdomini | casa_torre | 4 | 2 | Torre_dei_Visdomini | 0,6 |
| w456578419 | Museo dell'Opera del Duomo | palazzo_cinquecento | 3 | 7 | Museo_dell'Opera_del_Duomo_(Firenze) | 0,4 |
| w114220149 | Palazzo della Misericordia (Lage) | palazzo_cinquecento | 5 | 8 | https://feelflorence.it/en/node/12233 | 0,4 |
| w491889292 | Casa Sermanni (Lage) | palazzo_ottocento | 4 | 8 | Palazzo_dei_Canonici_(Firenze) | 0,35 |

## Höhenkorrekturen nötig (dokumentierte Höhe widerspricht `hoeheBl`)
Die Geschosssummen bleiben innerhalb von hoeheBl +-2 (Validator). Die dokumentierte Geschosszahl ist höher als die Datenquelle.
- w307544521 Palazzo Pasqui: dokumentiert EG mit Mezzanin, erstes Geschoss und drei Obergeschosse (5-6 Ebenen, grob 20 m, etwa 40 Blöcke); hoeheBl 30 (OSM 4 Ebenen).
- w307544522 Palazzo Incontri: dokumentiert 3 Geschosse plus Mezzanin (grob 15-17 m, etwa 30-34 Blöcke); hoeheBl 23.
- w307544533 Palazzetto del Bianco: dokumentiert 3 Geschosse plus eine durch Ausmauern der Loggia entstandene vierte (etwa 28-30 Blöcke); hoeheBl 23 (geschätzt).
- w307544530 Palazzo Naldini: nur drei Geschosse belegt, dafür wirken 23 Blöcke knapp für einen Barockpalazzo (Richtwert 28-30); keine Höhenangabe gefunden, nur Vermutung.
- Keine Höhe belegt (kein Widerspruch): alle Türme (Pierozzi, Visdomini, Marignolli sind laut Quellen gekappt), Museo, Osservatorio.

## Zuordnungen und Auffälligkeiten
- **Palazzo dei Canonici** ist laut Wikipedia ein klassizistischer Bau von Baccani (1826-30), kein Renaissance-Palazzo. Der Grundriss (73 Blöcke) umfasst vermutlich den Mittelbau und die Seitenbauten (Nr. 12-17). Gleiche Quelle nennt Casa Sermanni (Ost) und Palazzo della Misericordia (West) als Nachbarn.
- **Palazzo della Misericordia** (Piazza del Duomo 19/20) = w114220149, Zuordnung über die Lage: Südseite der Piazza, unmittelbar südlich des Campanile (Mitte -200/65), östlich von Bigallo und Via dei Calzaiuoli, 5 OSM-Geschosse. Keine Fassadenbeschreibung gefunden. Unsicher.
- **Casa Sermanni** = w491889292 (Grundriss x -18..56, z 119..144), östlich des Canonici-Grundrisses (x -100..-27), wie auf Wikipedia beschrieben. Nur Lage.
- **Torre in via de' Cerretani** (w307153311, Wikidata Q3995649): Der Wikipedia-Artikel dieses Namens beschreibt die Torre dei Marignolli (Via de' Cerretani 2, w306381526, Koordinaten passen zu x -400, z -82). Der Grundriss w307153311 liegt etwa 36 Blöcke weiter westlich, wahrscheinlich ein Nachbarturm. Wikidata-/OSM-Verknüpfung prüfen.
- **Palazzo Arcivescovile** (Piazza San Giovanni 3, 11 Achsen, Neubau 1573-84 nach Dosio, 1895 erweitert, Putz mit Steinrahmen, Fenster mit Dreiecks- und Bogengiebeln, Quelle: Palazzo_Arcivescovile_(Firenze)): im Datensatz **kein Grundriss** westlich der Taufkirche (x -420..-330, z -70..90 leer). Nicht zugeordnet. w477257659 (x -363, z -91) und w491923451 (x -367, z 101) wären die nächsten Kandidaten, ohne Beleg nicht benannt.
- **Opera di San Giovanni, Curia:** Curia liegt am Palazzo Arcivescovile (Piazza San Giovanni 3). Kein eigener Grundriss identifiziert.
- **Osservatorio Ximeniano:** Wikipedia nennt Via Borgo San Lorenzo 26 und den Torre dei Rondinelli als Unterbau; Grundriss (62x68) gehört wohl zum ganzen Konvent San Giovannino.
- **Museo dell'Opera:** Wikipedia (Piazza del Duomo 9, Nordostseite) und Opera-Seiten beschreiben die Fassade nicht; Akte bleibt weitgehend Typologie.
- **Bottega:** nur Standort (Via dello Studio, seit Mitte 19. Jh.) belegt: https://www.firenzemadeintuscany.com/it/articolo/la-bottega-dell-opera-del-duomo/

## Gewöhnliche Häuser
Nur stichprobenartig gegen Lage und Typologie geprüft; keine Änderungen außer dem Namen von w491889292. Die Nachbarschaftsregel ist erfüllt (nach einer Korrektur an w114220149: 8 Achsen und Putzgesims, weil es sonst nur 1 Unterschied zu w491889275 gab).

## Offene Punkte
- Putzfarben und Fensterrahmen sind überall dort Annahmen, wo die Quelle keine Farbe nennt (siehe `notiz`).
- Casa Ghiberti und Palazzo Naldini: Rustika im EG ist belegt, `bugnato_glatt` setzt aber auch die Obergeschosse als glatten Stein (nicht belegt).
- Weitere Quellen (Commons-Beschreibungen, Fotos) wurden nicht ausgewertet.
