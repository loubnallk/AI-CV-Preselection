# Frontend — AI CV Preselection

Interface Next.js pour soumettre une offre et des CV PDF, puis afficher un classement explicable.

## Prérequis

- Node.js 18+
- Backend FastAPI lancé sur [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Installation et scripts

```powershell
cd frontend
npm install
```

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement ([http://localhost:3000](http://localhost:3000)) |
| `npm run build` | Build de production |
| `npm run start` | Serveur production (après `build`) |
| `npm run lint` | Vérification ESLint |

## Configuration

Copier `.env.local.example` vers `.env.local` si besoin :

```
BACKEND_URL=http://127.0.0.1:8000
```

Par défaut, le proxy Next.js (`next.config.ts`) redirige `/api/:path*` vers le backend.

## Architecture des composants

```
app/
├── layout.tsx          # Layout racine, metadata
├── page.tsx            # Page principale (état, orchestration)
└── globals.css

components/
├── JobDescriptionForm.tsx   # Textarea offre d'emploi
├── CvUpload.tsx             # Upload multi-PDF, drag & drop, retrait
├── AnalyzeButton.tsx        # Bouton « Lancer l'analyse »
└── RankingResults.tsx       # Classement et détail Step 3

lib/
└── api.ts              # Client fetch /api/analyze + types TypeScript
```

## Parcours utilisateur

1. **Description de l'offre** — textarea avec compteur de caractères
2. **CVs des candidats** — glisser-déposer ou « Parcourir les fichiers » (PDF uniquement, multi-sélection)
3. **Lancer l'analyse** — bouton actif si offre non vide + au moins 1 PDF
4. **Résultats** — panneau droit (desktop) ou sous le formulaire (mobile)

## Upload multi-PDF

- Filtre automatique des non-PDF
- Déduplication par `nom-taille`
- Liste des fichiers avec bouton **Retirer**
- Zone désactivée pendant l'analyse

## Affichage des résultats (Step 3)

Pour chaque candidat, lorsque l'API renvoie les champs Step 3 :

| Élément | Source API |
|---------|------------|
| Score final (%) | `score` — barre de progression |
| Rang | `rank` |
| Score sémantique | `score_breakdown.semantic` |
| Score compétences | `score_breakdown.keywords` |
| Poids 60/40 | `score_breakdown.weights` |
| Compétences trouvées | `matched_skills` — badges verts |
| Compétences manquantes | `missing_skills` — badges ambre |
| Extrait pertinent | `best_match_excerpt` — bloc citation |

**Candidat #1** — carte « Meilleur candidat » (style emerald, badge en flux normal).

**Autres candidats** — cartes compactes dans la section « Autres candidats ».

**Rétrocompatibilité** — si `score_breakdown` est absent, seul le score final et le rang sont affichés.

## États de l'interface

| État | Comportement |
|------|--------------|
| **Initial** | Message « Aucun résultat pour le moment » |
| **Loading** | Skeleton animé + bandeau « Analyse en cours… » |
| **Succès** | Classement complet |
| **Erreur API** | Alerte rouge dans le formulaire + panneau « Analyse interrompue » (pas de message « aucun candidat classé ») |
| **Offre vide** | Bouton désactivé + message d'aide |
| **Résultat vide** | « Aucun candidat n'a pu être classé » (analyse OK mais liste vide) |

## Communication avec l'API

Le frontend appelle `POST /api/analyze` (proxifié vers le backend) :

- `job_description` — texte de l'offre
- `cvs` — fichiers PDF (répétable)

Types définis dans `lib/api.ts` : `AnalyzeResult`, `ScoreBreakdown`, `AnalyzeResponse`.

## Lancement complet

```powershell
# Terminal 1 — backend
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — frontend
cd frontend
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).
