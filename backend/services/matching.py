from sentence_transformers.util import cos_sim

from services.chunking import chunk_text
from services.embeddings import get_embedding, get_embeddings


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Calcule la similarite cosinus entre deux vecteurs d'embedding.

    Args:
        vec_a: premier vecteur.
        vec_b: second vecteur.

    Returns:
        Score de similarite entre 0 et 1 (plus haut = plus similaire).

    Raises:
        ValueError: si les vecteurs sont vides ou de dimensions differentes.
    """
    if not vec_a or not vec_b:
        raise ValueError("Les vecteurs ne peuvent pas etre vides.")

    if len(vec_a) != len(vec_b):
        raise ValueError(
            f"Dimensions incompatibles : {len(vec_a)} vs {len(vec_b)}."
        )

    return round(float(cos_sim(vec_a, vec_b)), 4)


def score_cv_against_job(job_embedding: list[float], cv_text: str) -> dict:
    """
    Score un CV via le passage le plus proche de l'offre.

    Returns:
        dict avec score et best_match_excerpt.
    """
    chunks = chunk_text(cv_text)
    if not chunks:
        raise ValueError("Le CV ne contient aucun texte exploitable.")

    chunk_embeddings = get_embeddings(chunks)

    best_score = -1.0
    best_excerpt = chunks[0]
    for chunk, chunk_embedding in zip(chunks, chunk_embeddings):
        score = cosine_similarity(job_embedding, chunk_embedding)
        if score > best_score:
            best_score = score
            best_excerpt = chunk

    return {
        "score": best_score,
        "best_match_excerpt": best_excerpt,
    }


def rank_candidates_from_texts(
    job_text: str,
    candidates: list[dict],
) -> list[dict]:
    """
    Encode l'offre puis classe les candidats par pertinence (matching par chunks).

    Args:
        job_text: texte de l'offre d'emploi.
        candidates: liste de dicts avec au minimum "filename" et "text".

    Returns:
        Liste triee par score decroissant (filename, score, rank, best_match_excerpt).
    """
    job_embedding = get_embedding(job_text)

    scored = []
    for candidate in candidates:
        match = score_cv_against_job(job_embedding, candidate["text"])
        scored.append(
            {
                "filename": candidate["filename"],
                "score": match["score"],
                "best_match_excerpt": match["best_match_excerpt"],
            }
        )

    scored.sort(key=lambda item: item["score"], reverse=True)

    for index, item in enumerate(scored, start=1):
        item["rank"] = index

    return scored
