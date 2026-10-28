# Ajouter ou étoffer une page du calendrier laboral (ES)

Cette notice s'adresse aux agents qui prolongent le site. Lisez-la en entier avant d'écrire, avec `~/Documents/GitHub/RECETTE-SITE.md` (§0, §3, §6, §7, §9.3, §11, §21, §26).

## Principe

Une page = **un fichier** `src/content/guides/<id>.ts` (`defineGuide`), espagnol (`es`) et anglais (`en`) côte à côte : slug, titre, description, H1, chapeau, bloc citable (`resume`), FAQ, corps, sources, outil de tête (`tool`, `toolArg`) et pages liées. L'`id` est le nom du fichier ; ajoutez-le dans `src/lib/planned.ts`. Exception : `comunidades.ts` exporte un tableau de 19 pages (`cl-<comunidad>`), dont le texte propre est dans `_ccaa-notas.ts`, `_ccaa-extra.ts` et `_ccaa-plan.ts` (fichiers en `_`, hors registre).

Routes, menus, sitemap, hreflang, llms.txt et schémas lisent ces fichiers : **ne touchez à aucun fichier du cœur pour ajouter une page.** Budget : 100 pages HTML au total (31 guides × 2 langues aujourd'hui, plus accueil, pages de service et embed).

## Les outils

| `tool` | Rôle |
|---|---|
| `buscador` | Accueil : recherche d'un municipio (201 dans la liste), ses 14 fiestas, laborables, fichier .ics |
| `cuenta` (+ `toolArg.ev`) | Compte à rebours en direct, dans le fuseau du visiteur (festivo, Navidad, Reyes, Semana Santa, cambio de hora) |
| `municipio`, `nacionales`, `laborables` | Fiestas d'un municipio ou d'une comunidad ; laborables mois par mois |
| `puentes` | Optimiseur de puentes (programmation dynamique, `src/lib/engine/puentes.ts`) |
| `semanaSanta`, `movil`, `cambio`, `faltan` | Dates calculées : Pâques (Meeus), Carnaval, fête des mères, changement d'heure, jours restants |

Déclaratifs dans `src/lib/tool-specs.ts` (rendus par `calc/SpecTool.tsx`), sauf `buscador` et `cuenta` (`calc/Buscador.tsx`, `calc/Cuenta.tsx`). Les dates calculées sont testées dans `tests/fechas.test.ts`. **Rien n'est envoyé ni stocké.**

## Les données

- `src/data/festivos.json` : résolutions de la Dirección General de Trabajo (BOE) pour 2026 et 2027, fiestas insulaires de Canarias, substitution du Val d'Aran.
- `src/data/municipal/<comunidad>.json` : fiestas locales lues dans le boletín autonómico ou provincial, avec la source (`fuentes`), le décret régional (`decreto_autonomico`) et, si le texte de l'année n'est pas paru, `{ "estado": "no-publicado", "comprobado": "AAAA-MM-JJ" }` : le site affiche alors « sin publicar ».
- `src/data/escolar/<comunidad>.json` : calendrier scolaire 2026-2027 (champs à `null` si le texte ne les fixe pas).
- `src/data/params-2026.json` : sources de base (Estatuto de los Trabajadores, RD 2001/1983, RD 236/2002, changement d'heure) et `retrieved_at`.

## Mise à jour (manuelle, aucune automatisation)

1. Chaque semaine d'octobre à janvier : relire les boletines des comunidades encore « no-publicado » pour l'année suivante ; remplir les fiestas, la source, la date de lecture.
2. Chaque année en octobre : ajouter la nouvelle résolution du BOE dans `festivos.json` et l'année dans `YEARS`.
3. Après chaque modification : `npx vitest run` puis `npm run check` (0 défaut attendu).

## Règles propres au site

- « Sitio independiente, no gubernamental » sous chaque H1 ; ni logo ni emblème officiel.
- Ni leads, ni affiliation, ni lien vers le portefeuille, ni nom de concurrent ou de moteur de recherche (`tests/pages.test.ts`).
- Un nom de fiesta locale n'est jamais inventé : si le boletín ne donne que la date, la page écrit « Fiesta local ».
- Ce qui compte pour un salarié, ce sont les fiestas locales du municipio du centre de travail.
