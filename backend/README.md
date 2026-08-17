# Backend — AI CV Preselection API

API FastAPI pour la plateforme de présélection de CV par IA.

## Prérequis

- Python 3.10 ou supérieur

## Installation

1. Créer et activer un environnement virtuel :

```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

2. Installer les dépendances :

```bash
pip install -r requirements.txt
```

## Lancer le serveur

Depuis le dossier `backend/` (avec le venv activé) :

```bash
uvicorn main:app --reload
```

L'API est disponible sur [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Vérifier que l'API fonctionne

- Endpoint de santé : [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Documentation interactive : [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

Réponse attendue pour `GET /health` :

```json
{
  "status": "ok",
  "message": "API is running"
}
```
