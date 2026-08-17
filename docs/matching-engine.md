# Moteur de matching — évolution et validation

Documentation de l'évolution du classement CV : baseline → Step 1 → Step 2 → Step 3.

**Offre de benchmark** (identique pour toutes les étapes) :

> Développeur Python FastAPI — Nous recherchons un développeur backend Python avec au minimum 3 ans d'expérience. Maîtrise de FastAPI, conception d'APIs REST et bonnes pratiques de développement. Connaissance SQL appréciée.

Fichier : `backend/benchmark/job_offer.txt`

Compétences détectées dans l'offre (Step 3) : **Python, FastAPI, REST, SQL**.

---

## Baseline

**Stratégie :** un vecteur par document entier — similarité cosinus entre l'offre et chaque CV.

| Paramètre | Valeur |
|-----------|--------|
| Modèle | `sentence-transformers/all-MiniLM-L6-v2` |
| Granularité | Document entier |
| Score | Cosine similarity directe |

**Résultats** (`benchmark/baseline_results.json`, 5 CVs) :

| Rang | CV | Score |
|------|-----|-------|
| 1 | cv_python_fastapi.pdf | 0.6590 |
| 2 | cv_python_django.pdf | 0.6059 |
| 3 | cv_data_analyst.pdf | 0.5041 |
| 4 | cv_java_spring.pdf | 0.2587 |
| 5 | cv_cuisine.pdf | 0.1815 |

---

## Step 1 — Modèle multilingue + normalisation

**Changements :**

- Modèle → `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- Normalisation du texte via `text_normalizer.py` (espaces, tabulations et sauts de ligne excessifs)
- Même logique document entier + cosine

**Résultats** (`benchmark/step1_results.json`, 5 CVs) :

| Rang | CV | Score baseline | Score Step 1 | Δ |
|------|-----|----------------|--------------|-----|
| 1 | cv_python_fastapi.pdf | 0.6590 | 0.6608 | +0.0018 |
| 2 | cv_python_django.pdf | 0.6059 | 0.5620 | −0.0439 |
| 3 | cv_data_analyst.pdf | 0.5041 | 0.4129 | −0.0912 |
| 4 | cv_java_spring.pdf | 0.2587 | 0.3026 | +0.0439 |
| 5 | cv_cuisine.pdf | 0.1815 | 0.0039 | −0.1776 |

**Observations :**

- L'ordre global est **inchangé** (5 CVs).
- Le CV hors sujet (`cv_cuisine.pdf`) chute fortement (0.18 → 0.004), signal sémantique plus discriminant en français.
- Le modèle multilingue améliore la séparation pertinents / hors sujet sans modifier la logique de ranking.

---

## Step 2 — Chunking + extrait pertinent

**Changements :**

- Découpage du CV en passages (`chunking.py`) — paragraphes, fusion des fragments courts
- Score sémantique = **max** des similarités cosinus (offre vs chaque passage)
- Ajout de `best_match_excerpt` — passage le plus proche de l'offre
- Nouveau CV fixture : `cv_long_mixed.pdf` (6 CVs au total)

**Pourquoi `cv_long_mixed.pdf` ?**

CV intentionnellement bruité : paragraphe non pertinent (communication/marketing) **puis** paragraphe très pertinent (Python, FastAPI, REST). Le chunking permet de cibler le bon passage au lieu de diluer le signal sur le document entier.

**Résultats** (`benchmark/step2_results.json`) :

| Rang | CV | Score | Extrait (aperçu) |
|------|-----|-------|------------------|
| 1 | cv_long_mixed.pdf | 0.8258 | « Developpeur Python senior. 4 ans d'experience FastAPI, APIs REST… » |
| 2 | cv_python_fastapi.pdf | 0.8008 | « …FastAPI et Flask. Conception d'APIs REST, PostgreSQL… » |
| 3 | cv_python_django.pdf | 0.6895 | « …Django et Celery. Developpement web… » |
| 4 | cv_java_spring.pdf | 0.4068 | « …Spring Boot, microservices, APIs REST… » |
| 5 | cv_data_analyst.pdf | 0.4029 | « …Python pour l'analyse de donnees, pandas, SQL… » |
| 6 | cv_cuisine.pdf | 0.1673 | « Chef de cuisine. 10 ans d'experience… » |

**Changement de ranking vs Step 1 :**

- `cv_long_mixed.pdf` devient **#1** grâce au passage pertinent isolé.
- `cv_data_analyst.pdf` passe de #3 à **#5** : score sémantique plus bas (0.40 vs 0.41 en Step 1 document entier) une fois le matching par passage appliqué.

---

## Step 3 — Score hybride sémantique + compétences

**Changements :**

- Extraction des compétences de l'offre via `data/skills_dictionary.json`
- Matching compétences dans chaque CV → `matched_skills`, `missing_skills`
- Score compétences (`keywords`) = part des compétences requises trouvées dans le CV
- **Score final** :

```
score = 0.6 × semantic + 0.4 × keywords
```

- Conservation du score sémantique Step 2 et de `best_match_excerpt`
- **Fallback `semantic_only`** : si aucune compétence du dictionnaire n'est détectée dans l'offre → score final = score sémantique, `keywords = null`, poids 100 % sémantique

**Résultats** (`benchmark/step3_results.json`) :

| Rang | CV | Final | Sém. | Comp. | Matched | Missing |
|------|-----|-------|------|-------|---------|---------|
| 1 | cv_long_mixed.pdf | 0.7955 | 0.8258 | 0.75 | Python, FastAPI, REST | SQL |
| 2 | cv_python_fastapi.pdf | 0.7805 | 0.8008 | 0.75 | Python, FastAPI, REST | SQL |
| 3 | cv_python_django.pdf | 0.5137 | 0.6895 | 0.25 | Python | FastAPI, REST, SQL |
| 4 | cv_data_analyst.pdf | 0.4417 | 0.4029 | 0.50 | Python, SQL | FastAPI, REST |
| 5 | cv_java_spring.pdf | 0.3441 | 0.4068 | 0.25 | REST | Python, FastAPI, SQL |
| 6 | cv_cuisine.pdf | 0.1004 | 0.1673 | 0.00 | — | Python, FastAPI, REST, SQL |

**Formule vérifiée** (ex. `cv_python_fastapi.pdf`) :  
`0.6 × 0.8008 + 0.4 × 0.75 = 0.7805`

### Ce qui change vs Step 2

| Aspect | Step 2 | Step 3 |
|--------|--------|--------|
| Score affiché | Sémantique seul | Hybride 60/40 |
| Ordre #1–#2 | long_mixed > fastapi | **Identique** |
| Ordre #4–#5 | java (#4) > data_analyst (#5) | **Inversé** : data_analyst (#4) > java (#5) |
| Explicabilité | Extrait seul | Extrait + skills + breakdown |
| cv_cuisine.pdf | 0.1673 | 0.1004 (pénalisé par 0 % compétences) |

Le Step 3 fait remonter `cv_data_analyst.pdf` devant `cv_java_spring.pdf` grâce à un meilleur score compétences (Python + SQL vs REST seul).

---

## Validation

### Régression backend (16/16 PASS)

Tests exécutés contre le serveur live `POST /analyze` avec les 6 CVs benchmark :

- `GET /health`, `POST /parse-pdf`, `POST /analyze`
- Présence de tous les champs Step 3
- Classement et scores **identiques** à `step3_results.json`
- Score sémantique Step 3 = score Step 2 pour chaque CV
- Fallback `semantic_only` validé (offre sans compétence dictionnaire)
- Validations API (offre vide → 400)

### Tests fonctionnels navigateur (26/26 PASS)

Parcours complet Playwright sur `localhost:3000` :

- Upload 3 PDF, analyse, affichage scores/skills/extrait
- Retrait CV, états loading/erreur/vide
- Erreur API sans message « aucun candidat classé »
- Responsive mobile (390px) — badge sans chevauchement

### Reproduire le benchmark

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python benchmark/run_benchmark.py step3_results.json
python benchmark/compare_results.py step2_results.json step3_results.json
```

---

## Limites

| Limite | Impact |
|--------|--------|
| PDF texte uniquement | CVs scannés non exploitables sans OCR |
| Dictionnaire fixe | Compétences hors liste ignorées ; pas d'extraction libre |
| Poids 60/40 fixes | Non adaptés au métier sans recalibrage |
| Pas de BDD | Aucun historique d'analyses |
| Pas d'authentification | Usage local / démonstration |
| Extraction PDF variable | Qualité du texte dépend du PDF source |
| Outil d'aide | Décision finale = validation humaine recommandée |

Le système **assiste** le recruteur avec un classement explicable ; il ne remplace pas l'évaluation des candidats.
