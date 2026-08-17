# AI CV Preselection

Plateforme de **présélection de CV** qui classe des candidats par rapport à une offre d'emploi, avec un score hybride **sémantique + compétences** et un résultat explicable pour le recruteur.

> Outil d'aide à la décision — la validation humaine reste recommandée avant tout entretien.

## Contexte

La présélection manuelle de CV devient coûteuse dès qu'un poste attire de nombreux profils. Ce projet propose un MVP qui :

1. extrait le texte des CV PDF ;
2. compare chaque candidat à l'offre via embeddings et matching de compétences ;
3. produit un classement avec scores détaillés, compétences trouvées/manquantes et extrait pertinent.

## Fonctionnalités principales

- Upload multi-PDF (glisser-déposer ou sélection)
- Analyse via `POST /analyze` (offre + CVs)
- Classement par score final décroissant
- Détail par candidat : score sémantique, score compétences, poids 60/40, skills, extrait
- Interface web Next.js en français

## Architecture

```
Utilisateur
    │
    ▼
frontend/ (Next.js :3000)
    │  POST /api/analyze  ──proxy──▶  backend/ (FastAPI :8000)
    │                                      │
    │                                      ├─ parser.py        (PDF → texte)
    │                                      ├─ text_normalizer  (normalisation)
    │                                      ├─ embeddings.py    (vecteurs)
    │                                      ├─ chunking.py      (passages CV)
    │                                      ├─ skills_matcher  (dictionnaire)
    │                                      └─ matching.py      (score hybride)
    ▼
RankingResults (affichage explicable)
```

## Stack technique

| Couche | Technologies |
|--------|----------------|
| Backend | Python, FastAPI, Uvicorn, pypdf, sentence-transformers |
| Modèle | `paraphrase-multilingual-MiniLM-L12-v2` |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |

## Prérequis

- **Python 3.10+**
- **Node.js 18+**
- Connexion internet au premier lancement (téléchargement du modèle Hugging Face)

## Démarrage rapide

### 1. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Vérifier : [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 2. Frontend

Dans un second terminal :

```powershell
cd frontend
npm install
npm run dev
```

Ouvrir : [http://localhost:3000](http://localhost:3000)

Le proxy Next.js redirige `/api/*` vers `http://127.0.0.1:8000/*` (configurable via `BACKEND_URL` dans `.env.local`).

## Workflow utilisateur

1. Coller la description de l'offre
2. Importer un ou plusieurs CV PDF
3. Cliquer sur **Lancer l'analyse**
4. Consulter le classement : candidat #1 mis en avant, détail des scores et compétences pour chaque profil

## Documentation

| Document | Contenu |
|----------|---------|
| [backend/README.md](backend/README.md) | API, structure backend, benchmark |
| [frontend/README.md](frontend/README.md) | Composants, parcours UI, scripts |
| [docs/matching-engine.md](docs/matching-engine.md) | Évolution baseline → Steps 1–3, résultats, validation |

## État actuel du projet

| Composant | Statut |
|-----------|--------|
| Backend MVP + Steps 1, 2, 3 | Validé |
| Frontend MVP + affichage Step 3 | Validé |
| Benchmark reproductible | 6 CVs fixtures + JSON de référence |
| Régression backend | 16/16 tests PASS |
| Tests fonctionnels navigateur | 26/26 PASS |

Derniers commits notables : scoring hybride backend (`e1506b3`), affichage explicable frontend (`c5dbdfc`).

## Limites principales

- PDF **texte uniquement** (pas d'OCR pour scans)
- Dictionnaire de compétences **limité et fixe**
- Poids hybrides **fixes** (60 % sémantique / 40 % compétences)
- Pas de base de données, pas d'authentification
- Qualité dépendante de l'extraction PDF
- **Outil d'aide à la présélection**, pas un système de recrutement autonome
