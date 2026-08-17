from sentence_transformers.util import cos_sim

from services.embeddings import get_embedding


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Calcule la similarité cosinus entre deux vecteurs d'embedding.

    Args:
        vec_a: premier vecteur.
        vec_b: second vecteur.

    Returns:
        Score de similarité entre 0 et 1 (plus haut = plus similaire).

    Raises:
        ValueError: si les vecteurs sont vides ou de dimensions différentes.
    """
    if not vec_a or not vec_b:
        raise ValueError("Les vecteurs ne peuvent pas être vides.")

    if len(vec_a) != len(vec_b):
        raise ValueError(
            f"Dimensions incompatibles : {len(vec_a)} vs {len(vec_b)}."
        )

    return round(float(cos_sim(vec_a, vec_b)), 4)


def rank_candidates(
    job_embedding: list[float],
    candidates: list[dict],
) -> list[dict]:
    """
    Classe des candidats par similarité avec une offre d'emploi.

    Args:
        job_embedding: vecteur d'embedding de l'offre.
        candidates: liste de dicts avec au minimum "filename" et "embedding".

    Returns:
        Liste triée par score décroissant, chaque élément contient
        filename, score et rank.
    """
    if not candidates:
        return []

    scored = []
    for candidate in candidates:
        filename = candidate["filename"]
        embedding = candidate["embedding"]
        score = cosine_similarity(job_embedding, embedding)
        scored.append({"filename": filename, "score": score})

    scored.sort(key=lambda item: item["score"], reverse=True)

    for index, item in enumerate(scored, start=1):
        item["rank"] = index

    return scored


def rank_candidates_from_texts(
    job_text: str,
    candidates: list[dict],
) -> list[dict]:
    """
    Encode des textes puis classe les candidats par pertinence.

    Args:
        job_text: texte de l'offre d'emploi.
        candidates: liste de dicts avec au minimum "filename" et "text".

    Returns:
        Liste triée par score décroissant (filename, score, rank).
    """
    job_embedding = get_embedding(job_text)

    embedded_candidates = [
        {
            "filename": candidate["filename"],
            "embedding": get_embedding(candidate["text"]),
        }
        for candidate in candidates
    ]

    return rank_candidates(job_embedding, embedded_candidates)
