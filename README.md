# Forme

Web app d'entraînement installable (PWA), dans l'esprit de Hevy :

- **Séance en cours** : tableau des séries (précédent, charge, reps), types de série (échauffement, dégressive, échec), supersets, minuteur de repos, notes, ajout ou remplacement d'exercices.
- **Programme** intégré avec progression automatique (double progression), phases et semaines allégées.
- **Routines** personnalisées et séances libres.
- **Bibliothèque** d'environ 140 exercices en français, avec images, consignes, historique, records et 1RM estimé.
- **Profil** : objectifs, poids (moyenne sur 7 jours et date estimée), tests, séances par semaine, muscles travaillés, calendrier.
- Mobilité guidée, habitudes quotidiennes, thèmes clair et sombre, kg ou lb.

Les données restent dans le navigateur (localStorage, clé `forme.v2`, migration automatique depuis `forme.v1`). Export et import JSON dans Réglages.

Test d'une date précise : `?date=2026-11-02`.

Crédits : images d'exercices [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense) ; police [Inter](https://rsms.me/inter/) (SIL OFL 1.1).
