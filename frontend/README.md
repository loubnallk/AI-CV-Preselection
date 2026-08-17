# Frontend — AI CV Preselection

Interface Next.js pour la plateforme de présélection de CV par IA.

## Prérequis

- Node.js 18 ou supérieur
- Backend FastAPI lancé sur [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Installation

```bash
npm install
```

## Configuration

Copier le fichier d'exemple (optionnel) :

```bash
cp .env.local.example .env.local
```

Par défaut, le proxy Next.js redirige `/api/*` vers `http://127.0.0.1:8000/*`.

## Lancer le frontend

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## Utilisation

1. Lancer le backend (`uvicorn main:app --reload` depuis `backend/`).
2. Ouvrir le frontend sur `http://localhost:3000`.
3. Coller la description de l'offre.
4. Uploader un ou plusieurs CV PDF.
5. Cliquer sur **Analyser** pour afficher le classement.

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |

## Communication avec l'API

Le frontend envoie une requête `POST /api/analyze` (proxy Next.js) avec :

- `job_description` : texte de l'offre
- `cvs` : fichiers PDF

La réponse affiche le ranking (`rank`, `filename`, `score`).
