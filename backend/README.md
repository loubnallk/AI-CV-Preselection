# Backend — AI CV Preselection API

API FastAPI pour l'extraction de CV PDF, le matching sémantique et le classement hybride.

## Structure

```
backend/
├── main.py                 # Endpoints FastAPI
├── requirements.txt
├── data/
│   └── skills_dictionary.json
├── services/
│   ├── parser.py           # Extraction texte PDF (pypdf)
│   ├── text_normalizer.py  # Normalisation du texte extrait
│   ├── embeddings.py       # Encodage sentence-transformers
│   ├── chunking.py         # Découpage CV en passages
│   ├── skills_matcher.py   # Détection compétences (dictionnaire)
│   └── matching.py         # Score hybride + ranking
└── benchmark/
    ├── job_offer.txt       # Offre de référence
    ├── fixtures/cvs/       # 6 CV PDF de test
    ├── run_benchmark.py
    ├── compare_results.py
    ├── generate_fixtures.py
    └── *_results.json      # Résultats baseline / step1 / step2 / step3
```

## Prérequis et installation

- Python 3.10+
- Environnement virtuel recommandé

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Lancer le serveur

```powershell
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

- API : [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Swagger : [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

> **Important :** après modification du code Python, le serveur doit charger la nouvelle version. Utilisez `--reload` en développement, ou **redémarrez manuellement** uvicorn si le processus a été lancé sans reload. Un ancien processus peut continuer à servir une version obsolète du matching.

## Endpoints

### `GET /health`

Contrôle de disponibilité.

```json
{
  "status": "ok",
  "message": "API is running"
}
```

### `POST /parse-pdf`

Extraction de texte d'un PDF (usage dev/test).

- **Entrée :** `multipart/form-data`, champ `file` (PDF)
- **Sortie :** `filename`, `text`, `character_count`

### `POST /analyze`

Endpoint principal — classement de candidats.

- **Entrée :** `multipart/form-data`
  - `job_description` (string, obligatoire)
  - `cvs` (un ou plusieurs PDF, obligatoire)
- **Erreurs :** `400` si offre vide ou PDF invalide

**Exemple de réponse (Step 3) :**

```json
{
  "job_description": "...",
  "candidate_count": 2,
  "results": [
    {
      "filename": "cv_python_fastapi.pdf",
      "score": 0.7805,
      "rank": 1,
      "best_match_excerpt": "Developpeur Python senior. 4 ans d'experience...",
      "score_breakdown": {
        "semantic": 0.8008,
        "keywords": 0.75,
        "weights": { "semantic": 0.6, "keywords": 0.4 },
        "fallback": null
      },
      "matched_skills": ["Python", "FastAPI", "REST"],
      "missing_skills": ["SQL"],
      "skills_required": ["Python", "FastAPI", "REST", "SQL"]
    }
  ]
}
```

**Fallback `semantic_only` :** si aucune compétence du dictionnaire n'est détectée dans l'offre, le score final = score sémantique seul ; `keywords` vaut `null`, `fallback` vaut `"semantic_only"`, poids `{ semantic: 1.0, keywords: 0.0 }`.

## Pipeline de matching

1. **Parsing** — PDF → texte brut
2. **Normalisation** — nettoyage (`text_normalizer.py`)
3. **Embeddings** — modèle `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
4. **Chunking** — découpage du CV par paragraphes ; score sémantique = similarité cosinus max entre l'offre et chaque passage
5. **Compétences** — compétences de l'offre extraites via `data/skills_dictionary.json` ; matching par nom/aliases dans le CV
6. **Score hybride** — `score = 0.6 × sémantique + 0.4 × compétences` (si compétences détectées dans l'offre)
7. **Ranking** — tri décroissant + attribution du `rank`

Voir [docs/matching-engine.md](../docs/matching-engine.md) pour l'évolution baseline → Steps 1–3.

## Dictionnaire de compétences

Fichier : `data/skills_dictionary.json`

Chaque entrée contient un `name` et des `aliases`. Seules les compétences **présentes dans l'offre** entrent dans le calcul. Exemples : Python, FastAPI, REST, SQL, Django, Java, Spring…

## Benchmark

Jeu de test reproductible dans `benchmark/` :

- Offre : `job_offer.txt` (poste Développeur Python FastAPI)
- 6 CV PDF : `fixtures/cvs/` (pertinents, partiels, hors sujet)

### Lancer le benchmark

Depuis `backend/` (venv activé) :

```powershell
python benchmark/run_benchmark.py step3_results.json
```

Affiche le classement et enregistre le JSON.

### Comparer deux étapes

```powershell
python benchmark/compare_results.py step2_results.json step3_results.json
```

### Régénérer les PDF fixtures

```powershell
python benchmark/generate_fixtures.py
```

## Limites connues

- Extraction PDF texte uniquement (pas d'OCR)
- Dictionnaire de compétences limité — pas d'extraction NLP libre
- Poids 60/40 non configurables via l'API
- Modèle chargé en mémoire — premier appel lent
- Pas de persistance ni d'authentification
- PostgreSQL/MySQL dans le dictionnaire ne remplacent pas « SQL » automatiquement
